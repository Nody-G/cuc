/**
 * Plages temporelles partagées — une seule source de vérité.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions **pures**, `nowMs`
 * injecté. Le §4 de `durability_health.md` est explicite — « toute duplication
 * locale est un bug futur ». Ces plages servaient au seul journal d'audit ; le
 * hub Journal les emploie désormais aussi, et les redéfinir une deuxième fois
 * aurait garanti deux jeux de seuils divergents.
 */

export type RangeFilter = 'all' | '24h' | '7d' | '30d';

export const RANGE_OPTIONS: readonly RangeFilter[] = ['all', '24h', '7d', '30d'];

export const RANGE_LABELS: Record<RangeFilter, string> = {
    all: 'Tout l’historique',
    '24h': 'Dernières 24 h',
    '7d': '7 derniers jours',
    '30d': '30 derniers jours',
};

export const RANGE_MS: Record<Exclude<RangeFilter, 'all'>, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

/**
 * Borne basse en millisecondes, ou `null` pour « tout l'historique ».
 *
 * `null` est explicite plutôt que `-Infinity` ou `0` : un `0` mal interprété
 * deviendrait 1970, et un filtre silencieusement inopérant.
 */
export function rangeThresholdMs(range: RangeFilter, nowMs: number): number | null {
    if (range === 'all') return null;
    return nowMs - RANGE_MS[range];
}

/** Borne basse au format ISO attendu par Supabase, ou `null`. */
export function rangeSinceIso(range: RangeFilter, nowMs: number): string | null {
    const threshold = rangeThresholdMs(range, nowMs);
    return threshold === null ? null : new Date(threshold).toISOString();
}

/** L'horodatage ISO tombe-t-il dans la plage demandée ? */
export function isWithinRange(iso: string, range: RangeFilter, nowMs: number): boolean {
    const threshold = rangeThresholdMs(range, nowMs);
    if (threshold === null) return true;
    const at = new Date(iso).getTime();
    // Un horodatage illisible est écarté : le retenir laisserait passer une
    // donnée qu'on ne sait pas dater.
    if (Number.isNaN(at)) return false;
    return at >= threshold;
}
