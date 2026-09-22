import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

/**
 * Fabrique de canaux Supabase Realtime SÛRS.
 *
 * Problème résolu (panne réelle en production) :
 * ----------------------------------------------
 * `supabase.channel(name)` renvoie le canal EXISTANT si un canal portant le
 * même nom est déjà enregistré sur le client. Or `@supabase/supabase-js`
 * interdit d'appeler `.on('postgres_changes', ...)` sur un canal déjà abonné :
 * il lève une exception SYNCHRONE non capturée.
 *
 *   "cannot add postgres_changes callbacks for realtime:<name> after subscribe()"
 *
 * Cette exception remontait jusqu'à la frontière `global-error` de Next.js et
 * affichait « This page couldn't load / Reload to try again, or go back. » sur
 * TOUTES les pages publiques. Deux causes de collision :
 *   1. React StrictMode double-monte les effets en développement ;
 *   2. les remontages de navigation réutilisaient le même nom de canal.
 *
 * La parade est double :
 *   - un suffixe unique par instance (`#<seq>`) garantit qu'aucun canal n'est
 *     jamais réutilisé ;
 *   - un `try/catch` empêche toute exception Realtime de faire tomber la page.
 *
 * Doctrine : Realtime est un CONFORT (synchronisation instantanée), jamais une
 * dépendance dure. En cas d'échec, le contenu initial (fallback) reste affiché.
 */

let channelSeq = 0;

/** Retourne un nom de canal unique et non réutilisable. */
export function uniqueChannelName(base: string): string {
    channelSeq += 1;
    return `${base}#${channelSeq}`;
}

/**
 * Crée un canal Realtime en absorbant toute exception.
 *
 * @param supabase  Client Supabase (navigateur).
 * @param baseName  Nom logique du canal (ex. `site_social_links:all`).
 * @param configure Callback qui enregistre les écouteurs `.on(...)`.
 * @returns Le canal abonné, ou `null` si Realtime est indisponible.
 */
export function createSafeChannel(
    supabase: SupabaseClient,
    baseName: string,
    configure: (channel: RealtimeChannel) => RealtimeChannel
): RealtimeChannel | null {
    try {
        const channel = configure(supabase.channel(uniqueChannelName(baseName)));
        channel.subscribe();
        return channel;
    } catch {
        /* Realtime indisponible : le fallback statique reste affiché. */
        return null;
    }
}

/** Retire un canal en absorbant toute exception. */
export function removeSafeChannel(
    supabase: SupabaseClient,
    channel: RealtimeChannel | null
): void {
    if (!channel) return;
    try {
        supabase.removeChannel(channel);
    } catch {
        /* Déjà retiré ou client fermé : sans conséquence. */
    }
}

/* ------------------------------------------------------------------ *
 * Canal PARTAGÉ par client — un seul WebSocket pour toute la page
 * ------------------------------------------------------------------ */

export interface PostgresChangeConfig {
    table: string;
    filter?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

interface SharedChannelEntry {
    channel: RealtimeChannel;
    listeners: number;
    subscribed: boolean;
}

/** Un canal partagé par client Supabase (et non un canal par écoute). */
const sharedChannels = new WeakMap<SupabaseClient, SharedChannelEntry>();

/**
 * Écoute `postgres_changes` sur un **canal partagé par client**.
 *
 * Pourquoi : une page publique pouvait ouvrir 5 à 7 canaux Realtime (navigation,
 * pied de page, réseaux sociaux, page, traductions, annonces, films…), soit
 * autant de WebSockets par visiteur — la vraie limite de charge, bien avant la
 * base elle-même. Ici, tous les hooks montés dans le même commit React
 * s'enregistrent sur le même canal : **un seul WebSocket** en régime nominal.
 *
 * La souscription est différée d'un tick (`queueMicrotask`) précisément pour
 * laisser les autres hooks du même rendu s'enregistrer avant `subscribe()`
 * (Supabase interdit d'ajouter un écouteur après souscription).
 *
 * Doctrine inchangée : Realtime est un CONFORT. Toute exception est absorbée et
 * la fonction de désabonnement reste sûre.
 */
export function subscribeTable(
    supabase: SupabaseClient,
    config: PostgresChangeConfig,
    handler: (payload: { new: unknown; eventType?: string; old?: unknown }) => void
): () => void {
    try {
        let entry = sharedChannels.get(supabase);
        if (!entry || entry.subscribed) {
            const channel = supabase.channel(uniqueChannelName('cuc:shared'));
            const created: SharedChannelEntry = { channel, listeners: 0, subscribed: false };
            queueMicrotask(() => {
                if (created.subscribed) return;
                created.subscribed = true;
                try {
                    created.channel.subscribe();
                } catch {
                    /* Realtime indisponible : le repli statique reste affiché. */
                }
            });
            sharedChannels.set(supabase, created);
            entry = created;
        }

        const target = entry;
        const state = { active: true };

        target.channel.on(
            'postgres_changes',
            {
                event: config.event ?? '*',
                schema: 'public',
                table: config.table,
                ...(config.filter ? { filter: config.filter } : {}),
            },
            (payload) => {
                if (!state.active) return;
                handler(payload as { new: unknown; eventType?: string; old?: unknown });
            }
        );
        target.listeners += 1;

        return () => {
            state.active = false;
            target.listeners -= 1;
            if (target.listeners > 0) return;
            if (sharedChannels.get(supabase) === target) sharedChannels.delete(supabase);
            try {
                supabase.removeChannel(target.channel);
            } catch {
                /* Déjà retiré ou client fermé : sans conséquence. */
            }
        };
    } catch {
        return () => {
            /* Aucun canal créé : rien à retirer. */
        };
    }
}
