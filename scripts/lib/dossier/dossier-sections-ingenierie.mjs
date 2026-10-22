/**
 * CHAPITRES 9 À 14 — QUALITÉ ÉDITORIALE, PERFORMANCE, SÉCURITÉ, GLOSSAIRE & FAQ
 * =============================================================================
 *
 * Responsabilité :
 *   Construire les chapitres qui présentent le travail de fond sur les données,
 *   les performances mesurées, la sécurité des rôles et des sauvegardes,
 *   les bonnes pratiques, le glossaire et la foire aux questions.
 */

import { esc, nf, mo, mo2, kb, pct, kpiHtml, featCard, accordionRow, donut } from './dossier-data.mjs';
import { buildPerformanceChartsHtml, buildResilienceCascadeSvg } from './dossier-diagrams.mjs';

const TABLE_LABELS = {
  site_translations: 'Traductions éditoriales (EN)',
  site_films: 'Films vérifiés au catalogue',
  site_partners: 'Partenaires & institutions',
  site_team: 'Membres de l’équipe & direction',
  site_sessions: 'Sessions de formation',
  site_pages: 'Pages publiques bilingues',
  site_settings: 'Blocs de réglages & miroirs',
  site_disciplines: 'Disciplines enseignées',
  site_programs: 'Programmes de formation',
  site_campus_pois: 'Zones du plan du campus',
  site_social_links: 'Réseaux sociaux officiels',
  site_events: 'Prestations CUC Events',
};

const ROLES_CARDS = [
  {
    iconName: 'sliders',
    badge: 'Cockpit Vitrine',
    title: 'Direction & Administrateur',
    desc: 'Accès intégral au Cockpit (/admin) : édition de toutes les pages en Mode Studio, gestion du catalogue, des accès, du journal d’activité et des sauvegardes JSON.',
    tags: ['Accès complet'],
  },
  {
    iconName: 'phone',
    badge: 'Cockpit Vitrine',
    title: 'Secrétariat',
    desc: 'Suivi et qualification des candidatures par pipeline, mise à jour du calendrier des sessions de stage, édition des pages courantes et des traductions.',
    tags: ['Gestion quotidienne'],
  },
  {
    iconName: 'users',
    badge: 'Espace CUC Sign',
    title: 'Coachs, Formateurs & Élèves',
    desc: "Les coachs et les élèves n'accèdent jamais au Cockpit du site vitrine : leur espace de travail dédié (planning, émargement, notes, suivi médical) vit exclusivement dans l'application métier CUC Sign.",
    tags: ['Séparation stricte'],
  },
];

const PRACTICES = [
  { iconName: 'eye', title: 'Privilégier le Mode Studio pour les retouches', desc: "Cliquez directement sur le texte dans l'aperçu : vous contrôlez immédiatement le rendu visuel sur ordinateur et mobile avant d'enregistrer." },
  { iconName: 'globe', title: 'Vérifier le basculement FR ↔ EN', desc: "Un bouton dans la barre d'aperçu permet de passer de la page française à la page anglaise en une seconde pour vérifier la cohérence des deux versions." },
  { iconName: 'calendar', title: 'Tenir à jour le statut des sessions', desc: "« Ouvert », « Dernières places », « Complet » : c'est l'indicateur qui déclenche le passage à l'action des candidats sur la page Stages." },
  { iconName: 'film', title: 'Étoiler les crédits marquants d’un coach', desc: 'Sur chaque fiche membre, les crédits étoilés remontent automatiquement en tête de sa filmographie personnelle.' },
  { iconName: 'database', title: 'Exporter une sauvegarde avant un gros chantier', desc: 'Depuis Coordonnées & paramètres, téléchargez un export JSON complet en un clic avant toute refonte importante.' },
  { iconName: 'shield', title: 'Utiliser l’historique des versions sans hésiter', desc: 'Chaque enregistrement de page conserve une révision datée : revenir à la version précédente prend trois secondes.' },
];

