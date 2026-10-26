/**
 * Catalogue interactif des routes publiques (FR/EN) et des 27 écrans du Cockpit
 * pour le Dossier Application (Centre d'Aide du Cockpit).
 *
 * Couche « Types & Contrats / Données » (`AGENTS.md` § 1).
 */

export type CockpitPoleId = 'all' | 'planning' | 'catalogue' | 'audience' | 'systeme';

export interface PublicRouteCatalogItem {
    title: string;
    route: string;
    role: string;
    status: 'Actif au menu' | 'En réserve (1 clic)' | 'Fiches dynamiques';
    description: string;
    tags: string[];
}

export interface CockpitScreenCatalogItem {
    pole: Exclude<CockpitPoleId, 'all'>;
    title: string;
    route: string;
    role: string;
    description: string;
    tags: string[];
}

export const COCKPIT_POLE_LABELS: readonly { id: CockpitPoleId; label: string; count: number }[] = [
    { id: 'all', label: 'Tous les écrans', count: 27 },
    { id: 'planning', label: 'Inscriptions & Planning', count: 3 },
    { id: 'catalogue', label: 'Pages, Films, Coachs & 3D', count: 8 },
    { id: 'audience', label: 'Instagram & Audience', count: 3 },
    { id: 'systeme', label: 'Menus, Médias, Langues & Sécurité', count: 13 },
];

