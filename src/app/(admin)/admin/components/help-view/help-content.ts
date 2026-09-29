/**
 * Contenu de la section « Aide & Guide » du Cockpit — cœur des sujets.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : données pures, aucune React.
 * C'est le **seul** endroit où vit la pédagogie de l'application ; les vues
 * métier restent sobres et ne portent aucun tutoriel. Les contrats vivent dans
 * `help-content.types.ts`, les sujets système dans `help-content.systeme.ts`.
 */

import type { HelpGroup } from './help-content.types';
import { HELP_SYSTEM_GROUP } from './help-content.systeme';

export type { HelpTopic, HelpGroup, QuickStep } from './help-content.types';
export { HELP_QUICK_START } from './help-content.types';

const HELP_GROUPS: HelpGroup[] = [
    {
        id: 'essentiels',
        title: 'Les essentiels du Cockpit',
        topics: [
            {
                id: 'navigation',
                title: 'Naviguer et trouver un écran',
                summary: 'Un menu groupé par pôle, une palette de commandes et des raccourcis.',
                bullets: [
                    'Le menu latéral est repliable par groupe ; Ctrl+B le réduit ou l’étend.',
                    'Ctrl+K ouvre la palette : tapez un mot-clé (« devis », « session », « film »).',
                    'Les favoris et l’historique « Récent » de la palette accélèrent les allers-retours.',
                    'Chaque écran a une URL propre (/admin/pages, /admin/visites…) : elle est partageable.',
                ],
                keywords: ['menu', 'palette', 'raccourci', 'navigation', 'sidebar', 'ctrl k'],
            },
            {
                id: 'roles',
                title: 'Ce que chaque rôle voit',
                summary: 'Le menu s’adapte au rôle du compte connecté.',
                bullets: [
                    'Coach : uniquement ses sessions, sa fiche formateur et ses crédits films.',
                    'Secrétariat : inscriptions, sessions, pages, films, médias — sans les réglages sensibles.',
                    'Directeur / Administrateur : accès complet, y compris comptes, journal et outils système.',
                    'Un onglet masqué l’est par construction, jamais par simple style.',
                ],
                keywords: ['role', 'coach', 'directeur', 'secretaire', 'admin', 'permissions'],
            },
            {
                id: 'theme',
                title: 'Thème et confort visuel',
                summary: 'Bascule clair/sombre sans quitter le travail en cours.',
                bullets: [
                    'Le bouton soleil/lune de la barre supérieure change le thème ; le choix est mémorisé.',
                    'Le thème du Cockpit n’affecte jamais la vitrine publique.',
                ],
                keywords: ['theme', 'sombre', 'clair', 'dark', 'light', 'apparence'],
            },
        ],
    },
    {
        id: 'vitrine',
        title: 'Éditer la vitrine',
        topics: [
            {
                id: 'pages',
                title: 'Éditer une page',
                summary: 'Un écran, cinq onglets : Contenu, SEO, Mise en page, Aperçu, Versions.',
                bullets: [
                    'Sélectionnez la page dans l’arborescence (haut de l’écran).',
                    'Onglet Contenu : textes, images, blocs spécifiques à la page.',
                    'Onglet SEO : titre, description et référencement de la page.',
                    'Onglet Mise en page : ordre et visibilité des sections (quand la page le permet).',
                    'Onglet Versions : instantanés créés avant chaque modification, restaurables.',
                ],
                keywords: ['pages', 'contenu', 'editeur', 'seo', 'sections', 'versions', 'revision'],
            },
            {
                id: 'studio',
                title: 'Mode Studio — édition dans l’aperçu',
                summary: 'Cliquez un texte de la vraie page et saisissez-le sur place.',
                bullets: [
                    'Onglet Aperçu : un clic sur un texte annoté ouvre la saisie ; Entrée valide, Échap annule.',
                    '« Vue partagée » affiche l’éditeur et l’aperçu côte à côte.',
                    'L’inspecteur liste les modifications en attente et permet d’en annuler une seule.',
                    'La bascule FR|EN de l’aperçu indique dans quelle langue la saisie s’écrit.',
                ],
                keywords: ['studio', 'apercu', 'live', 'preview', 'edition en place', 'inspecteur'],
            },
            {
                id: 'publication',
                title: 'Publier ou laisser en brouillon',
                summary: 'Le statut de publication se règle par page.',
                bullets: [
                    '« Publiée » : la page est visible sur la vitrine et dans le sitemap.',
                    '« Brouillon » : retirée du sitemap, encore joignable par URL directe.',
                    'L’enregistrement crée un instantané consultable dans l’onglet Versions.',
                ],
                keywords: ['publier', 'brouillon', 'publication', 'sitemap', 'draft'],
            },
            {
                id: 'bilingue',
                title: 'Édition bilingue FR → EN',
                summary: 'La version anglaise se saisit dans le même formulaire.',
                bullets: [
                    'Le sélecteur FR|EN bascule la langue ; en anglais, les champs encore en français sont signalés.',
                    'Une liste modifiée en français doit être réalignée en anglais (l’écran le rappelle).',
                    'Le repli est automatique : un texte non traduit ne casse jamais la vitrine.',
                ],
                keywords: ['bilingue', 'anglais', 'en', 'traduction', 'i18n', 'locale'],
            },
            {
                id: 'menus',
                title: 'Menus, pied de page et textes récurrents',
                summary: 'Quatre sources distinctes, à ne pas confondre.',
                bullets: [
                    '« Menus du Site » : entrées de la barre de navigation et bouton d’appel à l’action.',
                    '« Bas de Page » : colonnes de liens, marque et mentions légales.',
                    '« Réseaux Sociaux » : une seule source réutilisée par la barre, le menu mobile et le pied de page.',
                    '« Textes & Boutons du Site » : libellés génériques récurrents (boutons, messages d’état).',
                ],
                keywords: ['menu', 'navbar', 'footer', 'pied de page', 'social', 'microtextes', 'libelles'],
            },
            {
                id: 'traductions',
                title: 'Traductions vs micro-textes',
                summary: 'Deux outils d’i18n aux usages différents.',
                bullets: [
                    '« Traductions Anglaises » : surcharge JSON par entité (films, coachs, événements…).',
                    '« Textes & Boutons » : libellés d’interface réutilisés partout.',
                    'Pour éditer un contenu de page avec aperçu live, préférez le Mode Studio.',
                ],
                keywords: ['traductions', 'microcopy', 'i18n', 'json', 'overlay'],
            },
        ],
    },
    {
        id: 'medias',
        title: 'Médias & campus',
        topics: [
            {
                id: 'mediatheque',
                title: 'Médiathèque',
                summary: 'Tout le bucket, dossier par dossier.',
                bullets: [
                    'Recherche globale, filtres par type, tri et aperçu détaillé.',
                    'Sélection multiple pour déplacer, copier une URL ou supprimer.',
                    'La suppression est réversible : les fichiers partent dans la corbeille « _trash ».',
                    'Dans les formulaires, « Choisir un média » ouvre le même explorateur.',
                ],
                keywords: ['mediatheque', 'media', 'images', 'photos', 'uploads', 'trash', 'corbeille'],
            },
            {
                id: 'campus',
                title: 'Campus : plan 3D & zones',
                summary: 'Deux sous-vues : placement 3D et inventaire des lieux.',
                bullets: [
                    'Plan 3D : sélectionnez un bâtiment, déplacez-le, tournez-le, redimensionnez-le.',
                    'Les flèches du clavier déplacent (Maj = 2,5 m, Alt = 0,1 m) ; F cadre la caméra.',
                    'Ctrl+Z annule, Ctrl+Maj+Z rétablit ; l’enregistrement est automatique.',
                    'Zones POI : créez et éditez les bâtiments et points du plan interactif.',
                ],
                keywords: ['campus', '3d', 'plan', 'zones', 'poi', 'batiments', 'placement'],
            },
        ],
    },
    {
        id: 'metier',
        title: 'Catalogue & exploitation',
        topics: [
            {
                id: 'contact',
                title: 'Contact & dossiers candidats',
                summary: 'Chaque demande suit le pipeline de son projet.',
                bullets: [
                    'Les dossiers sont filtrés par pipeline (Formation, Production, Événementiel, Presse).',
                    'Un dossier peut être re-catégorisé ; l’historique de la personne reste visible.',
                    'Un ancien candidat qui re-postule garde son passé (candidature recalée, session Découverte).',
                    '« Exporter CSV » produit la liste filtrée pour le suivi hors ligne.',
                ],
                keywords: ['contact', 'candidatures', 'inquiries', 'dossiers', 'pipeline', 'csv', 'leads'],
            },
            {
                id: 'sessions',
                title: 'Sessions de formation',
                summary: 'Les dates et disponibilités, par programme.',
                bullets: [
                    'Basculez une session en « Complet » en un clic, ou ajoutez-en une nouvelle.',
                    'Le suivi du remplissage alimente les statistiques du tableau de bord.',
                ],
                keywords: ['sessions', 'stages', 'dates', 'planning', 'complet'],
            },
            {
                id: 'coachs',
                title: 'Coachs, crédits et films',
                summary: 'La fiche publique se compose à partir du catalogue.',
                bullets: [
                    'Fiche coach : identité, bio, disciplines et filmographie.',
                    'L’étoile met un crédit en avant ; l’ordre des mises en avant se règle par flèches.',
                    'Le rôle (coordinateur, doublure, cascadeur…) se choisit sur chaque ligne de crédit.',
                    'Filmographie : filtre par coach pour voir « qui a bossé dans quoi ».',
                ],
                keywords: ['coachs', 'formateurs', 'credits', 'films', 'doublure', 'imdb', 'star', 'role'],
            },
            {
                id: 'instagram',
                title: 'Instagram & vidéos',
                summary: 'Métriques relevées et Reels mis en avant.',
                bullets: [
                    'Le relevé s’appuie sur l’API Meta ; « Actualiser » relance la synchronisation.',
                    'Choisissez les Reels affichés sur la page vidéos (flux automatique ou sélection manuelle).',
                    'Les chiffres affichés sont mesurés : un repère, pas une estimation.',
                ],
                keywords: ['instagram', 'insta', 'reels', 'vues', 'abonnes', 'followers', 'meta'],
            },
            {
                id: 'visites',
                title: 'Visites du site',
                summary: 'Audience et consultation des pages.',
                bullets: [
                    'Choisissez la période (aujourd’hui → 12 mois) dans la barre supérieure.',
                    'Le flux « en direct » ne montre que des sessions réellement observées.',
                    '« Export CSV » récupère les séries affichées.',
                ],
                keywords: ['visites', 'trafic', 'audience', 'visiteurs', 'frequentation', 'analytics'],
            },
        ],
    },
];

/** Groupes exposés à la vue, assemblage unique (cœur + système). */
export const HELP_CONTENT: HelpGroup[] = [...HELP_GROUPS, HELP_SYSTEM_GROUP];
