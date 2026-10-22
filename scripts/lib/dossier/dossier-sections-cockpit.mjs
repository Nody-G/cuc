/**
 * CHAPITRES 6 À 8 — MODE STUDIO, COCKPIT (27 ÉCRANS) & GUIDE QUOTIDIEN
 * ====================================================================
 *
 * Responsabilité :
 *   Construire les chapitres dédiés au pilotage par l'équipe du CUC :
 *   6. Mode Studio (édition visuelle sur la page) & Studio 3D du campus
 *   7. Les 27 écrans du Cockpit d'administration (filtrables par pôle)
 *   8. Guide opérationnel « Au quotidien », cycle candidat & sessions en direct
 */

import { esc, featCard, accordionRow } from './dossier-data.mjs';
import { buildStudioModeSvg, buildRequestCycleSvg } from './dossier-diagrams.mjs';

export const COCKPIT_APPS = [
  { group: 'planning', iconName: 'layers', title: 'Tableau de bord', route: '/admin', role: 'vue d’ensemble', desc: 'Synthèse des contenus, dernière activité, remplissage des sessions et accès rapide aux outils.', tags: ['Accueil Admin'] },
  { group: 'planning', iconName: 'phone', title: 'Contact & candidatures', route: '/admin/inquiries', role: 'pipelines dédiés', desc: 'Chaque demande suit le circuit de son projet (Formation, Tournage, Événement) avec détection automatique des dossiers antérieurs du même candidat et conversion en compte élève CUC Sign.', tags: ['Pipelines', 'Historique candidat'] },
  { group: 'planning', iconName: 'calendar', title: 'Sessions de formation', route: '/admin/sessions', role: 'calendrier en direct', desc: 'Dates, statut (ouvert, dernières places, complet, bientôt) et liaison vers la formation correspondante dans CUC Sign.', tags: ['Stages & Cursus'] },
  { group: 'catalogue', iconName: 'edit', title: 'Pages du site & Mode Studio', route: '/admin/pages', role: 'édition sur la page', desc: 'Éditez chaque page par formulaire ou directement en cliquant sur les textes dans l’aperçu Mode Studio (FR et EN), avec historique de versions restaurable en un clic.', tags: ['Mode Studio', 'Révisions'] },
  { group: 'catalogue', iconName: 'film', title: 'Filmographie & crédits', route: '/admin/films', role: 'catalogue cinéma', desc: 'Gestion du catalogue de films : affiches, catégories, rôles exacts des membres du CUC, crédits phares étoilés et galerie des 36 célébrités doublées.', tags: ['569 films', '36 doublures'] },
  { group: 'catalogue', iconName: 'users', title: 'Coachs & formateurs', route: '/admin/team', role: '20 profils', desc: 'Rôle, ordre d’affichage, biographie, lien IMDb, spécialités et filmographie personnelle reliée au catalogue.', tags: ['20 fiches'] },
  { group: 'catalogue', iconName: 'map', title: 'Campus — zones & équipements', route: '/admin/campus', role: 'installations', desc: 'Éditer les zones d’entraînement et les équipements du campus de 11 000 m².', tags: ['11 000 m²'] },
  { group: 'catalogue', iconName: 'cpu', title: 'Campus — Studio du plan 3D', route: '/admin/campus-3d', role: 'maquette 3D', desc: 'Placer, déplacer, tourner et redimensionner les bâtiments du plan 3D avec manipulateur visuel (Gizmo), annulation Ctrl+Z et import de modèles .glb.', tags: ['Studio 3D'] },
  { group: 'catalogue', iconName: 'book', title: 'Disciplines enseignées', route: '/admin/disciplines', role: 'référentiel', desc: 'Les 10 disciplines officielles (Parkour, Combat Scénique, Chutes, Câblage…) : niveaux, équipements et descriptifs bilingues.', tags: ['10 disciplines'] },
  { group: 'catalogue', iconName: 'star', title: 'Agence & événements', route: '/admin/events', role: 'activités CUC Events', desc: 'Prestations et références événementielles présentées sur la page CUC Events.', tags: ['Events'] },
  { group: 'catalogue', iconName: 'users', title: 'Partenaires', route: '/admin/partners', role: 'logos & liens', desc: 'Ajouter, retirer ou réordonner les partenaires et institutions affichés sur le site.', tags: [] },
  { group: 'audience', iconName: 'play', title: 'Instagram & vidéos Meta', route: '/admin/instagram', role: 'API Meta en direct', desc: 'Synchronisation du nombre d’abonnés, portée des publications et sélection des Reels mis en avant sur l’accueil et la page Vidéos.', tags: ['API Meta Graph'] },
  { group: 'audience', iconName: 'globe', title: 'Visites du site', route: '/admin/visites', role: 'audience mesurée', desc: 'Fréquentation par page, provenance et appareil, ainsi que les temps de chargement réellement vécus par les visiteurs.', tags: ['Sans cookie tiers'] },
  { group: 'audience', iconName: 'gauge', title: 'Statistiques & conversion', route: '/admin/analytics', role: 'indicateurs', desc: 'Entonnoir de traitement des demandes et répartition par pipeline (Formation, Tournage, Événement).', tags: ['Direction'] },
  { group: 'systeme', iconName: 'database', title: 'Médiathèque WebP', route: '/admin/media', role: 'photos & documents', desc: 'Dépôt direct depuis le navigateur : conversion WebP automatique, classement par dossiers, recherche, corbeille réversible et conservation des originaux sous _originals.', tags: ['Compression auto'] },
  { group: 'systeme', iconName: 'bell', title: 'Bandeau d’alerte', route: '/admin/announcements', role: 'message urgent', desc: 'Bandeau d’information affiché en haut du site public, activable et désactivable en un clic.', tags: [] },
  { group: 'systeme', iconName: 'layout', title: 'Menus du site', route: '/admin/navigation', role: 'navigation adaptative', desc: 'Ordre des onglets, sous-menus (avec bascule automatique en lien direct s’il n’y a qu’un seul sous-choix visible) et bouton d’action.', tags: ['Menu intelligent'] },
  { group: 'systeme', iconName: 'layout', title: 'Bas de page (Footer)', route: '/admin/footer', role: 'pied de page', desc: 'Colonnes de liens, présentation et mentions légales du bas de page.', tags: [] },
  { group: 'systeme', iconName: 'globe', title: 'Réseaux sociaux', route: '/admin/social', role: 'liens officiels', desc: 'Comptes Instagram, YouTube, TikTok, Facebook et LinkedIn partagés entre l’en-tête, le menu mobile et le pied de page.', tags: [] },
  { group: 'systeme', iconName: 'sliders', title: 'Coordonnées & paramètres', route: '/admin/settings', role: 'identité du site', desc: 'Téléphone officiel (01 30 32 38 03), adresses e-mail, horaires, numéro Qualiopi et sauvegarde JSON complète en un clic.', tags: ['Sauvegarde JSON'] },
  { group: 'systeme', iconName: 'globe', title: 'Traductions anglaises', route: '/admin/translations', role: 'FR → EN', desc: 'Édition des textes anglais pour les films, coachs, événements, disciplines et installations.', tags: ['Bilingue'] },
  { group: 'systeme', iconName: 'edit', title: 'Textes & boutons du site', route: '/admin/microtextes', role: '442 micro-textes', desc: 'Tous les libellés de boutons, filtres et messages d’interface, modifiables sans toucher au code.', tags: ['Zéro texte figé'] },
  { group: 'systeme', iconName: 'shield', title: 'Comptes & accès', route: '/admin/users', role: 'rôles administratifs', desc: 'Gestion des comptes autorisés sur le Cockpit vitrine (Direction, Administrateur, Secrétariat).', tags: ['Sécurité'] },
  { group: 'systeme', iconName: 'bell', title: 'Journal & activité', route: '/admin/journal', role: 'métier · système · rétention', desc: 'Suivi unifié des modifications de contenu, des alertes techniques classées et de la politique de rétention.', tags: ['Direction'] },
  { group: 'systeme', iconName: 'check', title: 'Journal d’audit', route: '/admin/audit', role: 'traçabilité', desc: 'Historique horodaté de toutes les actions réalisées dans le Cockpit, filtrable et exportable.', tags: ['Direction'] },
  { group: 'systeme', iconName: 'gauge', title: 'Diagnostic du site', route: '/admin/health', role: 'contrôle qualité', desc: 'Vérification automatique des liens internes, des images, des métadonnées SEO et de la parité FR/EN.', tags: ['Direction'] },
  { group: 'systeme', iconName: 'book', title: 'Aide & guide intégré', route: '/admin/aide', role: 'mode d’emploi', desc: 'Documentation pratique intégrée au Cockpit pour accompagner chaque membre de l’équipe.', tags: ['Guide'] },
];

