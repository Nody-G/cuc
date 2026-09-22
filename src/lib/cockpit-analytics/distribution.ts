/**
 * Répartitions du moteur analytique : filtre les entrées nulles, calcule la
 * part de chaque libellé et trie par valeur décroissante.
 */

import type { DistributionSlice } from './types';

export function buildDistribution(
    entries: Array<{ label: string; value: number }>
): DistributionSlice[] {
    const total = entries.reduce((acc, e) => acc + e.value, 0);
    return entries
        .filter((e) => e.value > 0)
        .map((e) => ({
            label: e.label,
            value: e.value,
            share: total > 0 ? Math.round((e.value / total) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}
