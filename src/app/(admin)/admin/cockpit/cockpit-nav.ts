/**
 * Contrats de navigation du Cockpit — onglets, routes, hubs et modèles de menu.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune React ici, seulement la
 * correspondance onglet ↔ URL, la description des **hubs** (regroupements avec
 * sous-onglets) et les modèles du menu latéral.
 *
 * La construction des sections vit dans `cockpit-nav-sections.ts` et les
 * métadonnées d'affichage dans `cockpit-tab-metadata.ts`, afin de tenir le
 * plafond dur de 300 lignes (`AGENTS.md` § 2). Ces deux modules ne dépendent de
 * ce fichier que par des types (aucun cycle d'exécution).
 */

import type { LucideIcon } from 'lucide-react';

export type TabType =
    | 'dashboard'
    | 'logs'
    | 'inquiries'
    | 'pages'
    | 'navigation'
    | 'footer'
    | 'social'
    | 'disciplines'
    | 'campus'
    | 'campus-3d'
    | 'sessions'
    | 'team'
    | 'films'
    | 'partners'
    | 'events'
    | 'media'
    | 'announcements'
    | 'users'
    | 'audit'
    | 'health'
    | 'analytics'
    | 'translations'
    | 'microcopy'
    | 'settings'
    | 'instagram'
    | 'traffic'
    | 'help'
    // Hubs introduits par la réorganisation du 2026-10-01 : entrées de menu qui
    // regroupent des écrans existants sous des sous-onglets. Les valeurs
    // ci-dessus restent toutes valides (rétro-compatibilité des deep-links).
    | 'chrome'
    | 'journal'
    | 'audience';

/**
 * Source de vérité unique de la correspondance onglet ↔ segment d'URL.
 * Toute vue du Cockpit doit y figurer afin que le deep-linking, le bouton
 * Précédent/Suivant et le rafraîchissement direct d'une URL restent cohérents.
 *
 * Les entrées historiques sont **toutes conservées** : aucun deep-link existant
 * ne casse. Les hubs sont déclarés en tête pour que les URL historiques
 * `/admin/journal` et `/admin/audience` résolvent vers le hub (sous-onglet par
 * défaut pré-sélectionné) plutôt que vers l'un de leurs sous-onglets.
 */
export const TAB_ROUTES: ReadonlyArray<{ tab: TabType; segment: string }> = [
    { tab: 'journal', segment: 'journal' },
    { tab: 'audience', segment: 'audience' },
    { tab: 'chrome', segment: 'chrome' },
    { tab: 'traffic', segment: 'visites' },
    { tab: 'instagram', segment: 'instagram' },
    { tab: 'inquiries', segment: 'inquiries' },
    { tab: 'pages', segment: 'pages' },
    { tab: 'navigation', segment: 'navigation' },
    { tab: 'footer', segment: 'footer' },
    { tab: 'social', segment: 'social' },
    { tab: 'disciplines', segment: 'disciplines' },
    { tab: 'campus-3d', segment: 'campus-3d' },
    { tab: 'campus', segment: 'campus' },
    { tab: 'sessions', segment: 'sessions' },
    { tab: 'team', segment: 'team' },
    { tab: 'films', segment: 'films' },
    { tab: 'partners', segment: 'partners' },
    { tab: 'events', segment: 'events' },
    { tab: 'media', segment: 'media' },
    { tab: 'announcements', segment: 'announcements' },
    { tab: 'users', segment: 'users' },
    { tab: 'logs', segment: 'journal' },
    { tab: 'audit', segment: 'audit' },
    { tab: 'health', segment: 'health' },
    { tab: 'analytics', segment: 'analytics' },
    { tab: 'settings', segment: 'settings' },
    { tab: 'translations', segment: 'translations' },
    { tab: 'microcopy', segment: 'microtextes' },
    { tab: 'help', segment: 'aide' },
];

/** Résout un chemin d'URL vers l'onglet correspondant (ou `null` si inconnu). */
export function resolveTabFromPath(path: string): TabType | null {
    const match = TAB_ROUTES.find(({ segment }) => path.includes(`/${segment}`));
    return match ? match.tab : null;
}

/**
 * Résout l'URL canonique d'un onglet depuis `TAB_ROUTES`.
 *
 * Source unique : `switchTab` et le deep-linking ne peuvent plus diverger
 * (l'ancien code composait `/admin/${tab}`, ce qui envoyait « Visites » vers
 * `/admin/traffic` alors que l'URL canonique est `/admin/visites`).
 */
