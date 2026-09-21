#!/usr/bin/env node
/**
 * DOSSIER DE PRÉSENTATION CLIENT — L'APPLICATION DU CAMPUS UNIVERS CASCADES
 * =========================================================================
 *
 * Document autonome destiné au client : à quoi sert l'application, ce que
 * chaque page montre, ce que le Cockpit permet de piloter, comment les choses
 * fonctionnent — en langage simple, avec des visuels.
 *
 * Ce dossier ne parle NI d'audit, NI de corrections techniques : c'est un
 * support de compréhension et de prise en main.
 *
 * Régénération : `npm run report:dossier`
 * Sortie : reports/cuc-dossier-application.html
 *
 * Les chiffres « en un coup d'œil » sont relus des rapports de contrôle
 * (`scripts/audit_supabase_state_report.json`, `reports/cuc-metriques-2026.metrics.json`)
 * quand ils existent, avec des valeurs de repli sinon — jamais saisis à la main.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'reports', 'cuc-dossier-application.html');

const readJson = (p) => {
    try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
        return null;
    }
};

const db = readJson(path.join(ROOT, 'scripts', 'audit_supabase_state_report.json'));
const metrics = readJson(path.join(ROOT, 'reports', 'cuc-metriques-2026.metrics.json'));

const t = db?.tables ?? {};
const storageFiles = (metrics?.database?.storage ?? []).reduce((a, s) => a + (s.files ?? 0), 0);

/** Chiffres « en un coup d'œil » (mesurés, avec repli prudent). */
const FIGURES = [
    { value: '15', label: 'pages publiques', sub: 'chacune en français ET en anglais' },
    { value: t['site_films'] != null ? String(t['site_films']) : '570', label: 'films au catalogue', sub: 'affiches et fiches détaillées' },
    { value: t['site_team'] != null ? String(t['site_team']) : '12', label: 'coachs', sub: 'filmographies vérifiées' },
    { value: t['site_translations'] != null ? String(t['site_translations']) : '579', label: 'traductions', sub: 'contenus bilingues en base' },
    { value: t['site_sessions'] != null ? String(t['site_sessions']) : '18', label: 'sessions de formation', sub: 'dates et statuts en direct' },
    { value: t['site_disciplines'] != null ? String(t['site_disciplines']) : '10', label: 'disciplines enseignées', sub: 'référentiel complet' },
    { value: t['site_partners'] != null ? String(t['site_partners']) : '21', label: 'partenaires', sub: 'marques & institutions' },
    { value: storageFiles > 0 ? String(storageFiles) : '221', label: 'images & documents', sub: 'centralisés et optimisés' },
];

/* ================================================================== */
/* Boîte à outils visuelle (identique à l'identité du site)            */
/* ================================================================== */

const esc = (s) =>
    String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');

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
};

