#!/usr/bin/env node
/**
 * DOSSIER DE PRÉSENTATION CLIENT — L'APPLICATION DU CAMPUS UNIVERS CASCADES
 * =========================================================================
 *
 * Version 5 : deux sorties — le dossier de l'application et la page dédiée à
 * CUC Sign (signalements terrain inclus) ; échelle du projet (lignes de code) et
 * comparaison avec l'ancien site réintroduites.
 * Le tout autonome et imprimable.
 *
 * Régénération : `npm run report:dossier`
 * Sorties : reports/cuc-dossier-application.html · reports/cuc-sign.html
 *
 * Sources :
 *   - Supabase de production (lecture seule) — via DATABASE_URL, repli silencieux ;
 *   - scripts/audit_supabase_state_report.json (volumétrie) ;
 *   - reports/cuc-metriques-2026.metrics.json (poids de pages, garanties).
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';

import { buildCucSignDossier } from './lib/cuc-sign-dossier.mjs';

dotenv.config({ path: '.env.local' });

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'reports', 'cuc-dossier-application.html');
const OUT_SIGN = path.join(ROOT, 'reports', 'cuc-sign.html');

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const dbState = readJson(path.join(ROOT, 'scripts', 'audit_supabase_state_report.json'));
const metrics = readJson(path.join(ROOT, 'reports', 'cuc-metriques-2026.metrics.json'));

const t = Array.isArray(metrics?.database?.tables)
  ? Object.fromEntries(metrics.database.tables.map((r) => [r.name, r.rows]))
  : dbState?.tables ?? {};

/* ------------------------------------------------------------------ */
/* Mesures complémentaires en direct (lecture seule, repli silencieux) */
/* ------------------------------------------------------------------ */

const live = {
  filmsByDecade: [],
  storage: metrics?.database?.storage ?? [],
  partnersByCategory: [],
  sessions: [],
  programNames: {},
  quality: null,
};

async function collectLive() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) return;
  const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const decades = await client.query(
      `SELECT (left(year, 4)::int / 10 * 10)::text AS decade, COUNT(*)::int AS n
             FROM site_films
             WHERE is_published = true AND year ~ '^[0-9]{4}'
             GROUP BY 1 ORDER BY 1`
    );
    live.filmsByDecade = decades.rows.map((r) => ({ decade: r.decade, n: r.n }));
  } catch { }
  try {
    const storage = await client.query(
      `SELECT bucket_id, COUNT(*)::int AS files,
                    COALESCE(SUM(CASE WHEN (metadata->>'size') ~ '^[0-9]+$' THEN (metadata->>'size')::bigint ELSE 0 END), 0)::bigint AS bytes
             FROM storage.objects GROUP BY bucket_id ORDER BY bytes DESC`
    );
    if (storage.rows.length) {
      live.storage = storage.rows.map((r) => ({
        bucket: r.bucket_id,
        files: r.files,
        bytes: Number(r.bytes),
      }));
    }
  } catch { }
  try {
    const partners = await client.query(
      `SELECT category, COUNT(*)::int AS n FROM site_partners
             WHERE is_published = true GROUP BY 1 ORDER BY n DESC`
    );
    live.partnersByCategory = partners.rows;
  } catch { }
  try {
    const sessions = await client.query(
      `SELECT program_id, date_display, status FROM site_sessions
             WHERE is_published = true AND date_display IS NOT NULL
             ORDER BY order_index ASC NULLS LAST LIMIT 12`
    );
    live.sessions = sessions.rows;
  } catch { }
  try {
    let progs = { rows: [] };
    try {
      progs = await client.query(`SELECT id, name FROM site_programs`);
    } catch {
      try {
        progs = await client.query(`SELECT id, title FROM site_programs`);
      } catch { }
    }
    live.programNames = Object.fromEntries(
      progs.rows.map((r) => [r.id, r.name ?? r.title]).filter(([, v]) => v)
    );
  } catch { }
  try {
    const fq = await client.query(
      `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE image IS NOT NULL AND image <> '')::int AS with_image,
                    COUNT(*) FILTER (WHERE (image IS NOT NULL AND image <> '')
                                       AND (description IS NOT NULL AND description <> ''))::int AS both
             FROM site_films WHERE is_published = true`
    );
    const tq = await client.query(
      `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE bio IS NOT NULL AND bio <> '')::int AS with_bio,
                    COUNT(*) FILTER (WHERE imdb IS NOT NULL AND imdb <> '')::int AS with_imdb,
                    COUNT(*) FILTER (WHERE avatar_url IS NOT NULL AND avatar_url <> '')::int AS with_avatar
             FROM site_team`
    );
    let filmsEn = 0;
    try {
      const en = await client.query(
        `SELECT COUNT(DISTINCT entity_id)::int AS n FROM site_translations
               WHERE entity = 'film' AND locale = 'en'`
      );
      filmsEn = en.rows[0]?.n ?? 0;
    } catch { }
    live.quality = { films: fq.rows[0], team: tq.rows[0], filmsEn };
  } catch { }
  await client.end();
}
await collectLive().catch(() => { });

const storageFiles = live.storage.reduce((a, s) => a + (s.files ?? 0), 0);
const storageBytes = live.storage.reduce((a, s) => a + (s.bytes ?? 0), 0);

/* ================================================================== */
/* Boîte à outils visuelle (identité CUC)                              */
/* ================================================================== */

const esc = (s) => String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
const nf = (n) => Number(n).toLocaleString('fr-FR');
const mo = (bytes) => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
const kb = (bytes) => `${Math.round(bytes / 1024)} Ko`;
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

const FEAT_ICONS = {
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 11a3 3 0 1 0 0-6"/><path d="M21 20c0-2.5-1.8-4.4-4.5-4.8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z"/>',
  map: '<path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2z"/><path d="M9 3v16M15 5v16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 5v6h-6"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
  database:
    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  phone:
    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-3-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2V5z"/><path d="M8 7h8M8 11h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gauge: '<path d="M4 14a8 8 0 1 1 16 0"/><path d="M12 14l4-4"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
};

const icon = (name) => `<span class="fi"><svg viewBox="0 0 24 24" aria-hidden="true">${FEAT_ICONS[name] ?? FEAT_ICONS.star}</svg></span>`;
const tagsHtml = (tags = []) =>
  tags.length ? `<div class="tags">${tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '';

const featCard = ({ iconName, title, desc, tags }) => `
  <article class="feat reveal">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(desc)}</p>${tagsHtml(tags)}</article>`;

const accordionRow = ({ iconName, title, role, desc, tags }) => `
  <details class="acc reveal">
    <summary>${icon(iconName)}<span>${esc(title)}${role ? ` <span class="role">— ${esc(role)}</span>` : ''}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(desc)}${tagsHtml(tags)}</div>
  </details>`;

/** KPI avec compteur animé lorsque la valeur est purement numérique. */
const kpiHtml = (value, label, sub = '') => {
  const raw = String(value);
  const numeric = /^\d+$/.test(raw) ? Number(raw) : null;
  const inner = numeric !== null ? `<span data-count="${numeric}">${nf(numeric)}</span>` : esc(raw);
  return `<div class="kpi reveal"><div class="n">${inner}</div><div class="l">${esc(label)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>`;
};

/* Le diagramme à barres maison (`barChart`) a été retiré le 2026-09-24 :
   il décorait plus qu'il n'informait. Les volumes se lisent dans un tableau,
   et le seul graphique conservé est le camembert de complétude des fiches. */

/** Camembert + légende. */
function donut(entries, { size = 224, unit = 'lignes' } = {}) {
  if (!entries.length) return '<p class="meta">Données indisponibles pour le moment.</p>';
  const palette = ['#FFE500', '#FFB020', '#FF7043', '#4FC3F7', '#81C784', '#BA68C8', '#F06292', '#90A4AE'];
  const total = Math.max(1, entries.reduce((a, e) => a + e.value, 0));
  const r = 72;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = entries
    .map((e, i) => {
      const dash = (c * e.value) / total;
      const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="26"
        stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += dash;
      return arc;
    })
    .join('');
  const legend = entries
    .map(
      (e, i) =>
        `<li><span class="dot" style="background:${palette[i % palette.length]}"></span>${esc(e.label)} — <strong>${nf(e.value)}</strong> ${esc(unit)}</li>`
    )
    .join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" class="donut-total">${nf(total)}</text></svg>
      <ul class="legend">${legend}</ul></div>`;
}

/* ================================================================== */
/* Contenus rédactionnels                                              */
/* ================================================================== */

const PUBLIC_PAGES = [
  { iconName: 'film', title: 'Accueil', role: 'la vitrine du campus', desc: "Positionnement du campus, tournages, partenaires, réseaux sociaux, visite virtuelle et certification Qualiopi.", tags: ['Point d’entrée'] },
  { iconName: 'book', title: 'Formation professionnelle de cascadeur', role: 'le cursus complet', desc: "Le programme de deux ans (720 à 800 heures) : disciplines enseignées, formules, rythme et parcours d'admission.", tags: ['Cursus 2 ans'] },
  { iconName: 'calendar', title: 'Stages de cascade & parkour', role: 'les sessions datées', desc: "Stages intensifs tous niveaux dès 16 ans : découverte de 12 jours, week-ends thématiques — chaque session affiche ses dates et son statut.", tags: ['Tous niveaux'] },
  { iconName: 'users', title: "L'équipe", role: 'les 12 coachs', desc: 'Chaque coach possède sa fiche : rôle au campus, biographie et filmographie vérifiée crédit par crédit sur IMDb.', tags: ['12 fiches'] },
  { iconName: 'film', title: 'Tournage — CUC Stunt Team', role: 'pour les productions', desc: 'Coordination de cascades et mise en relation avec un vivier de cascadeurs professionnels pour tournages et séries.', tags: ['Production'] },
  { iconName: 'star', title: 'Catalogue des films', role: 'le cœur cinéma', desc: 'Plus de 570 films référencés avec affiches : fiche détaillée au clic (équipe impliquée, rôle de chacun), même présentation sur tout le site.', tags: ['570 films'] },
  { iconName: 'users', title: 'Partenaires', role: 'qui nous accompagne', desc: 'Équipementiers, marques et institutions affichés et pilotés depuis le Cockpit.', tags: [] },
  { iconName: 'play', title: 'Vidéos & reportages', role: 'TF1, France 2, BFM TV', desc: 'Reportages télévisés et showreels du campus, avec lecture directe sur le site.', tags: [] },
  { iconName: 'map', title: 'Le campus', role: 'installations & accès', desc: "Visite guidée des installations réelles : tour de saut 21 m, dojos, fosse de chute, hébergement — et comment venir.", tags: [] },
  { iconName: 'cpu', title: 'Visite virtuelle', role: '360° et plan 3D', desc: 'Immersion 360° et plan 3D interactif du campus, chargé à la demande pour rester rapide.', tags: ['3D'] },
  { iconName: 'layers', title: 'CUC Events — agence événementielle', role: 'festivals & lancements', desc: "Shows d'action clé en main pour festivals, lancements de marque, parcs à thème et séminaires.", tags: [] },
  { iconName: 'star', title: 'Spectacles cascadeurs & Yamakasi', role: 'la scène', desc: 'Performances scéniques : voltige urbaine, combats chorégraphiés, pyrotechnie.', tags: [] },
  { iconName: 'refresh', title: 'Animations airbag & parkour', role: 'grand public', desc: 'Faire vivre au public la chute libre sur airbag de cinéma, en cadre encadré et sécurisé.', tags: [] },
  { iconName: 'users', title: 'Team building', role: 'entreprises', desc: "Séminaires d'entreprise : cohésion d'équipe par les cascades et les coulisses du cinéma.", tags: [] },
  { iconName: 'globe', title: 'Stunt Workshop international', role: 'en anglais & français', desc: 'Stage international de 2 semaines : participants du monde entier, encadrement professionnel du campus.', tags: ['International'] },
  { iconName: 'phone', title: 'Contact', role: 'formulaire & carte', desc: "Formulaire guidé (projet, formation, événement) et carte interactive d'accès au campus.", tags: [] },
];

