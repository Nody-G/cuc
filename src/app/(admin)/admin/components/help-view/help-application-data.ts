/**
 * Données structurées du Dossier Application CUC (Centre d'Aide du Cockpit).
 *
 * Synthèse factuelle et exhaustive : métriques réelles, comparatif WordPress vs
 * Next.js 16, failles historiques et filière média WebP.
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export {
    WHY_SITE_STANDS_OUT,
    PERFORMANCE_BENCHMARKS,
    RESILIENCE_CASCADE_LEVELS,
    type CraftPillar,
    type PerformanceBenchmark,
    type ResilienceLevel,
} from './help-application-benchmarks';

export interface AppMetric {
    label: string;
    value: string;
    subtext: string;
    badge?: string;
    tone?: 'gold' | 'cyan' | 'green' | 'neutral';
}

export const APP_METRICS: readonly AppMetric[] = [
    {
        label: 'Catalogue Cinéma Vérifié',
        value: '569 films',
        subtext: '100 % avec affiche officielle, synopsis FR/EN et rôles exacts de l’équipe',
        badge: 'IMDb / TMDB',
        tone: 'gold',
    },
    {
        label: 'Équipe & Doublures',
        value: '20 profils · 36 stars',
        subtext: 'Fiches individuelles recoupées sur IMDb et 36 célébrités doublées reliées aux films',
        badge: 'Navigation croisée',
        tone: 'cyan',
    },
    {
        label: 'Édition Visuelle en Place',
        value: '442 textes',
        subtext: 'Modifiables au clic sur la page en Mode Studio (0 texte figé dans le code)',
        badge: 'Mode Studio',
        tone: 'green',
    },
    {
        label: 'Ouverture Internationale',
        value: '1 660+ entrées EN',
        subtext: 'Bilinguisme FR / EN intégralement rédigé (pages, films, coachs, disciplines)',
        badge: 'FR ↔ EN',
        tone: 'gold',
    },
    {
        label: 'Gain de Vitesse (Oct. 2026)',
        value: '−42 % JS · −75 % HTML',
        subtext: 'Chargement différé de la 3D et pagination progressive des filmographies (−10,2 Mo)',
        badge: '231–270 Ko gzip',
        tone: 'green',
    },
    {
        label: 'Filière Média WebP',
        value: '−71 % de poids',
        subtext: 'Conversion WebP dans le navigateur à l’import + originaux conservés sous _originals',
        badge: '26,3 Mo au total',
        tone: 'cyan',
    },
    {
        label: 'Garantie Logicielle',
        value: '1 188 tests',
        subtext: 'Vérifications automatisées exécutées à chaque mise à jour (liens, budgets, rôles)',
        badge: '160 suites Vitest',
        tone: 'green',
    },
    {
        label: 'Envergure du Code',
        value: '225 000+ lignes',
        subtext: 'Architecture modulaire stricte (< 300 lignes par fichier) et 20 tables protégées RLS',
        badge: 'Next.js 16 + Supabase',
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
        oldWordpress: 'Temps de chargement 4 à 8 secondes, extensions lourdes recalculées à chaque visite.',
        newNextApp: 'Affichage en une fraction de seconde (Next.js 16 + Cache CDN), −42 % de JS et −75 % de poids HTML sur les fiches coachs.',
    },
    {
        category: 'Expérience d’édition (Mode Studio)',
        oldWordpress: 'Back-office déconnecté du rendu réel, décalages visuels fréquents, risque de casser la page.',
        newNextApp: 'Mode Studio interactif : clic direct sur la page en typographie miroir, Ctrl+Z, historique de versions restaurable en 1 clic.',
    },
    {
        category: 'Catalogue Cinéma, Coachs & Doublures',
        oldWordpress: 'Pages statiques isolées sans lien entre les films, les cascadeurs et les acteurs doublés.',
        newNextApp: '569 films vérifiés, 20 fiches IMDb dédiées, 36 célébrités doublées reliées aux films et galerie 2×4 extensible.',
    },
    {
        category: 'Plan 3D, Instagram Meta & Navigation',
        oldWordpress: 'Photos figées, intégrations manuelles qui périment, menus rigides.',
        newNextApp: 'Studio 3D interactif (/admin/campus-3d), synchronisation directe API Meta Instagram et menu Events adaptatif.',
    },
    {
        category: 'Sécurité, Bilinguisme & CUC Sign',
        oldWordpress: 'Dizaines d’extensions tierces vulnérables, site uniquement en français, silo isolé.',
        newNextApp: 'Bilingue FR/EN natif, 20 tables protégées par rôle (RLS) et base PostgreSQL partagée avec la plateforme CUC Sign.',
    },
];

export interface PageSectionOverview {
    title: string;
    description: string;
    count: number;
    items: string[];
}

export const PUBLIC_PAGES_OVERVIEW: PageSectionOverview = {
    title: 'Les 15 Pages du Site Vitrine (+ Fiches Dédiées)',
    description: 'Une présence cinématographique bilingue (FR/EN) pensée pour les productions, les candidats et les entreprises.',
    count: 15,
    items: [
        'Accueil : bandeau vidéo, chiffres clés 11 000 m², films, Reels Meta & Qualiopi',
        'Formation professionnelle de cascadeur (cursus 720–800h, 10 disciplines, AFDAS)',
        'Stages de cascade & parkour (calendrier en direct, statuts Ouvert / Complet)',
        'Stunt Workshop international (2 semaines en français et anglais)',
        'L’équipe pédagogique (20 profils ordonnés avec spécialités)',
        'Fiches individuelles des 20 coachs (crédits IMDb vérifiés & pagination −75 % HTML)',
        'Tournage — CUC Stunt Team (Hall of Fame, 36 stars doublées sur 6 colonnes, galerie action 2×4)',
        'Catalogue complet des 569 films (recherche, filtres & fiches détaillées)',
        'Visite guidée du campus de 11 000 m² (tour 21 m, dojo 600 m², airbag, câblage)',
        'Visite virtuelle 360° & Plan 3D interactif (12 zones cliquables)',
        'CUC Events — Agence événementielle (accès direct depuis l’onglet Events)',
        'Spectacles Cascadeurs, Animations Airbag & Team Building (3 pages prêtes en réserve)',
        'Vidéos, reportages TV (TF1, France 2, BFM TV) & Reels Instagram Meta',
        'Partenaires officiels & institutions (AFDAS, France Travail, studios)',
        'Contact & candidature (formulaire épuré par projet, 01 30 32 38 03 & carte)',
    ],
};

export const COCKPIT_SCREENS_OVERVIEW: PageSectionOverview = {
    title: 'Les 27 Écrans du Cockpit Administratif',
    description: 'Une suite complète réservée à la Direction, aux Administrateurs et au Secrétariat.',
    count: 27,
    items: [
        'Tableau de bord (/admin) : synthèse, activité récente et état des sessions',
        'Contact & candidatures (/admin/inquiries) : pipelines Formation/Tournage/Event & mémoire candidat',
        'Sessions de formation (/admin/sessions) : dates, statuts et liaison CUC Sign',
        'Pages du site & Mode Studio (/admin/pages) : saisie en place, SEO et révisions',
        'Filmographie & crédits (/admin/films) : 569 films, rôles et 36 célébrités doublées',
        'Coachs & formateurs (/admin/team) : 20 fiches, bios, IMDb et crédits étoilés',
        'Campus — zones & équipements (/admin/campus) : installations des 11 000 m²',
        'Campus — Studio du plan 3D (/admin/campus-3d) : Gizmo 3D, Ctrl+Z et import .glb',
        'Disciplines enseignées (/admin/disciplines) : référentiel des 10 disciplines',
        'Agence & événements (/admin/events) et Partenaires (/admin/partners)',
        'Instagram & vidéos Meta (/admin/instagram) : synchronisation API Meta Graph',
        'Visites du site (/admin/visites) & Statistiques de conversion (/admin/analytics)',
        'Médiathèque WebP (/admin/media) : compression navigateur, _originals et _trash',
        'Menus (/admin/navigation), Bas de page (/admin/footer), Annonces & Réseaux sociaux',
        'Paramètres & Sauvegarde JSON (/admin/settings), Traductions EN, Micro-textes, Accès & Journaux',
    ],
};

export const MEDIA_PIPELINE_INFO = {
    title: 'La Filière Média WebP & Protection des Originaux',
    subtitle: 'Images allégées de 71 % dans le navigateur et conservation systématique des fichiers maîtres',
    points: [
        {
            title: 'Conservation des négatifs sources (_originals)',
            desc: 'Chaque visuel de référence haute résolution est conservé intact dans le dossier protégé _originals/, sans jamais alourdir la navigation des visiteurs.',
        },
        {
            title: 'Compression automatique WebP dans le navigateur',
            desc: 'Dès le dépôt dans le Cockpit, l’image est convertie en WebP au profil du dossier (3200 px hero, 2560 px standard, 1600 px portrait, 512 px logo).',
        },
        {
            title: 'Corbeille réversible (_trash)',
            desc: 'La suppression d’un média le déplace dans la corbeille sécurisée au lieu de l’effacer définitivement, évitant toute perte accidentelle.',
        },
        {
            title: 'Détection d’usages & intégrité des liens',
            desc: 'L’explorateur média indique sur quelles pages ou fiches films chaque image est utilisée avant toute suppression ou déplacement.',
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
        title: 'Extensions Tierces & Portes Dérobées (Piratage)',
        riskLevel: 'Critique',
        oldFlaw: 'L’ancien WordPress reposait sur plus de 30 extensions codées par des éditeurs tiers.',
        concreteRisk: 'Chaque extension non mise à jour ouvrait un risque d’injection SQL, de défiguration du site ou d’intrusion dans l’administration.',
        newResolution: 'Zéro extension tierce exposée. Le code est compilé en amont, typé strictement et protégé par 8 en-têtes de sécurité navigateur.',
    },
    {
        title: 'Surcharge lors des Passages Télévisés (TF1 / France 2)',
        riskLevel: 'Critique',
        oldFlaw: 'Un serveur PHP unique recalculait chaque page et interrogeait MySQL à chaque visiteur.',
        concreteRisk: 'Lors d’un reportage TV ou d’un Reel viral, le serveur pouvait saturer et renvoyer une erreur 502 au moment où les candidats postulent.',
        newResolution: 'Pages pré-générées servies depuis le cache CDN mondial, avec 0 connexion WebSocket publique et un code JS réduit de 42 %.',
    },
    {
        title: 'Exposition des Données Candidats & RGPD',
        riskLevel: 'Élevé',
        oldFlaw: 'Les formulaires stockaient les coordonnées et demandes dans des tables WordPress partagées avec toutes les extensions.',
        concreteRisk: 'Une faille sur un seul plugin permettait de lire toute la base de prospects.',
        newResolution: '20 tables PostgreSQL protégées par Row-Level Security (RLS) : seuls les comptes Direction, Admin et Secrétariat accèdent aux dossiers.',
    },
    {
        title: 'Sauvegardes Liées au Même Serveur',
        riskLevel: 'Élevé',
        oldFlaw: 'Les sauvegardes étaient stockées localement sur le même hébergement que le site.',
        concreteRisk: 'En cas de corruption lors d’une mise à jour d’extension, la restauration complète était longue et incertaine.',
        newResolution: 'Export JSON manuel en 1 clic des 14 tables de contenu depuis le Cockpit (sans toucher à CUC Sign) + moteur chiffré AES-256-GCM en veille.',
    },
    {
        title: 'Dégradation ou Perte des Photos Haute Définition',
        riskLevel: 'Majeur',
        oldFlaw: 'Les photos déposées dans wp-content/uploads mélangeaient fichiers bruts lourds et miniatures.',
        concreteRisk: 'Ralentissement sévère des pages galeries ou perte des fichiers sources originaux.',
        newResolution: 'Double circuit automatique : dérivé WebP ultra-léger servi aux visiteurs (−71 %) et fichier maître conservé sous _originals/.',
    },
    {
        title: 'Conflits de Mises à Jour & Coûts de Licences',
        riskLevel: 'Majeur',
        oldFlaw: 'Empilement d’extensions payantes (constructeur de page, traduction, cache, formulaires).',
        concreteRisk: 'Expiration de licence ou conflit entre deux mises à jour cassant la mise en page ou la version traduite.',
        newResolution: '0 € de licence logicielle : le CUC est propriétaire à 100 % de son code, de son Mode Studio et de son système bilingue.',
    },
];
