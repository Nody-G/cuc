/**
 * CHAPITRES 1 À 5 — VISION, COMPARATIF, ARCHITECTURE & VITRINE PUBLIQUE
 * =====================================================================
 *
 * Responsabilité :
 *   Construire les cinq premiers chapitres du dossier :
 *   1. Synthèse & pourquoi l'application se distingue
 *   2. Comparatif factuel avec l'ancien site WordPress
 *   3. Fonctionnement global & mécanismes clés (schéma animé)
 *   4. Carte du site & logique du menu adaptatif (Events)
 *   5. Détail des 16 routes publiques (FR / EN)
 */

import { esc, nf, icon, featCard, accordionRow } from './dossier-data.mjs';
import { buildEcosystemSvg } from './dossier-diagrams.mjs';

const DISTINCTION_PILLARS = [
  {
    iconName: 'eye',
    badge: 'Mode Studio',
    title: 'Édition visuelle directement sur la page',
    desc: "Plus besoin de chercher un texte dans un formulaire abstrait : vous cliquez sur le titre ou le bouton dans l'aperçu de la page, vous écrivez en taille réelle, et vous publiez quand tout est prêt.",
    tags: ['442 textes annotés', 'Ctrl+Z intégré'],
  },
  {
    iconName: 'zap',
    badge: '−42 % de JS',
    title: 'Vitesse d’affichage immédiate sur mobile et ordinateur',
    desc: 'Les pages sont préparées à l’avance et servies depuis un cache mondial. Le moteur 3D, les animations et la base ne se chargent que lorsqu’un écran en a réellement besoin.',
    tags: ['231–270 Ko gzip', '0 WebSocket public'],
  },
  {
    iconName: 'film',
    badge: 'Vérifié IMDb',
    title: 'Un véritable catalogue cinéma relié de bout en bout',
    desc: 'Affiches authentiques, rôles normalisés, 19 fiches individuelles de l’équipe et 36 célébrités doublées reliées aux films : cliquer sur un acteur ouvre ses films, cliquer sur un film montre qui y a travaillé.',
    tags: ['Navigation croisée', 'FR & EN'],
  },
  {
    iconName: 'shield',
    badge: '4 niveaux',
    title: 'Une architecture qui ne tombe jamais en page blanche',
    desc: 'Chaque texte dispose de quatre filets de sécurité (surcharge anglaise, base de données, catalogue de micro-textes, copie certifiée dans le code) et chaque page conserve son historique de versions.',
    tags: ['Zéro page morte', '1 188 tests auto'],
  },
];

const OLD_SITE_ROWS = [
  [
    'Vitesse & diffusion',
    'Serveur unique ; chaque visite recalcule la page via WordPress et ses extensions.',
    'Pages pré-générées servies en quelques dizaines de millisecondes ; code JavaScript réduit de 42 % au premier écran.',
  ],
  [
    'Modification des textes',
    'Back-office WordPress séparé du rendu réel ; risque de décaler la mise en page.',
    'Mode Studio : clic direct sur la page en taille réelle, annulation Ctrl+Z, historique de versions restaurable en un clic.',
  ],
  [
    'Filmographie & Équipe',
    'Listes statiques non reliées entre elles, difficiles à tenir à jour.',
    'Catalogue centralisé de plus de 500 films, 19 fiches dédiées vérifiées sur IMDb, et galerie de 36 célébrités doublées.',
  ],
  [
    'Visite du campus (11 000 m²)',
    'Photos statiques uniquement.',
    'Visite virtuelle 360° couplée à un plan 3D interactif dont les bâtiments se déplacent et s’orientent depuis le Cockpit.',
  ],
  [
    'Instagram & Vidéos',
    'Captures figées ou intégrations manuelles qui périment.',
    'Synchronisation directe avec l’API Meta Graph : compteur d’abonnés en direct et Reels triés par audience.',
  ],
  [
    'Ouverture internationale',
    'Site uniquement en français.',
    'Application intégralement bilingue français / anglais (1 660 traductions éditoriales en base, aucune traduction automatique).',
  ],
  [
    'Médias & Stockage',
    'Fichiers bruts lourds déposés dans wp-content.',
    'Conversion automatique en WebP léger dans le navigateur dès l’import (−71 % de poids) et conservation des originaux.',
  ],
  [
    'Sécurité & Continuité',
    'Dizaines d’extensions tierces à maintenir ; sauvegardes externes.',
    'Zéro extension tierce, 20 tables protégées par rôle, 21 redirections SEO préservées et export/restauration en un clic.',
  ],
];

