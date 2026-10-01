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

export interface VulnerabilityDetail {
    title: string;
    riskLevel: 'Critique' | 'Élevé' | 'Majeur';
    oldFlaw: string;
    concreteRisk: string;
    newResolution: string;
}

export const OLD_SITE_VULNERABILITIES: readonly VulnerabilityDetail[] = [
    {
        title: 'Plugins Tiers & Portes Dérobées (Piratage / Ransomware)',
        riskLevel: 'Critique',
        oldFlaw: 'L’ancien WordPress reposait sur plus de 30 extensions (plugins) codées par des tiers inconnus.',
        concreteRisk: 'Chaque plugin non mis à jour est une brèche ouverte : risque d’injection SQL, de défiguration du site (affichage de messages frauduleux) ou de piratage des accès administrateur.',
        newResolution: 'Zéro plugin tiers exposé. 100% du code source est propriétaire, audité, compilé en amont et servi en lecture seule via Next.js.',
    },
    {
        title: 'Effondrement lors des Pics Média (Crashs TV TF1 / France 2)',
        riskLevel: 'Critique',
        oldFlaw: 'Un serveur PHP traditionnel unique recalculait chaque page et interrogeait MySQL pour chaque visiteur.',
        concreteRisk: 'Lors d’un passage au journal télévisé de 20h ou d’un post viral, le serveur saturait dès 50-100 connexions simultanées, renvoyant une page blanche "502 Bad Gateway" et perdant des dizaines de candidatures.',
        newResolution: 'Architecture Serverless Edge sur Vercel : le site est distribué sur un réseau mondial capable d’encaisser 100 000 visiteurs simultanés sans ralentir d’une milliseconde.',
    },
    {
        title: 'Fuite des Données Personnelles Candidats & Risque RGPD',
        riskLevel: 'Élevé',
        oldFlaw: 'Les formulaires stockaient les coordonnées, CV, téléphones et vidéos des stagiaires en clair dans les tables WordPress.',
        concreteRisk: 'Une simple faille sur un plugin de formulaire permettait d’aspirer l’intégralité de la base de prospects du CUC. Responsabilité civile et pénale de l’école engagée auprès de la CNIL.',
        newResolution: 'Base PostgreSQL Supabase blindée par Row-Level Security (RLS) : chaque ligne est verrouillée comme un coffre-fort. Seul le secrétariat authentifié peut y accéder.',
    },
    {
        title: 'Absence de Sauvegardes Étanches & Risque de Perte Définitive',
        riskLevel: 'Élevé',
        oldFlaw: 'Les sauvegardes étaient gérées localement sur le même disque dur de l’hébergeur.',
        concreteRisk: 'En cas de crash de disque, d’incendie du datacenter (ex : incendie OVH) ou de corruption de base lors d’une mise à jour, des années d’archives de cascade et d’inscriptions étaient anéanties à jamais.',
        newResolution: 'Sauvegardes automatiques quotidiennes chiffrées répliquées sur plusieurs régions Cloud indépendantes, plus exports manuels complets en 1 clic depuis le Cockpit.',
    },
    {
        title: 'Destruction des Négatifs Haute Définition des Cascades',
        riskLevel: 'Majeur',
        oldFlaw: 'Les photos téléversées dans `wp-content/uploads` étaient écrasées et recompressées à la volée sans conserver les sources.',
        concreteRisk: 'Perte irréversible de la netteté 4K des cascades et des tournages historiques de Lucas Dollfus.',
        newResolution: 'Dossier inconditionnel `_originals/` qui préserve chaque image maître dans sa résolution native pour toujours, doublé d’une corbeille réversible `_trash/`.',
    },
    {
        title: 'Rançon Financière des Licences & Conflits Permanents',
        riskLevel: 'Majeur',
        oldFlaw: 'Abonnements obligatoires à renouveler chaque année (Elementor Pro, WPML bilingue, plugins de cache, extensions de formulaires).',
        concreteRisk: 'Si une licence expire ou si deux plugins entrent en conflit après une mise à jour nocturne, le site casse sans prévenir un dimanche matin.',
        newResolution: '0€ de licence logicielle. Le CUC est 100% propriétaire de sa technologie, sans aucun intermédiaire captif.',
    },
];