export function routeForTab(tab: TabType): string {
    if (tab === 'dashboard') return '/admin';
    const match = TAB_ROUTES.find((entry) => entry.tab === tab);
    return match ? `/admin/${match.segment}` : `/admin/${tab}`;
}

/* ------------------------------------------------------------------ */
/* Hubs : regroupements d'écrans existants sous des sous-onglets        */
/* ------------------------------------------------------------------ */

export interface CockpitHubSubTab {
    /** Onglet canonique rendu lorsque ce sous-onglet est actif. */
    tab: TabType;
    /** Libellé désambiguïsé affiché dans la barre de sous-onglets. */
    label: string;
}

export interface CockpitHubModel {
    /** Onglet du hub lui-même (entrée de la barre latérale). */
    id: TabType;
    label: string;
    /** Sous-onglet ouvert par défaut en l'absence de sous-onglet explicite. */
    defaultTab: TabType;
    subTabs: CockpitHubSubTab[];
}

/** Description des trois hubs du Cockpit (Chrome, Journal, Audience). */
export const COCKPIT_HUBS: readonly CockpitHubModel[] = [
    {
        id: 'chrome',
        label: 'Chrome du Site',
        defaultTab: 'announcements',
        subTabs: [
            { tab: 'announcements', label: 'Bandeau' },
            { tab: 'footer', label: 'Bas de Page' },
            { tab: 'social', label: 'Réseaux Sociaux' },
            { tab: 'settings', label: 'Coordonnées' },
        ],
    },
    {
        id: 'journal',
        label: 'Journal',
        defaultTab: 'logs',
        subTabs: [
            { tab: 'logs', label: 'Activité' },
            { tab: 'audit', label: 'Journal d’Audit' },
        ],
    },
    {
        id: 'audience',
        label: 'Statistiques & Audience',
        defaultTab: 'analytics',
        subTabs: [
            { tab: 'analytics', label: 'Statistiques & Conversion' },
            { tab: 'traffic', label: 'Visites du Site' },
        ],
    },
];

/** Récupère un hub par son identifiant d'onglet. */
export function getHub(hubId: TabType): CockpitHubModel | undefined {
    return COCKPIT_HUBS.find((hub) => hub.id === hubId);
}

/**
 * Détermine le hub qui rend un onglet donné — que l'onglet soit le hub lui-même
 * ou l'un de ses sous-onglets. C'est ce qui route les deep-links historiques
 * (`analytics`, `traffic`, `logs`, `audit`, `announcements`, `footer`, `social`,
 * `settings`) vers le hub correspondant, sous-onglet pré-sélectionné.
 */
export function getHubForTab(tab: TabType): CockpitHubModel | undefined {
    return COCKPIT_HUBS.find(
        (hub) => hub.id === tab || hub.subTabs.some((sub) => sub.tab === tab),
    );
}

/**
 * Sous-onglet à rendre pour un onglet actif : l'onglet lui-même s'il est un
 * sous-onglet déclaré, sinon le sous-onglet par défaut du hub.
 */
export function subTabFor(hub: CockpitHubModel, activeTab: TabType): TabType {
    return hub.subTabs.some((sub) => sub.tab === activeTab) ? activeTab : hub.defaultTab;
}

/**
 * Surbrillance de la barre latérale. Une entrée de hub reste active tant qu'un
 * de ses sous-onglets est ouvert — sans quoi changer de sous-onglet ferait
 * « disparaître » le surlignage du menu, puisque chaque sous-onglet est un
 * `TabType` distinct.
 */
export function isNavItemActive(itemId: TabType, activeTab: TabType): boolean {
    if (itemId === activeTab) return true;
    // Cas historique : `campus` est un sous-écran de « Campus & Installations ».
    if (itemId === 'campus-3d' && activeTab === 'campus') return true;
    const hub = getHub(itemId);
    return hub ? hub.subTabs.some((sub) => sub.tab === activeTab) : false;
}

/* ------------------------------------------------------------------ */
/* Modèles du menu latéral                                             */
/* ------------------------------------------------------------------ */

export interface CockpitNavItemModel {
    id: TabType;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

export interface CockpitNavSectionModel {
    title: string;
    items: CockpitNavItemModel[];
}

// Construction du menu et métadonnées d'affichage ré-exportées : les
// consommateurs historiques (`CockpitApp`) gardent un point d'entrée unique.
export { buildNavSections } from './cockpit-nav-sections';
export type { BuildNavSectionsArgs } from './cockpit-nav-sections';
export type { TabMetadata } from './cockpit-tab-metadata';
export { getTabMetadata } from './cockpit-tab-metadata';
