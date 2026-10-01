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
    ScrollText,
    Stethoscope,
    BookOpen,
    History,
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
        // Navigation — Pôle 1 : Inscriptions & Planning
        { id: 'nav-dashboard', label: 'Tableau de Bord', category: 'Navigation', icon: LayoutDashboard, action: () => selectTab('dashboard'), keywords: ['accueil', 'stats', 'kpi', 'home', 'vue'] },
        { id: 'nav-inquiries', label: 'Contact', category: 'Navigation', icon: Inbox, action: () => selectTab('inquiries'), keywords: ['leads', 'candidats', 'inscriptions', 'devis', 'contact', 'candidatures', 'messages'] },
        { id: 'nav-sessions', label: 'Sessions de Formation', category: 'Navigation', icon: Calendar, action: () => selectTab('sessions'), keywords: ['dates', 'planning', 'calendrier', 'stages'] },

        // Navigation — Pôle 2 : Formations, Coachs & Films
        { id: 'nav-pages', label: 'Pages du Site', category: 'Navigation', icon: FileText, action: () => selectTab('pages'), keywords: ['contenu', 'vitrine', 'textes', 'sections', 'seo', 'visuel', 'pages'] },
        { id: 'nav-films', label: 'Filmographie & Cascades', category: 'Navigation', icon: Film, action: () => selectTab('films'), keywords: ['filmographie', 'credits', 'imdb', 'catalogue', 'tournages', 'cinema'] },
        { id: 'nav-team', label: 'Coachs & Formateurs', category: 'Navigation', icon: Users, action: () => selectTab('team'), keywords: ['coachs', 'formateurs', 'cascadeurs', 'equipe', 'staff'] },
        { id: 'nav-campus-3d', label: 'Campus & Installations', category: 'Navigation', icon: Boxes, action: () => selectTab('campus-3d'), keywords: ['campus', '3d', 'installations', 'lieux', 'batiments', 'poi', 'studio'] },
        { id: 'nav-disciplines', label: 'Disciplines Enseignées', category: 'Navigation', icon: Compass, action: () => selectTab('disciplines'), keywords: ['parkour', 'cascades', 'escalade', 'disciplines', 'modules'] },
        { id: 'nav-events', label: 'Events', category: 'Navigation', icon: Briefcase, action: () => selectTab('events'), keywords: ['agence', 'events', 'evenements', 'b2b', 'prestations'] },
        { id: 'nav-partners', label: 'Partenaires', category: 'Navigation', icon: Handshake, action: () => selectTab('partners'), keywords: ['sponsors', 'logos', 'partenaires', 'marques'] },

        // Navigation — Pôle 3 : Réseaux & Visites
        { id: 'nav-instagram', label: 'Instagram & Vidéos', category: 'Navigation', icon: Activity, action: () => selectTab('instagram'), keywords: ['instagram', 'insta', 'reels', 'vues', 'abonnés', 'followers'] },
        { id: 'nav-traffic', label: 'Visites du Site', category: 'Navigation', icon: Globe, action: () => selectTab('traffic'), keywords: ['visites', 'trafic', 'audience', 'visiteurs', 'frequentation'] },
        { id: 'nav-media', label: 'Médiathèque (Photos & Médias)', category: 'Navigation', icon: ImageIcon, action: () => selectTab('media'), keywords: ['images', 'photos', 'videos', 'fichiers', 'uploads'] },

        // Navigation — Pôle 4 : Réglages du Site
        { id: 'nav-announcements', label: 'Bandeau d\'Alerte', category: 'Navigation', icon: Bell, action: () => selectTab('announcements'), keywords: ['bandeau', 'banniere', 'annonce', 'message', 'alerte'] },
        { id: 'nav-navigation', label: 'Menus du Site', category: 'Navigation', icon: Menu, action: () => selectTab('navigation'), keywords: ['menu', 'navbar', 'liens', 'dropdown', 'navigation'] },
        { id: 'nav-footer', label: 'Bas de Page (Footer)', category: 'Navigation', icon: PanelBottom, action: () => selectTab('footer'), keywords: ['footer', 'pied', 'bas de page', 'mentions', 'legal'] },
        { id: 'nav-social', label: 'Réseaux Sociaux', category: 'Navigation', icon: Share2, action: () => selectTab('social'), keywords: ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin'] },
        { id: 'nav-translations', label: 'Traductions Anglaises (i18n)', category: 'Navigation', icon: Globe, action: () => selectTab('translations'), keywords: ['traductions', 'anglais', 'en', 'i18n', 'langues'] },
        { id: 'nav-microcopy', label: 'Libellés & Micro-textes', category: 'Navigation', icon: FileText, action: () => selectTab('microcopy'), keywords: ['microtextes', 'textes', 'boutons', 'labels', 'phrases', 'libelles', 'catalogue'] },
        { id: 'nav-settings', label: 'Coordonnées & Paramètres', category: 'Navigation', icon: Settings, action: () => selectTab('settings'), keywords: ['configuration', 'parametres', 'reglages', 'identite', 'qualiopi'] },
        { id: 'nav-users', label: 'Comptes & Accès', category: 'Navigation', icon: Shield, action: () => selectTab('users'), keywords: ['comptes', 'permissions', 'roles', 'acces', 'admin'] },
        { id: 'nav-audit', label: 'Journal d’Audit', category: 'Navigation', icon: Activity, action: () => selectTab('audit'), keywords: ['audit', 'historique', 'journal', 'tracabilite', 'logs'] },
        { id: 'nav-analytics', label: 'Statistiques & Conversion', category: 'Navigation', icon: BarChart3, action: () => selectTab('analytics'), keywords: ['analytique', 'statistiques', 'kpi', 'metriques', 'conversion', 'audience'] },
        { id: 'nav-health', label: 'Diagnostic du Contenu', category: 'Navigation', icon: Stethoscope, action: () => selectTab('health'), keywords: ['diagnostic', 'contenu', 'sante du contenu', 'liens casses', 'images manquantes', 'seo', 'integrite', 'qualite'] },

        // Actions Rapides
        { id: 'action-view-site', label: 'Ouvrir le Site Vitrine en direct', category: 'Actions Rapides', icon: ExternalLink, action: () => { if (typeof window !== 'undefined') window.open('/', '_blank'); }, keywords: ['voir', 'site', 'vitrine', 'public', 'apercu', 'ouvrir'] },
        { id: 'action-new-session', label: 'Créer une Nouvelle Session', category: 'Actions Rapides', icon: Plus, action: () => selectTab('sessions'), keywords: ['ajouter', 'nouvelle', 'creer', 'session', 'stage'] },
        { id: 'action-new-page', label: 'Créer / Éditer une Page Vitrine', category: 'Actions Rapides', icon: FileText, action: () => selectTab('pages'), keywords: ['ajouter', 'nouvelle', 'creer', 'page', 'contenu'] },
        { id: 'action-new-partner', label: 'Ajouter un Partenaire', category: 'Actions Rapides', icon: Handshake, action: () => selectTab('partners'), keywords: ['ajouter', 'nouveau', 'creer', 'partenaire', 'sponsor'] },
        { id: 'action-upload-media', label: 'Téléverser un Média', category: 'Actions Rapides', icon: ImageIcon, action: () => selectTab('media'), keywords: ['upload', 'ajouter', 'image', 'photo', 'video', 'fichier'] },

        // Aide
        { id: 'nav-help', label: 'Aide & Guide', category: 'Navigation', icon: BookOpen, action: () => selectTab('help'), keywords: ['aide', 'guide', 'help', 'tuto', 'documentation', 'comment faire', 'explication'] },

        // Outils Système
        { id: 'nav-logs', label: 'Activité du Site (Journal)', category: 'Navigation', icon: ScrollText, action: () => selectTab('logs'), keywords: ['journal', 'logs', 'activite', 'erreurs', 'incidents', 'tracabilite', 'audit'] },
        { id: 'tool-backup', label: 'Import / Export d’un contenu JSON', category: 'Outils Système', icon: Database, action: () => openBackup(), keywords: ['backup', 'export', 'import', 'json', 'contenu', 'fusion'] },
        { id: 'tool-backup-versions', label: 'Versions de sauvegarde & Restauration versionnée', category: 'Outils Système', icon: History, action: () => selectTab('dashboard'), keywords: ['versions', 'restauration', 'retour arriere', 'rollback', 'snapshot', 'catalogue', 'sauvegardes', 'backup'] },
        { id: 'tool-health', label: 'Diagnostic Système & Santé', category: 'Outils Système', icon: Activity, action: () => openHealth(), keywords: ['sante', 'diagnostic', 'statut', 'monitoring', 'performance'] },
    ];
}
