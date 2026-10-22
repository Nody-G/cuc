#!/usr/bin/env node
/**
 * DOSSIER DE PRÉSENTATION CLIENT — L'APPLICATION DU CAMPUS UNIVERS CASCADES
 * =========================================================================
 *
 * Version 6 (Octobre 2026) — Refonte complète et architecture modulaire :
 *   - `scripts/lib/dossier/dossier-data.mjs`              (collecte Supabase + JSON)
 *   - `scripts/lib/dossier/dossier-styles.mjs`            (design system & print)
 *   - `scripts/lib/dossier/dossier-diagrams.mjs`          (schémas SVG & barres Avant/Après)
 *   - `scripts/lib/dossier/dossier-sections-vitrine.mjs`  (chapitres 1 à 5)
 *   - `scripts/lib/dossier/dossier-sections-cockpit.mjs`  (chapitres 6 à 8 : Mode Studio, 3D, Cockpit)
 *   - `scripts/lib/dossier/dossier-sections-ingenierie.mjs` (chapitres 9 à 14 : qualité, perf, gouvernance)
 *   - `scripts/lib/cuc-sign-dossier.mjs`                  (chapitre 15 : CUC Sign)
 *
 * Régénération : `npm run report:dossier`
 * Sortie       : `reports/cuc-dossier-application.html`
 */

import fs from 'node:fs';
import path from 'node:path';

import { esc, nf, icon, featCard, kpiHtml, loadDossierData } from './lib/dossier/dossier-data.mjs';
import { DOSSIER_STYLES } from './lib/dossier/dossier-styles.mjs';
import { PUBLIC_PAGES, buildVitrineSections } from './lib/dossier/dossier-sections-vitrine.mjs';
import { COCKPIT_APPS, buildCockpitSections } from './lib/dossier/dossier-sections-cockpit.mjs';
import { GLOSSARY, FAQ, buildIngenierieSections } from './lib/dossier/dossier-sections-ingenierie.mjs';
import { buildCucSignContent } from './lib/cuc-sign-dossier.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'reports', 'cuc-dossier-application.html');

const data = await loadDossierData();
const { live, cucSign } = data;
const q = live.quality;

const generated = new Date();
const today = generated.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const stripItems = [
  `${nf(q.films.total)} films vérifiés au catalogue`,
  `${nf(q.team.total)} profils d’équipe & direction (IMDb)`,
  `${nf(live.celebritiesCount)} célébrités doublées reliées aux films`,
  `${PUBLIC_PAGES.length} routes publiques · FR / EN`,
  `${COCKPIT_APPS.length} écrans d’administration + Mode Studio`,
  `${nf(q.translationsTotal)} traductions éditoriales en base`,
  '−42 % de JavaScript au 1er chargement',
  '−75 % de poids HTML sur les fiches coachs',
  '−71 % de poids média grâce au WebP navigateur',
  '1 188 vérifications automatiques',
];

const stripHtml = [...stripItems, ...stripItems]
  .map((x) => `<span>${esc(x)}</span><span class="sep">◆</span>`)
  .join('');