const COCKPIT_APPS = [
  { iconName: 'layers', title: 'Tableau de bord', role: 'vue d’ensemble', desc: 'Synthèse des contenus, dernière activité et état général du site.', tags: [] },
  { iconName: 'edit', title: 'Pages & héros', role: 'édition directe', desc: "Chaque page se modifie sans code : titres, badges, textes, référencement — avec aperçu en direct et historique de versions (restauration en un clic).", tags: ['Révisions'] },
  { iconName: 'film', title: 'Films', role: 'catalogue', desc: 'Gérer les films : affiches, catégories, rôles de l’équipe, publication ou retrait.', tags: [] },
  { iconName: 'users', title: 'Équipe', role: 'coachs', desc: "Rôle, biographie, crédits, mise en avant, ordre d'affichage — et liaison vers le compte CUC Sign du coach.", tags: [] },
  { iconName: 'calendar', title: 'Sessions de formation', role: 'calendrier', desc: 'Dates, statut (ouvert, complet, dernières places), liaison vers la formation correspondante dans CUC Sign.', tags: [] },
  { iconName: 'users', title: 'Partenaires', role: 'logos & liens', desc: 'Ajouter, retirer ou réordonner les partenaires affichés sur le site.', tags: [] },
  { iconName: 'star', title: 'Événements', role: 'agence', desc: "Événements d'agence présentés sur les pages d'activité.", tags: [] },
  { iconName: 'book', title: 'Disciplines', role: 'référentiel', desc: 'Les 10 disciplines enseignées : niveaux, équipements, contexte cinéma.', tags: [] },
  { iconName: 'cpu', title: 'Campus 3D', role: 'studio du plan', desc: 'Placer et ajuster les bâtiments du plan 3D visible en visite virtuelle.', tags: ['3D'] },
  { iconName: 'database', title: 'Médias', role: 'bibliothèque', desc: 'Toutes les images et documents centralisés et servis par la base du projet.', tags: [] },
  { iconName: 'globe', title: 'Traductions', role: 'FR → EN', desc: 'Les traductions éditoriales (films, équipe, événements, disciplines, campus) consultables et éditables.', tags: [] },
  { iconName: 'bell', title: 'Annonces', role: 'bandeau d’alerte', desc: 'Message exceptionnel affiché en haut du site public (fermeture, information urgente).', tags: [] },
  { iconName: 'phone', title: 'Candidatures', role: 'boîte de réception', desc: 'Demandes reçues via le site : statut, notes internes, réponse — puis conversion en compte élève CUC Sign.', tags: ['Suivi'] },
  { iconName: 'sliders', title: 'Réglages & navigation', role: 'identité du site', desc: 'Coordonnées, boutons d’appel à l’action, réseaux sociaux, structure du menu et du pied de page.', tags: [] },
  { iconName: 'database', title: 'Traçabilité & sauvegarde', role: 'sécurité éditoriale', desc: 'Journal des actions (qui a modifié quoi) et export / restauration complète du contenu.', tags: [] },
];

const MECHANISMS = [
  { iconName: 'refresh', title: 'Synchronisation en temps réel', desc: "Une modification dans le Cockpit apparaît sur le site en moins d'une seconde, sans rechargement — sessions, films, équipe, partenaires, réglages, annonces.", tags: ['Temps réel'] },
  { iconName: 'globe', title: 'Bilingue français / anglais', desc: 'Chaque page existe dans les deux langues, avec des textes adaptés (pas de traduction automatique). La parité est vérifiée automatiquement à chaque contrôle.', tags: ['FR / EN'] },
  { iconName: 'film', title: 'Catalogue films unifié', desc: 'Affiches au format affiche de cinéma, fiche détaillée au clic avec les rôles du CUC — la même présentation partout, de l’accueil à la fiche coach.', tags: ['570 films'] },
  { iconName: 'database', title: 'Médias centralisés & optimisés', desc: "Images et documents servis par la base du projet (aucune dépendance à l'ancien site), convertis automatiquement en formats légers.", tags: ['Optimisé'] },
  { iconName: 'shield', title: 'Interconnexion CUC Sign', desc: "Sessions de formation, coachs et lieux du site reflètent la plateforme de gestion de l'école — en lecture seule : le site ne peut jamais altérer les données pédagogiques.", tags: ['CUC Sign'] },
  { iconName: 'users', title: 'Sécurité & rôles', desc: 'Accès administrateur nominatif, permissions par rôle (direction, secrétariat, coachs) et sécurité par ligne en base de données.', tags: ['Rôles'] },
  { iconName: 'search', title: 'Recherche instantanée (Cockpit)', desc: 'Palette de commandes au clavier (Ctrl/⌘ + K) : accès direct à n’importe quel écran ou contenu en quelques lettres.', tags: ['Productivité'] },
  { iconName: 'phone', title: 'Du formulaire à l’élève', desc: 'Une demande envoyée depuis le site arrive dans le Cockpit : l’équipe la qualifie, l’annote et peut la convertir en compte CUC Sign.', tags: ['Parcours'] },
];

const JOURNEY = [
  { title: 'Découvrir', text: "Accueil, formation, campus : comprendre l'offre en 30 secondes." },
  { title: 'Explorer', text: 'Équipe, filmographie, reportages : la preuve par les faits.' },
  { title: 'Se projeter', text: 'Stages, sessions datées, statut des places : passer à l’acte.' },
  { title: 'Écrire', text: 'Formulaire guidé, contextuel selon la page d’origine.' },
  { title: 'Être suivi', text: 'La demande vit dans le Cockpit jusqu’à la réponse.' },
];

const WORKFLOWS = [
  { iconName: 'edit', title: 'Modifier un texte du site', desc: 'Cockpit → Pages & héros → choisir la page → modifier → Aperçu → Enregistrer.', tags: [] },
  { iconName: 'calendar', title: 'Ajouter une session de stage', desc: 'Cockpit → Sessions → créer (dates, statut) → relier la formation CUC Sign correspondante.', tags: [] },
  { iconName: 'film', title: 'Mettre un film en avant', desc: 'Cockpit → Films (ou fiche coach) → étoiler le crédit → il monte en tête de la filmographie.', tags: [] },
  { iconName: 'bell', title: 'Publier une information urgente', desc: 'Cockpit → Annonces → activer le message : le bandeau s’affiche en haut de tout le site.', tags: [] },
  { iconName: 'globe', title: 'Compléter une traduction anglaise', desc: 'Cockpit → Traductions → entité concernée → compléter → enregistrer.', tags: [] },
  { iconName: 'shield', title: 'Revenir en arrière sur une erreur', desc: 'Cockpit → Pages & héros → Historique des versions → restaurer la version précédente.', tags: [] },
];

const FAQ = [
  { q: 'Le site est-il vraiment disponible en anglais ?', a: "Oui : les 15 pages existent en français et en anglais, avec des textes rédigés (et non traduits automatiquement). La galerie de films, les fiches coachs, les événements, les disciplines et le campus disposent de traductions éditoriales stockées en base." },
  { q: 'Faut-il des compétences techniques pour mettre le site à jour ?', a: "Non. Tout se pilote depuis le Cockpit d'administration, avec un aperçu avant publication. Aucune ligne de code n'est nécessaire." },
  { q: 'Que se passe-t-il si une modification est une erreur ?', a: "Rien n'est définitif : chaque page conserve un historique de versions, restaurable en un clic. Le journal d'audit garde aussi trace des actions réalisées." },
  { q: 'Le site peut-il modifier l’application CUC Sign ?', a: "Jamais. La liaison est en lecture seule : le site affiche les formations, coachs et lieux de CUC Sign, mais n'y écrit aucune donnée. Les données pédagogiques sont protégées par des règles strictes côté base." },
  { q: 'Comment les demandes (candidatures, projets) arrivent-elles ?', a: "Le visiteur remplit un formulaire guidé sur le site. La demande apparaît dans le Cockpit (écran Candidatures) avec un statut, des notes internes, et peut être convertie en compte élève CUC Sign." },
  { q: 'Où sont hébergées les images et vidéos du site ?', a: "Dans la base du projet, pas sur l'ancien site : une bibliothèque centralisée (écran Médias) sert automatiquement des formats optimisés pour le web." },
  { q: 'Le site est-il optimisé pour être trouvé sur Google ?', a: "Oui : chaque page possède son propre titre, sa description et son image de partage, un plan du site est publié automatiquement, et les fiches (films, coachs) utilisent des données structurées que les moteurs de recherche lisent nativement." },
  { q: 'Que se passe-t-il sur un téléphone ?', a: "Tout le site est conçu d'abord pour le mobile : les jaquettes de films passent en grille compacte, les menus se replient, un bouton d'appel direct apparaît en bas d'écran. Le plan 3D et la visite 360° fonctionnent aussi au doigt." },
  { q: 'Les chiffres de ce dossier sont-ils figés ?', a: "Non : ce dossier est régénéré à la demande, directement depuis la base de données. Chaque nouvelle version reflète l'état réel du site au jour de sa génération." },
  { q: 'Et si je veux un état des lieux technique complet ?', a: "Un rapport technique détaillé existe en parallèle de ce dossier : structure du code, performances, sécurité, référencement, qualité des liens et des traductions. Il est mis à jour avec la même méthode." },
  { q: "Combien coûte l'exploitation du site, chaque mois ?", a: "Deux abonnements seulement : l'hébergement du site et la base de données avec ses médias. Le site n'utilise aucune fonctionnalité payante de Vercel : les pages sont préparées à l'avance, les images sont allégées automatiquement et aucun traitement planifié n'est nécessaire. L'offre gratuite de Vercel suffit donc techniquement ; son règlement la réserve à un usage non commercial, point à confirmer pour une structure qui facture des formations. La base de données, elle, exige une offre payante : les sauvegardes quotidiennes automatiques et la marge d'espace sont indispensables à un catalogue de cette taille. Le détail est au chapitre 9." },
  { q: 'Le site tiendra-t-il si un reportage provoque un pic de visites ?', a: "Oui, et pour une raison simple : les pages du site sont générées à l'avance et servies depuis un cache réparti mondialement, elles ne sont pas recalculées à chaque visite. Un pic de lecture n'atteint donc pas la base de données, qui n'est sollicitée que par le Cockpit. Le suivi de fréquentation et les mesures de vitesse de chargement sont en place pour le vérifier sur des chiffres réels." },
];