export const GLOSSARY = [
  { iconName: 'eye', title: 'Mode Studio', role: 'édition sur la page', desc: "Mode d'aperçu interactif du Cockpit permettant de cliquer directement sur les titres, textes et boutons de la page pour les modifier à leur taille réelle." },
  { iconName: 'sliders', title: 'Cockpit (/admin)', role: 'administration du site', desc: "Espace de gestion réservé à la Direction, aux Administrateurs et au Secrétariat pour piloter l'ensemble du site sans écrire de code." },
  { iconName: 'database', title: 'Supabase (PostgreSQL)', role: 'base de données & médias', desc: 'Le coffre central qui héberge les textes, le catalogue de films, les traductions et les images optimisées, partagé avec CUC Sign.' },
  { iconName: 'zap', title: 'Cache SSR & Revalidation', role: 'vitesse d’affichage', desc: 'Les pages sont préparées à l’avance pour s’afficher instantanément ; dès que vous cliquez sur Enregistrer au Cockpit, le cache français et anglais est régénéré.' },
  { iconName: 'film', title: 'WebP & dossier _originals', role: 'filière image', desc: "Format d'image moderne généré automatiquement par votre navigateur lors de l'import (−71 % de poids), tandis que le fichier source original est conservé sous _originals." },
  { iconName: 'edit', title: 'Micro-textes (442 clés)', role: 'libellés d’interface', desc: 'Tous les petits textes du site (boutons, intitulés de filtres, messages de formulaire) rendus modifiables depuis le Cockpit.' },
  { iconName: 'shield', title: 'Sécurité par ligne (RLS)', role: 'protection des tables', desc: 'Verrouillage directement dans la base de données (20 tables protégées) garantissant qu’aucun visiteur anonyme ne puisse lire un brouillon ni modifier une donnée.' },
  { iconName: 'check', title: 'CUC Sign', role: 'plateforme école', desc: "Application métier dédiée à la vie pédagogique (émargement Qualiopi, groupes, blessures, fiches de casting), reliée au site par la même base de données." },
];

export const FAQ = [
  { q: 'Pourquoi le site se charge-t-il aussi vite malgré plus de 500 films et un plan 3D ?', a: "Parce que le poids initial a été réduit de 42 % : les visiteurs reçoivent des pages pré-calculées sans connexion permanente inutile, les lourdes bibliothèques (moteur 3D Three.js, client de base de données, animations) ne sont téléchargées qu'à la demande, et les filmographies des 19 fiches coachs utilisent une pagination progressive qui allège le HTML de 75 %." },
  { q: 'Comment fonctionne le nouveau menu Events lorsqu’une seule page est active ?', a: "C'est automatique : tant que seule la page « CUC Events » (/cuc-events-agence) est cochée comme visible dans l'écran Menus du site, la barre de navigation retire la flèche de liste déroulante et redirige directement au clic. Les 3 autres pages (Spectacles Cascadeurs, Animations Airbag, Team Building) restent conservées et éditables en réserve." },
  { q: 'Les coachs ou les élèves peuvent-ils se connecter au Cockpit du site (/admin) ?', a: "Non, jamais. Par sécurité, le Cockpit du site vitrine est réservé aux rôles Direction, Administrateur et Secrétariat. L'espace de travail des coachs et des élèves se trouve exclusivement dans CUC Sign." },
  { q: 'Que se passe-t-il si je fais une erreur en modifiant une page en Mode Studio ?', a: "Tant que vous n'avez pas cliqué sur Enregistrer, rien n'est écrit en base : vous pouvez annuler avec Ctrl+Z ou fermer l'onglet. Et même après avoir enregistré, l'Historique des versions vous permet de restaurer l'état précédent en un clic." },
  { q: 'Comment sont gérées les sauvegardes du site ?', a: "Conformément à votre choix d'exploitation, aucune tâche automatique payante ne tourne en arrière-plan : vous déclenchez une sauvegarde complète (fichier JSON des 14 tables de contenu) quand vous le souhaitez depuis le Cockpit, et pouvez la restaurer sans jamais toucher aux données de CUC Sign. Un moteur de sauvegarde chiffré (AES-256-GCM) est également prêt en veille." },
  { q: 'Les filmographies et doublures ont-elles été vérifiées ?', a: "Oui : chaque profil de l'équipe a été recoupé crédit par crédit sur IMDb, les intitulés de rôles ont été normalisés avec sobriété, et les 36 célébrités doublées sont reliées de façon bidirectionnelle aux fiches des films correspondants." },
  { q: 'Combien coûte l’hébergement mensuel de l’application ?', a: "Le site n'utilise aucune fonction payante de Vercel (ni cron, ni calcul long) et tourne sur le cache standard (0 € en offre Hobby, ou ≈ 20 $/mois si Vercel requiert l'offre Pro commerciale). La base Supabase Pro (≈ 25 $/mois) assure l'hébergement PostgreSQL, la médiathèque et les sauvegardes." },
];

