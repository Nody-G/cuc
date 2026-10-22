/**
 * SCHÉMAS ANIMÉS SVG & GRAPHIQUES COMPARATIFS DU DOSSIER CUC
 * ==========================================================
 *
 * Responsabilité :
 *   Produire les représentations visuelles (SVG animés CSS et barres
 *   comparatives Avant/Après) qui illustrent l'architecture, le Mode Studio,
 *   la cascade de résilience, les gains de performance et le cycle candidat.
 */

import { esc } from './dossier-data.mjs';

const svgBox = (x, y, w, h, title, sub, accent = '#2a2a38') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="#101018" stroke="${accent}" stroke-width="1.6"/>
  <text x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">${esc(title)}</text>
  <text x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle" fill="#9a9aa8" font-size="11">${esc(sub)}</text>`;

/**
 * 1. Schéma global de l'écosystème (Visiteur, Cache SSR, Cockpit/Studio, Supabase, Meta, CUC Sign).
 */
export function buildEcosystemSvg(cockpitCount = 27) {
  return `
<svg viewBox="0 0 960 360" class="chart" role="img" aria-label="Architecture : Visiteur, Site Vitrine en cache, Cockpit et Mode Studio, Base Supabase, API Meta Instagram et plateforme CUC Sign">
  <!-- Liaisons de fond -->
  <path d="M160 120 H 235" fill="none" stroke="#3a3a48" stroke-width="2"/>
  <path d="M445 100 C 495 100, 505 145, 545 155" fill="none" stroke="#2a2a38" stroke-width="2.4"/>
  <path class="flowline" style="stroke:#4ade80" d="M545 155 C 505 145, 495 100, 445 100"/>
  <path d="M445 255 C 495 255, 505 205, 545 195" fill="none" stroke="#2a2a38" stroke-width="2.4"/>
  <path class="flowline" style="stroke:#FFE500" d="M445 255 C 495 255, 505 205, 545 195"/>
  <path d="M745 155 H 805" fill="none" stroke="#2a2a38" stroke-width="2.4"/>
  <path class="flowline" style="stroke:#38bdf8" d="M745 155 H 805"/>
  <path d="M805 190 H 745" fill="none" stroke="#2a2a38" stroke-width="2.4"/>
  <path class="flowline" style="stroke:#38bdf8; opacity:.65" d="M805 190 H 745"/>
  <path d="M645 85 V 125" fill="none" stroke="#2a2a38" stroke-width="2.2"/>
  <path class="flowline" style="stroke:#f472b6" d="M645 85 V 125"/>

  <!-- Boîtes -->
  ${svgBox(24, 78, 136, 84, 'Visiteur', 'Web & Mobile · FR/EN')}
  ${svgBox(235, 56, 210, 88, 'Site Vitrine (Cache)', '16 routes · 0 WebSocket public', '#4ade80')}
  ${svgBox(235, 210, 210, 92, 'Cockpit & Mode Studio', `${cockpitCount} écrans · édition sur page`, '#FFE500')}
  ${svgBox(545, 125, 200, 100, 'Base Supabase', 'PostgreSQL + Médias WebP', '#FFE500')}
  ${svgBox(555, 20, 180, 64, 'API Meta Instagram', 'Abonnés & Reels en direct', '#f472b6')}
  ${svgBox(805, 125, 132, 100, 'CUC Sign', 'Gestion de l’école', '#38bdf8')}

  <circle class="halo" cx="645" cy="175" r="74" fill="none" stroke="#FFE500" stroke-width="1.3" opacity="0.25"/>
  <text x="480" y="336" text-anchor="middle" fill="#8c8c9a" font-size="11.5">
    Les visiteurs reçoivent des pages pré-calculées ultra-légères ; le Cockpit invalide instantanément le cache français et anglais à chaque publication.
  </text>
</svg>`;
}

/**
 * 2. Schéma du Mode Studio (édition visuelle en place + typographie miroir + sauvegarde atomique).
 */