const PRACTICES = [
  { iconName: 'check', title: 'Relisez l’aperçu avant d’enregistrer', desc: "Le Cockpit affiche un aperçu fidèle de la page : dix secondes de relecture évitent 90 % des coquilles." },
  { iconName: 'globe', title: 'Complétez l’anglais au fil de l’eau', desc: 'Traduire une fiche au moment où on la crée coûte moins cher que de rattraper un retard. La parité est mesurée par un contrôle automatique.' },
  { iconName: 'calendar', title: 'Tenez à jour les statuts de sessions', desc: '« Ouvert », « dernières places », « complet » : ces trois mots sont la première information que cherche un candidat.' },
  { iconName: 'bell', title: 'Réservez les annonces à l’exceptionnel', desc: 'Le bandeau d’alerte doit rester rare pour garder sa force — activer, puis désactiver dès que l’information est passée.' },
  { iconName: 'film', title: 'Étoilez les tournages marquants', desc: 'La mise en avant des crédits remonte les productions phares en tête des filmographies, sur la page équipe et les fiches coachs.' },
  { iconName: 'shield', title: 'En cas de doute : l’historique', desc: 'Chaque page garde ses versions. Restaurer une version précédente est plus rapide que de reconstruire un contenu.' },
];

const ROLES = [
  { iconName: 'sliders', title: 'Direction', desc: 'Accès complet : toutes les pages, tous les contenus, les réglages du site, la gestion des accès et les sauvegardes.' },
  { iconName: 'phone', title: 'Secrétariat', desc: 'Suivi des candidatures et du calendrier des sessions, mise à jour des pages courantes, consultation des traductions.' },
  { iconName: 'users', title: 'Encadrement & coachs', desc: 'Consultation de l’espace d’administration ; chaque accès est nominatif et limité à ce qui est utile au rôle.' },
];

const SITE_MAP = [
  { theme: 'Découvrir', pages: ['Accueil', 'Le campus', 'Visite virtuelle'], iconName: 'film' },
  { theme: 'Se former', pages: ['Formation professionnelle', 'Stages de cascade & parkour', 'Stunt Workshop international'], iconName: 'book' },
  { theme: 'Activités d’action', pages: ['CUC Events', 'Spectacles Yamakasi', 'Animations airbag', 'Team building'], iconName: 'layers' },
  { theme: 'L’équipe & les films', pages: ['L’équipe (12 fiches)', 'Tournage — CUC Stunt Team', 'Catalogue des films'], iconName: 'star' },
  { theme: 'Confiance & contact', pages: ['Partenaires', 'Vidéos & reportages', 'Contact'], iconName: 'phone' },
];

const GLOSSARY = [
  { iconName: 'layout', title: 'Site vitrine', desc: "La partie publique de l'application : les 15 pages consultées par vos visiteurs, en français et en anglais." },
  { iconName: 'sliders', title: 'Cockpit', desc: "L'espace d'administration protégé, où votre équipe gère l'ensemble du contenu — sans passer par un développeur." },
  { iconName: 'database', title: 'Base de données (Supabase)', desc: 'Le coffre central du projet : textes, images, films, dates, traductions. Le site et le Cockpit y lisent et écrivent selon leurs droits respectifs.' },
  { iconName: 'refresh', title: 'Temps réel', desc: 'Mécanisme qui pousse automatiquement un changement enregistré dans le Cockpit vers le navigateur du visiteur — sans rechargement de page.' },
  { iconName: 'edit', title: 'Révisions (historique)', desc: "Versions successives d'une page, conservées automatiquement. Restaurer une version antérieure prend un clic." },
  { iconName: 'shield', title: 'CUC Sign', desc: 'La plateforme pédagogique des élèves. Le site y lit les formations, coachs et lieux du campus — en lecture seule, jamais en écriture.' },
  { iconName: 'users', title: 'Rôles & permissions', desc: "Chaque compte du Cockpit possède un rôle (direction, secrétariat, encadrement) qui définit précisément ce qu'il peut consulter et modifier." },
  { iconName: 'check', title: 'Qualiopi', desc: "Certification qualité des organismes de formation, délivrée en France — citée sur votre site public au titre de la formation professionnelle." },
];

/* ================================================================== */
/* Chiffres « contenus » (vulgarisés)                                  */
/* ================================================================== */

const TABLE_LABELS = {
  site_films: 'Films au catalogue',
  site_translations: 'Traductions éditoriales',
  site_team: 'Coachs & direction',
  site_partners: 'Partenaires',
  site_sessions: 'Sessions de formation',
  site_pages: 'Pages du site',
  site_settings: 'Réglages du site',
  site_disciplines: 'Disciplines',
  site_campus_pois: 'Zones du campus',
  site_social_links: 'Réseaux sociaux',
  site_events: 'Événements',
  site_announcements: 'Annonces',
  site_programs: 'Programmes de formation',
  site_inquiries: 'Demandes reçues',
  site_audit_logs: 'Journal d’actions',
  site_navigation: 'Menu de navigation',
  site_footer: 'Pied de page',
};

const contentRows = Object.entries(t)
  .filter(([, v]) => typeof v === 'number' && v > 0)
  .map(([k, v]) => ({ label: TABLE_LABELS[k] ?? k, value: v }))
  .sort((a, b) => b.value - a.value);

const CATEGORY_LABELS = { Film: 'Films', film: 'Films', Serie: 'Séries', Série: 'Séries', serie: 'Séries', 'Court métrage': 'Courts métrages' };
const filmsByCategory = (metrics?.database?.filmsByCategory ?? dbState?.filmsByCategory ?? []).map((r) => ({
  label: CATEGORY_LABELS[r.category] ?? r.category ?? 'Non classé',
  value: r.n,
}));

const SESSION_LABELS = { ouvert: 'Ouvertes aux inscriptions', complet: 'Complètes', 'dernières places': 'Dernières places', bientôt: 'Annoncées prochainement' };
const sessionsByStatus = (metrics?.database?.sessionsByStatus ?? dbState?.sessionsByStatus ?? []).map((r) => ({
  label: SESSION_LABELS[r.status] ?? r.status,
  value: r.n,
}));

const ENTITY_LABELS = { film: 'Films', team: 'Coachs', event: 'Événements', discipline: 'Disciplines', campus_poi: 'Zones du campus', campus_facility: 'Installations', page: 'Pages', partner: 'Partenaires', video: 'Vidéos', celebrity: 'Comédiens doublés' };
const translationsByEntity = (metrics?.database?.translationsByEntity ?? dbState?.translationsByEntity ?? [])
  .slice(0, 10)
  .map((r) => ({ label: ENTITY_LABELS[r.entity] ?? r.entity ?? 'Autre', value: r.n }));

const PARTNER_LABELS = {
  cinema: 'Cinéma & production',
  materiel: 'Matériel & équipements',
  institutionnel: 'Institutions & financeurs',
  media: 'Médias & presse',
};
const partnersRows = live.partnersByCategory.map((r) => ({
  label: PARTNER_LABELS[r.category] ?? r.category ?? 'Autres',
  value: r.n,
}));

const cucSign = metrics?.database?.cucSign ?? dbState?.cucSign;
const rlsOn = metrics?.database?.rlsOn ?? dbState?.rlsOn ?? 0;
const realtimeTables = metrics?.database?.realtimeTables ?? dbState?.realtimePublication?.length ?? 0;
const pageWeights = metrics?.routes?.pageWeights ?? null;
const bundleBytes = metrics?.bundle?.staticChunks ?? null;
/**
 * Le rapport de métriques range les tests sous `code.tests` ; la lecture racine
 * seule renvoyait `null` en silence, et le dossier se rabattait sur un texte
 * générique « des contrôles vérifient… » au lieu du nombre réellement mesuré.
 * Défaut corrigé le 2026-09-24.
 */
const tests = metrics?.tests ?? metrics?.code?.tests ?? null;
const securityHeaders = metrics?.security?.headers ?? [];
const i18n = metrics?.i18n ?? null;

/* ------------------------------------------------------------------ */
/* Hébergement & exploitation : uniquement des usages mesurés          */
/* ------------------------------------------------------------------ */

/** Somme des tailles de tables relevées dans le rapport de métriques. */
const dbTableRows = Array.isArray(metrics?.database?.tables) ? metrics.database.tables : [];
const dbAppBytes = dbTableRows.reduce((a, r) => a + (Number(r.bytes) || 0), 0);
const dbAppRows = dbTableRows.reduce((a, r) => a + (Number(r.rows) || 0), 0);

/**
 * Médias : mesure en direct si disponible, sinon repli sur le dernier
 * rapport de métriques. Les plafonds cités sont nos propres garde-fous
 * (`npm run audit:quotas`), pas des limites commerciales supposées.
 */
const mediaTotals = storageBytes
  ? { bytes: storageBytes, files: storageFiles }
  : {
    bytes: (metrics?.database?.storage ?? []).reduce((a, s) => a + (Number(s.bytes) || 0), 0),
    files: (metrics?.database?.storage ?? []).reduce((a, s) => a + (Number(s.files) || 0), 0),
  };

const decadeRows = live.filmsByDecade.map((r) => ({ label: `${r.decade}s`, value: r.n }));

/* ------------------------------------------------------------------ */
/* Sessions live — telles qu'affichées sur le site                     */
/* ------------------------------------------------------------------ */