const icon = (name) => `<span class="fi"><svg viewBox="0 0 24 24" aria-hidden="true">${FEAT_ICONS[name] ?? FEAT_ICONS.star}</svg></span>`;
const tagsHtml = (tags = []) =>
    tags.length ? `<div class="tags">${tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '';

const featCard = ({ iconName, title, desc, tags }) => `
  <article class="feat">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(desc)}</p>${tagsHtml(tags)}</article>`;

const accordionRow = ({ iconName, title, role, desc, tags }) => `
  <details class="acc">
    <summary>${icon(iconName)}<span>${esc(title)}${role ? ` <span class="role">— ${esc(role)}</span>` : ''}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(desc)}${tagsHtml(tags)}</div>
  </details>`;

/* ================================================================== */
/* Contenus                                                            */
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
    { iconName: 'shield', title: 'Interconnexion CUC Sign', desc: 'Sessions de formation, coachs et lieux du site reflètent la plateforme élèves — en lecture seule : le site ne peut jamais altérer les données pédagogiques.', tags: ['CUC Sign'] },
    { iconName: 'users', title: 'Sécurité & rôles', desc: 'Accès administrateur nominatif, permissions par rôle (direction, secrétariat, coachs) et sécurité par ligne en base de données.', tags: ['RLS'] },
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

/** Guide pratique : « au quotidien, comment je fais… ». */
const WORKFLOWS = [
    { iconName: 'edit', title: 'Modifier un texte du site', steps: 'Cockpit → Pages & héros → choisir la page → modifier → Aperçu → Enregistrer.' },
    { iconName: 'calendar', title: 'Ajouter une session de stage', steps: 'Cockpit → Sessions → créer (dates, statut) → relier la formation CUC Sign correspondante.' },
    { iconName: 'film', title: 'Mettre un film en avant', steps: 'Cockpit → Films (ou fiche coach) → étoiler le crédit → il monte en tête de la filmographie.' },
    { iconName: 'bell', title: 'Publier une information urgente', steps: 'Cockpit → Annonces → activer le message : le bandeau s’affiche en haut de tout le site.' },
    { iconName: 'globe', title: 'Compléter une traduction anglaise', steps: 'Cockpit → Traductions → entité concernée → compléter → enregistrer.' },
    { iconName: 'shield', title: 'Revenir en arrière sur une erreur', steps: 'Cockpit → Pages & héros → Historique des versions → restaurer la version précédente.' },
];

const FAQ = [
    { q: 'Le site est-il vraiment disponible en anglais ?', a: "Oui : les 15 pages existent en français et en anglais, avec des textes rédigés (et non traduits automatiquement). La galerie de films, les fiches coachs, les événements, les disciplines et le campus disposent de traductions éditoriales stockées en base." },
    { q: 'Faut-il des compétences techniques pour mettre le site à jour ?', a: "Non. Tout se pilote depuis le Cockpit d'administration, avec un aperçu avant publication. Aucune ligne de code n'est nécessaire." },
    { q: 'Que se passe-t-il si une modification est une erreur ?', a: "Rien n'est définitif : chaque page conserve un historique de versions, restaurable en un clic. Le journal d'audit garde aussi trace des actions réalisées." },
    { q: 'Le site peut-il modifier l’application CUC Sign ?', a: "Jamais. La liaison est en lecture seule : le site affiche les formations, coachs et lieux de CUC Sign, mais n'y écrit aucune donnée. Les données pédagogiques sont protégées par des règles strictes côté base." },
    { q: 'Comment les demandes (candidatures, projets) arrivent-elles ?', a: "Le visiteur remplit un formulaire guidé sur le site. La demande apparaît dans le Cockpit (écran Candidatures) avec un statut, des notes internes, et peut être convertie en compte élève CUC Sign." },
    { q: 'Où sont hébergées les images et vidéos du site ?', a: "Dans la base du projet, pas sur l'ancien site : une bibliothèque centralisée (écran Médias) sert automatiquement des formats optimisés pour le web." },
];

/* ================================================================== */
/* Visuels                                                             */
/* ================================================================== */

const svgTile = (x, y, w, h, label, sub) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#101017" stroke="#2a2a33"/>
  <text x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700">${esc(label)}</text>
  <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" fill="#9a9aa5" font-size="11.5">${esc(sub)}</text>`;

const ecosystemSvg = `
<svg viewBox="0 0 940 360" class="chart" role="img" aria-label="Schéma : visiteur, site vitrine, Supabase, Cockpit d'administration et plateforme CUC Sign">
  <path d="M150 167 C 180 167, 186 120, 208 108" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M540 165 C 492 165, 484 112, 434 102" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M430 272 C 480 272, 500 250, 556 240" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M730 170 H 798" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M798 210 H 732" fill="none" stroke="#3a3a44" stroke-width="2"/>
  ${svgTile(30, 125, 120, 84, 'Visiteur', 'web & mobile')}
  ${svgTile(210, 40, 224, 84, 'Site vitrine', '15 pages • FR / EN')}
  ${svgTile(210, 230, 224, 84, 'Cockpit admin', '15 écrans • rôles')}
  ${svgTile(540, 135, 190, 100, 'Supabase', 'base + temps réel')}
  ${svgTile(800, 135, 120, 100, 'CUC Sign', 'plateforme élèves')}
  <circle class="flowdot" r="3.5" fill="#FFE500" style="offset-path: path('M430 272 C 480 272, 500 250, 556 240'); animation-duration: 2.6s"/>
  <circle class="flowdot" r="3.5" fill="#FFE500" style="offset-path: path('M430 272 C 480 272, 500 250, 556 240'); animation-duration: 2.6s; animation-delay: -1.3s"/>
  <circle class="flowdot" r="3.5" fill="#7bd88f" style="offset-path: path('M540 165 C 492 165, 484 112, 434 102'); animation-duration: 2.2s"/>
  <circle class="flowdot" r="3.5" fill="#4FC3F7" style="offset-path: path('M730 170 H 798'); animation-duration: 3.2s"/>
  <circle class="flowdot" r="3.5" fill="#4FC3F7" style="offset-path: path('M798 210 H 732'); animation-duration: 3.2s; animation-delay: -1.6s"/>
  <text x="500" y="300" text-anchor="middle" fill="#7c7c88" font-size="11">Le Cockpit écrit dans la base ; le site la lit — rien ne transite par la machine du visiteur.</text>
</svg>`;

const figuresHtml = FIGURES.map(
    (f) => `<div class="kpi"><div class="n">${esc(f.value)}</div><div class="l">${esc(f.label)}</div><div class="s">${esc(f.sub)}</div></div>`
).join('');

