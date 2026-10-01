/**
 * Métadonnées d'affichage des onglets du Cockpit (libellé, section, icône).
 *
 * Extraites de `cockpit-nav.ts` pour respecter le plafond dur de 300 lignes
 * (`AGENTS.md` § 2) — même motif que `cockpit-nav-sections.ts`. Couche
 * « Types & Contrats » : aucune React.
 *
 * Depuis la réorganisation du 2026-10-01, les `sectionTitle` reflètent les 6
 * sections de l'IA cible et les libellés sont désambiguïsés (voir le détail
 * dans `cockpit-nav-sections.ts`). Les hubs (`chrome`, `journal`, `audience`)
 * disposent de leur propre entrée pour l'en-tête de la barre supérieure.
 */

import {
    Activity,
    BarChart3,
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
    LifeBuoy,
    Menu,
    PanelBottom,
    ScrollText,
    Settings,
    Share2,
    Shield,
    ShieldCheck,
    Stethoscope,
    Users,
    type LucideIcon,
} from 'lucide-react';
import type { TabType } from './cockpit-nav';

export interface TabMetadata {
    label: string;
    sectionTitle: string;
    icon: LucideIcon;
}

const TAB_METADATA_MAP: Record<TabType, TabMetadata> = {
    /* 1. Éditorial */
    pages: { label: 'Pages du Site', sectionTitle: 'Éditorial', icon: FileText },
    navigation: { label: 'Menus du Site', sectionTitle: 'Éditorial', icon: Menu },
    microcopy: { label: 'Libellés & Micro-textes', sectionTitle: 'Éditorial', icon: FileText },
    translations: { label: 'Traductions Anglaises', sectionTitle: 'Éditorial', icon: Globe },

    /* 2. Chrome du site */
    chrome: { label: 'Chrome du Site', sectionTitle: 'Chrome du site', icon: PanelBottom },
    announcements: { label: 'Bandeau', sectionTitle: 'Chrome du site', icon: Bell },
    footer: { label: 'Bas de Page', sectionTitle: 'Chrome du site', icon: PanelBottom },
    social: { label: 'Réseaux Sociaux', sectionTitle: 'Chrome du site', icon: Share2 },
    settings: { label: 'Coordonnées', sectionTitle: 'Chrome du site', icon: Settings },

    /* 3. Contenus métier */
    sessions: { label: 'Sessions de Formation', sectionTitle: 'Contenus métier', icon: Calendar },
    team: { label: 'Coachs & Formateurs', sectionTitle: 'Contenus métier', icon: Users },
    films: { label: 'Filmographie', sectionTitle: 'Contenus métier', icon: Film },
    campus: { label: 'Campus & Installations', sectionTitle: 'Contenus métier', icon: Boxes },
    'campus-3d': { label: 'Campus & Installations', sectionTitle: 'Contenus métier', icon: Boxes },
    disciplines: { label: 'Disciplines', sectionTitle: 'Contenus métier', icon: Shield },
    events: { label: 'Events', sectionTitle: 'Contenus métier', icon: Briefcase },
    partners: { label: 'Partenaires', sectionTitle: 'Contenus métier', icon: Handshake },

    /* 4. Médias & Réseaux */
    media: { label: 'Médiathèque', sectionTitle: 'Médias & Réseaux', icon: ImageIcon },
    instagram: { label: 'Instagram & Vidéos', sectionTitle: 'Médias & Réseaux', icon: Activity },

    /* 5. Pilotage */
    dashboard: { label: 'Tableau de Bord', sectionTitle: 'Pilotage', icon: LayoutDashboard },
    inquiries: { label: 'Contact', sectionTitle: 'Pilotage', icon: Inbox },
    audience: { label: 'Statistiques & Audience', sectionTitle: 'Pilotage', icon: BarChart3 },
    analytics: { label: 'Statistiques & Conversion', sectionTitle: 'Pilotage', icon: BarChart3 },
    traffic: { label: 'Visites du Site', sectionTitle: 'Pilotage', icon: Globe },
    journal: { label: 'Journal', sectionTitle: 'Pilotage', icon: ScrollText },
    logs: { label: 'Activité', sectionTitle: 'Pilotage', icon: ScrollText },
    audit: { label: 'Journal d’Audit', sectionTitle: 'Pilotage', icon: ShieldCheck },
    health: { label: 'Diagnostic du Contenu', sectionTitle: 'Pilotage', icon: Stethoscope },

    /* 6. Système & Aide */
    users: { label: 'Comptes & Accès', sectionTitle: 'Système & Aide', icon: Users },
    help: { label: 'Aide & Guide', sectionTitle: 'Système & Aide', icon: LifeBuoy },
};

export function getTabMetadata(tab: TabType): TabMetadata {
    return TAB_METADATA_MAP[tab] || { label: tab, sectionTitle: 'Cockpit', icon: LayoutDashboard };
}