const PRETTY_PROGRAM = (id) =>
  String(id ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const programLabel = (id) => live.programNames[id] ?? PRETTY_PROGRAM(id) ?? 'Session';

const STATUS_STYLE = {
  'ouvert': ['Ouvertes aux inscriptions', 's-ok'],
  'dernières places': ['Dernières places', 's-last'],
  'complet': ['Complet', 's-full'],
  'bientôt': ['Annoncées prochainement', 's-soon'],
};

const sessionsHtml = live.sessions.length
  ? live.sessions
    .map((s) => {
      const [label, cls] = STATUS_STYLE[s.status] ?? [s.status ?? 'Statut à préciser', 's-soon'];
      return `<li class="sess reveal">
        <span class="sess-status ${cls}">${esc(label)}</span>
        <span class="sess-title">${esc(programLabel(s.program_id))}</span>
        <span class="sess-date">${esc(s.date_display ?? '')}</span>
      </li>`;
    })
    .join('')
  : '<li class="sess reveal"><span class="sess-title">Aucune session datée publiée pour le moment.</span></li>';

/* ------------------------------------------------------------------ */
/* Qualité éditoriale (complétude réelle du catalogue)                 */
/* ------------------------------------------------------------------ */

const q = live.quality;
const qualityKpis = q
  ? [
    kpiHtml(`${pct(q.films.with_image, q.films.total)} %`, 'films avec affiche', `${nf(q.films.with_image)} sur ${nf(q.films.total)}`),
    kpiHtml(q.films.both, 'films avec affiche ET description', 'fiche complète, prête à lire'),
    kpiHtml(q.filmsEn, 'films traduits en anglais', 'fiches bilingues en base'),
    kpiHtml(q.team.with_imdb, 'coachs avec fiche IMDb', `sur ${nf(q.team.total)} coachs et direction`),
    kpiHtml(q.team.with_bio, 'coachs avec biographie', 'textes rédigés, pas de gabarit'),
    kpiHtml(q.team.with_avatar, 'coachs avec portrait', 'photos officielles du campus'),
  ].join('')
  : '';

const completenessDonut = q
  ? donut(
    [
      { label: 'Fiche complète (affiche + description)', value: q.films.both },
      { label: 'Affiche sans description', value: Math.max(0, q.films.with_image - q.films.both) },
      { label: 'À compléter', value: Math.max(0, q.films.total - q.films.with_image) },
    ],
    { unit: 'films' }
  )
  : '<p class="meta">Données indisponibles.</p>';

/* ------------------------------------------------------------------ */
/* Repères sobres — les graphiques à barres ont été retirés le         */
/* 2026-09-24 : ils décoraient plus qu'ils n'informaient. Un tableau   */
/* et quelques chiffres choisis disent la même chose, en mieux.        */
/* ------------------------------------------------------------------ */

/** Volumes publiés, en tableau : lisible, imprimable, sans décoration. */
const contentTable = contentRows.length
  ? `<table>
      <thead><tr><th>Contenu</th><th>Publié</th></tr></thead>
      <tbody>${contentRows
    .slice(0, 12)
    .map((r) => `<tr><td>${esc(r.label)}</td><td><strong>${nf(r.value)}</strong></td></tr>`)
    .join('')}</tbody>
    </table>`
  : '<p class="meta">Données indisponibles pour le moment.</p>';

const sumValues = (rows) => rows.reduce((a, r) => a + (Number(r.value) || 0), 0);

/**
 * Repères du catalogue, choisis pour ce qu'ils racontent vraiment.
 *
 * Le classement « coach le plus présent » a été retiré : le décompte brut issu
 * de `cuc_team_involved` ne reflète pas la filmographie vérifiée crédit par
 * crédit (un intervenant peut apparaître des dizaines de fois sans être le plus
 * présent au regard des crédits validés). Une valeur non fiable n'a pas sa place
 * dans un dossier client — décision du 2026-09-24.
 */
const catalogTraits = [
  decadeRows.length
    ? kpiHtml(
      decadeRows.length,
      'décennies couvertes par les films',
      `de ${decadeRows[0].label} à ${decadeRows[decadeRows.length - 1].label}`
    )
    : '',
  filmsByCategory.length
    ? kpiHtml(filmsByCategory[0].label, 'catégorie la plus fournie', `${nf(filmsByCategory[0].value)} films publiés`)
    : '',
  translationsByEntity.length
    ? kpiHtml(sumValues(translationsByEntity), 'traductions éditoriales en base', 'film, équipe, événements, disciplines, campus')
    : '',
  partnersRows.length ? kpiHtml(sumValues(partnersRows), 'partenaires affichés', 'équipementiers, marques, institutions') : '',
  sessionsByStatus.length ? kpiHtml(sumValues(sessionsByStatus), 'sessions publiées', 'datées et suivies par statut') : '',
].filter(Boolean);

const catalogTraitsHtml = catalogTraits.join('');

/** Poids des pages : trois chiffres suffisent, la liste complète n'apprend rien de plus. */
const pageWeightSummary = (() => {
  const served = (pageWeights ?? []).filter((p) => p.status === 200).sort((a, b) => b.bytes - a.bytes);
  if (!served.length) return '';
  const heaviest = served[0];
  const lightest = served[served.length - 1];
  const medianMs = [...served].map((p) => p.ms).sort((a, b) => a - b)[Math.floor(served.length / 2)];
  return [
    kpiHtml(kb(heaviest.bytes), 'page la plus lourde', `${heaviest.route} · ${heaviest.ms} ms`),
    kpiHtml(`${medianMs} ms`, 'temps de réponse médian', `sur ${nf(served.length)} pages mesurées`),
    kpiHtml(kb(lightest.bytes), 'page la plus légère', `${lightest.route} · ${lightest.ms} ms`),
  ].join('');
})();

/**
 * Accroche CUC Sign affichée dans le dossier de l'application : trois cartes,
 * puis un renvoi vers la page dédiée [`scripts/lib/cuc-sign-dossier.mjs`], qui
 * porte tout le détail (espaces, signalements, passerelle, avenir).
 */
const cucSignTeaserCards = [
  {
    iconName: 'users',
    title: 'Les élèves',
    desc: 'Ils s’émargent, consultent leur planning, suivent leur progression, signalent une blessure ou un matériel défectueux depuis leur téléphone, et repartent avec un profil de casting.',
    tags: ['Élèves'],
  },
  {
    iconName: 'phone',
    title: 'Les coachs',
    desc: 'Ils notent depuis le téléphone, composent les groupes, assurent les remplacements, et voient avant le cours qui revient de blessure — ou qui a signalé un problème.',
    tags: ['Coachs'],
  },
  {
    iconName: 'gauge',
    title: 'La direction & le secrétariat',
    desc: 'Planning, présences, signalements, comptes et rôles, preuves réclamées par les financeurs : tout se pilote depuis un seul écran.',
    tags: ['Direction'],
  },
].map(featCard);

/* Les cartes « avenir », la passerelle et le parcours élève vivent désormais
   dans `scripts/lib/cuc-sign-dossier.mjs` : une seule source pour la page CUC Sign. */

/* ================================================================== */
/* Schémas SVG                                                         */
/* ================================================================== */

const svgTile = (x, y, w, h, label, sub) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#101017" stroke="#2a2a33"/>
  <text x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700">${esc(label)}</text>
  <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" fill="#9a9aa5" font-size="11.5">${esc(sub)}</text>`;

const ecosystemSvg = `
<svg viewBox="0 0 940 360" class="chart" role="img" aria-label="Schéma : visiteur, site vitrine, Supabase, Cockpit d'administration et plateforme CUC Sign">
  <path d="M150 167 C 180 167, 186 120, 208 108" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M540 165 C 492 165, 484 112, 434 102" fill="none" stroke="#2a2a33" stroke-width="2.6"/>
  <path class="flowline" style="stroke:#7bd88f" d="M540 165 C 492 165, 484 112, 434 102"/>
  <path d="M430 272 C 480 272, 500 250, 556 240" fill="none" stroke="#2a2a33" stroke-width="2.6"/>
  <path class="flowline" style="stroke:#FFE500" d="M430 272 C 480 272, 500 250, 556 240"/>
  <path d="M730 170 H 798" fill="none" stroke="#2a2a33" stroke-width="2.6"/>
  <path class="flowline" style="stroke:#4FC3F7" d="M730 170 H 798"/>
  <path d="M798 210 H 732" fill="none" stroke="#2a2a33" stroke-width="2.6"/>
  <path class="flowline" style="stroke:#4FC3F7; opacity:.55" d="M798 210 H 732"/>
  ${svgTile(30, 125, 120, 84, 'Visiteur', 'web & mobile')}
  ${svgTile(210, 40, 224, 84, 'Site vitrine', '15 pages • FR / EN')}
  ${svgTile(210, 230, 224, 84, 'Cockpit admin', '15 écrans • rôles')}
  ${svgTile(540, 135, 190, 100, 'Supabase', 'base + temps réel')}
  ${svgTile(800, 135, 120, 100, 'CUC Sign', 'gestion de l’école')}
  <circle class="halo" cx="635" cy="185" r="72" fill="none" stroke="#FFE500" stroke-width="1.4" opacity="0.25"/>
  <text x="500" y="300" text-anchor="middle" fill="#7c7c88" font-size="11">Le Cockpit écrit dans la base ; le site la lit — rien ne transite par la machine du visiteur.</text>
</svg>`;

/** Anatomie d'une page : ce qui est modifiable (pastilles jaunes). */
const pageAnatomySvg = `
<svg viewBox="0 0 900 420" class="chart" role="img" aria-label="Anatomie d'une page : en-tête, héros, contenu, pied de page">
  <rect x="60" y="18" width="780" height="384" rx="16" fill="#0b0b10" stroke="#2a2a33"/>
  <rect x="60" y="18" width="780" height="46" rx="16" fill="#101017"/>
  <rect x="60" y="50" width="780" height="14" fill="#101017"/>
  <text x="88" y="47" fill="#fff" font-size="13" font-weight="700">Menu du site</text>
  <text x="330" y="47" fill="#7c7c88" font-size="11">navigation générée depuis le Cockpit</text>
  <rect x="88" y="88" width="724" height="104" rx="10" fill="#12121a" stroke="#26262e"/>
  <text x="108" y="118" fill="#FFE500" font-size="11" font-weight="700">BADGE</text>
  <text x="108" y="146" fill="#fff" font-size="17" font-weight="700">Titre principal de la page</text>
  <text x="108" y="170" fill="#9a9aa5" font-size="11.5">Sous-titre explicatif — textes pilotés depuis le Cockpit (FR & EN)</text>
  <rect x="640" y="126" width="150" height="34" rx="17" fill="#FFE500"/>
  <text x="715" y="148" text-anchor="middle" fill="#111" font-size="12" font-weight="700">Bouton d’action</text>
  <rect x="88" y="206" width="352" height="146" rx="10" fill="#12121a" stroke="#26262e"/>
  <text x="108" y="234" fill="#fff" font-size="13.5" font-weight="700">Contenu éditorial</text>
  <text x="108" y="256" fill="#9a9aa5" font-size="11.5">sections, chiffres clés, galeries</text>
  <rect x="460" y="206" width="352" height="146" rx="10" fill="#12121a" stroke="#26262e"/>
  <text x="480" y="234" fill="#fff" font-size="13.5" font-weight="700">Contenus dynamiques</text>
  <text x="480" y="256" fill="#9a9aa5" font-size="11.5">films, coachs, sessions, partenaires…</text>
  <rect x="60" y="366" width="780" height="36" rx="0" fill="#101017"/>
  <text x="88" y="389" fill="#9a9aa5" font-size="11.5">Pied de page — coordonnées et réseaux sociaux (pilotés depuis le Cockpit)</text>
  <circle cx="86" cy="110" r="6" fill="#FFE500"/><circle cx="86" cy="228" r="6" fill="#FFE500"/>
  <circle cx="86" cy="352" r="6" fill="#FFE500"/><circle cx="86" cy="389" r="6" fill="#FFE500"/>
  <text x="120" y="352" fill="#ffef9e" font-size="11">● pastilles jaunes : contenus modifiables par votre équipe, sans code</text>
</svg>`;

/** Le cycle d'une demande : carte-enveloppe voyageuse + étapes qui s'allument. */
const CYCLE_STEPS = [
  { x: 120, n: '1', t: 'Le visiteur écrit', s: 'formulaire guidé' },
  { x: 295, n: '2', t: 'La demande arrive', s: 'Cockpit · Candidatures' },
  { x: 470, n: '3', t: 'Votre équipe qualifie', s: 'statut + notes internes' },
  { x: 645, n: '4', t: 'Vous répondez', s: 'email / téléphone' },
  { x: 820, n: '5', t: 'Conversion possible', s: 'compte élève CUC Sign' },
];
const CYCLE_DELAYS = ['0.3s', '2.6s', '4.9s', '7.2s', '9.5s'];

const requestCycleSvg = `
<svg viewBox="0 0 940 170" class="chart" role="img" aria-label="Cycle d'une demande : formulaire, réception, qualification, échange, conversion">
  <path d="M120 62 H 820" stroke="#2a2a33" stroke-width="2" stroke-dasharray="6 7"/>
  <path class="rc-fill" d="M120 62 H 820"/>
  ${CYCLE_STEPS.map(
  (p, i) => `
    <circle class="rc-ping" cx="${p.x}" cy="62" r="24" style="animation-delay:${CYCLE_DELAYS[i]}"/>
    <circle class="rc-node" cx="${p.x}" cy="62" r="24" fill="#12121a" stroke="#3a3a44" stroke-width="2" style="animation-delay:${CYCLE_DELAYS[i]}"/>
    <text x="${p.x}" y="68" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">${p.n}</text>
    <text x="${p.x}" y="112" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="600">${p.t}</text>
    <text x="${p.x}" y="130" text-anchor="middle" fill="#9a9aa5" font-size="11">${p.s}</text>`
)
    .join('')}
  <g class="flowmsg" style="offset-path: path('M120 62 H 820')">
    <rect x="-17" y="-13" width="34" height="26" rx="7" fill="#FFE500"/>
    <path d="M-11 -5 L0 3 L11 -5" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

/* Le parcours élève (`studentJourneySvg`) est rendu dans la page CUC Sign. */

/* ================================================================== */
/* Assemblages HTML                                                    */
/* ================================================================== */

const FIGURE_DATA = [
  [t['site_pages'] ?? 15, 'pages publiques', 'chacune en français et en anglais'],
  [t['site_films'] ?? 570, 'films au catalogue', 'affiches et fiches détaillées'],
  [t['site_team'] ?? 12, 'coachs', 'filmographies vérifiées'],
  [t['site_translations'], 'traductions', 'contenus bilingues en base'],
  [t['site_sessions'], 'sessions de formation', 'dates et statuts en direct'],
  [t['site_disciplines'] ?? 10, 'disciplines enseignées', 'référentiel complet'],
  [t['site_partners'], 'partenaires', 'marques & institutions'],
  [storageFiles || null, 'images & documents', 'centralisés et optimisés'],
];

const figuresHtml = FIGURE_DATA.map(([v, l, s]) => (v != null ? kpiHtml(v, l, s) : '')).join('');

/* Marquee de chiffres (bandeau défilant sous le héros). */
const stripItems = [
  `${nf(t['site_films'] ?? 570)} films au catalogue`,
  `${nf(t['site_team'] ?? 12)} coachs & direction`,
  `${nf(t['site_pages'] ?? 15)} pages · FR / EN`,
  t['site_translations'] ? `${nf(t['site_translations'])} traductions éditoriales` : null,
  realtimeTables ? `${nf(realtimeTables)} tables synchronisées en temps réel` : null,
  storageFiles ? `${nf(storageFiles)} images & documents hébergés` : null,
  t['site_sessions'] ? `${nf(t['site_sessions'])} sessions de formation` : null,
].filter(Boolean);
const stripHtml = [...stripItems, ...stripItems]
  .map((x) => `<span>${esc(x)}</span><span class="sep">◆</span>`)
  .join('');

/* Les indicateurs du pont CUC Sign sont rendus dans la page dédiée. */

const guaranteesHtml = [
  { iconName: 'shield', title: 'Sécurité par ligne', desc: `${rlsOn} espaces de données protégés par des règles d'accès par rôle : chaque utilisateur du Cockpit ne peut agir que dans son périmètre.`, tags: ['Données'] },
  { iconName: 'gauge', title: 'En-têtes de sécurité', desc: `Protections navigateur actives (${securityHeaders.length} en-têtes : anti-détournement, contenu sécurisé, connexions chiffrées).`, tags: ['Web'] },
  {
    iconName: 'refresh', title: 'Contrôles automatiques', desc: tests?.available
      ? `${nf(tests.passed)} vérifications automatiques passent à chaque mise à jour — avant toute publication.`
      : 'Des contrôles automatiques vérifient liens, traductions et contenus avant chaque mise à jour.',
    tags: ['Qualité']
  },
  { iconName: 'database', title: 'Sauvegarde du contenu', desc: 'Export complet du contenu depuis le Cockpit, et historique de versions sur chaque page : rien ne peut être perdu.', tags: ['Continuité'] },
]
  .map(featCard)
  .join('');