const vitrineHtml = buildVitrineSections({ cockpitCount: COCKPIT_APPS.length });
const cockpitHtml = buildCockpitSections(data);
const ingenierieHtml = buildIngenierieSections(data);
const cucSignHtml = buildCucSignContent({ esc, nf, icon, featCard, kpiHtml, cucSign });

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Campus Univers Cascades — Dossier complet de l'application</title>
<style>${DOSSIER_STYLES}</style>
</head>
<body>
<a class="totop" href="#top" title="Revenir en haut" aria-label="Revenir en haut">↑</a>
<div class="wrap" id="top">

  <header class="hero">
    <div class="hero-top">
      <div class="kicker"><span class="kicker-dot"></span>Dossier de référence — ${esc(today)}</div>
      <span class="meta">Tél. officiel aligné : <strong>01 30 32 38 03</strong> · Campus <strong>11 000 m²</strong></span>
    </div>
    <h1>L'application du <em>Campus Univers Cascades</em></h1>
    <p class="hero-lead">
      Guide complet et état des lieux de votre écosystème numérique : <strong>site vitrine bilingue (FR / EN)</strong>,
      <strong>Mode Studio d'édition visuelle sur la page</strong>, <strong>Cockpit (${COCKPIT_APPS.length} écrans)</strong>,
      <strong>Studio 3D</strong>, <strong>optimisations de vitesse d'octobre 2026</strong> et passerelle <strong>CUC Sign</strong>.
    </p>

    <div class="toolbar">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input id="dossier-search" class="search-input" type="search" placeholder="Rechercher une page, un écran du Cockpit, une fonctionnalité ou une question (ex. Tournage, Events, 3D, WebP, sauvegarde)…" aria-label="Rechercher dans le dossier"/>
      </div>
      <span id="search-status" class="search-status"></span>
      <button type="button" id="toggle-all-acc" class="btn ghost">Tout déplier</button>
      <button type="button" class="btn" onclick="window.print()">Imprimer / PDF</button>
    </div>

    <div class="strip" aria-hidden="true"><div class="strip-inner">${stripHtml}</div></div>

    <nav class="toc" aria-label="Sommaire du dossier">
      <a href="#vue">1. Pourquoi ce site</a>
      <a href="#comparaison">2. Avant / Après</a>
      <a href="#ecosysteme">3. Architecture</a>
      <a href="#carte">4. Menu intelligent</a>
      <a href="#site">5. Les ${PUBLIC_PAGES.length} routes</a>
      <a href="#studio">6. Mode Studio & 3D</a>
      <a href="#cockpit">7. Le Cockpit (${COCKPIT_APPS.length})</a>
      <a href="#quotidien">8. Au quotidien</a>
      <a href="#contenus">9. Catalogue & IMDb</a>
      <a href="#capot">10. Vitesse & Médias</a>
      <a href="#gestion">11. Rôles & Sauvegarde</a>
      <a href="#pratiques">12. Bonnes pratiques</a>
      <a href="#glossaire">13. Glossaire</a>
      <a href="#faq">14. FAQ</a>
      <a href="#cuc-sign">15. CUC Sign</a>
    </nav>
  </header>

  ${vitrineHtml}
  ${cockpitHtml}
  ${ingenierieHtml}

  <section id="cuc-sign">
    <h2>15. CUC Sign — la plateforme pédagogique de l'école</h2>
    ${cucSignHtml}
  </section>

  <footer>
    Dossier généré le ${generated.toLocaleString('fr-FR')} pour le <strong>Campus Univers Cascades</strong> (Lucas Dollfus).
    Document 100 % autonome (consultable hors connexion et imprimable en PDF) · régénérable via <code>npm run report:dossier</code>.<br/>
    <div style="margin-top:8px">
      <span class="pill">FR / EN bilingue</span>
      <span class="pill">Mode Studio</span>
      <span class="pill">−42 % JS · −75 % HTML</span>
      <span class="pill">1 188 tests validés</span>
    </div>
  </footer>
</div>

<script>
  /* 1. Compteurs animés à l'entrée dans le champ de vision */
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
          var p = Math.min(1, (now - start) / 850);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('fr-FR');
          if (p < 1) requestAnimationFrame(step);
          else el.classList.add('done');
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* 2. Recherche instantanée dans tout le dossier + bouton Tout déplier/replier */
  (function () {
    var input = document.getElementById('dossier-search');
    var status = document.getElementById('search-status');
    var toggleBtn = document.getElementById('toggle-all-acc');
    var allDetails = Array.prototype.slice.call(document.querySelectorAll('details.acc'));
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    var expanded = false;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        expanded = !expanded;
        allDetails.forEach(function (d) { d.open = expanded; });
        toggleBtn.textContent = expanded ? 'Tout replier' : 'Tout déplier';
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        var q = (input.value || '').trim().toLowerCase();
        var matches = 0;
        filterItems.forEach(function (item) {
          var txt = (item.textContent || '').toLowerCase();
          var hit = !q || txt.indexOf(q) !== -1;
          item.style.display = hit ? '' : 'none';
          if (hit) matches++;
          if (item.tagName === 'DETAILS' && q) item.open = hit;
        });
        if (status) {
          status.style.display = q ? 'inline' : 'none';
          status.textContent = q ? (matches + ' résultat(s)') : '';
        }
      });
    }

    /* 3. Filtres par pôle sur les 27 écrans du Cockpit */
    var groupBtns = Array.prototype.slice.call(document.querySelectorAll('[data-group-btn]'));
    var cockpitItems = Array.prototype.slice.call(document.querySelectorAll('#cockpit-list details.acc'));
    groupBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = btn.getAttribute('data-group-btn');
        groupBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        cockpitItems.forEach(function (item) {
          var ig = item.getAttribute('data-group');
          item.style.display = (g === 'all' || ig === g) ? '' : 'none';
        });
      });
    });
  })();

  /* 4. Sommaire collant (scrollspy) */
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
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
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

console.log('=== Dossier de présentation client généré (v6 — Architecture Modulaire) ===');
console.log(`Sections : 15 chapitres · Routes publiques : ${PUBLIC_PAGES.length} · Écrans Cockpit : ${COCKPIT_APPS.length} · Glossaire : ${GLOSSARY.length} · FAQ : ${FAQ.length}`);
console.log(`Catalogue live : ${nf(q.films.total)} films (${nf(q.filmsEn)} EN) · ${nf(q.team.total)} profils (${nf(q.team.with_imdb)} IMDb) · ${nf(live.celebritiesCount)} célébrités doublées · ${nf(q.translationsTotal)} traductions`);
console.log(`Sessions live : ${live.sessions.length} lignes datées`);
console.log('Sortie : reports/cuc-dossier-application.html');