const MECHANISMS = [
  { iconName: 'edit', title: 'Mode Studio (édition sur la page)', desc: 'Cliquez sur n’importe quel titre, paragraphe ou bouton dans l’aperçu pour le modifier à sa taille réelle, avec navigation Tab entre les champs.', tags: ['Aperçu live'] },
  { iconName: 'refresh', title: 'Cache rapide & publication instantanée', desc: 'Les visiteurs naviguent sur un cache ultra-rapide (sans connexion permanente inutile). Dès que vous enregistrez au Cockpit, le cache FR et EN est rafraîchi.', tags: ['FR + EN'] },
  { iconName: 'film', title: 'Maillage Films ↔ Coachs ↔ Doublures', desc: 'Une seule base alimente l’accueil, le catalogue de 569 films, la page Tournage, les 36 acteurs doublés et les 20 profils de l’équipe.', tags: ['Catalogue unifié'] },
  { iconName: 'cpu', title: 'Studio 3D du campus intégré', desc: 'Le plan 3D interactif se pilote au Cockpit : déplacement, rotation, redimensionnement des zones et import de modèles 3D (.glb).', tags: ['Three.js à la demande'] },
  { iconName: 'play', title: 'Synchronisation Meta Instagram', desc: 'Les Reels et statistiques d’abonnés sont relevés via l’API officielle Meta et mis en avant sur l’accueil et la page Vidéos.', tags: ['API Meta'] },
  { iconName: 'database', title: 'Filière média WebP automatique', desc: 'Chaque photo importée au Cockpit est convertie en WebP dans votre navigateur avant l’envoi, tandis que le fichier haute définition est gardé sous _originals.', tags: ['−71 % sur le stockage'] },
  { iconName: 'layout', title: 'Menu intelligent & pages en réserve', desc: "Lorsqu'un menu déroulant n'a qu'une seule page active (ex. CUC Events), il enlève sa flèche et redirige directement, tout en gardant les autres pages prêtes en réserve.", tags: ['UX adaptative'] },
  { iconName: 'shield', title: 'Pont sécurisé avec CUC Sign', desc: 'Le site lit les formations, les coachs et les lieux de CUC Sign en lecture seule, et prépare la conversion des candidats admis en dossiers élèves.', tags: ['Base partagée'] },
];