const rolesHtml = ROLES.map(featCard).join('');
const practicesHtml = PRACTICES.map(featCard).join('');
const siteMapHtml = SITE_MAP.map(
  (g) => `
  <article class="map-card reveal">
    ${icon(g.iconName)}
    <h4>${esc(g.theme)}</h4>
    <ul>${g.pages.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
  </article>`
).join('');

const TECH = [
  { name: 'Next.js 16', role: 'moteur du site : affichage ultra-rapide, pages optimisées pour Google' },
  { name: 'React 19', role: "bibliothèque d'interface utilisée par le site et le Cockpit" },
  { name: 'Supabase', role: 'base de données, stockage des médias et synchronisation temps réel' },
  { name: 'Tailwind CSS 4', role: 'système de design garantissant la cohérence visuelle' },
  { name: 'Three.js', role: 'moteur 3D du plan interactif du campus (chargé uniquement quand utile)' },
  { name: 'Framer Motion', role: 'animations fluides et sobres du site public' },
];

const techTable = `
  <table>
    <thead><tr><th>Technologie</th><th>Son rôle dans votre application</th></tr></thead>
    <tbody>${TECH.map((x) => `<tr><td><code>${esc(x.name)}</code></td><td>${esc(x.role)}</td></tr>`).join('')}</tbody>
  </table>`;

const hostingKpis = [
  dbAppBytes
    ? kpiHtml(mo(dbAppBytes), 'base de données', `${nf(dbAppRows)} enregistrements mesurés`)
    : '',
  mediaTotals.bytes
    ? kpiHtml(mo(mediaTotals.bytes), 'médias hébergés', `${nf(mediaTotals.files)} fichiers allégés pour le web`)
    : '',
  kpiHtml('0 €', 'hébergement du site', 'offre gratuite (Hobby)'),
]
  .filter(Boolean)
  .join('');

const hostingBlock = `
    <h3>Où vit votre site, et ce que cela coûte <span class="meta">(usages mesurés à la génération de ce dossier)</span></h3>
    <p>
      Deux services, deux rôles. <strong>Vercel</strong> héberge le site et le diffuse depuis un réseau de serveurs répartis dans le monde ;
      <strong>Supabase</strong> héberge la base de données, les médias et la synchronisation des modifications faites dans le Cockpit.
    </p>
    <div class="kpis">${hostingKpis}</div>
    <table>
      <thead><tr><th>Poste</th><th>Ce que cela couvre</th><th>Coût mensuel</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>Hébergement du site</strong><br/><span class="meta">Vercel</span></td>
          <td>
            Diffusion des pages depuis le cache : elles sont préparées à l'avance, allégées pour les téléphones et servies sans recalcul.
            Aucune fonctionnalité payante n'est utilisée par le projet : ni tâche planifiée, ni fonction de longue durée, ni environnement réservé.
          </td>
          <td><strong>Offre gratuite (Hobby)</strong></td>
        </tr>
        <tr>
          <td><strong>Base de données et médias</strong><br/><span class="meta">Supabase</span></td>
          <td>
            Contenus, filmographies, traductions, affiches et documents. Les sauvegardes automatiques quotidiennes et la marge d'espace
            sont indispensables à un catalogue de ${nf(t['site_films'] ?? 570)} films et de ${nf(mediaTotals.files)} fichiers.
          </td>
          <td><strong>≈ 25 $ / mois (offre Pro)</strong></td>
        </tr>
      </tbody>
    </table>
    <p class="meta">
      Deux règles accompagnent ce choix. D'abord, le règlement de l'offre gratuite de Vercel la réserve à un usage non commercial :
      pour une structure qui facture des formations, ce point doit être confirmé auprès de Vercel ; s'il n'est pas accordé, l'offre professionnelle
      représente environ 20 $ par mois. Ensuite, un contrôle automatique (<code>npm run audit:quotas</code>) vérifie à chaque publication que la base
      reste sous 200 Mo et les médias sous 150 Mo, afin qu'aucune dérive de stockage ne passe inaperçue.
    </p>`;

/**
 * Résistance du site : uniquement des contrôles réellement exécutés, avec leur
 * résultat. Aucun score composite, aucune note inventée.
 */
const routesTotal = metrics?.routes?.total ?? null;
const resilienceRows = [
  tests?.available
    ? {
      label: 'Vérifications automatiques réussies',
      value: tests.passed,
      display: `${nf(tests.passed)} sur ${nf(tests.total)}`,
    }
    : null,
  routesTotal
    ? { label: 'Routes publiques et Cockpit vérifiées', value: routesTotal, display: nf(routesTotal) }
    : null,
  rlsOn ? { label: 'Espaces de données sous règles d’accès', value: rlsOn, display: nf(rlsOn) } : null,
  securityHeaders.length
    ? { label: 'En-têtes de sécurité actifs', value: securityHeaders.length, display: nf(securityHeaders.length) }
    : null,
].filter(Boolean);

const resilienceBlock = resilienceRows.length
  ? `
    <h3>La résistance du site, chiffrée <span class="meta">(contrôles exécutés avant chaque mise en ligne)</span></h3>
    <div class="kpis">${resilienceRows.map((r) => kpiHtml(r.value, r.label, r.display)).join('')}</div>
    <p class="meta">
      Ces vérifications passent <strong>avant</strong> publication : liens morts, traductions manquantes, poids des pages,
      conformité des zones éditables, historique des versions. Un échec bloque la mise en ligne — c'est ce qui garantit
      qu'aucune page ne parte en production avec un contenu incomplet.
    </p>`
  : '';