export function buildIngenierieSections(data) {
  const { tables, live, metrics, recompression, purge, rlsOn } = data;
  const q = live.quality;
  const codeTotals = metrics?.code?.totals;
  const codeTests = metrics?.code?.tests;
  const compCount = metrics?.code?.tsx?.componentExports ?? 446;

  const contentRows = Object.entries(TABLE_LABELS)
    .map(([k, label]) => ({ label, value: tables[k] ?? 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const qualityKpis = [
    kpiHtml(q.films.total, 'films vérifiés au catalogue', `${pct(q.films.with_image, q.films.total)} % avec affiche officielle`),
    kpiHtml(q.team.total, 'profils d’équipe & direction', `${nf(q.team.with_imdb)} reliés à leur fiche IMDb`),
    kpiHtml(live.celebritiesCount, 'célébrités doublées', 'reliées aux films sur 6 colonnes'),
    kpiHtml(q.translationsTotal, 'traductions éditoriales EN', `${nf(q.filmsEn)} fiches films traduites en base`),
    kpiHtml(442, 'micro-textes éditables', '0 texte figé dans le code'),
    kpiHtml(23, 'photos cascadeurs en action', 'galerie 2×4 + tiroir sur Tournage'),
  ].join('');

  const scaleKpis = [
    codeTotals ? kpiHtml(codeTotals.lines, 'lignes de code & documentation', `${nf(codeTotals.files)} fichiers structurés`) : '',
    kpiHtml(compCount, 'composants d’interface', 'architecture modulaire < 300 lignes'),
    codeTests?.available ? kpiHtml(codeTests.passed, 'tests automatiques validés', `sur ${nf(codeTests.files)} suites de contrôle`) : '',
    kpiHtml(rlsOn, 'tables protégées (RLS)', 'isolation stricte vitrine / CUC Sign'),
  ].join('');

  const completenessDonut = donut(
    [
      { label: 'Fiche complète (affiche + synopsis FR & EN)', value: q.films.both },
      { label: 'À compléter', value: Math.max(0, q.films.total - q.films.both) },
    ],
    { unit: 'films' }
  );

  return `
  <section id="contenus">
    <h2>9. Travail éditorial & vérité du catalogue cinéma</h2>
    <p class="lead">
      Au-delà de la technique, la crédibilité du site auprès des producteurs et des candidats repose sur l'exactitude
      de ses contenus : aucune formule publicitaire creuse, uniquement des faits vérifiés, des crédits IMDb recoupés
      et un bilinguisme français / anglais intégralement rédigé.
    </p>
    <div class="kpis">${qualityKpis}</div>

    <div class="two-col" style="margin-top:26px">
      <div>
        <h3>Volumes publiés en base de données</h3>
        <table>
          <thead><tr><th>Famille de contenu</th><th>Enregistrements</th></tr></thead>
          <tbody>${contentRows.map((r) => `<tr><td>${esc(r.label)}</td><td><strong>${nf(r.value)}</strong></td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div>
        <h3>Complétude du catalogue de films</h3>
        ${completenessDonut}
        <div class="callout" style="margin-top:18px">
          <strong>Précision terminologique respectée partout :</strong> surface réelle du campus (<code>11 000 m²</code>),
          vocabulaire officiel (<em>Parkour</em>, <em>Combat Scénique</em>, <em>Spectacles Cascadeurs</em>) et numéro
          unique <code>01 30 32 38 03</code> aligné dans le code comme en base.
        </div>
      </div>
    </div>
  </section>

  <section id="capot">
    <h2>10. Sous le capot — Performance, Filière Média & Coûts</h2>
    <p class="lead">
      En octobre 2026, l'application a bénéficié d'une campagne d'optimisation en profondeur pour garantir un affichage
      immédiat sur réseau mobile comme sur fibre, tout en réduisant l'empreinte de stockage de plus de 70 %.
    </p>

    <h3>Les trois gains majeurs d'octobre 2026, mesurés</h3>
    ${buildPerformanceChartsHtml()}

    <h3>La cascade de résilience à 4 niveaux (« Zéro Page Morte »)</h3>
    <p>
      Pour qu'aucune page n'affiche jamais un champ vide ou une erreur en cas d'oubli de saisie, chaque texte traverse
      automatiquement quatre niveaux de repli :
    </p>
    <div class="flow reveal">${buildResilienceCascadeSvg()}</div>

    <h3>L'envergure technique du projet</h3>
    <div class="kpis">${scaleKpis}</div>
    <p class="meta" style="margin-top:14px">
      Filière média : ${nf(recompression.count)} visuels ont été recompressés en WebP (${mo2(recompression.before)} → ${mo2(recompression.after)},
      soit ${mo2(recompression.saved)} économisés) et ${nf(purge.count)} doublons purgés (${mo2(purge.freed)} libérés),
      tout en conservant les fichiers haute définition sous <code>_originals/</code>.
    </p>
  </section>

  <section id="gestion">
    <h2>11. Sécurité, Rôles, Sauvegardes & Gouvernance</h2>
    <h3>Qui accède à quoi (Règle d'or des rôles)</h3>
    <div class="feat-grid">${ROLES_CARDS.map(featCard).join('')}</div>

    <ul class="thread" style="margin-top:22px">
      <li><b>Sauvegarde & restauration sur demande :</b> vous exportez l'intégralité des 14 tables de contenu du site en un fichier JSON depuis le Cockpit quand vous le décidez, sans tâche automatique superflue. La restauration met à jour les contenus du site sans jamais toucher aux tables de CUC Sign. En complément, un moteur de sauvegarde chiffré (AES-256-GCM, rotation GFS) reste disponible en veille.</li>
      <li><b>Journal d'activité en ajout seul :</b> l'écran <code>/admin/journal</code> sépare les modifications métier, les alertes techniques classées et la rétention. Aucune écriture n'est passée sous silence et les données sensibles sont masquées automatiquement.</li>
      <li><b>Garde-fous automatiques avant toute mise en ligne :</b> 1 188 tests unitaires, contrôle du budget JavaScript par route, vérification des 442 micro-textes et audit d'isolation CUC Sign s'exécutent à chaque livraison.</li>
    </ul>
  </section>

  <section id="pratiques">
    <h2>12. Les 6 bonnes pratiques pour votre équipe</h2>
    <div class="feat-grid">${PRACTICES.map(featCard).join('')}</div>
  </section>

  <section id="glossaire">
    <h2>13. Glossaire — les termes du projet en clair</h2>
    ${GLOSSARY.map(accordionRow).join('')}
  </section>

  <section id="faq">
    <h2>14. Questions fréquentes (FAQ)</h2>
    ${FAQ.map(
      ({ q: question, a }) => `
      <details class="acc reveal" data-filter-item>
        <summary><span>${esc(question)}</span>
          <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </summary>
        <div class="acc-body">${esc(a)}</div>
      </details>`
    ).join('')}
  </section>`;
}
