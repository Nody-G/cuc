/**
 * ==============================================================================
 * CUC — Performance réellement vécue : contrat **partagé** des mesures
 * ==============================================================================
 * Ce module porte ce que le navigateur **et** le serveur doivent connaître :
 * la liste des métriques, leurs seuils, la règle d'échantillonnage et le
 * nettoyage des chemins. Il ne touche ni au DOM ni au réseau : la collecte vit
 * dans `components/analytics/VitalsReporter.tsx`, la **validation stricte** dans
 * `vitals-validation.ts` (module serveur, jamais embarqué par le navigateur),
 * l'agrégation dans `scripts/audit_web_vitals.mjs`.
 *
 * Doctrine de charge (voir `durability_health.md` § 6) : la vitrine ne fait
 * **aucune** lecture par visiteur et n'ouvre aucun canal Realtime. La télémétrie
 * est la seule écriture du chemin public, et elle est **plafonnée par
 * construction** :
 *
 *  - **échantillonnée** : un visiteur sur vingt au maximum, décision prise une
 *    fois par session (jamais un tirage par métrique) ;
 *  - **une écriture par page vue**, au plus, et seulement à la sortie de page ;
 *  - **jamais bloquante** : sans `await`, sans conséquence sur l'affichage, et
 *    silencieuse en cas d'échec ;
 *  - **bornée côté serveur** : forme stricte, tableau de taille limitée, chemins
 *    nettoyés — un endpoint public ne doit pas pouvoir remplir une table.
 *
 * Seuils de notation : ce sont les seuils publics des Core Web Vitals
 * (bon / à améliorer / mauvais), pas des réglages maison.
 */

/** Métriques retenues — les Core Web Vitals et leurs compléments usuels. */
export const VITALS_METRICS = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'] as const;

export type VitalsMetric = (typeof VITALS_METRICS)[number];

export type VitalsRating = 'good' | 'needs-improvement' | 'poor';

/** Une mesure élémentaire, telle qu'elle est stockée. */
export interface VitalsSample {
    /** Chemin **nettoyé** de la page vue (sans requête ni fragment). */
    path: string;
    metric: VitalsMetric;
    value: number;
    rating: VitalsRating;
    locale: 'fr' | 'en';
}

/** Seuils officiels `[bon, à améliorer]` — au-delà : `poor`. */
const VITALS_THRESHOLDS: Record<VitalsMetric, readonly [number, number]> = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
};

/** Nombre maximal de mesures acceptées dans une requête (garde anti-abus). */
export const MAX_SAMPLES_PER_REQUEST = 8;

/** Taux d'échantillonnage par défaut : un visiteur sur vingt. */
export const DEFAULT_SAMPLE_RATE = 0.05;

/** Longueur maximale d'un chemin conservé. */
const MAX_PATH_LENGTH = 120;

export function isVitalsMetric(value: unknown): value is VitalsMetric {
    return typeof value === 'string' && (VITALS_METRICS as readonly string[]).includes(value);
}

/** Note d'une mesure, selon les seuils publics. */
export function resolveRating(metric: VitalsMetric, value: number): VitalsRating {
    const [good, needsImprovement] = VITALS_THRESHOLDS[metric];
    if (value <= good) return 'good';
    if (value <= needsImprovement) return 'needs-improvement';
    return 'poor';
}

/** Faut-il échantillonner ? `rand` est injecté pour rendre la règle testable. */
export function shouldSample(rand: number, rate: number = DEFAULT_SAMPLE_RATE): boolean {
    if (!Number.isFinite(rate) || rate <= 0) return false;
    if (rate >= 1) return true;
    if (!Number.isFinite(rand) || rand < 0) return false;
    return rand < rate;
}

/**
 * Nettoie un chemin avant stockage : jamais de requête, de fragment ni de valeur
 * libre. Un chemin vide devient `/`.
 */
export function sanitizePath(path: unknown): string {
    if (typeof path !== 'string') return '/';
    const clean = path.split('?')[0]?.split('#')[0]?.trim() ?? '';
    if (clean.length === 0) return '/';
    const normalized = clean.startsWith('/') ? clean : `/${clean}`;
    return normalized.slice(0, MAX_PATH_LENGTH);
}

/** Locale retenue : deux valeurs, jamais une chaîne libre. */
export function resolveLocale(path: string): 'fr' | 'en' {
    return path.startsWith('/en') ? 'en' : 'fr';
}

/** Valeur maximale acceptée pour une mesure (au-delà : artefact, pas une mesure). */
export const MAX_VITALS_VALUE = 600_000;