/* ------------------------------------------------------------------ */
/* Échelle du projet & comparaison avec l'ancien site (dossier client) */
/* ------------------------------------------------------------------ */

const codeTotals = metrics?.code?.totals ?? null;
const codeTests = metrics?.code?.tests ?? null;
const componentCount = metrics?.code?.tsx?.componentExports ?? null;
const securityRedirects = metrics?.security?.redirects ?? 0;

const projectScaleBlock = codeTotals
  ? `
    <h3>Le poids du projet, en chiffres <span class="meta">(relevé à la génération de ce dossier)</span></h3>
    <div class="kpis">
      ${kpiHtml(codeTotals.lines, 'lignes de code', 'application, outillage et documentation')}
      ${kpiHtml(codeTotals.files, 'fichiers', 'suivis dans ces périmètres')}
      ${componentCount ? kpiHtml(componentCount, 'composants d’interface', 'réutilisables et typés') : ''}
      ${codeTests?.available ? kpiHtml(codeTests.total, 'vérifications automatiques', `${nf(codeTests.passed)} qui passent à chaque mise à jour`) : ''}
    </div>
    <p class="meta">
      Ces chiffres comptent le code réellement écrit pour votre application — pages, Cockpit, composants,
      outillage et documentation. Ils sont mesurés, jamais estimés, et recalculés à chaque génération.
    </p>`
  : '';

/**
 * Comparaison honnête avec l'ancien site WordPress : ce qui change, sans
 * superlatif. Aucun « avant » n'est caricaturé, aucun « après » n'est promis
 * au-delà de ce qui tourne réellement aujourd'hui.
 */
const OLD_SITE_ROWS = [
  ['Diffusion des pages', 'Serveur unique ; chaque visite repasse par WordPress.', 'Pages préparées à l’avance et servies depuis un cache réparti dans le monde.'],
  ['Mise à jour du contenu', 'Éditeur WordPress et extensions tierces.', 'Cockpit dédié : édition sans code, aperçu avant publication, historique de versions.'],
  ['Images & documents', 'Hébergés sur l’ancien site (wp-content).', 'Rapatriés dans la base du projet et convertis automatiquement en formats légers.'],
  ['Sécurité', 'Des dizaines d’extensions tierces à tenir à jour.', `Aucune extension exposée ; accès nominatif par rôle et règles par ligne en base (${rlsOn} espaces protégés).`],
  ['Adresses & référencement', 'Adresses WordPress historiques.', `Adresses clés conservées (${nf(securityRedirects)} redirections), titre et description par page, données structurées, plan du site automatique.`],
  ['Langues', 'Contenu en français.', 'Les 15 pages existent en français et en anglais, textes rédigés — jamais traduits automatiquement.'],
  ['Propriété des données', 'Tables WordPress et extensions.', 'PostgreSQL standard, export complet du contenu depuis le Cockpit.'],
];

const oldSiteBlock = `
    <h3>La nouvelle application face à l'ancien site</h3>
    <p>
      L'ancien site du campus était un WordPress hébergé sur un serveur classique. La nouvelle application en change
      la nature — sans rien perdre de ce qui faisait sa valeur.
    </p>
    <table>
      <thead><tr><th>Critère</th><th>Ancien site (WordPress)</th><th>Nouvelle application</th></tr></thead>
      <tbody>${OLD_SITE_ROWS.map(
  ([criterion, before, after]) =>
    `<tr><td><strong>${esc(criterion)}</strong></td><td>${esc(before)}</td><td>${esc(after)}</td></tr>`
).join('')}</tbody>
    </table>
    <div class="callout">
      <strong>Rien n'est perdu au passage :</strong> les adresses historiques continuent de mener vers la bonne page,
      pour ne pas abandonner le référencement déjà acquis sur Google.
    </div>`;

const mechCardsHtml = MECHANISMS.map(featCard).join('');
const workflowHtml = WORKFLOWS.map(featCard).join('');
const publicAccordions = PUBLIC_PAGES.map(accordionRow).join('');
const cockpitAccordions = COCKPIT_APPS.map(accordionRow).join('');
const glossaryAccordions = GLOSSARY.map(accordionRow).join('');
const faqAccordions = FAQ.map(
  ({ q: question, a }) => `
  <details class="acc reveal">
    <summary><span>${esc(question)}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(a)}</div>
  </details>`
).join('');
const journeyHtml = JOURNEY.map(
  (s, i) => `<div class="step reveal"><span class="num">${i + 1}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`
).join('');