export function buildStudioModeSvg() {
  return `
<svg viewBox="0 0 940 310" class="chart" role="img" aria-label="Fonctionnement du Mode Studio : barre d'outils Cockpit, aperçu interactif avec saisie en place et publication atomique">
  <rect x="20" y="20" width="900" height="270" rx="16" fill="#0b0b12" stroke="#252532"/>
  <!-- Barre supérieure du Mode Studio -->
  <rect x="20" y="20" width="900" height="44" rx="16" fill="#13131d"/>
  <circle cx="44" cy="42" r="5" fill="#f87171"/><circle cx="60" cy="42" r="5" fill="#fbbf24"/><circle cx="76" cy="42" r="5" fill="#4ade80"/>
  <text x="102" y="47" fill="#fff" font-size="12.5" font-weight="700">Mode Studio — Aperçu Interactif (?cuc-preview=1)</text>
  <rect x="430" y="30" width="92" height="24" rx="12" fill="rgba(255,229,0,.14)" stroke="#FFE500"/>
  <text x="476" y="46" text-anchor="middle" fill="#FFE500" font-size="11" font-weight="700">✎ Édition</text>
  <rect x="532" y="30" width="96" height="24" rx="12" fill="#1b1b26" stroke="#343446"/>
  <text x="580" y="46" text-anchor="middle" fill="#c4c4d0" font-size="11">FR ↔ EN</text>
  <rect x="638" y="30" width="118" height="24" rx="12" fill="rgba(74,222,128,.12)" stroke="#4ade80"/>
  <text x="697" y="46" text-anchor="middle" fill="#4ade80" font-size="11" font-weight="600">✓ 100 % cliquables</text>
  <rect x="790" y="29" width="112" height="26" rx="13" fill="#FFE500"/>
  <text x="846" y="46" text-anchor="middle" fill="#111" font-size="11.5" font-weight="800">Enregistrer</text>

  <!-- Étape 1 : Clic sur la page -->
  <rect x="44" y="84" width="268" height="182" rx="12" fill="#11111a" stroke="#FFE500" stroke-dasharray="5 4"/>
  <text x="62" y="110" fill="#FFE500" font-size="10.5" font-weight="700">1. CLIC DIRECT SUR LA PAGE</text>
  <text x="62" y="136" fill="#fff" font-size="15" font-weight="700">Typographie miroir</text>
  <text x="62" y="158" fill="#a2a2b0" font-size="11.5">Le titre s’édite dans sa vraie police,</text>
  <text x="62" y="175" fill="#a2a2b0" font-size="11.5">taille et couleur sur la page même.</text>
  <rect x="62" y="194" width="232" height="28" rx="6" fill="#191926" stroke="#343446"/>
  <text x="74" y="212" fill="#ffef9e" font-size="11">Tab / Maj+Tab : champ suivant</text>
  <text x="62" y="246" fill="#8c8c9a" font-size="11">442 textes annotés · 0 texte figé</text>

  <!-- Flèche 1 -> 2 -->
  <path class="flowline" style="stroke:#FFE500" d="M316 175 H 352"/>

  <!-- Étape 2 : Brouillon mémoire -->
  <rect x="356" y="84" width="256" height="182" rx="12" fill="#11111a" stroke="#2d2d3d"/>
  <text x="374" y="110" fill="#38bdf8" font-size="10.5" font-weight="700">2. BROUILLON PROTÉGÉ</text>
  <text x="374" y="136" fill="#fff" font-size="15" font-weight="700">Zéro écriture prématurée</text>
  <text x="374" y="158" fill="#a2a2b0" font-size="11.5">Vos essais restent en mémoire locale</text>
  <text x="374" y="175" fill="#a2a2b0" font-size="11.5">(filet 7 jours) tant que vous ne publiez pas.</text>
  <rect x="374" y="194" width="220" height="28" rx="6" fill="#191926" stroke="#343446"/>
  <text x="386" y="212" fill="#9ee6a8" font-size="11">Ctrl+Z / Ctrl+Y : annuler / rétablir</text>
  <text x="374" y="246" fill="#8c8c9a" font-size="11">Comparateur de modifications intégré</text>

  <!-- Flèche 2 -> 3 -->
  <path class="flowline" style="stroke:#4ade80" d="M616 175 H 652"/>

  <!-- Étape 3 : Publication & Historique -->
  <rect x="656" y="84" width="240" height="182" rx="12" fill="#11111a" stroke="#4ade80"/>
  <text x="674" y="110" fill="#4ade80" font-size="10.5" font-weight="700">3. PUBLICATION & RÉVISION</text>
  <text x="674" y="136" fill="#fff" font-size="15" font-weight="700">Instantané + Version</text>
  <text x="674" y="158" fill="#a2a2b0" font-size="11.5">Enregistre en base, crée une version</text>
  <text x="674" y="175" fill="#a2a2b0" font-size="11.5">restaurable et rafraîchit FR + EN.</text>
  <rect x="674" y="194" width="204" height="28" rx="6" fill="#191926" stroke="#343446"/>
  <text x="686" y="212" fill="#fff" font-size="11">Anti-conflit entre 2 onglets</text>
  <text x="674" y="246" fill="#8c8c9a" font-size="11">Retour arrière en 1 clic à tout moment</text>
</svg>`;
}

