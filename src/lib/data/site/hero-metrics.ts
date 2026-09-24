/**
 * ==============================================================================
 * CUC — Métriques rapides du hero (domaine)
 * ==============================================================================
 * Les métriques du hero sont fusionnées **index par index** avec le catalogue
 * traduit (`mergeSectionItems`, cf. `ParallaxHero`) : la structure est stable,
 * une surcharge ne crée ni ne supprime jamais de métrique.
 *
 * Le Cockpit doit écrire dans ces mêmes règles — d'où ces fonctions pures,
 * déterministes et testables hors du cycle de vie UI (`AGENTS.md` § 1, couche
 * « Domaine & Services ») : une écriture ne touche jamais les autres métriques,
 * n'invente aucun trou et laisse le repli traduit intact quand la valeur est
 * vide.
 */

export interface HeroMetricValue {
    val?: string;
    label?: string;
}

/** Clés éditables d'une métrique. */
export type HeroMetricKey = 'val' | 'label';

/**
 * Surcharge d'une métrique, ou `undefined` — le catalogue traduit reste alors
 * la source affichée (repli).
 */
export function readHeroMetricOverride(
    metrics: readonly HeroMetricValue[] | undefined,
    index: number
): HeroMetricValue | undefined {
    if (!Array.isArray(metrics) || !Number.isInteger(index) || index < 0) return undefined;
    const metric = metrics[index];
    return metric && typeof metric === 'object' ? metric : undefined;
}

/**
 * Écrit `value` dans la métrique `index`, en copie immuable : les autres
 * métriques sont préservées, les positions intermédiaires absentes sont comblées
 * par des objets vides (aucun trou de tableau), et un index invalide laisse la
 * liste inchangée.
 */
export function writeHeroMetricOverride(
    metrics: readonly HeroMetricValue[] | undefined,
    index: number,
    key: HeroMetricKey,
    value: string
): HeroMetricValue[] {
    if (!Number.isInteger(index) || index < 0) return [...(metrics ?? [])];

    const length = Math.max(metrics?.length ?? 0, index + 1);
    const next: HeroMetricValue[] = [];
    for (let position = 0; position < length; position += 1) {
        const metric = metrics?.[position];
        next.push(metric && typeof metric === 'object' ? { ...metric } : {});
    }

    next[index] = { ...next[index], [key]: value };
    return next;
}
