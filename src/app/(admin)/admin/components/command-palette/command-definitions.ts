/**
 * Catalogue des commandes de la palette Cockpit + contrats associés.
 * Module de données purs (`AGENTS.md` § 1) — les actions sont injectées.
 */
import React from 'react';
import {
    LayoutDashboard,
    Inbox,
    FileText,
    Calendar,
    Users,
    Film,
    Handshake,
    Settings,
    Shield,
    Image as ImageIcon,
    Bell,
    Database,
    Plus,
    Activity,
    Compass,
    Menu,
    PanelBottom,
    Share2,
    BarChart3,
    Boxes,
    Briefcase,
    ExternalLink,
    Globe,
} from 'lucide-react';
import type { TabType } from '../../CockpitApp';

export type CommandCategory = 'Navigation' | 'Actions Rapides' | 'Outils Système';

export interface CommandItem {
    id: string;
    label: string;
    category: CommandCategory;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void;
    badge?: string;
    keywords?: string[];
}

export interface ScoredCommand {
    command: CommandItem;
    score: number;
}

/** Actions externes injectées dans le catalogue (navigation, modales système). */
export interface CommandActions {
    selectTab: (tab: TabType) => void;
    openBackup: () => void;
    openHealth: () => void;
}

/** Construit le catalogue complet des commandes (navigation, actions, outils). */
export function buildCommands({ selectTab, openBackup, openHealth }: CommandActions): CommandItem[] {
    return [
        // Navigation — Pôle 1 : Pilotage & Inscriptions
        { id: 'nav-dashboard', label: 'Aller au Tableau de Bord', category: 'Navigation', icon: LayoutDashboard, action: () => selectTab('dashboard'), keywords: ['accueil', 'stats', 'kpi', 'home', 'vue'] },
        { id: 'nav-inquiries', label: 'Candidatures & Demandes de contact', category: 'Navigation', icon: Inbox, action: () => selectTab('inquiries'), badge: 'Admissions', keywords: ['leads', 'candidats', 'inscriptions', 'devis', 'contact'] },
        { id: 'nav-sessions', label: 'Sessions & Calendrier de formation', category: 'Navigation', icon: Calendar, action: () => selectTab('sessions'), keywords: ['dates', 'planning', 'calendrier', 'stages'] },

        // Navigation — Pôle 2 : Métier & Contenus du Campus
        { id: 'nav-pages', label: 'Éditeur Mode Studio (Pages Vitrines)', category: 'Navigation', icon: FileText, action: () => selectTab('pages'), badge: 'Studio', keywords: ['contenu', 'vitrine', 'textes', 'sections', 'seo', 'visuel'] },
        { id: 'nav-films', label: 'Filmographie Cascades (570+ films)', category: 'Navigation', icon: Film, action: () => selectTab('films'), badge: '570+', keywords: ['filmographie', 'credits', 'imdb', 'catalogue', 'tournages'] },
        { id: 'nav-team', label: 'Équipe & Formateurs Cascades', category: 'Navigation', icon: Users, action: () => selectTab('team'), badge: '20', keywords: ['coachs', 'formateurs', 'cascadeurs', 'equipe', 'staff'] },
        { id: 'nav-campus-3d', label: 'Campus & Installations (3D + POI)', category: 'Navigation', icon: Boxes, action: () => selectTab('campus-3d'), badge: '3D + POI', keywords: ['campus', '3d', 'installations', 'lieux', 'batiments', 'poi', 'studio'] },
        { id: 'nav-disciplines', label: 'Disciplines & Modules de formation', category: 'Navigation', icon: Compass, action: () => selectTab('disciplines'), keywords: ['parkour', 'cascades', 'escalade', 'disciplines', 'modules'] },
        { id: 'nav-events', label: 'Agence & Événements B2B', category: 'Navigation', icon: Briefcase, action: () => selectTab('events'), keywords: ['agence', 'events', 'evenements', 'b2b', 'prestations'] },
        { id: 'nav-partners', label: 'Partenaires & Marques', category: 'Navigation', icon: Handshake, action: () => selectTab('partners'), keywords: ['sponsors', 'logos', 'partenaires', 'marques'] },

        // Navigation — Pôle 3 : Notoriété & Médias
        { id: 'nav-instagram', label: 'Instagram Live & Leaderboard', category: 'Navigation', icon: Activity, action: () => selectTab('instagram'), badge: '1,12M', keywords: ['instagram', 'insta', 'reels', 'vues', 'abonnés', 'followers'] },
        { id: 'nav-traffic', label: 'Fréquentation Web & Visites', category: 'Navigation', icon: Globe, action: () => selectTab('traffic'), badge: 'Live', keywords: ['visites', 'trafic', 'audience', 'visiteurs', 'frequentation'] },
        { id: 'nav-media', label: 'Médiathèque Cloud (CDN Storage)', category: 'Navigation', icon: ImageIcon, badge: 'CDN', action: () => selectTab('media'), keywords: ['images', 'photos', 'videos', 'fichiers', 'uploads'] },

        // Navigation — Pôle 4 : Configuration & Site
        { id: 'nav-announcements', label: 'Bandeau Flash Urgent', category: 'Navigation', icon: Bell, action: () => selectTab('announcements'), keywords: ['bandeau', 'banniere', 'annonce', 'message', 'alerte'] },
        { id: 'nav-navigation', label: 'Menus & Navigation du site', category: 'Navigation', icon: Menu, action: () => selectTab('navigation'), keywords: ['menu', 'navbar', 'liens', 'dropdown', 'navigation'] },
        { id: 'nav-footer', label: 'Pied de Page (Footer)', category: 'Navigation', icon: PanelBottom, action: () => selectTab('footer'), keywords: ['footer', 'pied', 'bas de page', 'mentions', 'legal'] },
        { id: 'nav-social', label: 'Réseaux Sociaux officiels', category: 'Navigation', icon: Share2, action: () => selectTab('social'), keywords: ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin'] },
        { id: 'nav-translations', label: 'Traductions Multilingues (i18n)', category: 'Navigation', icon: Globe, action: () => selectTab('translations'), keywords: ['traductions', 'anglais', 'en', 'i18n', 'langues'] },
        { id: 'nav-microcopy', label: 'Micro-textes du Site Vitrine', category: 'Navigation', icon: FileText, action: () => selectTab('microcopy'), keywords: ['microtextes', 'textes', 'boutons', 'labels', 'phrases'] },
        { id: 'nav-settings', label: 'Paramètres Globaux du Campus', category: 'Navigation', icon: Settings, action: () => selectTab('settings'), keywords: ['configuration', 'parametres', 'reglages', 'identite', 'qualiopi'] },
        { id: 'nav-users', label: 'Comptes Équipe Cockpit & Rôles', category: 'Navigation', icon: Shield, action: () => selectTab('users'), keywords: ['comptes', 'permissions', 'roles', 'acces', 'admin'] },
        { id: 'nav-audit', label: 'Journal d’Audit & Historique', category: 'Navigation', icon: Activity, action: () => selectTab('audit'), keywords: ['audit', 'historique', 'journal', 'tracabilite', 'logs'] },
        { id: 'nav-analytics', label: 'Tableau de Bord Analytique', category: 'Navigation', icon: BarChart3, action: () => selectTab('analytics'), keywords: ['analytique', 'statistiques', 'kpi', 'metriques', 'conversion'] },

        // Actions Rapides
        { id: 'action-view-site', label: 'Ouvrir le Site Vitrine en direct', category: 'Actions Rapides', icon: ExternalLink, action: () => { if (typeof window !== 'undefined') window.open('/', '_blank'); }, keywords: ['voir', 'site', 'vitrine', 'public', 'apercu', 'ouvrir'] },
        { id: 'action-new-session', label: 'Créer une Nouvelle Session', category: 'Actions Rapides', icon: Plus, action: () => selectTab('sessions'), keywords: ['ajouter', 'nouvelle', 'creer', 'session', 'stage'] },
        { id: 'action-new-page', label: 'Créer / Éditer une Page Vitrine', category: 'Actions Rapides', icon: FileText, action: () => selectTab('pages'), keywords: ['ajouter', 'nouvelle', 'creer', 'page', 'contenu'] },
        { id: 'action-new-partner', label: 'Ajouter un Partenaire', category: 'Actions Rapides', icon: Handshake, action: () => selectTab('partners'), keywords: ['ajouter', 'nouveau', 'creer', 'partenaire', 'sponsor'] },
        { id: 'action-upload-media', label: 'Téléverser un Média', category: 'Actions Rapides', icon: ImageIcon, action: () => selectTab('media'), keywords: ['upload', 'ajouter', 'image', 'photo', 'video', 'fichier'] },

        // Outils Système
        { id: 'tool-backup', label: 'Sauvegarder / Restaurer le Site', category: 'Outils Système', icon: Database, action: () => openBackup(), keywords: ['backup', 'export', 'import', 'restauration', 'sauvegarde'] },
        { id: 'tool-health', label: 'Diagnostic Système & Santé', category: 'Outils Système', icon: Activity, action: () => openHealth(), keywords: ['sante', 'diagnostic', 'statut', 'monitoring', 'performance'] },
    ];
}
