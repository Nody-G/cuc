/**
 * ==============================================================================
 * CUC — Performance vécue : validation **serveur** des mesures entrantes
 * ==============================================================================
 * Séparé de `vitals.ts` pour une raison mesurable : la validation n'a rien à
 * faire dans le bundle du navigateur. Le client collecte et propose, le serveur
 * valide et décide — et n'embarque dans la page que le strict nécessaire
 * (`audit:route-weight` le vérifie à chaque gate).
 *
 * Règle : toute entrée douteuse est **rejetée**, jamais corrigée en douce. Une
 * table de performance qui contient des valeurs inventées, ou qu'un tiers peut
 * remplir, ne vaut rien.
 */

import {
    MAX_SAMPLES_PER_REQUEST,
    MAX_VITALS_VALUE,
    isVitalsMetric,
    resolveLocale,
    resolveRating,
    sanitizePath,
    type VitalsSample,
} from './vitals';

/**
 * Valide une mesure entrante. Rejette plutôt que corriger, et **recalcule la
 * note** : le client propose, le serveur décide.
 */
export function normalizeVitalsSample(input: unknown): VitalsSample | null {
    if (typeof input !== 'object' || input === null) return null;
    const candidate = input as Record<string, unknown>;

    if (!isVitalsMetric(candidate.metric)) return null;
    if (typeof candidate.value !== 'number' || !Number.isFinite(candidate.value)) return null;
    if (candidate.value < 0 || candidate.value > MAX_VITALS_VALUE) return null;

    const path = sanitizePath(candidate.path);
    return {
        path,
        metric: candidate.metric,
        value: candidate.value,
        rating: resolveRating(candidate.metric, candidate.value),
        locale: resolveLocale(path),
    };
}

/**
 * Valide une charge utile complète : tableau non vide, taille bornée, toutes les
 * entrées valides (une seule entrée douteuse invalide la requête entière).
 */
export function normalizeVitalsBatch(input: unknown): VitalsSample[] | null {
    if (!Array.isArray(input)) return null;
    if (input.length === 0 || input.length > MAX_SAMPLES_PER_REQUEST) return null;

    const samples: VitalsSample[] = [];
    for (const entry of input) {
        const sample = normalizeVitalsSample(entry);
        if (!sample) return null;
        samples.push(sample);
    }
    return samples;
}
