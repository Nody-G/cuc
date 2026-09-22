/**
 * Contrats de navigation du Cockpit — onglets, routes, sections du menu.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : aucune React ici, seulement
 * la correspondance onglet ↔ URL et la construction des sections du menu.
 */
import {
    Activity,
    BarChart3,
    Bell,
    Boxes,
    Calendar,
    Compass,
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
    Sparkles,
    Stethoscope,
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
    | 'settings';

/**
 * Source de vérité unique de la correspondance onglet ↔ segment d'URL.
 * Toute vue du Cockpit doit y figurer afin que le deep-linking, le bouton
 * Précédent/Suivant et le rafraîchissement direct d'une URL restent cohérents.
 */
export const TAB_ROUTES: ReadonlyArray<{ tab: TabType; segment: string }> = [
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

    return [
        {
            title: "Vue d'ensemble",
            items: [
                { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
                {
                    id: 'inquiries',
                    label: 'Candidatures & Devis',
                    icon: Inbox,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} new` : undefined,
                },
                ...(isDirecteurOrAdmin
                    ? [{ id: 'analytics' as TabType, label: 'Analytique', icon: BarChart3 }]
                    : []),
            ],
        },
        ...(!isCoach
            ? [
                {
                    title: "CMS & Vitrine",
                    items: [
                        {
                            id: 'pages' as TabType,
                            label: 'Éditeur de Pages & Structure',
                            icon: FileText,
                            badge: '15',
                        },
                        {
                            id: 'navigation' as TabType,
                            label: 'Navigation & Menus',
                            icon: Menu,
                        },
                        {
                            id: 'footer' as TabType,
                            label: 'Pied de Page',
                            icon: PanelBottom,
                        },
                        {
                            id: 'social' as TabType,
                            label: 'Réseaux Sociaux',
                            icon: Share2,
                        },
                        {
                            id: 'translations' as TabType,
                            label: 'Traductions EN',
                            icon: Globe,
                            badge: 'i18n',
                        },
                        {
                            id: 'microcopy' as TabType,
                            label: 'Micro-textes du site',
                            icon: Globe,
                            badge: 'studio',
                        },
                        {
                            id: 'media' as TabType,
                            label: 'Médiathèque Storage',
                            icon: ImageIcon,
                            badge: 'CDN',
                        },
                    ],
                },
            ]
            : []),
        {
            title: "Pédagogie & Campus",
            items: [
                {
                    id: 'disciplines',
                    label: 'Modules & Disciplines',
                    icon: Shield,
                    badge: '10 Disciplines',
                },
                {
                    id: 'campus',
                    label: 'Infrastructures',
                    icon: Compass,
                    badge: 'Radar',
                },
                {
                    id: 'campus-3d',
                    label: 'Plan 3D du Campus',
                    icon: Boxes,
                    badge: 'Studio',
                },
            ],
        },
        {
            title: isCoach ? "Mes Activités" : "Contenus Spécifiques",
            items: [
                {
                    id: 'sessions',
                    label: isCoach ? 'Sessions Encadrées' : 'Sessions & Stages',
                    icon: Calendar,
                },
                ...(!isSecretaire
                    ? [
                        {
                            id: 'team' as TabType,
                            label: isCoach ? 'Ma Fiche Formateur' : 'Équipe & Coachs',
                            icon: Users,
                        },
                        {
                            id: 'films' as TabType,
                            label: isCoach ? 'Mes Films & Crédits' : 'Filmographie',
                            icon: Film,
                        },
                    ]
                    : []),
                ...(isDirecteurOrAdmin
                    ? [
                        { id: 'events' as TabType, label: 'Prestations Events', icon: Sparkles },
                        { id: 'partners' as TabType, label: 'Partenaires & Labels', icon: Handshake },
                    ]
                    : []),
            ],
        },
        ...(!isCoach
            ? [
                {
                    title: "Configuration",
                    items: [
                        {
                            id: 'announcements' as TabType,
                            label: 'Bandeau Flash',
                            icon: Bell,
                            badge: announcementActive ? 'Live' : undefined,
                        },
                        ...(isDirecteurOrAdmin
                            ? [
                                { id: 'users' as TabType, label: 'Utilisateurs & Rôles', icon: Shield },
                                { id: 'audit' as TabType, label: 'Journal d’Audit', icon: Activity },
                                { id: 'health' as TabType, label: 'Diagnostic de Contenu', icon: Stethoscope },
                                { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
                            ]
                            : []),
                    ],
                },
            ]
            : []),
    ];
}