const DAILY_WORKFLOWS = [
  {
    iconName: 'eye',
    title: 'Modifier un texte directement sur la page',
    desc: 'Cockpit → Pages du site → choisir la page → onglet Aperçu (Mode Studio) → cliquer sur le texte à l’écran → modifier → Enregistrer.',
    tags: ['Mode Studio'],
  },
  {
    iconName: 'calendar',
    title: 'Ouvrir ou clôturer une session de stage',
    desc: 'Cockpit → Sessions de formation → passer le statut sur « Ouvert », « Dernières places » ou « Complet » : la page Stages se met à jour aussitôt.',
    tags: ['Sessions'],
  },
  {
    iconName: 'layout',
    title: 'Réactiver une page dans le menu Events',
    desc: 'Cockpit → Menus du site → cocher la visibilité d’une page en réserve (ex. Spectacles Cascadeurs) : le menu déroulant se reforme tout seul.',
    tags: ['Navigation'],
  },
  {
    iconName: 'film',
    title: 'Mettre un film ou une doublure en avant',
    desc: 'Cockpit → Filmographie (ou fiche Coach) → étoiler le crédit phare pour le placer en tête de liste, ou enrichir la fiche de l’acteur doublé.',
    tags: ['Catalogue'],
  },
  {
    iconName: 'database',
    title: 'Ajouter une nouvelle photo optimisée',
    desc: 'Cockpit → Médiathèque → glisser l’image : votre navigateur la convertit automatiquement en WebP léger et conserve l’original en réserve.',
    tags: ['Médiathèque'],
  },
  {
    iconName: 'shield',
    title: 'Revenir en arrière après une erreur',
    desc: 'En cours de saisie : appuyez sur Ctrl+Z. Après publication : ouvrez l’Historique des versions de la page et restaurez la version précédente en un clic.',
    tags: ['Réversibilité'],
  },
];