export const PUBLIC_ROUTES_CATALOG: readonly PublicRouteCatalogItem[] = [
    {
        title: 'Accueil',
        route: '/fr & /en',
        role: 'Vitrine principale',
        status: 'Actif au menu',
        description: 'Bandeau vidéo, chiffres clés du campus de 11 000 m², tournages récents, partenaires, Reels Instagram Meta en direct et certification Qualiopi.',
        tags: ['FR / EN', 'Mode Studio'],
    },
    {
        title: 'Formation professionnelle de cascadeur',
        route: '/formation-de-cascadeur',
        role: 'Cursus 2 ans (720–800 h)',
        status: 'Actif au menu',
        description: 'Les 10 disciplines enseignées (Parkour, Combat Scénique, Chutes de hauteur, Câblage…), formules, financements AFDAS/OPCO et parcours d’admission.',
        tags: ['Qualiopi', '10 disciplines'],
    },
    {
        title: 'Stages de cascade & parkour',
        route: '/stages-cascades-parkour-2',
        role: 'Sessions datées en direct',
        status: 'Actif au menu',
        description: 'Stage découverte de 12 jours, week-ends d’immersion et Summer Camp dès 16 ans : chaque session affiche ses dates et son statut (Ouvert, Dernières places, Complet).',
        tags: ['Calendrier live', 'Lié à CUC Sign'],
    },
    {
        title: 'Stunt Workshop international',
        route: '/stunt-workshop-cuc',
        role: 'Stage bilingue 2 semaines',
        status: 'Actif au menu',
        description: 'Programme international accueillant des participants du monde entier avec hébergement sur le campus et encadrement bilingue.',
        tags: ['International', 'FR / EN'],
    },
    {
        title: 'L’équipe pédagogique & encadrants',
        route: '/equipe-cascadeurs-pro',
        role: 'Galerie des 20 profils',
        status: 'Actif au menu',
        description: 'Présentation ordonnée de la direction (Lucas Dollfus, Jérôme Gaspard, Malik Diouf, Franck Blanc) et des formateurs spécialistes.',
        tags: ['20 profils', 'IMDb vérifié'],
    },
    {
        title: 'Fiches individuelles des coachs',
        route: '/equipe-cascadeurs-pro/[slug]',
        role: '20 pages dédiées',
        status: 'Fiches dynamiques',
        description: 'Biographie, spécialités, lien IMDb officiel, crédits étoilés et filmographie vérifiée avec pagination progressive (24 films affichés puis ouverture complète, allégeant le HTML de 75 %).',
        tags: ['SEO individuel', '−75 % HTML'],
    },
    {
        title: 'Tournage — CUC Stunt Team',
        route: '/cuc-team-cascadeur',
        role: 'Coordination cinéma & doublures',
        status: 'Actif au menu',
        description: 'Hall of Fame des films coordonnés, galerie des 36 célébrités doublées (sur 6 colonnes avec navigation croisée vers les films), et galerie « Cascadeurs en action » sur 2 lignes de 4 photos avec tiroir déroulant (23 clichés).',
        tags: ['36 doublures', 'Galerie 2×4 extensible'],
    },
    {
        title: 'Catalogue complet des films',
        route: '/cuc-team-cascadeur/films',
        role: '569 productions vérifiées',
        status: 'Fiches dynamiques',
        description: 'Recherche instantanée et filtres par catégorie : chaque affiche ouvre une fiche détaillée listant les membres du CUC impliqués et leurs rôles exacts.',
        tags: ['569 films', '100 % affiches'],
    },
    {
        title: 'Visite guidée du campus (11 000 m²)',
        route: '/visite-guidee',
        role: 'Infrastructures & équipements',
        status: 'Actif au menu',
        description: 'Tour de saut de 21 m, grand dojo de 600 m², fosse de chute et airbag géant, portique de câblage 3D, résidence stagiaires et réfectoire.',
        tags: ['11 000 m²', 'Équipements'],
    },
    {
        title: 'Visite virtuelle 360° & Plan 3D',
        route: '/visite-virtuelle',
        role: 'Immersion interactive',
        status: 'Actif au menu',
        description: 'Exploration à 360° et maquette 3D interactive du campus (12 zones cliquables), chargée à la demande pour préserver la vitesse du site.',
        tags: ['Plan 3D', '360°'],
    },
    {
        title: 'CUC Events — Agence événementielle',
        route: '/cuc-events-agence',
        role: 'Accès direct depuis l’onglet Events',
        status: 'Actif au menu',
        description: 'Shows d’action sur mesure pour festivals, lancements de marque, conventions et séminaires. Lien direct sans flèche tant qu’il est le seul choix actif du menu Events.',
        tags: ['Lien direct Events'],
    },
    {
        title: 'Spectacles Cascadeurs',
        route: '/spectacles-cascadeurs-yamakasi',
        role: 'Page spécialisée conservée',
        status: 'En réserve (1 clic)',
        description: 'Performances scéniques : Parkour, voltige, combats chorégraphiés et chutes de hauteur. Conservée intacte et réactivable en 1 clic dans Menus du site.',
        tags: ['Réactivable 1 clic'],
    },
    {
        title: 'Animations Airbag & Parkour',
        route: '/animations-airbag-parkour',
        role: 'Page spécialisée conservée',
        status: 'En réserve (1 clic)',
        description: 'Dispositifs mobiles de saut sur airbag cinéma et parcours d’initiation encadrés par les cascadeurs professionnels du CUC.',
        tags: ['Réactivable 1 clic'],
    },
    {
        title: 'Team Building Cascades',
        route: '/team-building-cascades',
        role: 'Page spécialisée conservée',
        status: 'En réserve (1 clic)',
        description: 'Journées de cohésion d’entreprise autour des techniques de cascade et du tournage d’une séquence d’action.',
        tags: ['Réactivable 1 clic'],
    },
    {
        title: 'Vidéos, reportages TV & Reels',
        route: '/videos-cascadeur',
        role: 'TF1, France 2, BFM TV & Meta',
        status: 'Actif au menu',
        description: 'Reportages télévisés consacrés au campus, showreels officiels et sélection des meilleurs Reels Instagram synchronisés via l’API Meta.',
        tags: ['API Meta Graph', 'TV'],
    },
    {
        title: 'Partenaires & Institutions',
        route: '/partenaires',
        role: 'Réseau professionnel',
        status: 'Actif au menu',
        description: 'Studios, organismes de financement (AFDAS, France Travail), équipementiers et partenaires officiels du campus.',
        tags: ['21 partenaires'],
    },
    {
        title: 'Contact & Candidature',
        route: '/contact-cuc',
        role: 'Formulaire épuré & accès',
        status: 'Actif au menu',
        description: 'Formulaire allégé et direct (orienté Formation, Tournage ou Event), numéro officiel 01 30 32 38 03 et carte interactive.',
        tags: ['01 30 32 38 03', 'Pipelines'],
    },
];

