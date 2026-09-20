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
