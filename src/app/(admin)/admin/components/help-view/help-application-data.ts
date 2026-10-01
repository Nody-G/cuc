/**
 * Données structurées du Dossier Application CUC.
 *
 * Synthèse factuelle du projet : chiffres clés, comparatif WordPress vs Next.js,
 * cartographie des 15 pages vitrine et 27 écrans Cockpit, et filière média.
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface AppMetric {
    label: string;
    value: string;
    subtext: string;
    tone?: 'gold' | 'cyan' | 'green' | 'neutral';
}

export const APP_METRICS: readonly AppMetric[] = [
    {
        label: 'Code source & composants',
        value: '190 000+',
        subtext: 'Lignes de TypeScript & TSX strict, 0 any résiduel',
        tone: 'gold',
    },
    {
        label: 'Garantie logicielle',
        value: '802 tests',
        subtext: 'Suite automatisée Vitest validée à chaque commit',
        tone: 'green',
    },
    {
        label: 'Pages & écrans',
        value: '42 modules',
        subtext: '15 pages vitrine optimisées + 27 écrans Cockpit',
        tone: 'cyan',
    },
    {
        label: 'Base relationnelle',
        value: '22 tables',
        subtext: 'PostgreSQL Supabase sécurisé par Row-Level Security',
        tone: 'gold',
    },
];

export interface ComparisonPoint {
    category: string;
    oldWordpress: string;
    newNextApp: string;
}

export const WORDPRESS_VS_NEXT: readonly ComparisonPoint[] = [
    {
        category: 'Performance & Vitesse',
        oldWordpress: 'Temps de chargement 4 à 8 secondes, plugins lourds, scores Google faibles.',
        newNextApp: 'Temps de chargement sub-seconde, Server Components Next.js 15, CDN mondial Vercel Edge.',
    },
    {
        category: 'Sécurité & Intégrité',
        oldWordpress: 'Failles fréquentes sur plugins tiers, spams formulaires, maintenance permanente.',
        newNextApp: 'Postgres Supabase avec politiques RLS étanches par rôle, formulaires protégés par rate-limit.',
    },
    {
        category: 'Expérience d’édition',
        oldWordpress: 'Éditeur lourd, décalages visuels constants, risque de tout casser par erreur.',
        newNextApp: 'Mode Studio interactif (saisie directe sur la page), instantanés de révision annulables.',
    },
    {
        category: 'Multilingue & SEO',
        oldWordpress: 'Plugins de traduction coûteux et instables, traductions partielles et bugs de sitemap.',
        newNextApp: 'Architecture bilingue FR/EN native, balises OpenGraph dynamiques et sitemap auto-généré.',
    },
    {
        category: 'Écosystème & Avenir',
        oldWordpress: 'Silo isolé sans connexion possible avec les outils de l’école ni signature électronique.',
        newNextApp: 'Base unifiée partagée avec la future application CUC Sign (inscriptions fluides, zéro ressaisie).',
    },
];

export interface PageSectionOverview {
    title: string;
    description: string;
    count: number;
    items: string[];
}

export const PUBLIC_PAGES_OVERVIEW: PageSectionOverview = {
    title: 'Les 15 Pages du Site Vitrine',
    description: 'Une présence cinématographique percutante taillée pour séduire candidats et productions.',
    count: 15,
    items: [
        'Accueil cinématographique & hero vidéo',
        'Formations (Cascadeur Pro, Découverte, Cursus)',
        'Équipe de cascadeurs & fiches formateurs',
        'Films & productions tournées par le CUC',
        'Événements, stages immersifs & spectacles',
        'Campus & plan interactif 3D immersif',
        'Galeries photos & vidéos immersives',
        'Page Contact & candidatures multi-pipelines',
        'Presse, médias & parutions TV (TF1, France 2)',
        'Partenaires officiels & équipementiers',
        'Fiches coachs individuelles avec filmographies',
        'Pages légales (Mentions, Confidentialité, CGV)',
    ],
};

export const COCKPIT_SCREENS_OVERVIEW: PageSectionOverview = {
    title: 'Les 27 Écrans du Cockpit Administratif',
    description: 'Une suite complète pour piloter la vitrine en toute autonomie sans développeur.',
    count: 27,
    items: [
        'Tableau de bord : alertes, flux en direct et santé globale',
        'Pages du site : édition de contenu, SEO, mise en page et versions',
        'Mode Studio : édition visuelle en place directement dans la page',
        'Médiathèque : explorateur Storage, recherche, filtres et corbeille',
        'Campus 3D : placement des bâtiments et éditeur de zones POI',
        'Contact & candidatures : pipeline par projet et mémoire candidat',
        'Sessions : dates, gestion des effectifs et statut Complet',
        'Coachs & Formateurs : bios, disciplines et crédits vérifiés',
        'Catalogue Films : synchronisation, affiches et filtres',
        'Bandeau d’alerte : message d’urgence temps réel sur le site',
        'Menus & Pied de page : navigation et mentions légales',
        'Traductions Anglaises & Micro-textes du site',
        'Journal & Activité : audit exhaustif de chaque modification',
        'Diagnostic du site : liens cassés, images orphelines, scores SEO',
        'Comptes & Accès : gestion des rôles Direction et Secrétariat',
    ],
};

export const MEDIA_PIPELINE_INFO = {
    title: 'La Filière Média Industrielle',
    subtitle: 'Qualité visuelle maximale et zéro ralentissement',
    points: [
        {
            title: 'Conservation des négatifs sources (_originals)',
            desc: 'Tout fichier téléversé conserve son original haute résolution intouché dans un sous-dossier sécurisé. Aucune photo maîtresse n’est détruite.',
        },
        {
            title: 'Compression automatique WebP / AVIF',
            desc: 'Chaque image est convertie et allégée sans perte perceptible pour un affichage instantané sur mobile comme sur grand écran 4K.',
        },
        {
            title: 'Corbeille réversible (_trash)',
            desc: 'La suppression d’un média le déplace dans la corbeille sécurisée au lieu de l’effacer définitivement, évitant toute erreur de manipulation.',
        },
        {
            title: 'Détection d’orphelins & liens morts',
            desc: 'Le moniteur de diagnostic veille à ce qu’aucun fichier ne soit supprimé s’il est encore utilisé sur une page active du site.',
        },
    ],
};