export const PUBLIC_PAGES = [
  { iconName: 'film', title: 'Accueil', route: '/fr & /en', role: 'la vitrine du campus', desc: 'Bandeau vidéo, chiffres clés du campus de 11 000 m², carrousel des tournages récents, partenaires, Reels Instagram en direct, visite virtuelle et certification Qualiopi.', tags: ['Point d’entrée', 'FR / EN'] },
  { iconName: 'book', title: 'Formation professionnelle de cascadeur', route: '/formation-de-cascadeur', role: 'le cursus complet', desc: "Programme professionnalisant (720 à 800 heures) : les 10 disciplines enseignées (Parkour, Combat Scénique, Chutes de hauteur, Câblage, Équitation…), formules, financements AFDAS/OPCO et parcours d'admission.", tags: ['Cursus pro', 'Qualiopi'] },
  { iconName: 'calendar', title: 'Stages de cascade & parkour', route: '/stages-cascades-parkour-2', role: 'les sessions datées', desc: 'Stages intensifs tous niveaux dès 16 ans : stage découverte de 12 jours, week-ends thématiques et Summer Camp — chaque session affiche ses dates et son statut en direct.', tags: ['Calendrier live'] },
  { iconName: 'globe', title: 'Stunt Workshop international', route: '/stunt-workshop-cuc', role: 'en français & anglais', desc: 'Stage international de deux semaines accueillant des participants du monde entier avec hébergement sur place et encadrement bilingue.', tags: ['International'] },
  { iconName: 'users', title: "L'équipe pédagogique & encadrants", route: '/equipe-cascadeurs-pro', role: 'la galerie des 20 profils', desc: 'Présentation ordonnée de la direction (Lucas Dollfus, Jérôme Gaspard, Malik Diouf, Franck Blanc) et des formateurs spécialistes, avec accès direct à chaque fiche individuelle.', tags: ['20 profils'] },
  { iconName: 'star', title: 'Fiches individuelles des coachs & cascadeurs', route: '/equipe-cascadeurs-pro/[slug]', role: 'pages dédiées', desc: 'Page personnelle de chaque membre : biographie, spécialités, lien IMDb officiel, crédits phares étoilés et filmographie vérifiée avec pagination progressive (24 films affichés puis ouverture complète, allégeant la page de 75 %).', tags: ['SEO individuel', 'Pagination −75 % HTML'] },
  { iconName: 'film', title: 'Tournage — CUC Stunt Team', route: '/cuc-team-cascadeur', role: 'pour les productions', desc: 'Coordination de cascades pour le cinéma : Hall of Fame des films coordonnés, galerie de 36 célébrités doublées (sur 6 colonnes avec navigation croisée vers les films), et galerie « Cascadeurs en action » présentée sur 2 lignes de 4 photos avec tiroir déroulant pour explorer les 23 clichés de plateau.', tags: ['36 doublures', 'Galerie 2×4 extensible'] },
  { iconName: 'star', title: 'Catalogue complet des films', route: '/cuc-team-cascadeur/films', role: '569 productions vérifiées', desc: 'Moteur de recherche et filtres par catégorie (Longs-métrages, Séries, Productions internationales) : chaque affiche ouvre une fiche détaillée listant les membres du CUC impliqués et leurs rôles exacts.', tags: ['569 films'] },
  { iconName: 'map', title: 'Visite guidée du campus (11 000 m²)', route: '/visite-guidee', role: 'installations & équipements', desc: 'Découverte détaillée des infrastructures : tour de saut de 21 m, grand dojo de 600 m², fosse de chute et airbag géant, portique de câblage 3D, résidence et réfectoire.', tags: ['11 000 m²'] },
  { iconName: 'cpu', title: 'Visite virtuelle 360° & Plan 3D', route: '/visite-virtuelle', role: 'immersion interactive', desc: 'Exploration à 360° et maquette 3D interactive du campus (12 zones cliquables), chargée à la demande pour préserver la rapidité du site.', tags: ['3D interactive'] },
  { iconName: 'layers', title: 'CUC Events — Agence événementielle', route: '/cuc-events-agence', role: 'accès direct depuis l’onglet Events', desc: "Shows d'action sur mesure pour festivals, lancements de marque, conventions et séminaires. Point d'entrée direct du menu Events.", tags: ['Lien direct'] },
  { iconName: 'star', title: 'Spectacles Cascadeurs (en réserve)', route: '/spectacles-cascadeurs-yamakasi', role: 'page spécialisée réactivable en 1 clic', desc: 'Performances scéniques : Parkour, voltige, combats chorégraphiés et chutes de hauteur. Conservée intacte et éditable au Cockpit, masquée du menu principal selon votre choix.', tags: ['En réserve (1 clic)'] },
  { iconName: 'refresh', title: 'Animations Airbag & Parkour (en réserve)', route: '/animations-airbag-parkour', role: 'page spécialisée réactivable en 1 clic', desc: 'Dispositifs mobiles de saut sur airbag cinéma et parcours d’initiation encadrés par les cascadeurs professionnels du CUC.', tags: ['En réserve (1 clic)'] },
  { iconName: 'users', title: 'Team Building Cascades (en réserve)', route: '/team-building-cascades', role: 'page spécialisée réactivable en 1 clic', desc: "Journées de cohésion d'entreprise autour des techniques de cascade et du tournage d'une séquence d'action.", tags: ['En réserve (1 clic)'] },
  { iconName: 'play', title: 'Vidéos, reportages TV & Reels', route: '/videos-cascadeur', role: 'TF1, France 2, BFM TV & Instagram', desc: 'Reportages télévisés consacrés au campus, showreels officiels et sélection des meilleurs Reels Instagram synchronisés avec Meta.', tags: ['Médias & TV'] },
  { iconName: 'users', title: 'Partenaires & Institutions', route: '/partenaires', role: 'réseau professionnel', desc: 'Studios, organismes de financement (AFDAS, France Travail), équipementiers et partenaires officiels du campus.', tags: ['Confiance'] },
  { iconName: 'phone', title: 'Contact & Candidature', route: '/contact-cuc', role: 'formulaire épuré & carte d’accès', desc: 'Formulaire direct et allégé (sans champ superflu, orienté selon votre demande : Formation, Tournage ou Événement), numéro officiel 01 30 32 38 03 et carte interactive.', tags: ['01 30 32 38 03'] },
];

