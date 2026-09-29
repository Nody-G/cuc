/**
 * Écriture du journal d'activité — service serveur.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1). **Serveur uniquement** : ce
 * module importe le client à clé de service. Il ne doit jamais entrer dans un
 * graphe client — seules les Server Actions et les scripts l'importent.
 *
 * Deux règles non négociables, toutes deux issues du §8 de
 * `durability_health.md` :
 *
 *  1. `supabase-js` **ne lève pas** : une écriture refusée revient dans `error`.
 *     On lit donc `error` explicitement — un `try/catch` seul ferait croire à un
 *     journal fonctionnel alors que la table refuse tout.
 *  2. **Journaliser ne casse jamais le parcours utilisateur.** Cette fonction ne
 *     lève jamais, même si le journal est absent, plein ou expurgé de travers :
 *     un incident d'observabilité ne doit pas devenir un incident fonctionnel.
 *     L'échec d'écriture reste visible dans les logs serveur, préfixé
 *     `[activity-log-unwritten]` — le seul endroit où il ne peut plus être perdu.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { redactEntry } from './redact';
import { fingerprintOf, LogThrottle } from './throttle';
import type { ActivityLogInput } from './types';

const TABLE = 'site_activity_logs';

/**
 * Plafond d'écritures relevé pour les incidents critiques : un `critical` est
 * rare par nature et ne doit pas être étouffé par l'anti-inondation, alors qu'un
 * `info` répété (sonde, lecture) n'apporte rien au-delà de trois occurrences.
 */
const CRITICAL_EMIT_LIMIT = 10;

/**
 * Anti-inondation partagé par l'instance serveur.
 *
 * Mémoire volatile assumée : sur une plateforme sans état, chaque instance
 * regroupe ce qu'elle voit. L'objectif est d'éviter l'inondation d'une rafale,
 * pas de garantir un décompte global — pour cela, la table suffit.
 */
const throttle = new LogThrottle({ windowMs: 60_000, maxEmitsPerWindow: 3 });

/** Réinitialise l'anti-inondation (tests, ou reprise explicite après incident). */
export function resetActivityLogThrottle(): void {
    throttle.reset();
}

export interface WriteActivityLogResult {
    written: boolean;
    /** `throttled` : regroupé ; `storage` : table absente ou écriture refusée. */
    reason?: 'throttled' | 'storage';
}

/**
 * Écrit un événement. Ne lève **jamais**, et ne bloque jamais l'appelant.
 *
 * `void` en tête d'appel est le motif attendu côté Server Action :
 * `void writeActivityLog({...})` — le journal ne fait pas attendre le parcours.
 * Le `await` reste possible quand l'ordre importe (tests, scripts).
 */
export async function writeActivityLog(
    input: ActivityLogInput,
): Promise<WriteActivityLogResult> {
    let payload: ActivityLogInput;
    try {
        payload = redactEntry(input);
    } catch (error) {
        // L'expurgation ne devrait pas échouer ; si elle échoue, on n'écrit rien
        // plutôt que d'écrire un contenu potentiellement sensible.
        console.error('[activity-log-unwritten] expurgation impossible :', error);
        return { written: false, reason: 'storage' };
    }

    const decision = throttle.register(
        fingerprintOf({
            source: payload.source,
            category: payload.category,
            message: payload.message,
            target: payload.target ?? null,
        }),
        payload.level === 'critical' ? CRITICAL_EMIT_LIMIT : undefined,
    );

    if (!decision.emit) {
        return { written: false, reason: 'throttled' };
    }

    try {
        const admin = createAdminClient();
        const { error } = await admin.from(TABLE).insert({
            level: payload.level,
            source: payload.source,
            category: payload.category,
            message: payload.message,
            target: payload.target ?? null,
            context: payload.context ?? null,
            request_id: payload.requestId ?? null,
            duration_ms: payload.durationMs ?? null,
            origin: payload.origin ?? null,
            actor_id: payload.actorId ?? null,
            actor_name: payload.actorName ?? null,
            repeat_count: decision.repeatCount,
        });

        // Règle n°1 : c'est ici que se joue la différence entre un journal et un
        // décor. Sans cette lecture, une table absente passerait inaperçue.
        if (error) {
            console.error(
                `[activity-log-unwritten] ${payload.source}/${payload.category} : ${error.message}`,
            );
            return { written: false, reason: 'storage' };
        }

        return { written: true };
    } catch (error) {
        console.error('[activity-log-unwritten] écriture impossible :', error);
        return { written: false, reason: 'storage' };
    }
}

/** Écrit sans attendre — sucre syntaxique pour les Server Actions. */
export function writeActivityLogInBackground(input: ActivityLogInput): void {
    void writeActivityLog(input);
}
