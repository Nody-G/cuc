'use server';

/**
 * Journal d'activité — ingestion depuis le **navigateur**.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Deux portes d'entrée seulement, et elles ne se
 * confondent pas :
 *
 *  - `reportClientError` — la frontière d'erreur racine signale un **parcours
 *    cassé** : gravité `critical`, domaine `site`, aucune trace d'appel ;
 *  - `reportClientIncident` — un outil du Cockpit se **dégrade** (canal temps réel
 *    rompu, téléversement refusé) : gravité imposée à `warning`, domaines et
 *    catégories en liste fermée.
 *
 * Ces points d'entrée sont joignables depuis n'importe quel navigateur : un
 * appelant ne doit donc jamais pouvoir choisir librement la gravité, le domaine
 * ou la catégorie de ce qu'il écrit. C'est la raison d'être de la liste fermée —
 * et de l'absence de `stack`, qui contiendrait des chemins locaux et parfois des
 * données de formulaire.
 */

import { writeActivityLog } from '@/lib/logging/write';
import { getCurrentUserProfile } from './auth';

export interface ClientErrorReport {
    message: string;
    /** Empreinte fournie par Next.js pour retrouver la trace serveur. */
    digest?: string;
    /** Chemin visité au moment de l'erreur. */
    path?: string;
}

export interface ClientIncidentReport {
    source: 'realtime' | 'media';
    category: string;
    message: string;
    target?: string | null;
    origin?: string;
}

/**
 * Domaines et catégories acceptés depuis un navigateur.
 *
 * Fermé par construction : ajouter un incident suppose de l'ajouter ici, donc de
 * le décider explicitement plutôt que de le découvrir dans la base.
 */
const CLIENT_INCIDENT_CATEGORIES: Record<string, readonly string[]> = {
    realtime: ['channel.error', 'channel.timeout', 'channel.removed'],
    media: ['upload.error', 'preview.error'],
};

/** Identité de l'auteur, si une session existe — jamais bloquant. */
async function resolveActor(): Promise<{ id: string | null; name: string | null }> {
    const profile = await getCurrentUserProfile().catch(() => null);
    return { id: profile?.id ?? null, name: profile?.full_name ?? profile?.email ?? null };
}

/**
 * Remontée d'erreur depuis la frontière d'erreur du navigateur.
 *
 * Ouverte **sans garde de rôle** : le visiteur d'une page vitrine n'est pas
 * connecté, et c'est justement son incident qui intéresse l'exploitant. Le message
 * est tronqué, l'anti-inondation de `write.ts` regroupe les répétitions, ce qui
 * borne une boucle d'erreur.
 */
export async function reportClientError(payload: ClientErrorReport): Promise<void> {
    const message = (payload.message ?? '').trim().slice(0, 500);
    if (!message) return;

    const actor = await resolveActor();

    await writeActivityLog({
        level: 'critical',
        source: 'site',
        category: 'frontier.error',
        message,
        target: (payload.path ?? '').slice(0, 200) || null,
        context: payload.digest ? { digest: payload.digest } : null,
        origin: 'global-error',
        actorId: actor.id,
        actorName: actor.name,
    });
}

/**
 * Incident technique signalé par le navigateur, sur un outil du Cockpit.
 *
 * La gravité est **imposée** à `warning` : un navigateur n'est pas une autorité
 * sur la gravité, il ne peut donc pas fabriquer un incident critique.
 */
export async function reportClientIncident(payload: ClientIncidentReport): Promise<void> {
    const allowed = CLIENT_INCIDENT_CATEGORIES[payload.source];
    if (!allowed || !allowed.includes(payload.category)) return;

    const message = (payload.message ?? '').trim().slice(0, 400);
    if (!message) return;

    const actor = await resolveActor();

    await writeActivityLog({
        level: 'warning',
        source: payload.source,
        category: payload.category,
        message,
        target: (payload.target ?? '').slice(0, 200) || null,
        origin: (payload.origin ?? 'cockpit-client').slice(0, 120),
        actorId: actor.id,
        actorName: actor.name,
    });
}
