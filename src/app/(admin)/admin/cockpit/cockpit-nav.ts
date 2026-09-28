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
    { tab: 'campus', segment: 'campus' },
    { tab: 'campus-3d', segment: 'campus-3d' },
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
            title: '1. Pilotage & Inscriptions',
            items: [
                { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
                {
                    id: 'inquiries',
                    label: 'Candidatures & Contacts',
                    icon: Inbox,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} nouveau` : undefined,
                },
                {
                    id: 'sessions',
                    label: 'Sessions & Calendrier',
                    icon: Calendar,
                },
            ],
        },
        {
            title: '2. Métier & Contenus du Campus',
            items: [
                {
                    id: 'pages',
                    label: 'Éditeur Mode Studio',
                    icon: FileText,
                    badge: 'Visuel',
                },
                {
                    id: 'films',
                    label: 'Filmographie Cascades',
                    icon: Film,
                    badge: '570+',
                },
                ...(!isSecretaire
                    ? [
                        {
                            id: 'team' as TabType,
                            label: 'Équipe & Coachs',
                            icon: Users,
                            badge: '20',
                        },
                    ]
                    : []),
                {
                    id: 'campus-3d',
                    label: 'Campus & Installations',
                    icon: Boxes,
                    badge: '3D + POI',
                },
                ...(isDirecteurOrAdmin
                    ? [
                        { id: 'disciplines' as TabType, label: 'Disciplines & Modules', icon: Shield },
                        { id: 'events' as TabType, label: 'Agence & Events B2B', icon: Briefcase },
                        { id: 'partners' as TabType, label: 'Partenaires & Marques', icon: Handshake },
                    ]
                    : []),
            ],
        },
        ...(isDirecteurOrAdmin
            ? [
                {
                    title: '3. Notoriété & Médias',
                    items: [
                        { id: 'instagram' as TabType, label: 'Instagram Live', icon: Activity, badge: '1,12M' },
                        { id: 'traffic' as TabType, label: 'Fréquentation Web', icon: Globe, badge: 'Live' },
                        { id: 'media' as TabType, label: 'Médiathèque Cloud', icon: ImageIcon, badge: 'CDN' },
                    ],
                },
            ]
            : [
                {
                    title: '3. Médias & Ressources',
                    items: [
                        { id: 'media' as TabType, label: 'Médiathèque Cloud', icon: ImageIcon, badge: 'CDN' },
                    ],
                },
            ]),
        {
            title: '4. Configuration & Site',
            items: [
                {
                    id: 'announcements',
                    label: 'Bandeau Flash Urgent',
                    icon: Bell,
                    badge: announcementActive ? 'Actif' : undefined,
                },
                {
                    id: 'navigation',
                    label: 'Menus & Navigation',
                    icon: Menu,
                },
                ...(isDirecteurOrAdmin
                    ? [
                        { id: 'footer' as TabType, label: 'Pied de Page (Footer)', icon: PanelBottom },
                        { id: 'social' as TabType, label: 'Réseaux Sociaux', icon: Share2 },
                        { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
                        { id: 'users' as TabType, label: 'Équipe Cockpit & Rôles', icon: Users },
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
    dashboard: { label: 'Tableau de Bord', sectionTitle: 'Pilotage', icon: LayoutDashboard },
    inquiries: { label: 'Candidatures & Contacts', sectionTitle: 'Pilotage', icon: Inbox },
    sessions: { label: 'Sessions & Calendrier', sectionTitle: 'Pilotage', icon: Calendar },
    pages: { label: 'Éditeur Mode Studio', sectionTitle: 'Campus & Contenus', icon: FileText },
    films: { label: 'Filmographie Cascades', sectionTitle: 'Campus & Contenus', icon: Film },
    team: { label: 'Équipe & Coachs', sectionTitle: 'Campus & Contenus', icon: Users },
    campus: { label: 'Campus & Installations', sectionTitle: 'Campus & Contenus', icon: Boxes },
    'campus-3d': { label: 'Campus & Installations', sectionTitle: 'Campus & Contenus', icon: Boxes },
    disciplines: { label: 'Disciplines & Modules', sectionTitle: 'Campus & Contenus', icon: Shield },
    events: { label: 'Agence & Events B2B', sectionTitle: 'Campus & Contenus', icon: Briefcase },
    partners: { label: 'Partenaires & Marques', sectionTitle: 'Campus & Contenus', icon: Handshake },
    instagram: { label: 'Instagram Live', sectionTitle: 'Notoriété & Médias', icon: Activity },
    traffic: { label: 'Fréquentation Web', sectionTitle: 'Notoriété & Médias', icon: Globe },
    media: { label: 'Médiathèque Cloud', sectionTitle: 'Notoriété & Médias', icon: ImageIcon },
    announcements: { label: 'Bandeau Flash Urgent', sectionTitle: 'Configuration & Site', icon: Bell },
    navigation: { label: 'Menus & Navigation', sectionTitle: 'Configuration & Site', icon: Menu },
    footer: { label: 'Pied de Page (Footer)', sectionTitle: 'Configuration & Site', icon: PanelBottom },
    social: { label: 'Réseaux Sociaux', sectionTitle: 'Configuration & Site', icon: Share2 },
    settings: { label: 'Paramètres Globaux', sectionTitle: 'Configuration & Site', icon: Settings },
    users: { label: 'Équipe Cockpit & Rôles', sectionTitle: 'Configuration & Site', icon: Users },
    audit: { label: 'Journal d’Audit', sectionTitle: 'Outils Système', icon: Activity },
    health: { label: 'Diagnostic de Santé', sectionTitle: 'Outils Système', icon: Activity },
    analytics: { label: 'Tableau Analytique', sectionTitle: 'Pilotage', icon: Activity },
    translations: { label: 'Traductions Multilingues', sectionTitle: 'Configuration & Site', icon: Globe },
    microcopy: { label: 'Micro-textes du Site', sectionTitle: 'Configuration & Site', icon: FileText },
};

export function getTabMetadata(tab: TabType): TabMetadata {
    return TAB_METADATA_MAP[tab] || { label: tab, sectionTitle: 'Cockpit', icon: LayoutDashboard };
}
