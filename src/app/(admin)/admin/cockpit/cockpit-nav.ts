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
            title: '1. Pilotage & Quotidien',
            items: [
                { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
                {
                    id: 'inquiries',
                    label: 'Candidatures & Devis',
                    icon: Inbox,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} new` : undefined,
                },
                {
                    id: 'sessions',
                    label: 'Sessions & Stages',
                    icon: Calendar,
                },
            ],
        },
        {
            title: '2. Contenu & Vitrine (Outils Phares)',
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
                    badge: '570',
                },
                ...(!isSecretaire
                    ? [
                        {
                            id: 'team' as TabType,
                            label: 'Équipe & Coachs',
                            icon: Users,
                            badge: '12',
                        },
                    ]
                    : []),
                {
                    id: 'campus-3d',
                    label: 'Campus & Visite 3D',
                    icon: Boxes,
                    badge: '3D',
                },
            ],
        },
        ...(isDirecteurOrAdmin
            ? [
                {
                    title: '3. Notoriété & Audience',
                    items: [
                        { id: 'instagram' as TabType, label: 'Instagram & Reels', icon: Activity, badge: '1,05M' },
                        { id: 'traffic' as TabType, label: 'Visites en Direct', icon: Globe, badge: 'Live' },
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
            title: '4. Configuration & Réglages',
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
                        { id: 'partners' as TabType, label: 'Partenaires & Labels', icon: Handshake },
                        { id: 'disciplines' as TabType, label: 'Disciplines & Référentiel', icon: Shield },
                        { id: 'microcopy' as TabType, label: 'Dictionnaire Libellés (Avancé)', icon: Globe },
                        { id: 'users' as TabType, label: 'Équipe Cockpit & Rôles', icon: Shield },
                        { id: 'settings' as TabType, label: 'Paramètres Globaux', icon: Settings },
                    ]
                    : []),
            ],
        },
    ];
}
