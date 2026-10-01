/**
 * Construction des sections du menu latéral du Cockpit.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : fonction pure, sans React.
 * Extraite de `cockpit-nav.ts` (plafond dur de 300 lignes, § 2) pour héberger
 * l'arborescence en 6 sections validée par l'audit du 2026-10-01 :
 *
 *  1. Éditorial          — Pages, Menus, Libellés & Micro-textes, Traductions
 *  2. Chrome du site     — hub `chrome` (Bandeau, Bas de Page, Réseaux, Coordonnées)
 *  3. Contenus métier    — Sessions, Coachs, Filmographie, Campus, Disciplines, Events, Partenaires
 *  4. Médias & Réseaux   — Médiathèque, Instagram & Vidéos
 *  5. Pilotage           — Tableau de Bord, Contact, hub `audience`, hub `journal`, Diagnostic du Contenu
 *  6. Système & Aide     — Comptes & Accès, Aide & Guide
 *
 * Les libellés qui se télescopaient sont désambiguïsés : « Diagnostic du
 * Contenu » (onglet `health`) ne se confond plus avec la modale « Diagnostic
 * Système & Santé », et « Activité » / « Journal d'Audit » distinguent les deux
 * sous-onglets du hub Journal.
 */

import {
    Activity,
    BarChart3,
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
    LifeBuoy,
    Menu,
    PanelBottom,
    ScrollText,
    Shield,
    Stethoscope,
    Users,
} from 'lucide-react';
import type {
    CockpitNavItemModel,
    CockpitNavSectionModel,
    TabType,
} from './cockpit-nav';

export interface BuildNavSectionsArgs {
    userRole: string;
    newInquiriesCount: number;
    /** Bandeau flash actif — affiche le badge « Live » sur le hub Chrome. */
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

    const editorial: CockpitNavSectionModel = {
        title: '1. Éditorial',
        items: [
            { id: 'pages', label: 'Pages du Site', icon: FileText },
            { id: 'navigation', label: 'Menus du Site', icon: Menu },
            ...(isDirecteurOrAdmin
                ? [
                    { id: 'microcopy' as TabType, label: 'Libellés & Micro-textes', icon: FileText },
                    { id: 'translations' as TabType, label: 'Traductions Anglaises', icon: Globe },
                ]
                : []),
        ],
    };

    const chrome: CockpitNavSectionModel = {
        title: '2. Chrome du site',
        items: [
            {
                id: 'chrome',
                label: 'Chrome du Site',
                icon: PanelBottom,
                badge: announcementActive ? 'Live' : undefined,
            },
        ],
    };

    const businessItems: CockpitNavItemModel[] = [
        { id: 'sessions', label: 'Sessions de Formation', icon: Calendar },
        ...(!isSecretaire
            ? [{ id: 'team' as TabType, label: 'Coachs & Formateurs', icon: Users }]
            : []),
        { id: 'films', label: 'Filmographie', icon: Film },
        { id: 'campus-3d', label: 'Campus & Installations', icon: Boxes },
        ...(isDirecteurOrAdmin
            ? [
                { id: 'disciplines' as TabType, label: 'Disciplines', icon: Shield },
                { id: 'events' as TabType, label: 'Events', icon: Briefcase },
                { id: 'partners' as TabType, label: 'Partenaires', icon: Handshake },
            ]
            : []),
    ];

    const mediaItems: CockpitNavItemModel[] = [
        { id: 'media', label: 'Médiathèque', icon: ImageIcon },
        ...(isDirecteurOrAdmin
            ? [{ id: 'instagram' as TabType, label: 'Instagram & Vidéos', icon: Activity }]
            : []),
    ];

    const pilotage: CockpitNavSectionModel = {
        title: '5. Pilotage',
        items: [
            { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
            {
                id: 'inquiries',
                label: 'Contact',
                icon: Inbox,
                badge: newInquiriesCount > 0 ? `${newInquiriesCount} nouveau` : undefined,
            },
            ...(isDirecteurOrAdmin
                ? [
                    { id: 'audience' as TabType, label: 'Statistiques & Audience', icon: BarChart3 },
                    { id: 'journal' as TabType, label: 'Journal', icon: ScrollText },
                    { id: 'health' as TabType, label: 'Diagnostic du Contenu', icon: Stethoscope },
                ]
                : []),
        ],
    };

    const system: CockpitNavSectionModel = {
        title: '6. Système & Aide',
        items: [
            ...(isDirecteurOrAdmin
                ? [{ id: 'users' as TabType, label: 'Comptes & Accès', icon: Users }]
                : []),
            { id: 'help', label: 'Aide & Guide', icon: LifeBuoy },
        ],
    };

    return [
        editorial,
        chrome,
        { title: '3. Contenus métier', items: businessItems },
        { title: '4. Médias & Réseaux', items: mediaItems },
        pilotage,
        system,
    ];
}