const generated = new Date();
const today = generated.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Campus Univers Cascades — Dossier de présentation de l'application</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: #060608; color: #e7e7ea; font: 15px/1.65 "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  :focus-visible { outline: 2px solid #FFE500; outline-offset: 2px; border-radius: 4px; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 52px 24px 96px; }
  header.hero { padding: 34px 0 30px; border-bottom: 1px solid #26262e; margin-bottom: 34px; position: relative; }
  header.hero::after { content: ""; position: absolute; z-index: -1; top: -60px; right: -40px; width: 420px; height: 260px;
    background: radial-gradient(closest-side, rgba(255,229,0,.10), transparent 70%); animation: glowPulse 8s ease-in-out infinite; pointer-events: none; }
  @keyframes glowPulse { 50% { opacity: .45; transform: translateY(8px) scale(1.06); } }
  .kicker { color: #FFE500; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: clamp(30px, 4.4vw, 48px); margin: 12px 0 8px; line-height: 1.12; }
  h1 em { font-style: normal; background: linear-gradient(100deg, #FFE500, #fff6c4, #FFE500); background-size: 220% 100%;
    -webkit-background-clip: text; background-clip: text; color: transparent; animation: sheen 7s linear infinite; }
  @keyframes sheen { to { background-position: -220% 0; } }
  .meta { color: #9a9aa5; font-size: 13.5px; max-width: 860px; }
  .hero-actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #111; background: #FFE500; border: 0; border-radius: 999px; padding: 9px 18px; cursor: pointer; text-decoration: none; transition: transform .15s ease; }
  .btn:hover { transform: translateY(-1px); }
  .btn.ghost { background: transparent; color: #e7e7ea; border: 1px solid #3a3a44; }
  .strip { overflow: hidden; margin-top: 20px; border-top: 1px solid #26262e; border-bottom: 1px solid #26262e; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }
  .strip-inner { display: flex; align-items: center; gap: 26px; padding: 10px 0; white-space: nowrap; width: max-content; color: #b9b9c2; font-size: 12.5px; animation: slideZ 46s linear infinite; }
  .strip-inner .sep { color: #FFE500; font-size: 9px; }
  @keyframes slideZ { to { transform: translateX(-50%); } }
  nav.toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 0; position: sticky; top: 10px; z-index: 20; padding: 8px 0; background: linear-gradient(#060608, #060608e6); backdrop-filter: blur(6px); }
  nav.toc a { font-size: 12px; color: #cfcfd6; border: 1px solid #2c2c36; border-radius: 999px; padding: 5px 12px; text-decoration: none; background: #0b0b10; transition: border-color .15s ease, color .15s ease, background .15s ease; }
  nav.toc a:hover { border-color: #FFE500; color: #FFE500; }
  nav.toc a.active { border-color: #FFE500; color: #FFE500; background: #16160d; }
  section { scroll-margin-top: 92px; }
  h2 { margin-top: 64px; font-size: 25px; border-left: 4px solid #FFE500; padding-left: 12px; }
  h3 { margin-top: 34px; font-size: 18px; color: #f2f2f5; }
  h3 .meta { font-size: 12.5px; }
  p { color: #c9c9d1; }
  a { color: #FFE500; }
  .lead { font-size: 16.5px; color: #d8d8de; max-width: 860px; }
  .kpis { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-top: 22px; }
  .kpi { background: linear-gradient(180deg, #101017 0%, #0c0c11 100%); border: 1px solid #26262e; border-radius: 14px; padding: 16px 18px; transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
  .kpi:hover { transform: translateY(-3px); border-color: #3a3a44; box-shadow: 0 14px 34px rgba(0,0,0,.45); }
  .kpi .n { font-size: 30px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .kpi .n span.done { display: inline-block; animation: pop .42s ease; }
  @keyframes pop { 50% { transform: scale(1.16); color: #FFE500; } }
  .kpi .l { font-size: 13px; color: #e2e2e8; margin-top: 2px; }
  .kpi .s { font-size: 11.5px; color: #8a8a95; margin-top: 2px; }
  .feat-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .feat { background: linear-gradient(180deg, #101017 0%, #0c0c11 100%); border: 1px solid #26262e; border-radius: 14px; padding: 20px; position: relative; overflow: hidden; transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
  .feat:hover { transform: translateY(-3px); border-color: #3a3a44; box-shadow: 0 14px 34px rgba(0,0,0,.45); }
  .feat::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 2px; background: linear-gradient(90deg, #FFE500, transparent 72%); opacity: .85; }
  .feat .fi { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,229,0,.08); border: 1px solid rgba(255,229,0,.35); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .feat h3 { margin: 0 0 6px; font-size: 16.5px; }
  .feat p { margin: 0; color: #b9b9c2; font-size: 13.5px; }
  .feat .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 10.5px; letter-spacing: .04em; text-transform: uppercase; color: #ffef9e; border: 1px solid #3d3a1e; background: rgba(255,229,0,.06); border-radius: 999px; padding: 2px 9px; }
  .fi svg { width: 20px; height: 20px; stroke: #FFE500; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  details.acc { border: 1px solid #26262e; border-radius: 12px; background: #0d0d12; margin: 8px 0; overflow: hidden; transition: border-color .2s ease, background .2s ease; }
  details.acc:hover { border-color: #3a3a44; }
  details.acc summary { cursor: pointer; list-style: none; padding: 13px 18px; display: flex; align-items: center; gap: 12px; font-weight: 600; color: #eef0f4; transition: background .2s ease; }
  details.acc summary:hover { background: #12121a; }
  details.acc summary::-webkit-details-marker { display: none; }
  details.acc summary .role { color: #9a9aa5; font-weight: 400; font-size: 12.5px; }
  details.acc summary .chev { margin-left: auto; color: #FFE500; transition: transform .25s ease; flex: 0 0 auto; }
  details.acc[open] summary .chev { transform: rotate(90deg); }
  details.acc .acc-body { padding: 12px 18px 16px 18px; color: #bfc0c9; font-size: 13.8px; border-top: 1px solid #1d1d25; }
  .steps { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-top: 14px; }
  .step { background: #0d0d12; border: 1px solid #26262e; border-radius: 12px; padding: 14px; position: relative; }
  .step .num { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; background: #FFE500; color: #111; font-weight: 700; font-size: 12.5px; align-items: center; justify-content: center; margin-bottom: 8px; }
  .step h4 { margin: 0 0 4px; font-size: 14px; color: #fff; }
  .step p { margin: 0; font-size: 12.5px; color: #a9aab4; }
  @media (min-width: 1000px) {
    .step:not(:last-child)::after { content: ""; position: absolute; top: 26px; right: -13px; width: 14px; border-top: 2px dashed #3a3a44; }
  }
  .flow { background: radial-gradient(620px 260px at 18% 0%, rgba(255,229,0,.05), transparent), #0b0b10; border: 1px solid #26262e; border-radius: 16px; padding: 10px 12px; }
  .chart { width: 100%; height: auto; }
  .chart-label { fill: #c9c9d1; font-size: 13px; }
  .chart-value { fill: #fff; font-size: 12.5px; font-weight: 600; }
  .donut-wrap { display: flex; gap: 26px; align-items: center; flex-wrap: wrap; }
  .donut-total { fill: #fff; font-size: 22px; font-weight: 700; }
  .legend { list-style: none; margin: 0; padding: 0; font-size: 13px; color: #c9c9d1; }
  .legend li { margin: 4px 0; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 10px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #1f1f27; }
  th { color: #9a9aa5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
  td { color: #d6d6dd; }
  .legend-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; color: #9a9aa5; }
  .key { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  @media (max-width: 920px) { .two-col { grid-template-columns: 1fr; } }
  .callout { border-left: 4px solid #FFE500; background: #101016; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; color: #d6d6dd; }
  .map-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 14px; }
  .map-card { background: #0d0d12; border: 1px solid #26262e; border-radius: 14px; padding: 16px 18px; }
  .map-card h4 { margin: 8px 0 8px; font-size: 14.5px; color: #fff; }
  .map-card ul { margin: 0; padding-left: 18px; color: #b9b9c2; font-size: 12.8px; }
  .map-card li { margin: 3px 0; }
  ul.sessions { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
  .sess { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; background: #0d0d12; border: 1px solid #26262e; border-radius: 12px; padding: 12px 16px; }
  .sess-status { font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; border-radius: 999px; padding: 3px 10px; border: 1px solid #3a3a44; white-space: nowrap; }
  .s-ok { color: #9ee6a8; border-color: #2e5533; background: rgba(129,199,132,.08); }
  .s-last { color: #ffd28a; border-color: #5a4620; background: rgba(255,176,32,.08); }
  .s-full { color: #ff9d8a; border-color: #5c3128; background: rgba(255,112,67,.08); }
  .s-soon { color: #b9c6d8; border-color: #333c47; background: rgba(79,195,247,.06); }
  .sess-title { font-weight: 600; color: #eef0f4; }
  .sess-date { margin-left: auto; color: #9a9aa5; font-size: 13px; }
  footer { margin-top: 76px; border-top: 1px solid #26262e; padding-top: 20px; color: #8a8a95; font-size: 12.5px; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border: 1px solid #3a3a44; border-radius: 999px; color: #c9c9d1; margin-right: 6px; }
  code { color: #ffe9a8; }
  /* --- Animations (natives, sans dépendance) --- */
  .flowline { fill: none; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 3 12; animation: march 1.5s linear infinite; }
  @keyframes march { to { stroke-dashoffset: -15; } }
  .halo { animation: haloPulse 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes haloPulse { 0%, 100% { opacity: .12; transform: scale(.96); } 50% { opacity: .38; transform: scale(1.03); } }
  /* Cycle de demande : carte-enveloppe voyageuse + étapes qui s'allument en séquence */
  .flowmsg { offset-rotate: 0deg; animation: msgRun 10.5s linear infinite; filter: drop-shadow(0 4px 10px rgba(255,229,0,.28)); }
  @keyframes msgRun {
    0% { offset-distance: 0%; opacity: 0; }
    2% { opacity: 1; }
    88% { offset-distance: 100%; opacity: 1; }
    94%, 100% { offset-distance: 100%; opacity: 0; }
  }
  .rc-node { animation: nodeHit 10.5s linear infinite; }
  @keyframes nodeHit { 0% { stroke: #FFE500; stroke-width: 3.2; } 10% { stroke: #FFE500; stroke-width: 3.2; } 22%, 100% { stroke: #3a3a44; stroke-width: 2; } }
  .rc-ping { fill: none; stroke: #FFE500; stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; animation: pingOut 10.5s ease-out infinite; }
  @keyframes pingOut { 0% { transform: scale(.6); opacity: .8; } 10% { transform: scale(1.7); opacity: 0; } 10.01%, 100% { opacity: 0; } }
  .rc-fill { fill: none; stroke: #FFE500; stroke-width: 2; stroke-dasharray: 700; stroke-dashoffset: 700; animation: lineFill 10.5s linear infinite; }
  @keyframes lineFill { 0% { stroke-dashoffset: 700; opacity: .85; } 88% { stroke-dashoffset: 0; opacity: .85; } 92% { opacity: 0; } 92.01%, 100% { stroke-dashoffset: 700; opacity: 0; } }
  /* Parcours d'un élève : le chemin se dessine, le jeton avance, chaque étape s'allume à son passage */
  .jdraw { fill: none; stroke: #FFE500; stroke-width: 2.6; stroke-linecap: round; stroke-dasharray: 2300; stroke-dashoffset: 2300;
    animation: jDraw 16s linear infinite; }
  @keyframes jDraw { 0% { stroke-dashoffset: 2300; opacity: .9; } 94% { stroke-dashoffset: 0; opacity: .9; } 100% { stroke-dashoffset: 0; opacity: 0; } }
  .jtoken { offset-rotate: 0deg; animation: jToken 16s linear infinite; filter: drop-shadow(0 6px 16px rgba(255,229,0,.4)); }
  @keyframes jToken {
    0% { offset-distance: 0%; opacity: 0; }
    3% { opacity: 1; }
    95% { offset-distance: 100%; opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  .jnode { animation: jNode 16s linear infinite; }
  @keyframes jNode {
    0% { stroke: #FFE500; stroke-width: 3.4; }
    10% { stroke: #FFE500; stroke-width: 3.4; }
    16%, 100% { stroke: #3a3a44; stroke-width: 2; }
  }
  .jring { fill: none; stroke: #FFE500; stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center;
    animation: jRing 16s ease-out infinite; }
  @keyframes jRing { 0% { transform: scale(.7); opacity: .85; } 6% { transform: scale(1.9); opacity: 0; } 6.01%, 100% { opacity: 0; } }
  /* --- Confort de lecture (CSS moderne, sans dépendance) --- */
  @supports (animation-timeline: scroll()) {
    .progress { position: fixed; top: 0; left: 0; height: 3px; width: 100%; z-index: 60;
      background: linear-gradient(90deg, #FFE500, #ffb020); transform-origin: 0 50%; transform: scaleX(0);
      animation: growX linear; animation-timeline: scroll(); }
    @keyframes growX { to { transform: scaleX(1); } }
  }
  @supports (animation-timeline: view()) {
    .reveal { animation: riseIn both; animation-timeline: view(); animation-range: entry 0% entry 55%; }
    @keyframes riseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    h2 { animation: flagIn both; animation-timeline: view(); animation-range: entry 0% entry 45%; }
    @keyframes flagIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
  }
  .totop { position: fixed; right: 18px; bottom: 18px; z-index: 40; width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; background: #0e0e14; border: 1px solid #3a3a44;
    color: #FFE500; text-decoration: none; font-size: 18px; box-shadow: 0 10px 24px rgba(0,0,0,.45); }
  .totop:hover { border-color: #FFE500; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .flowline, .halo, .flowmsg, .rc-node, .rc-ping, .rc-fill, .jdraw, .jtoken, .jnode, .jring,
    .strip-inner, header.hero::after,
    .reveal, h2, .progress, h1 em, .kpi .n span.done { animation: none !important; }
    .jdraw { stroke-dashoffset: 0; opacity: .9; }
  }
  @media print {
    body { background: #fff; color: #111; }
    .feat, .kpi, .step, .map-card, .sess { border-color: #ddd; background: #fff; }
    nav.toc, .totop, .progress, .hero-actions, .strip, header.hero::after { display: none; }
    details.acc { break-inside: avoid; }
    details.acc .acc-body { display: block; }
  }
</style>
</head>
<body>
<span class="progress" aria-hidden="true"></span>
<a class="totop" href="#top" title="Revenir en haut" aria-label="Revenir en haut">↑</a>
<div class="wrap" id="top">

  <header class="hero">
    <div class="kicker">Dossier de présentation — ${esc(today)}</div>
    <h1>L'application du <em>Campus Univers Cascades</em></h1>
    <p class="meta">
      Tout ce qu'il faut savoir pour comprendre et utiliser votre site : ce qu'il montre, ce que vous pouvez
      piloter vous-même, comment les choses fonctionnent — et les chiffres réels de votre activité en ligne.
    </p>
    <div class="hero-actions">
      <button class="btn" onclick="window.print()">Imprimer / PDF</button>
      <a class="btn ghost" href="#faq">Aller aux questions fréquentes</a>
    </div>
    <div class="strip" aria-hidden="true"><div class="strip-inner">${stripHtml}</div></div>
    <nav class="toc">
      <a href="#vue">Vue d'ensemble</a><a href="#ecosysteme">Comment ça marche</a><a href="#carte">La carte du site</a>
      <a href="#site">Le site public</a><a href="#cockpit">Le Cockpit</a><a href="#quotidien">Au quotidien</a>
      <a href="#chiffres">Chiffres clés</a><a href="#contenus">Les contenus</a><a href="#capot">Sous le capot</a>
      <a href="#pratiques">Bonnes pratiques</a><a href="#glossaire">Glossaire</a><a href="#faq">FAQ</a>
      <a href="./cuc-sign.html">CUC Sign ↗</a>
    </nav>
  </header>

  <section id="vue">
    <h2>1. Vue d'ensemble</h2>
    <p class="lead">
      L'application regroupe <strong>deux outils</strong> qui travaillent ensemble : le <strong>site public</strong>, qui présente le campus
      et ses activités aux visiteurs en français et en anglais, et le <strong>Cockpit</strong>, l'espace d'administration où votre
      équipe modifie tout le contenu elle-même — sans intervention technique et sans délai.
    </p>
    <p>
      Les contenus sont centralisés : une modification faite dans le Cockpit est immédiatement reflétée sur le site. Les images,
      textes, films, dates de stages et traductions vivent dans la base de données du projet — jamais « en dur » dans le code.
      Résultat : votre site reste vivant, à jour, sans dépendre de personne à l'extérieur.
    </p>
    <div class="callout">
      <strong>Le principe en une phrase :</strong> vous écrivez une fois dans le Cockpit, le site s'occupe de tout —
      affichage public, version anglaise, cohérence avec la plateforme de gestion de l'école (CUC Sign).
    </div>
  </section>

  <section id="ecosysteme">
    <h2>2. Comment ça marche, en un schéma</h2>
    <p>Le visiteur consulte le site ; votre équipe modifie le contenu depuis le Cockpit ; la base fait le pont — en temps réel.
    Les flux animés matérialisent les échanges : chaque pointillé qui défile est un transfert d'information réel.</p>
    <div class="flow reveal">${ecosystemSvg}</div>
    <div class="legend-row">
      <span><span class="key" style="background:#FFE500"></span>Cockpit → base : vos modifications</span>
      <span><span class="key" style="background:#7bd88f"></span>base → site : rafraîchissement temps réel</span>
      <span><span class="key" style="background:#4FC3F7"></span>liaison lecture seule ↔ plateforme de gestion CUC Sign</span>
    </div>

    <h3>Le parcours d'un visiteur</h3>
    <div class="steps">${journeyHtml}</div>

    <h3>Les mécanismes qui font tourner l'ensemble</h3>
    <div class="feat-grid">${mechCardsHtml}</div>
  </section>

  <section id="carte">
    <h2>3. La carte du site</h2>
    <p>Les 15 pages publiques, organisées comme vos visiteurs les découvrent — et sous elles, les films qui font la réputation du campus.</p>
    <div class="map-grid">${siteMapHtml}</div>
    <div class="callout">
      <strong>Un catalogue, pas une vitrine figée :</strong> chaque film du catalogue ouvre sa fiche — équipe impliquée,
      rôles exacts, affiche authentique — et la même présentation est utilisée de l'accueil à la fiche de chaque coach.
    </div>
  </section>

  <section id="site">
    <h2>4. Le site public — page par page</h2>
    <p>Dépliez chaque entrée pour voir son rôle exact. Toutes les pages existent en français et en anglais.</p>
    ${publicAccordions}
  </section>

  <section id="cockpit">
    <h2>5. Le Cockpit d'administration — les 15 écrans</h2>
    <p>
      Accessible avec un compte nominatif, le Cockpit se pilote entièrement à la souris. Chaque écran se déplie ci-dessous.
    </p>
    ${cockpitAccordions}

    <h3>Ce qui est modifiable, et où</h3>
    <p>Sur chaque page du site, tout le contenu éditorial est piloté depuis le Cockpit — rien n'est figé dans le code.</p>
    <div class="flow reveal">${pageAnatomySvg}</div>
  </section>

  <section id="quotidien">
    <h2>6. Au quotidien — comment je fais…</h2>
    <p>Les gestes les plus courants, en une ligne chacun :</p>
    <div class="feat-grid">${workflowHtml}</div>

    <h3>Le cycle d'une demande, de bout en bout</h3>
    <p class="meta">Suivez l'enveloppe : une candidature envoyée depuis le site parcourt cinq étapes jusqu'à sa réponse. Chaque étape s'allume au moment où la demande l'atteint.</p>
    <div class="flow reveal">${requestCycleSvg}</div>

    <h3>Vos sessions, telles qu'elles apparaissent aujourd'hui sur le site</h3>
    <p class="meta">Relevé en direct dans la base de données : chaque ligne correspond à une session publiée, avec sa date affichée publiquement et son statut actuel.</p>
    <ul class="sessions">${sessionsHtml}</ul>

    <div class="callout">
      <strong>En cas de doute :</strong> rien n'est fragile. Chaque page possède un historique de versions restaurable,
      et le journal d'audit conserve la trace de toutes les actions.
    </div>
  </section>

  <section id="chiffres">
    <h2>7. L'application en un coup d'œil</h2>
    <div class="kpis">${figuresHtml}</div>
    <p class="meta" style="margin-top:14px">Chiffres relevés automatiquement depuis la base de données du projet, au moment de la génération de ce dossier.</p>

    ${qualityKpis
    ? `<h3>La qualité éditoriale, mesurée <span class="meta">(complétude réelle du catalogue et des fiches coachs)</span></h3>
    <p>Un catalogue ne vaut que par la richesse de ses fiches. Ces chiffres disent précisément où en est la documentation
    de chaque film et de chaque coach — et ce qu'il reste éventuellement à compléter.</p>
    <div class="kpis">${qualityKpis}</div>`
    : ''
  }
  </section>

  <section id="contenus">
    <h2>8. Tout ce que contient votre application</h2>
    <p>Les volumes réels du site, relevés dans la base au moment de la génération de ce dossier.</p>

    <div class="two-col">
      <div>
        <h3>Les contenus publiés</h3>
        ${contentTable}
      </div>
      <div>
        <h3>La complétude des fiches films</h3>
        ${completenessDonut}
        <p class="meta">Répartition des films publiés selon la richesse de leur fiche (affiche et description).</p>
      </div>
    </div>

    ${catalogTraitsHtml
    ? `<h3>Quelques repères du catalogue <span class="meta">(choisis pour ce qu'ils racontent)</span></h3>
    <div class="kpis">${catalogTraitsHtml}</div>`
    : ''
  }

    <h3 id="cuc-sign">CUC Sign — <a href="./cuc-sign.html">la plateforme de gestion de l'école</a></h3>
    <p>
      Le site public et le Cockpit que vous avez entre les mains sont la <strong>première étape</strong>. La seconde
      existe déjà et s'appelle <strong>CUC Sign</strong> : ce n'est pas un outil réservé aux élèves, c'est la
      <strong>plateforme de gestion de l'école</strong>, avec un espace pour chacun — élèves, coachs, direction.
      Les formations, les coachs et les lieux affichés publiquement viennent déjà de CUC Sign, en lecture seule.
    </p>
    <div class="feat-grid">${cucSignTeaserCards}</div>
    <div class="callout">
      <strong>CUC Sign a sa propre page.</strong> Le détail complet — espaces élèves, coachs et direction, circulation
      entre les deux applications, et les signalements terrain (matériel défectueux, rangement, blessure déclarés
      depuis un téléphone) — y est présenté.
      <div class="hero-actions">
        <a class="btn" href="./cuc-sign.html">Ouvrir la page CUC Sign →</a>
      </div>
    </div>
  </section>

  <section id="capot">
    <h2>9. Sous le capot — en toute transparence</h2>
    <p>
      Cette partie s'adresse aux curieux : ce que votre site « pèse », la vitesse à laquelle il répond,
      et les garanties qui l'entourent. Aucune connaissance technique n'est nécessaire pour la lire.
    </p>

${projectScaleBlock}
${oldSiteBlock}

    ${pageWeightSummary
    ? `<h3>Poids et temps de réponse <span class="meta">(mesurés sur la version de production)</span></h3>
    <div class="kpis">${pageWeightSummary}</div>
    <p class="meta">Les pages les plus « lourdes » sont les galeries de films — logique : elles affichent le catalogue complet. Les autres tiennent dans un dixième de seconde.</p>`
    : ''
  }
${hostingBlock}
${resilienceBlock}

    <h3>Les garanties qui entourent votre site</h3>
    <div class="feat-grid">${guaranteesHtml}</div>

    <h3>Qui peut faire quoi</h3>
    <div class="feat-grid">${rolesHtml}</div>

    <h3>Stack technique <span class="meta">(les technologies et leur rôle, sans jargon)</span></h3>
    <p class="meta">
      Aucun CMS externe, aucune extension tierce exposée : la stack est volontairement courte et standard,
      pour rester maintenable dans le temps.
    </p>
${techTable}

    ${bundleBytes ? `<p class="meta">Pour afficher le site, le navigateur télécharge environ ${mo(bundleBytes)} de code, mis en cache après la première visite. La visite suivante est quasi instantanée.</p>` : ''}
    ${i18n ? `<p class="meta">Langues : ${nf(i18n.fr)} clés éditoriales en français, ${nf(i18n.en)} en anglais — parité contrôlée automatiquement à chaque mise à jour.</p>` : ''}
  </section>

  <section id="pratiques">
    <h2>10. Les bonnes pratiques de votre équipe</h2>
    <p>Six réflexes simples qui gardent le site impeccable :</p>
    <div class="feat-grid">${practicesHtml}</div>
  </section>

  <section id="glossaire">
    <h2>11. Glossaire — les mots du projet, en clair</h2>
    <p>Huit termes que vous croiserez dans les échanges sur le projet, expliqués sans jargon.</p>
    ${glossaryAccordions}
  </section>

  <section id="faq">
    <h2>12. Questions fréquentes</h2>
    ${faqAccordions}
  </section>

  <footer>
    Dossier de présentation généré le ${generated.toLocaleString('fr-FR')} pour le Campus Univers Cascades.
    Document autonome (aucun accès internet requis) · régénérable à tout moment via <code>npm run report:dossier</code>.
    <span class="pill">FR / EN</span><span class="pill">sans connexion</span><span class="pill">imprimable</span>
  </footer>
</div>
<script>
  /* Compteurs animés — désactivés si mouvement réduit ou sans observer. */
  (function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('[data-count]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (!isFinite(target)) return;
        var start = performance.now();
        function step(now) {
          var p = Math.min(1, (now - start) / 900);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('fr-FR');
          if (p < 1) requestAnimationFrame(step);
          else el.classList.add('done');
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.35 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* Chapitre actif dans le sommaire (scrollspy discret). */
  (function () {
    var links = document.querySelectorAll('nav.toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      if (id) byId[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = byId[entry.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  })();
</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

/**
 * La feuille de style est capturée depuis le dossier déjà assemblé : la page
 * CUC Sign hérite de la même identité visuelle sans en dupliquer une ligne.
 */
const sharedCss = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const cucSignHtml = buildCucSignDossier({
  css: sharedCss,
  today,
  generated,
  kit: { esc, nf, icon, featCard, kpiHtml },
  cucSign,
});
fs.writeFileSync(OUT_SIGN, cucSignHtml, 'utf8');

console.log('=== Dossiers de présentation client générés (v5) ===');
console.log(`Dossier application — 12 sections · accordéons : ${PUBLIC_PAGES.length + COCKPIT_APPS.length + GLOSSARY.length + FAQ.length + 1}`);
console.log(`Repères chiffrés : contenus(tablo ${contentRows.length}) · complétude(${q ? 3 : 0}) · catalogue(${catalogTraits.length}) · résistance(${resilienceRows.length}) · pages(${pageWeights ? pageWeights.length : 0}) · échelle(${codeTotals ? 2 : 0}) · comparaison(${OLD_SITE_ROWS.length})`);
console.log(`Sessions live : ${live.sessions.length} lignes datées`);
console.log(`Qualité : ${q ? `${nf(q.films.with_image)}/${nf(q.films.total)} affiches · ${nf(q.filmsEn)} films EN · ${nf(q.team.with_imdb)} IMDb` : 'indisponible'}`);
console.log(`Schémas : écosystème (flux animés) · carte du site(${SITE_MAP.length} thèmes) · anatomie de page · cycle de demande (carte voyageuse)`);
console.log('Page CUC Sign — 6 sections · signalements smartphone (matériel, rangement, blessure)');
console.log('Sorties :');
console.log('  - reports/cuc-dossier-application.html');
console.log('  - reports/cuc-sign.html');
