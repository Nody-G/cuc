/**
 * Pages éditables du Cockpit — catalogue & structure de blocs (logique pure).
 *
 * Règle SRP (`AGENTS.md` § 1) : aucun React, aucune lecture réseau.
 *
 * Deux vérités distinctes, souvent confondues dans l'écran d'édition :
 *
 *  1. **Les pages** : le catalogue ci-dessous porte le **nom canonique lisible**
 *     de chaque page (casse normale, sans slug collé). C'est le seul nom de page
 *     affiché, partagé par le sélecteur d'édition, le libellé du menu et celui du
 *     pied de page — l'arborescence et les emplacements vivent dans
 *     `page-tree.ts`, jamais ici.
 *  2. **Les blocs** : `layout_sections` n'est lu par la vitrine que sur quelques
 *     pages (`BLOCK_STRUCTURE_PAGES`). Ailleurs, réordonner des blocs n'a aucun
 *     effet : l'écran le dit au lieu de laisser croire à un réglage actif.
 */

/** Une entrée du catalogue : slug canonique → nom canonique lisible. */
export interface SitePageCatalogEntry {
    /** Slug réel de la route vitrine (`/` pour l'accueil). */
    value: string;
    /** Nom canonique lisible, casse normale — unique nom de page affiché. */
    label: string;
}

/**
 * Nom canonique de chaque page vitrine.
 *
 * Le slug n'est **pas** répété dans le libellé : il est affiché à part, en
 * monospace, là où il sert (sélecteur, fiche d'identité de la page).
 */
export const SITE_PAGE_CATALOG: readonly SitePageCatalogEntry[] = [
    { value: '/', label: 'Accueil' },
    { value: 'formation-de-cascadeur', label: 'Formation de cascadeur' },
    { value: 'stages-cascades-parkour-2', label: 'Stages & séjours' },
    { value: 'stunt-workshop-cuc', label: 'Workshop international' },
    { value: 'equipe-cascadeurs-pro', label: 'Équipe & instructeurs' },
    { value: 'cuc-team-cascadeur', label: 'Tournages & action design' },
    { value: 'cuc-events-agence', label: 'CUC Events (agence)' },
    { value: 'team-building-cascades', label: 'Team building' },
    { value: 'spectacles-cascadeurs-yamakasi', label: 'Spectacles Yamakasi' },
    { value: 'animations-airbag-parkour', label: 'Animations airbag' },
    { value: 'visite-virtuelle', label: 'Visite virtuelle 360°' },
    { value: 'visite-guidee', label: 'Visite guidée du campus' },
    { value: 'videos-cascadeur', label: 'Vidéos & démos' },
    { value: 'partenaires', label: 'Partenaires & studios' },
    { value: 'contact-cuc', label: 'Contact & accès' },
];

/**
 * Pages dont la vitrine lit réellement `layout_sections`.
 *
 * Vérifié dans le code des routes (`HomeView`, `cuc-events-agence`,
 * `cuc-team-cascadeur`, `partenaires`, `visite-virtuelle`, `visite-guidee`,
 * `videos-cascadeur`). Ailleurs, l'agencement des blocs est inerte.
 */
export const BLOCK_STRUCTURE_PAGES: readonly string[] = [
    '/',
    'cuc-events-agence',
    'cuc-team-cascadeur',
    'partenaires',
    'visite-virtuelle',
    'visite-guidee',
    'videos-cascadeur',
];

/** Normalise un slug ou un href en clé de comparaison. */
export function toPageKey(value: string): string {
    const withoutOrigin = value.replace(/^https?:\/\/[^/]+/i, '');
    const [path] = withoutOrigin.split(/[?#]/);
    if (!path || path === '/') return '/';
    return path.replace(/^\/+|\/+$/g, '');
}

/** `true` si la page rend ses blocs selon `layout_sections`. */
export function readsBlockStructure(slug: string): boolean {
    return BLOCK_STRUCTURE_PAGES.includes(toPageKey(slug));
}

/** Nom canonique connu pour un slug, ou `null` si la page sort du catalogue. */
export function catalogPageLabel(slug: string): string | null {
    const key = toPageKey(slug);
    return SITE_PAGE_CATALOG.find((entry) => toPageKey(entry.value) === key)?.label ?? null;
}
