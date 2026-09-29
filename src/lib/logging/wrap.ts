/**
 * Enrobage des Server Actions — journalisation sans réécrire chaque action.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1). Le motif est volontairement
 * **transparent** : la fonction enrobée conserve exactement sa signature, sa
 * valeur de retour et ses erreurs. Seul un effet de bord s'ajoute — une ligne de
 * journal, en succès comme en échec.
 *
 * Pourquoi un enrobage plutôt que des appels dispersés : une action oubliée est
 * une action invisible. Ici, l'oubli se voit dans le fichier (l'action n'est pas
 * enrobée), alors qu'un `logAuditEvent` omis au milieu d'un corps de 80 lignes ne
 * se voit pas — c'est exactement le trou relevé au §1.4 du plan.
 */

import { classifyError } from './classify';
import { writeActivityLog } from './write';
import type { LogLevel, LogSource } from './types';

export interface ActivityActor {
    id: string | null;
    name: string | null;
}

export interface WrapOptions<Args extends unknown[], Result> {
    /** Domaine émetteur : décide de l'axe de rangement dans le hub. */
    source: LogSource;
    /** Catégorie d'échec, ex. `page.save.failed`. */
    failureCategory: string;
    /**
     * Événement de succès. Omis si l'action n'a pas d'intérêt à être tracée en
     * cas de réussite — on ne journalise pas pour remplir une table.
     */
    success?: {
        category: string;
        message: string | ((args: Args, result: Result) => string);
    };
    /** Cible de l'événement (slug, adresse, chemin), dérivée des arguments. */
    target?: (args: Args, result?: Result) => string | null;
    /** Nom du module appelant, pour retrouver le code fautif. */
    origin?: string;
    /**
     * Acteur de l'opération. Résolu par l'appelant **quand il le connaît déjà**
     * (profil chargé par la garde de rôle) : le journal ne déclenche pas une
     * lecture supplémentaire de la session à chaque écriture.
     */
    actor?: ActivityActor | (() => Promise<ActivityActor>);
}

/** Résout l'acteur, qu'il soit fourni directement ou par une fonction. */
async function resolveActor(
    actor: WrapOptions<unknown[], unknown>['actor'],
): Promise<ActivityActor> {
    if (!actor) return { id: null, name: null };
    if (typeof actor === 'function') {
        try {
            return await actor();
        } catch {
            return { id: null, name: null };
        }
    }
    return actor;
}

/**
 * Enrobe une Server Action.
 *
 * Le succès est journalisé en `info` (si `success` est fourni), l'échec est classé
 * par `classifyError` puis journalisé, et **l'erreur est relancée telle quelle** :
 * masquer une erreur pour « faire propre » changerait le comportement de
 * l'application, ce que cet enrobage s'interdit.
 */
export function withActivityLog<Args extends unknown[], Result>(
    options: WrapOptions<Args, Result>,
    run: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
    return async (...args: Args): Promise<Result> => {
        const startedAt = Date.now();
        const actor = await resolveActor(options.actor);

        try {
            const result = await run(...args);

            if (options.success) {
                const { category, message } = options.success;
                await writeActivityLog({
                    level: 'info',
                    source: options.source,
                    category,
                    message: typeof message === 'function' ? message(args, result) : message,
                    target: options.target?.(args, result) ?? null,
                    durationMs: Date.now() - startedAt,
                    origin: options.origin ?? null,
                    actorId: actor.id,
                    actorName: actor.name,
                });
            }

            return result;
        } catch (error) {
            const classified = classifyError(error, {
                source: options.source,
                category: options.failureCategory,
                level: 'error',
            });

            await writeActivityLog({
                level: classified.level as LogLevel,
                source: classified.source,
                category: classified.category,
                message: classified.message,
                target: options.target?.(args) ?? null,
                context: classified.context,
                durationMs: Date.now() - startedAt,
                origin: options.origin ?? null,
                actorId: actor.id,
                actorName: actor.name,
            });

            throw error;
        }
    };
}
