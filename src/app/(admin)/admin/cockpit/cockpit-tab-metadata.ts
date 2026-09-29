/**
 * Métadonnées d'affichage des onglets du Cockpit (libellé, section, icône).
 *
 * Extraites de `cockpit-nav.ts` pour respecter le plafond dur de 300 lignes
 * (`AGENTS.md` § 2) — même motif que `cockpit-system-section.ts` et
 * `cockpit-help-section.ts`. Couche « Types & Contrats » : aucune React.
 */

import {
    Activity,
    Bell,
    BookOpen,
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
    Shield,
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
    logs: { label: 'Journal & Activité', sectionTitle: 'Outils Système', icon: Activity },
    audit: { label: 'Journal d’Audit', sectionTitle: 'Outils Système', icon: Activity },
    health: { label: 'Diagnostic du Site', sectionTitle: 'Outils Système', icon: Activity },
    analytics: { label: 'Statistiques & Conversion', sectionTitle: 'Inscriptions & Planning', icon: Activity },
    translations: { label: 'Traductions Anglaises', sectionTitle: 'Réglages du Site', icon: Globe },
    microcopy: { label: 'Textes & Boutons du Site', sectionTitle: 'Réglages du Site', icon: FileText },
    help: { label: 'Aide & Guide', sectionTitle: 'Aide', icon: BookOpen },
};

export function getTabMetadata(tab: TabType): TabMetadata {
    return TAB_METADATA_MAP[tab] || { label: tab, sectionTitle: 'Cockpit', icon: LayoutDashboard };
}