/**
 * 3. Graphiques comparatifs de performance (Octobre 2026 : JS -42%, HTML -75%, Médias -71%).
 */
export function buildPerformanceChartsHtml() {
  return `
  <div class="perf-grid">
    <div class="perf-card reveal">
      <h4><span>Code JavaScript au 1er affichage</span><span class="perf-gain">−42 %</span></h4>
      <div class="perf-sub">Chargement différé de Supabase, Three.js 3D et Framer Motion hors du premier écran</div>
      <div class="bar-row">
        <div class="bar-meta"><span>Avant optimisation (septembre 2026)</span><strong>438 Ko gzip</strong></div>
        <div class="bar-track"><div class="bar-fill before" style="width:100%"></div></div>
      </div>
      <div class="bar-row">
        <div class="bar-meta"><span>Aujourd’hui (routes vitrine)</span><strong>231 à 270 Ko gzip</strong></div>
        <div class="bar-track"><div class="bar-fill after" style="width:58%"></div></div>
      </div>
    </div>

    <div class="perf-card reveal">
      <h4><span>Poids HTML des fiches coachs</span><span class="perf-gain">−75 %</span></h4>
      <div class="perf-sub">Pagination progressive (24 films affichés d’emblée + bouton « Voir toute la filmographie »)</div>
      <div class="bar-row">
        <div class="bar-meta"><span>Avant (tous les films injectés d’un bloc)</span><strong>832 Ko / fiche</strong></div>
        <div class="bar-track"><div class="bar-fill before" style="width:100%"></div></div>
      </div>
      <div class="bar-row">
        <div class="bar-meta"><span>Aujourd’hui (−10,2 Mo sur les 19 profils)</span><strong>207 Ko / fiche</strong></div>
        <div class="bar-track"><div class="bar-fill after" style="width:25%"></div></div>
      </div>
    </div>

    <div class="perf-card reveal">
      <h4><span>Stockage Média & Affiches</span><span class="perf-gain">−71 %</span></h4>
      <div class="perf-sub">Conversion WebP automatique dans le navigateur à l’import + négatifs sous <code>_originals</code></div>
      <div class="bar-row">
        <div class="bar-meta"><span>Bucket vitrine avant recompression</span><strong>90,54 Mo</strong></div>
        <div class="bar-track"><div class="bar-fill before" style="width:100%"></div></div>
      </div>
      <div class="bar-row">
        <div class="bar-meta"><span>Bucket vitrine après cure WebP</span><strong>26,32 Mo</strong></div>
        <div class="bar-track"><div class="bar-fill after" style="width:29%"></div></div>
      </div>
    </div>
  </div>`;
}

/**
 * 4. Schéma de la cascade de résilience (« Zéro Page Morte / Zéro Texte Blanc »).
 */