export function buildVitrineSections({ cockpitCount }) {
  return `
  <section id="vue">
    <h2>1. Synthèse — Pourquoi cette application se distingue</h2>
    <p class="lead">
      L'application du <strong>Campus Univers Cascades</strong> réunit en un seul outil votre <strong>site public bilingue (FR / EN)</strong>
      et votre <strong>Cockpit d'administration avec Mode Studio</strong>. Elle a été conçue sur mesure pour répondre à deux exigences :
      offrir aux productions, candidats et partenaires une vitrine à la hauteur des tournages du CUC, et donner à votre équipe
      une autonomie totale au quotidien.
    </p>
    <div class="feat-grid">${DISTINCTION_PILLARS.map(featCard).join('')}</div>
    <div class="callout">
      <strong>Le principe directeur :</strong> aucun texte, aucune photo, aucune date de stage ni aucun numéro (<code>01 30 32 38 03</code>)
      n'est prisonnier du code. Vous modifiez une fois dans le Cockpit ou directement sur la page en Mode Studio : le site français,
      la version anglaise et la passerelle CUC Sign restent parfaitement alignés.
    </div>
  </section>

  <section id="comparaison">
    <h2>2. Ce qui change par rapport à l'ancien site WordPress</h2>
    <p class="lead">
      Là où l'ancien site reposait sur un empilement d'extensions généralistes, la nouvelle application est taillée
      spécifiquement pour les métiers du CUC : école de cascade, agence de coordination cinéma et événementiel.
    </p>
    <table>
      <thead><tr><th>Domaine</th><th>Ancien site (WordPress)</th><th>Nouvelle application CUC</th></tr></thead>
      <tbody>${OLD_SITE_ROWS.map(([c, b, a]) => `<tr><td><strong>${esc(c)}</strong></td><td>${esc(b)}</td><td>${esc(a)}</td></tr>`).join('')}</tbody>
    </table>
  </section>

  <section id="ecosysteme">
    <h2>3. Comment l'ensemble fonctionne, en un schéma</h2>
    <p>
      Le schéma ci-dessous montre comment circulent les données : vos visiteurs chargent des pages pré-calculées ultra-rapides,
      tandis que le Cockpit pilote la base Supabase, récupère les statistiques Instagram Meta et lit les données de CUC Sign.
    </p>
    <div class="flow reveal">${buildEcosystemSvg(cockpitCount)}</div>
    <div class="legend-row">
      <span><span class="key" style="background:#FFE500"></span>Cockpit & Mode Studio → Base : vos publications</span>
      <span><span class="key" style="background:#4ade80"></span>Base → Site Vitrine : rafraîchissement instantané du cache FR & EN</span>
      <span><span class="key" style="background:#f472b6"></span>API Meta → Base : abonnés & Reels Instagram</span>
      <span><span class="key" style="background:#38bdf8"></span>Passerelle lecture seule ↔ CUC Sign</span>
    </div>
    <h3>Les 8 mécanismes qui font tourner l'application</h3>
    <div class="feat-grid">${MECHANISMS.map(featCard).join('')}</div>
  </section>

  <section id="carte">
    <h2>4. Architecture de navigation & menu intelligent</h2>
    <p>
      La barre de navigation s'adapte automatiquement à vos choix dans le Cockpit. Exemple concret mis en place sur l'onglet
      <strong>Events</strong> : lorsqu'un seul choix est actif (<em>CUC Events</em>), la flèche de liste déroulante disparaît
      d'elle-même et le clic mène directement à la page <code>/cuc-events-agence</code>. Si demain vous réactivez une deuxième
      page événementielle dans l'écran <em>Menus du site</em>, le menu déroulant réapparaît automatiquement.
    </p>
    <div class="callout">
      <strong>Rien n'est supprimé, tout reste prêt :</strong> les pages <em>Spectacles Cascadeurs</em>,
      <em>Animations Airbag & Parkour</em> et <em>Team Building</em> sont simplement désactivées du menu principal.
      Leurs textes, leurs photos et leurs traductions anglaises sont conservés et réactivables en un clic.
    </div>
  </section>

  <section id="site">
    <h2>5. Le site public — les ${PUBLIC_PAGES.length} routes détaillées (FR / EN)</h2>
    <p>Cliquez sur une page pour consulter son contenu et ses particularités techniques ou éditoriales :</p>
    ${PUBLIC_PAGES.map(accordionRow).join('')}
  </section>`;
}
