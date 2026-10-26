/**
 * Piliers d'excellence, benchmarks de performance Avant/Après et cascade de
 * résilience du Dossier Application CUC (Centre d'Aide du Cockpit).
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export interface CraftPillar {
    id: string;
    badge: string;
    title: string;
    summary: string;
    details: string[];
}

export const WHY_SITE_STANDS_OUT: readonly CraftPillar[] = [
    {
        id: 'studio',
        badge: 'Autonomie Totale',
        title: '1. Le Mode Studio : éditer directement sur la page en taille réelle',
        summary:
            'Au lieu de remplir des champs à l’aveugle dans un formulaire abstrait, vous cliquez sur n’importe quel titre, texte ou bouton dans l’aperçu réel de la page.',
        details: [
            'Typographie miroir : le texte s’édite dans sa vraie police, sa vraie taille et sa vraie couleur.',
            'Navigation au clavier (Tab / Maj+Tab) d’un texte au suivant, annulation Ctrl+Z et comparateur de modifications.',
            'Sonde d’atteignabilité automatique garantissant que 100 % des 442 textes restent cliquables à la souris.',
        ],
    },
    {
        id: 'cinema',
        badge: 'Crédibilité Production',
        title: '2. Un catalogue cinéma vérifié crédit par crédit (IMDb & Doublures)',
        summary:
            'Chaque film, chaque fiche de formateur et chaque acteur doublé fait partie d’un maillage relationnel unique en base de données.',
        details: [
            '569 films vérifiés avec affiches authentiques et rôles normalisés avec sobriété.',
            'Galerie de 36 célébrités doublées (sur 6 colonnes) : cliquer sur un acteur ouvre ses films, cliquer sur un film montre qui y a travaillé.',
            'Galerie « Cascadeurs en action » sur Tournage : 2 lignes de 4 photos visibles d’emblée + tiroir déroulant pour les 23 clichés de plateau.',
        ],
    },
    {
        id: 'speed',
        badge: 'Vitesse Mesurée',
        title: '3. Des pages qui s’affichent en une fraction de seconde',
        summary:
            'Chaque octet envoyé au téléphone ou à l’ordinateur du visiteur est mesuré et plafonné par un contrôle automatique.',
        details: [
            '−42 % de code JavaScript au premier chargement (231 à 270 Ko gzip) grâce au chargement différé des moteurs lourds.',
            '−75 % sur le poids HTML des fiches individuelles des coachs (−10,2 Mo économisés grâce à la pagination progressive à 24 films).',
            'Zéro connexion WebSocket superflue côté visiteur : le temps réel est réservé au Cockpit.',
        ],
    },
    {
        id: 'campus3d',
        badge: 'Immersion 11 000 m²',
        title: '4. Visite virtuelle 360° & Studio 3D du campus intégré',
        summary:
            'Les infrastructures du campus (11 000 m², tour de 21 m, dojo de 600 m², airbag, câblage 3D) se visitent en 360° et sur une maquette 3D interactive.',
        details: [
            'Éditeur 3D complet dans le Cockpit (/admin/campus-3d) avec manipulateur visuel (Gizmo : déplacer, tourner, redimensionner).',
            'Historique Ctrl+Z / Ctrl+Y et import direct de modèles 3D personnalisés (.glb).',
            'Chargement du moteur Three.js uniquement lorsque le visiteur ouvre la carte 3D.',
        ],
    },
    {
        id: 'adaptive',
        badge: 'UX & Réseaux en Direct',
        title: '5. Menu intelligent adaptatif & synchronisation Meta Instagram',
        summary:
            'L’interface s’ajuste toute seule à vos décisions éditoriales et affiche vos vraies performances réseaux.',
        details: [
            'Menu Events intelligent : lorsqu’un seul choix est actif (CUC Events → /cuc-events-agence), la flèche disparaît et le bouton redirige en direct, tout en gardant les 3 autres pages prêtes en réserve.',
            'Connexion directe à l’API Meta Graph : compteur d’abonnés en temps réel et Reels triés par nombre de vues.',
            'Formulaire de contact épuré, orienté par projet (Formation, Tournage, Event) et numéro officiel 01 30 32 38 03 aligné partout.',
        ],
    },
    {
        id: 'resilience',
        badge: 'Zéro Page Morte',
        title: '6. Cascade de résilience à 4 niveaux & séparation CUC Sign',
        summary:
            'Le site est conçu pour ne jamais afficher de texte vide, ne jamais perdre une donnée et préparer l’arrivée de CUC Sign.',
        details: [
            '4 niveaux de repli automatique pour chaque texte : Surcharge EN → Donnée Cockpit → Catalogue 442 micro-textes → Copie certifiée code.',
            'Séparation stricte des rôles : Cockpit vitrine réservé à Direction / Admin / Secrétariat ; espace Coachs & Élèves dans CUC Sign.',
            'Sauvegarde complète en 1 clic (export/import JSON des 14 tables de contenu) sans jamais impacter les tables de CUC Sign.',
        ],
    },
];

export interface PerformanceBenchmark {
    title: string;
    subtitle: string;
    gainBadge: string;
    beforeLabel: string;
    beforeValue: string;
    afterLabel: string;
    afterValue: string;
    afterPercentWidth: number;
}

export const PERFORMANCE_BENCHMARKS: readonly PerformanceBenchmark[] = [
    {
        title: 'Code JavaScript au 1er affichage (Routes publiques)',
        subtitle: 'Isolation de Supabase, Three.js 3D et Framer Motion hors du paquet initial',
        gainBadge: '−42 %',
        beforeLabel: 'Avant optimisation (septembre 2026)',
        beforeValue: '438 Ko gzip',
        afterLabel: 'Aujourd’hui sur les pages vitrine',
        afterValue: '231 à 270 Ko gzip',
        afterPercentWidth: 58,
    },
    {
        title: 'Poids HTML des 20 fiches individuelles coachs',
        subtitle: 'Pagination progressive de la filmographie (24 films affichés puis ouverture complète)',
        gainBadge: '−75 %',
        beforeLabel: 'Avant (tous les films injectés d’un bloc)',
        beforeValue: '832 Ko / fiche',
        afterLabel: 'Aujourd’hui (−10,2 Mo économisés au total)',
        afterValue: '207 Ko / fiche',
        afterPercentWidth: 25,
    },
    {
        title: 'Stockage Média & Affiches du site',
        subtitle: 'Conversion WebP automatique dans le navigateur dès l’import + négatifs sous _originals',
        gainBadge: '−71 %',
        beforeLabel: 'Bucket vitrine avant recompression',
        beforeValue: '90,54 Mo (178 fichiers)',
        afterLabel: 'Bucket vitrine après cure WebP',
        afterValue: '26,32 Mo (162 fichiers)',
        afterPercentWidth: 29,
    },
];

export interface ResilienceLevel {
    level: string;
    title: string;
    source: string;
    description: string;
    accentColor: string;
}

export const RESILIENCE_CASCADE_LEVELS: readonly ResilienceLevel[] = [
    {
        level: 'Niveau 1',
        title: 'Surcharge Éditoriale Anglaise',
        source: 'Table site_translations (1 660+ entrées)',
        description: 'Sur la version /en, affiche la traduction rédigée sur mesure pour chaque film, coach, discipline ou section.',
        accentColor: '#38bdf8',
    },
    {
        level: 'Niveau 2',
        title: 'Contenu Publié au Cockpit',
        source: 'Tables site_pages & site_settings',
        description: 'Affiche les textes, titres, coordonnées (01 30 32 38 03) et listes enregistrés depuis le Mode Studio ou les formulaires.',
        accentColor: '#FFE500',
    },
    {
        level: 'Niveau 3',
        title: 'Catalogue de Micro-textes',
        source: '442 clés bilingues (messages/fr.json & en.json)',
        description: 'Fournit tous les libellés d’interface, de boutons et de filtres, eux-mêmes surchargeables depuis le Cockpit.',
        accentColor: '#a855f7',
    },
    {
        level: 'Niveau 4',
        title: 'Copie Certifiée de Secours',
        source: 'DEFAULT_PAGE_CONTENTS (Code compilé)',
        description: 'Si un champ est vidé ou si la base est momentanément injoignable, le site sert la copie certifiée sans jamais afficher de page blanche.',
        accentColor: '#4ade80',
    },
];
