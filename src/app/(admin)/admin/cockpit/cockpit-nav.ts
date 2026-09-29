/**
 * Contrats de navigation du Cockpit — onglets, routes, sections du menu.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune React ici, seulement
 * la correspondance onglet ↔ URL et la construction des sections du menu.
 */
import {
    Activity,
    Bell,
    Boxes,
    Briefcase,
    Calendar,
    FileText,
    Film,
    Globe,
    Handshake,
    Image as ImageIcon,
    Inbox,
    LayoutDashboard,
    Menu,
    PanelBottom,
    Settings,
    Share2,
    Users,
    Shield,
    type LucideIcon,
} from 'lucide-react';

export type TabType =
    | 'dashboard'
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
    | 'traffic';

/**
 * Source de vérité unique de la correspondance onglet ↔ segment d'URL.
 * Toute vue du Cockpit doit y figurer afin que le deep-linking, le bouton
 * Précédent/Suivant et le rafraîchissement direct d'une URL restent cohérents.
 */
export const TAB_ROUTES: ReadonlyArray<{ tab: TabType; segment: string }> = [
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
    { tab: 'audit', segment: 'audit' },
    { tab: 'health', segment: 'health' },
    { tab: 'analytics', segment: 'analytics' },
    { tab: 'settings', segment: 'settings' },
    { tab: 'translations', segment: 'translations' },
    { tab: 'microcopy', segment: 'microtextes' },
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
/* Sections du menu latéral                                            */
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

export interface BuildNavSectionsArgs {
    userRole: string;
    newInquiriesCount: number;
    /** Bandeau flash actif — affiche le badge « Live ». */
    announcementActive: boolean;
}

/**
 * Construit les sections du menu selon le rôle (admin, directeur, secrétaire,
 * coach) : chaque item masqué l'est par construction, jamais par CSS.
 */
export function buildNavSections({
    userRole,
    newInquiriesCount,
    announcementActive,
}: BuildNavSectionsArgs): CockpitNavSectionModel[] {
    const isDirecteurOrAdmin = ['directeur', 'admin'].includes(userRole);
    const isSecretaire = userRole === 'secretaire';
    const isCoach = userRole === 'coach';

    // Vue Coach simplifiée et focalisée sur ses interventions
    if (isCoach) {
        return [
            {
                title: 'Mes Activités & Fiche',
                items: [
                    { id: 'sessions', label: 'Sessions Encadrées', icon: Calendar },
                    { id: 'team', label: 'Ma Fiche Formateur', icon: Users },
                    { id: 'films', label: 'Mes Films & Crédits', icon: Film },
                ],
            },
        ];
    }

    return [
        {
            title: '1. Inscriptions & Planning',
            items: [
                { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
                {
                    id: 'inquiries',
                    label: 'Contact',
                    icon: Inbox,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} nouveau` : undefined,
                },
                {
                    id: 'sessions',
                    label: 'Sessions de Formation',
                    icon: Calendar,
                },
            ],
        },
        {
            title: '2. Formations, Coachs & Films',
            items: [
                {
                    id: 'pages',
                    label: 'Pages du Site',
                    icon: FileText,
                },
                {
                    id: 'films',
                    label: 'Filmographie & Cascades',
                    icon: Film,
                },
                ...(!isSecretaire
                    ? [
                        {
                            id: 'team' as TabType,
                            label: 'Coachs & Formateurs',
                            icon: Users,
                        },
                    ]
                    : []),
                {
                    id: 'campus-3d',
                    label: 'Campus & Installations',
                    icon: Boxes,
                },
                ...(isDirecteurOrAdmin
                    ? [
                        { id: 'disciplines' as TabType, label: 'Disciplines Enseignées', icon: Shield },
                        { id: 'events' as TabType, label: 'Agence & Événements Pro', icon: Briefcase },
                        { id: 'partners' as TabType, label: 'Partenaires', icon: Handshake },
                    ]
                    : []),
            ],
        },
        ...(isDirecteurOrAdmin
            ? [
                {
                    title: '3. Réseaux & Visites',
                    items: [
                        { id: 'instagram' as TabType, label: 'Instagram & Vidéos', icon: Activity },
                        { id: 'traffic' as TabType, label: 'Visites du Site', icon: Globe },
                        { id: 'media' as TabType, label: 'Médiathèque (Photos & Médias)', icon: ImageIcon },
                    ],
                },
            ]
            : [
                {
                    title: '3. Réseaux & Médias',
                    items: [
                        { id: 'media' as TabType, label: 'Médiathèque (Photos & Médias)', icon: ImageIcon },
                    ],
                },
            ]),
        {
            title: '4. Réglages du Site',
            items: [
                {
                    id: 'announcements',
                    label: 'Bandeau d\'Alerte',
                    icon: Bell,
                    badge: announcementActive ? 'Actif' : undefined,
                },
                {
                    id: 'navigation',
                    label: 'Menus du Site',
                    icon: Menu,
                },
                ...(isDirecteurOrAdmin
                    ? [
                        { id: 'footer' as TabType, label: 'Bas de Page (Footer)', icon: PanelBottom },
                        { id: 'social' as TabType, label: 'Réseaux Sociaux', icon: Share2 },
                        { id: 'settings' as TabType, label: 'Coordonnées & Paramètres', icon: Settings },
                        { id: 'users' as TabType, label: 'Comptes & Accès', icon: Users },
                    ]
                    : []),
            ],
        },
    ];
}

export interface TabMetadata {
    label: string;
    sectionTitle: string;
    icon: LucideIcon;
}

const TAB_METADATA_MAP: Record<TabType, TabMetadata> = {
    dashboard: { label: 'Tableau de Bord', sectionTitle: 'Inscriptions & Planning', icon: LayoutDashboard },
    inquiries: { label: 'Contact', sectionTitle: 'Inscriptions & Planning', icon: Inbox },
    sessions: { label: 'Sessions de Formation', sectionTitle: 'Inscriptions & Planning', icon: Calendar },
    pages: { label: 'Pages du Site', sectionTitle: 'Formations & Films', icon: FileText },
    films: { label: 'Filmographie & Cascades', sectionTitle: 'Formations & Films', icon: Film },
    team: { label: 'Coachs & Formateurs', sectionTitle: 'Formations & Films', icon: Users },
    campus: { label: 'Campus & Installations', sectionTitle: 'Formations & Films', icon: Boxes },
    'campus-3d': { label: 'Campus & Installations', sectionTitle: 'Formations & Films', icon: Boxes },
    disciplines: { label: 'Disciplines Enseignées', sectionTitle: 'Formations & Films', icon: Shield },
    events: { label: 'Agence & Événements Pro', sectionTitle: 'Formations & Films', icon: Briefcase },
    partners: { label: 'Partenaires', sectionTitle: 'Formations & Films', icon: Handshake },
    instagram: { label: 'Instagram & Vidéos', sectionTitle: 'Réseaux & Visites', icon: Activity },
    traffic: { label: 'Visites du Site', sectionTitle: 'Réseaux & Visites', icon: Globe },
    media: { label: 'Médiathèque (Photos & Médias)', sectionTitle: 'Réseaux & Visites', icon: ImageIcon },
    announcements: { label: 'Bandeau d\'Alerte', sectionTitle: 'Réglages du Site', icon: Bell },
    navigation: { label: 'Menus du Site', sectionTitle: 'Réglages du Site', icon: Menu },
    footer: { label: 'Bas de Page (Footer)', sectionTitle: 'Réglages du Site', icon: PanelBottom },
    social: { label: 'Réseaux Sociaux', sectionTitle: 'Réglages du Site', icon: Share2 },
    settings: { label: 'Coordonnées & Paramètres', sectionTitle: 'Réglages du Site', icon: Settings },
    users: { label: 'Comptes & Accès', sectionTitle: 'Réglages du Site', icon: Users },
    audit: { label: 'Journal d’Audit', sectionTitle: 'Outils Système', icon: Activity },
    health: { label: 'Diagnostic du Site', sectionTitle: 'Outils Système', icon: Activity },
    analytics: { label: 'Statistiques & Conversion', sectionTitle: 'Inscriptions & Planning', icon: Activity },
    translations: { label: 'Traductions Anglaises', sectionTitle: 'Réglages du Site', icon: Globe },
    microcopy: { label: 'Textes & Boutons du Site', sectionTitle: 'Réglages du Site', icon: FileText },
};

export function getTabMetadata(tab: TabType): TabMetadata {
    return TAB_METADATA_MAP[tab] || { label: tab, sectionTitle: 'Cockpit', icon: LayoutDashboard };
}