export const COCKPIT_SCREENS_CATALOG: readonly CockpitScreenCatalogItem[] = [
    { pole: 'planning', title: 'Tableau de bord', route: '/admin', role: 'Vue d’ensemble', description: 'Synthèse des contenus, dernière activité, remplissage des sessions et accès rapide aux outils.', tags: ['Direction & Secrétariat'] },
    { pole: 'planning', title: 'Contact & candidatures', route: '/admin/inquiries', role: 'Pipelines par projet', description: 'Traitement par pipeline (Formation, Tournage, Événement), détection automatique des dossiers antérieurs d’un même candidat et conversion vers CUC Sign.', tags: ['Mémoire candidat'] },
    { pole: 'planning', title: 'Sessions de formation', route: '/admin/sessions', role: 'Calendrier en direct', description: 'Dates, statut (Ouvert, Dernières places, Complet, Bientôt) et liaison avec la formation correspondante dans CUC Sign.', tags: ['Stages & Cursus'] },
    { pole: 'catalogue', title: 'Pages du site & Mode Studio', route: '/admin/pages', role: 'Édition sur la page', description: 'Éditez chaque page par formulaire ou directement en cliquant sur les textes dans l’aperçu Mode Studio (FR et EN), avec historique de versions restaurable.', tags: ['Mode Studio', 'Ctrl+Z'] },
    { pole: 'catalogue', title: 'Filmographie & crédits', route: '/admin/films', role: 'Catalogue cinéma', description: 'Gestion des 569 films : affiches, catégories, rôles exacts des membres du CUC, crédits étoilés et galerie des 36 célébrités doublées.', tags: ['569 films', '36 doublures'] },
    { pole: 'catalogue', title: 'Coachs & formateurs', route: '/admin/team', role: '20 profils IMDb', description: 'Rôle, ordre d’affichage, biographie, lien IMDb, spécialités et filmographie personnelle reliée au catalogue.', tags: ['20 fiches'] },
    { pole: 'catalogue', title: 'Campus — zones & équipements', route: '/admin/campus', role: 'Installations 11 000 m²', description: 'Éditer les zones d’entraînement et les infrastructures du campus.', tags: ['11 000 m²'] },
    { pole: 'catalogue', title: 'Campus — Studio du plan 3D', route: '/admin/campus-3d', role: 'Maquette 3D interactive', description: 'Placer, déplacer, tourner et redimensionner les bâtiments du plan 3D avec manipulateur visuel (Gizmo), annulation Ctrl+Z et import .glb.', tags: ['Studio 3D'] },
    { pole: 'catalogue', title: 'Disciplines enseignées', route: '/admin/disciplines', role: 'Référentiel pédagogique', description: 'Les 10 disciplines officielles (Parkour, Combat Scénique, Chutes, Câblage…) : niveaux, équipements et descriptifs bilingues.', tags: ['10 disciplines'] },
    { pole: 'catalogue', title: 'Agence & événements', route: '/admin/events', role: 'Prestations CUC Events', description: 'Références et prestations événementielles présentées sur la page CUC Events.', tags: ['Events'] },
    { pole: 'catalogue', title: 'Partenaires', route: '/admin/partners', role: 'Logos & liens', description: 'Ajouter, retirer ou réordonner les partenaires et institutions affichés sur le site.', tags: ['21 partenaires'] },
    { pole: 'audience', title: 'Instagram & vidéos Meta', route: '/admin/instagram', role: 'API Meta Graph', description: 'Synchronisation du nombre d’abonnés, portée des publications et sélection des Reels mis en avant sur l’accueil et la page Vidéos.', tags: ['En direct'] },
    { pole: 'audience', title: 'Visites du site', route: '/admin/visites', role: 'Audience mesurée', description: 'Fréquentation par page, provenance et appareil, ainsi que les temps de chargement réellement vécus par les visiteurs.', tags: ['Sans cookie tiers'] },
    { pole: 'audience', title: 'Statistiques & conversion', route: '/admin/analytics', role: 'Indicateurs', description: 'Entonnoir de traitement des demandes et répartition par pipeline (Formation, Tournage, Événement).', tags: ['Direction'] },
    { pole: 'systeme', title: 'Médiathèque WebP', route: '/admin/media', role: 'Photos & documents', description: 'Dépôt direct depuis le navigateur : conversion WebP automatique (−71 %), dossiers, corbeille réversible (_trash) et originaux conservés (_originals).', tags: ['WebP auto'] },
    { pole: 'systeme', title: 'Bandeau d’alerte', route: '/admin/announcements', role: 'Message exceptionnel', description: 'Bandeau d’information affiché en haut du site public, activable et désactivable en un clic.', tags: ['Urgence'] },
    { pole: 'systeme', title: 'Menus du site', route: '/admin/navigation', role: 'Navigation adaptative', description: 'Ordre des onglets, visibilité des sous-pages (avec bascule automatique en lien direct s’il n’y a qu’un seul choix actif) et bouton d’action.', tags: ['Menu intelligent'] },
    { pole: 'systeme', title: 'Bas de page (Footer)', route: '/admin/footer', role: 'Pied de page', description: 'Colonnes de liens, présentation et mentions légales du bas de page.', tags: [] },
    { pole: 'systeme', title: 'Réseaux sociaux', route: '/admin/social', role: 'Liens officiels', description: 'Comptes Instagram, YouTube, TikTok, Facebook et LinkedIn partagés entre l’en-tête, le menu mobile et le pied de page (logo Instagram corrigé).', tags: [] },
    { pole: 'systeme', title: 'Coordonnées & paramètres', route: '/admin/settings', role: 'Identité & Sauvegarde', description: 'Téléphone officiel (01 30 32 38 03), adresses e-mail, horaires, numéro Qualiopi et export/import de sauvegarde JSON en 1 clic.', tags: ['Sauvegarde JSON'] },
    { pole: 'systeme', title: 'Traductions anglaises', route: '/admin/translations', role: 'Surcharges FR → EN', description: 'Édition des textes anglais pour les films, coachs, événements, disciplines et installations (1 660+ entrées en base).', tags: ['Bilingue'] },
    { pole: 'systeme', title: 'Textes & boutons du site', route: '/admin/microtextes', role: '442 micro-textes', description: 'Tous les libellés de boutons, filtres et messages d’interface, modifiables sans toucher au code.', tags: ['Zéro texte figé'] },
    { pole: 'systeme', title: 'Comptes & accès', route: '/admin/users', role: 'Rôles administratifs', description: 'Gestion des comptes autorisés sur le Cockpit vitrine (Direction, Administrateur, Secrétariat — coachs et élèves sur CUC Sign).', tags: ['Rôles étanches'] },
    { pole: 'systeme', title: 'Journal & activité', route: '/admin/journal', role: 'Métier · Système · Rétention', description: 'Suivi unifié des modifications de contenu, des alertes techniques classées et de la politique de rétention.', tags: ['Direction'] },
    { pole: 'systeme', title: 'Journal d’audit', route: '/admin/audit', role: 'Traçabilité', description: 'Historique horodaté de toutes les actions réalisées dans le Cockpit, filtrable et exportable.', tags: ['Direction'] },
    { pole: 'systeme', title: 'Diagnostic du site', route: '/admin/health', role: 'Contrôle qualité', description: 'Vérification automatique des liens internes, des images, des métadonnées SEO et de la parité FR/EN.', tags: ['Direction'] },
    { pole: 'systeme', title: 'Aide & guide intégré', route: '/admin/aide', role: 'Centre de connaissances', description: 'Guide pratique, Dossier Application interactif, méthodologie Vibe Coding, CUC Sign et FAQ.', tags: ['Documentation'] },
];
