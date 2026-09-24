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
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Aller au Tableau de Bord',
            category: 'Navigation',
            icon: LayoutDashboard,
            action: () => selectTab('dashboard'),
            keywords: ['accueil', 'stats', 'kpi', 'home', 'vue ensemble'],
        },
        {
            id: 'nav-inquiries',
            label: 'Ouvrir les demandes de contact',
            category: 'Navigation',
            icon: Inbox,
            action: () => selectTab('inquiries'),
            badge: 'Admissions',
            keywords: ['leads', 'candidats', 'inscriptions', 'devis', 'contact', 'admission'],
        },
        {
            id: 'nav-pages',
            label: 'Éditer les Pages Vitrines & Structure',
            category: 'Navigation',
            icon: FileText,
            action: () => selectTab('pages'),
            badge: 'CMS',
            keywords: ['contenu', 'vitrine', 'textes', 'sections', 'seo', 'pages'],
        },
        {
            id: 'nav-navigation',
            label: 'Éditer la Navigation & les Menus',
            category: 'Navigation',
            icon: Menu,
            action: () => selectTab('navigation'),
            badge: 'Navbar',
            keywords: ['menu', 'navbar', 'liens', 'dropdown', 'navigation', 'entrees'],
        },
        {
            id: 'nav-footer',
            label: 'Éditer le Pied de Page',
            category: 'Navigation',
            icon: PanelBottom,
            action: () => selectTab('footer'),
            badge: 'Footer',
            keywords: ['footer', 'pied', 'bas de page', 'mentions', 'legal', 'colonnes'],
        },
        {
            id: 'nav-social',
            label: 'Gérer les Réseaux Sociaux',
            category: 'Navigation',
            icon: Share2,
            action: () => selectTab('social'),
            badge: 'Social',
            keywords: ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin', 'reseaux'],
        },
        {
            id: 'nav-sessions',
            label: 'Gérer les Sessions de Formation',
            category: 'Navigation',
            icon: Calendar,
            action: () => selectTab('sessions'),
            keywords: ['dates', 'planning', 'calendrier', 'stages', 'sessions'],
        },
        {
            id: 'nav-team',
            label: 'Gérer l\'Équipe & les Coachs',
            category: 'Navigation',
            icon: Users,
            action: () => selectTab('team'),
            keywords: ['coachs', 'formateurs', 'cascadeurs', 'equipe', 'staff'],
        },
        {
            id: 'nav-films',
            label: 'Gérer les Films & Crédits',
            category: 'Navigation',
            icon: Film,
            action: () => selectTab('films'),
            keywords: ['filmographie', 'credits', 'imdb', 'catalogue', 'tournages'],
        },
        {
            id: 'nav-disciplines',
            label: 'Gérer les Disciplines',
            category: 'Navigation',
            icon: Compass,
            action: () => selectTab('disciplines'),
            keywords: ['parkour', 'cascades', 'escalade', 'disciplines', 'modules'],
        },
        {
            id: 'nav-campus',
            label: 'Gérer les Zones du Campus',
            category: 'Navigation',
            icon: Globe,
            action: () => selectTab('campus'),
            keywords: ['lieux', 'installations', 'poi', 'carte', 'zones'],
        },
        {
            id: 'nav-campus-3d',
            label: 'Plan 3D du Campus (Studio)',
            category: 'Navigation',
            icon: Boxes,
            action: () => selectTab('campus-3d'),
            keywords: ['3d', 'plan', 'batiment', 'modele', 'placement', 'studio', 'three'],
        },
        {
            id: 'nav-announcements',
            label: 'Gérer les Annonces',
            category: 'Navigation',
            icon: Bell,
            action: () => selectTab('announcements'),
            keywords: ['bandeau', 'banniere', 'annonce', 'message', 'alerte'],
        },
        {
            id: 'nav-partners',
            label: 'Gérer les Partenaires',
            category: 'Navigation',
            icon: Handshake,
            action: () => selectTab('partners'),
            keywords: ['sponsors', 'logos', 'partenaires', 'marques'],
        },
        {
            id: 'nav-media',
            label: 'Ouvrir la Médiathèque',
            category: 'Navigation',
            icon: ImageIcon,
            action: () => selectTab('media'),
            keywords: ['images', 'photos', 'videos', 'fichiers', 'uploads'],
        },
        {
            id: 'nav-settings',
            label: 'Ouvrir les Réglages du Site',
            category: 'Navigation',
            icon: Settings,
            action: () => selectTab('settings'),
            keywords: ['configuration', 'parametres', 'reglages', 'identite'],
        },
        {
            id: 'nav-users',
            label: 'Gérer les Utilisateurs & Rôles',
            category: 'Navigation',
            icon: Shield,
            action: () => selectTab('users'),
            keywords: ['comptes', 'permissions', 'roles', 'acces', 'admin'],
        },
        {
            id: 'nav-audit',
            label: 'Consulter le Journal d’Audit',
            category: 'Navigation',
            icon: Activity,
            action: () => selectTab('audit'),
            keywords: ['audit', 'historique', 'journal', 'tracabilite', 'logs', 'activite'],
        },
        {
            id: 'nav-analytics',
            label: 'Ouvrir le Tableau de Bord Analytique',
            category: 'Navigation',
            icon: BarChart3,
            action: () => selectTab('analytics'),
            keywords: ['analytique', 'statistiques', 'kpi', 'metriques', 'conversion', 'entonnoir', 'tendances'],
        },

        // Actions Rapides
        {
            id: 'action-new-session',
            label: 'Créer une Nouvelle Session',
            category: 'Actions Rapides',
            icon: Plus,
            action: () => selectTab('sessions'),
            keywords: ['ajouter', 'nouvelle', 'creer', 'session', 'stage'],
        },
        {
            id: 'action-new-page',
            label: 'Créer / Éditer une Page Vitrine',
            category: 'Actions Rapides',
            icon: FileText,
            action: () => selectTab('pages'),
            keywords: ['ajouter', 'nouvelle', 'creer', 'page', 'contenu'],
        },
        {
            id: 'action-new-partner',
            label: 'Ajouter un Partenaire',
            category: 'Actions Rapides',
            icon: Handshake,
            action: () => selectTab('partners'),
            keywords: ['ajouter', 'nouveau', 'creer', 'partenaire', 'sponsor'],
        },
        {
            id: 'action-upload-media',
            label: 'Téléverser un Média',
            category: 'Actions Rapides',
            icon: ImageIcon,
            action: () => selectTab('media'),
            keywords: ['upload', 'ajouter', 'image', 'photo', 'video', 'fichier'],
        },

        // Outils Système
        {
            id: 'tool-backup',
            label: 'Sauvegarder / Restaurer le Site',
            category: 'Outils Système',
            icon: Database,
            action: () => openBackup(),
            keywords: ['backup', 'export', 'import', 'restauration', 'sauvegarde'],
        },
        {
            id: 'tool-health',
            label: 'Diagnostic Système & Santé',
            category: 'Outils Système',
            icon: Activity,
            action: () => openHealth(),
            keywords: ['sante', 'diagnostic', 'statut', 'monitoring', 'performance'],
        },
    ];
}