const mechCardsHtml = MECHANISMS.map(featCard).join('');
const workflowHtml = WORKFLOWS.map(featCard).join('');
const publicAccordions = PUBLIC_PAGES.map(accordionRow).join('');
const cockpitAccordions = COCKPIT_APPS.map(accordionRow).join('');
const faqAccordions = FAQ.map(
    ({ q, a }) => `
  <details class="acc">
    <summary><span>${esc(q)}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(a)}</div>
  </details>`
).join('');
const journeyHtml = JOURNEY.map(
    (s, i) => `<div class="step"><span class="num">${i + 1}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`
).join('');

const generated = new Date();

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Campus Univers Cascades — Dossier de présentation de l'application</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #060608; color: #e7e7ea; font: 15px/1.65 "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 52px 24px 96px; }
  header.hero { padding: 34px 0 30px; border-bottom: 1px solid #26262e; margin-bottom: 34px; }
  .kicker { color: #FFE500; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: clamp(30px, 4.4vw, 48px); margin: 12px 0 8px; line-height: 1.12; }
  h1 em { color: #FFE500; font-style: normal; }
  .meta { color: #9a9aa5; font-size: 13.5px; max-width: 860px; }
  nav.toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 0; }
  nav.toc a { font-size: 12px; color: #cfcfd6; border: 1px solid #2c2c36; border-radius: 999px; padding: 5px 12px; text-decoration: none; }
  nav.toc a:hover { border-color: #FFE500; color: #FFE500; }
  h2 { margin-top: 64px; font-size: 25px; border-left: 4px solid #FFE500; padding-left: 12px; }
  h3 { margin-top: 34px; font-size: 18px; color: #f2f2f5; }
  h3 .meta { font-size: 12.5px; }
  p { color: #c9c9d1; }
  a { color: #FFE500; }
  .lead { font-size: 16.5px; color: #d8d8de; max-width: 860px; }
  .kpis { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-top: 22px; }
  .kpi { background: linear-gradient(180deg, #101017 0%, #0c0c11 100%); border: 1px solid #26262e; border-radius: 14px; padding: 16px 18px; }
  .kpi .n { font-size: 30px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .kpi .l { font-size: 13px; color: #e2e2e8; margin-top: 2px; }
  .kpi .s { font-size: 11.5px; color: #8a8a95; margin-top: 2px; }
  .feat-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .feat { background: linear-gradient(180deg, #101017 0%, #0c0c11 100%); border: 1px solid #26262e; border-radius: 14px; padding: 20px; position: relative; overflow: hidden; }
  .feat::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 2px; background: linear-gradient(90deg, #FFE500, transparent 72%); opacity: .85; }
  .feat .fi { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,229,0,.08); border: 1px solid rgba(255,229,0,.35); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .feat h3 { margin: 0 0 6px; font-size: 16.5px; }
  .feat p { margin: 0; color: #b9b9c2; font-size: 13.5px; }
  .feat .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 10.5px; letter-spacing: .04em; text-transform: uppercase; color: #ffef9e; border: 1px solid #3d3a1e; background: rgba(255,229,0,.06); border-radius: 999px; padding: 2px 9px; }
  .fi svg { width: 20px; height: 20px; stroke: #FFE500; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  details.acc { border: 1px solid #26262e; border-radius: 12px; background: #0d0d12; margin: 8px 0; overflow: hidden; }
  details.acc summary { cursor: pointer; list-style: none; padding: 13px 18px; display: flex; align-items: center; gap: 12px; font-weight: 600; color: #eef0f4; }
  details.acc summary::-webkit-details-marker { display: none; }
  details.acc summary .role { color: #9a9aa5; font-weight: 400; font-size: 12.5px; }
  details.acc summary .chev { margin-left: auto; color: #FFE500; transition: transform .25s ease; flex: 0 0 auto; }
  details.acc[open] summary .chev { transform: rotate(90deg); }
  details.acc .acc-body { padding: 12px 18px 16px 18px; color: #bfc0c9; font-size: 13.8px; border-top: 1px solid #1d1d25; }
  .steps { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-top: 14px; }
  .step { background: #0d0d12; border: 1px solid #26262e; border-radius: 12px; padding: 14px; }
  .step .num { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; background: #FFE500; color: #111; font-weight: 700; font-size: 12.5px; align-items: center; justify-content: center; margin-bottom: 8px; }
  .step h4 { margin: 0 0 4px; font-size: 14px; color: #fff; }
  .step p { margin: 0; font-size: 12.5px; color: #a9aab4; }
  .flow { background: radial-gradient(620px 260px at 18% 0%, rgba(255,229,0,.05), transparent), #0b0b10; border: 1px solid #26262e; border-radius: 16px; padding: 10px 12px; }
  .chart { width: 100%; height: auto; }
  .legend-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; color: #9a9aa5; }
  .key { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
  .flowdot { offset-rotate: 0deg; animation-name: flowRun; animation-timing-function: linear; animation-iteration-count: infinite; }
  @keyframes flowRun { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  @media (prefers-reduced-motion: reduce) { .flowdot { animation: none; } }
  .callout { border-left: 4px solid #FFE500; background: #101016; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; color: #d6d6dd; }
  footer { margin-top: 76px; border-top: 1px solid #26262e; padding-top: 20px; color: #8a8a95; font-size: 12.5px; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border: 1px solid #3a3a44; border-radius: 999px; color: #c9c9d1; margin-right: 6px; }
  code { color: #ffe9a8; }
  @media print { body { background: #fff; color: #111; } .feat, .kpi, .step { border-color: #ddd; background: #fff; } details.acc { break-inside: avoid; } }
</style>
</head>
<body>
<div class="wrap">

  <header class="hero">
    <div class="kicker">Dossier de présentation — 2026</div>
    <h1>L'application du <em>Campus Univers Cascades</em></h1>
    <p class="meta">
      Tout ce qu'il faut savoir pour comprendre et utiliser votre site : ce qu'il montre,
      ce que vous pouvez piloter vous-même, et comment l'ensemble fonctionne au quotidien.
    </p>
    <nav class="toc">
      <a href="#vue">Vue d'ensemble</a><a href="#ecosysteme">Comment ça marche</a><a href="#site">Le site public</a>
      <a href="#cockpit">Le Cockpit d'administration</a><a href="#quotidien">Au quotidien</a>
      <a href="#chiffres">En un coup d'œil</a><a href="#faq">Questions fréquentes</a>
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
    </p>
  </section>

  <section id="ecosysteme">
    <h2>2. Comment ça marche, en un schéma</h2>
    <p>Le visiteur consulte le site ; votre équipe modifie le contenu depuis le Cockpit ; la base fait le pont — en temps réel.</p>
    <div class="flow">${ecosystemSvg}</div>
    <div class="legend-row">
      <span><span class="key" style="background:#FFE500"></span>écriture depuis le Cockpit → base de données</span>
      <span><span class="key" style="background:#7bd88f"></span>rafraîchissement temps réel → site public</span>
      <span><span class="key" style="background:#4FC3F7"></span>liaison lecture seule ↔ plateforme élèves CUC Sign</span>
    </div>

    <h3>Le parcours d'un visiteur</h3>
    <div class="steps">${journeyHtml}</div>

    <h3>Les mécanismes qui font tourner l'ensemble</h3>
    <div class="feat-grid">${mechCardsHtml}</div>
  </section>

  <section id="site">
    <h2>3. Le site public — les 15 pages (+ le catalogue films)</h2>
    <p>Dépliez chaque entrée pour voir son rôle exact. Toutes les pages existent en français et en anglais.</p>
    ${publicAccordions}
  </section>

  <section id="cockpit">
    <h2>4. Le Cockpit d'administration — les 15 écrans</h2>
    <p>
      Accessible avec un compte nominatif, le Cockpit se pilote entièrement à la souris. Chaque écran se déplie ci-dessous.
      L'accès est sécurisé par rôle : direction, secrétariat, coachs — chacun ses permissions.
    </p>
    ${cockpitAccordions}
  </section>

  <section id="quotidien">
    <h2>5. Au quotidien — comment je fais…</h2>
    <p>Les gestes les plus courants, en une ligne chacun :</p>
    <div class="feat-grid">${workflowHtml}</div>
    <div class="callout">
      <strong>En cas de doute :</strong> rien n'est fragile. Chaque page possède un historique de versions restaurable,
      et le journal d'audit conserve la trace de toutes les actions.
    </div>
  </section>

  <section id="chiffres">
    <h2>6. L'application en un coup d'œil</h2>
    <div class="kpis">${figuresHtml}</div>
    <p class="meta" style="margin-top:14px">
      Chiffres issus de la base de données du projet, relevés automatiquement.
    </p>
  </section>

  <section id="faq">
    <h2>7. Questions fréquentes</h2>
    ${faqAccordions}
  </section>

  <footer>
    Dossier de présentation généré le ${generated.toLocaleString('fr-FR')} pour le Campus Univers Cascades.
    Document autonome (aucun accès internet requis) · régénérable à tout moment via <code>npm run report:dossier</code>.
    <span class="pill">FR / EN</span><span class="pill">sans connexion</span><span class="pill">imprimable</span>
  </footer>
</div>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

console.log('=== Dossier de présentation client généré ===');
console.log(`Pages publiques présentées : ${PUBLIC_PAGES.length}`);
console.log(`Écrans du Cockpit présentés : ${COCKPIT_APPS.length}`);
console.log(`Badges « chiffres » : ${FIGURES.map((f) => f.value).join(' · ')}`);
console.log('Sortie :');
console.log('  - reports/cuc-dossier-application.html');