export function buildResilienceCascadeSvg() {
  const steps = [
    { x: 35, c: '#38bdf8', n: 'Niveau 1', t: 'Surcharge Anglaise', s: 'site_translations (1 660 entrées)' },
    { x: 265, c: '#FFE500', n: 'Niveau 2', t: 'Contenu Cockpit', s: 'site_pages & site_settings' },
    { x: 495, c: '#a855f7', n: 'Niveau 3', t: 'Catalogue Micro-textes', s: '442 libellés éditables FR/EN' },
    { x: 725, c: '#4ade80', n: 'Niveau 4 (Secours)', t: 'Copie Certifiée Code', s: 'DEFAULT_PAGE_CONTENTS' },
  ];
  return `
<svg viewBox="0 0 940 145" class="chart" role="img" aria-label="Cascade de résilience à 4 niveaux garantissant zéro texte vide et zéro panne d'affichage">
  <path d="M220 68 H 260 M450 68 H 490 M680 68 H 720" stroke="#FFE500" stroke-width="2.2" stroke-dasharray="4 4"/>
  ${steps
    .map(
      (s) => `
    <rect x="${s.x}" y="22" width="185" height="92" rx="12" fill="#101018" stroke="${s.c}" stroke-width="1.6"/>
    <text x="${s.x + 92}" y="46" text-anchor="middle" fill="${s.c}" font-size="10.5" font-weight="800">${esc(s.n)}</text>
    <text x="${s.x + 92}" y="70" text-anchor="middle" fill="#fff" font-size="13.5" font-weight="700">${esc(s.t)}</text>
    <text x="${s.x + 92}" y="92" text-anchor="middle" fill="#9a9aa8" font-size="10.8">${esc(s.s)}</text>`
    )
    .join('')}
</svg>`;
}

/**
 * 5. Schéma animé du cycle d'une demande (Formulaire -> Pipeline Cockpit -> Historique -> CUC Sign).
 */
export function buildRequestCycleSvg() {
  const steps = [
    { x: 110, n: '1', t: 'Le visiteur écrit', s: 'formulaire épuré & guidé' },
    { x: 295, n: '2', t: 'Tri par pipeline', s: 'Formation · Tournage · Event' },
    { x: 480, n: '3', t: 'Mémoire candidat', s: 'dossiers antérieurs détectés' },
    { x: 665, n: '4', t: 'Qualification', s: 'statut, notes & réponse' },
    { x: 840, n: '5', t: 'Admission 1-clic', s: 'dossier élève CUC Sign' },
  ];
  const delays = ['0.3s', '2.6s', '4.9s', '7.2s', '9.5s'];
  return `
<svg viewBox="0 0 950 170" class="chart" role="img" aria-label="Cycle d'une demande : formulaire, tri par pipeline, détection d'historique candidat, qualification et conversion CUC Sign">
  <path d="M110 62 H 840" stroke="#2a2a33" stroke-width="2" stroke-dasharray="6 7"/>
  <path class="rc-fill" d="M110 62 H 840"/>
  ${steps
    .map(
      (p, i) => `
    <circle class="rc-ping" cx="${p.x}" cy="62" r="24" style="animation-delay:${delays[i]}"/>
    <circle class="rc-node" cx="${p.x}" cy="62" r="24" fill="#12121a" stroke="#3a3a44" stroke-width="2" style="animation-delay:${delays[i]}"/>
    <text x="${p.x}" y="68" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">${p.n}</text>
    <text x="${p.x}" y="112" text-anchor="middle" fill="#fff" font-size="12.5" font-weight="600">${p.t}</text>
    <text x="${p.x}" y="130" text-anchor="middle" fill="#9a9aa5" font-size="11">${p.s}</text>`
    )
    .join('')}
  <g class="flowmsg" style="offset-path: path('M110 62 H 840')">
    <rect x="-17" y="-13" width="34" height="26" rx="7" fill="#FFE500"/>
    <path d="M-11 -5 L0 3 L11 -5" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}
