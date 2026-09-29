/**
 * Pages éditables du Cockpit et structure de blocs — contrats & logique pure.
 *
 * Règle SRP (`AGENTS.md` § 1) : aucun React, aucune lecture réseau.
 *
 * Deux vérités distinctes, souvent confondues dans l'écran d'édition :
 *
 *  1. **Les pages** : le catalogue ci-dessous porte les libellés, et seules les
 *     pages réellement présentes en base sont proposées. Elles sont regroupées
 *     selon qu'elles apparaissent ou non dans le menu principal — le sélecteur
 *     ne mélange plus « pages du menu » et « pages secondaires ».
 *  2. **Les blocs** : `layout_sections` n'est lu par la vitrine que sur quelques
 *     pages (`BLOCK_STRUCTURE_PAGES`). Ailleurs, réordonner des blocs n'a aucun
 *     effet : l'écran le dit au lieu de laisser croire à un réglage actif.
 */

import type { SiteNavigation } from '@/data/navigation';

export interface PageChoice {
    value: string;
    label: string;
    inMenu: boolean;
}

export interface PageChoiceGroup {
    id: 'menu' | 'other';
    label: string;
    options: PageChoice[];
}

/** Catalogue des pages éditables : slug → libellé affiché. */
export const SITE_PAGE_CATALOG = [
    { value: '/', label: 'Accueil (/)' },
    { value: 'formation-de-cascadeur', label: 'Formation Pro 2 Ans (/formation-de-cascadeur)' },
    { value: 'stages-cascades-parkour-2', label: 'Stages & Initiations (/stages-cascades-parkour-2)' },
    { value: 'stunt-workshop-cuc', label: 'Stunt Workshops Masterclass (/stunt-workshop-cuc)' },
    { value: 'equipe-cascadeurs-pro', label: 'Équipe & Instructeurs (/equipe-cascadeurs-pro)' },
    { value: 'cuc-team-cascadeur', label: 'CUC Team & Action Design (/cuc-team-cascadeur)' },
    { value: 'cuc-events-agence', label: 'CUC Events Agence (/cuc-events-agence)' },
    { value: 'team-building-cascades', label: 'Team Building (/team-building-cascades)' },
    {
        value: 'spectacles-cascadeurs-yamakasi',
        label: 'Spectacles Yamakasi (/spectacles-cascadeurs-yamakasi)',
    },
    { value: 'animations-airbag-parkour', label: 'Animations Airbag (/animations-airbag-parkour)' },
    { value: 'visite-virtuelle', label: 'Visite Virtuelle 360° (/visite-virtuelle)' },
    { value: 'visite-guidee', label: 'Visite Guidée Campus (/visite-guidee)' },
    { value: 'videos-cascadeur', label: 'Vidéos & Démos (/videos-cascadeur)' },
    { value: 'partenaires', label: 'Partenaires & Studios (/partenaires)' },
    { value: 'contact-cuc', label: 'Contact & Accès (/contact-cuc)' },
] as const;

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

/** Tous les slugs de pages cités par la navigation principale (liens + sous-liens). */
export function collectMenuSlugs(navigation: SiteNavigation | null | undefined): Set<string> {
    const slugs = new Set<string>();
    const items = navigation?.structure?.items ?? [];

    const visit = (item: unknown): void => {
        if (typeof item !== 'object' || item === null) return;
        const record = item as { href?: unknown; children?: unknown; items?: unknown };
        if (typeof record.href === 'string' && record.href.trim().length > 0) {
            slugs.add(toPageKey(record.href));
        }
        for (const nested of [record.children, record.items]) {
            if (Array.isArray(nested)) nested.forEach(visit);
        }
    };

    items.forEach(visit);
    return slugs;
}

export interface BuildPageGroupsInput {
    /** Slugs réellement présents en base (`site_pages`). */
    availableSlugs: readonly string[];
    /** Slugs cités par le menu principal. */
    menuSlugs: ReadonlySet<string>;
}

/**
 * Construit les groupes du sélecteur de page.
 *
 * Seules les pages **réellement en base** sont proposées, et celles du menu sont
 * séparées des pages secondaires : l'écran ne liste plus des entrées que le
 * header n'expose pas au même endroit.
 */
export function buildPageGroups({
    availableSlugs,
    menuSlugs,
}: BuildPageGroupsInput): PageChoiceGroup[] {
    const available = new Set(availableSlugs.map(toPageKey));

    const menu: PageChoice[] = [];
    const other: PageChoice[] = [];

    for (const choice of SITE_PAGE_CATALOG) {
        const key = toPageKey(choice.value);
        if (!available.has(key)) continue;
        const inMenu = menuSlugs.has(key);
        (inMenu ? menu : other).push({ value: choice.value, label: choice.label, inMenu });
    }

    const groups: PageChoiceGroup[] = [];
    if (menu.length > 0) {
        groups.push({ id: 'menu', label: 'Pages du menu principal', options: menu });
    }
    if (other.length > 0) {
        groups.push({ id: 'other', label: 'Autres pages (hors menu)', options: other });
    }
    return groups;
}