const STATUS_STYLE = {
  ouvert: ['Ouvertes aux inscriptions', 's-ok'],
  'dernières places': ['Dernières places', 's-last'],
  complet: ['Complet', 's-full'],
  bientôt: ['Annoncées prochainement', 's-soon'],
};

const prettyProgram = (id, map) =>
  map[id] ||
  String(id ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) ||
  'Session';

export function buildCockpitSections({ live }) {
  const sessionsHtml = live.sessions.length
    ? live.sessions
        .map((s) => {
          const [label, cls] = STATUS_STYLE[s.status] ?? [s.status ?? 'Programmé', 's-soon'];
          return `<li class="sess reveal">
            <span class="sess-status ${cls}">${esc(label)}</span>
            <span class="sess-title">${esc(prettyProgram(s.program_id, live.programNames))}</span>
            <span class="sess-date">${esc(s.date_display ?? '')}</span>
          </li>`;
        })
        .join('')
    : '<li class="sess reveal"><span class="sess-title">Sessions synchronisées avec la base de production.</span></li>';

  return `
  <section id="studio">
    <h2>6. Le Mode Studio & le Studio 3D — éditer en voyant le résultat</h2>
    <p class="lead">
      Pour que la mise à jour du site soit aussi simple que la relecture d'une page, le Cockpit intègre un
      <strong>Mode Studio</strong> : vous éditez les textes directement dans l'aperçu réel de la page, en français comme en anglais,
      sans jamais risquer d'écrire une modification incomplète en base.
    </p>
    <div class="flow reveal">${buildStudioModeSvg()}</div>
    <ul class="thread">
      <li><b>Saisie à l'échelle réelle :</b> quand vous cliquez sur un titre ou un bouton, le champ d'édition adopte exactement sa police, sa taille et sa couleur. Vous voyez immédiatement si votre texte tient sur une ou deux lignes.</li>
      <li><b>Navigation clavier fluide :</b> la touche <code>Tab</code> (et <code>Maj+Tab</code>) passe d'un texte éditable au suivant dans l'ordre de lecture de la page ; <code>Ctrl+Z</code> annule la dernière retouche.</li>
      <li><b>Sonde d'atteignabilité intégrée :</b> la barre supérieure vérifie automatiquement que chaque texte de la page est bien cliquable à la souris, même lorsqu'un effet visuel ou un bandeau vidéo l'entoure.</li>
      <li><b>Studio du Plan 3D (<code>/admin/campus-3d</code>) :</b> sur le même esprit visuel, la maquette 3D du campus se modifie à la souris (déplacement, rotation, taille des bâtiments, historique <code>Ctrl+Z</code> et import de modèles <code>.glb</code>).</li>
    </ul>
  </section>

  <section id="cockpit">
    <h2>7. Le Cockpit d'administration — les ${COCKPIT_APPS.length} écrans par pôle</h2>
    <p>
      Le Cockpit est strictement réservé à l'équipe administrative (<strong>Direction, Administrateur, Secrétariat</strong>).
      Utilisez les boutons ci-dessous pour filtrer les écrans par pôle d'activité :
    </p>
    <div class="filter-pills" role="tablist" aria-label="Filtrer les écrans du Cockpit par pôle">
      <button type="button" class="filter-pill active" data-group-btn="all">Tous les écrans (${COCKPIT_APPS.length})</button>
      <button type="button" class="filter-pill" data-group-btn="planning">Inscriptions & Planning (3)</button>
      <button type="button" class="filter-pill" data-group-btn="catalogue">Pages, Films, Coachs & Campus 3D (8)</button>
      <button type="button" class="filter-pill" data-group-btn="audience">Instagram & Audience (3)</button>
      <button type="button" class="filter-pill" data-group-btn="systeme">Menus, Médias, Langues & Sécurité (13)</button>
    </div>
    <div id="cockpit-list">
      ${COCKPIT_APPS.map(accordionRow).join('')}
    </div>
  </section>

  <section id="quotidien">
    <h2>8. Guide pratique — les gestes du quotidien</h2>
    <p>Les six opérations les plus courantes, résumées étape par étape :</p>
    <div class="feat-grid">${DAILY_WORKFLOWS.map(featCard).join('')}</div>

    <h3>Le cycle d'une candidature ou d'une demande de tournage</h3>
    <p class="meta">
      Depuis le formulaire épuré de la page Contact jusqu'à la conversion en dossier élève CUC Sign, chaque demande est classée
      dans son pipeline (Formation, Tournage ou Événement) et signale automatiquement si la personne avait déjà déposé un dossier par le passé.
    </p>
    <div class="flow reveal">${buildRequestCycleSvg()}</div>

    <h3>Vos sessions de formation actuellement publiées en base</h3>
    <ul class="sessions">${sessionsHtml}</ul>
  </section>`;
}
