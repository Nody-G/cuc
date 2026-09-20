/**
 * CLASSIFICATION DE L'INVENTAIRE MÉDIA
 * ====================================
 *
 * Lit `scripts/media_inventory.json` (produit par `audit_original_media.mjs`)
 * et classe chaque média en catégories décisionnelles :
 *
 *   - `cuc-visual`      : visuels propres au campus (photos de campus, salles,
 *                         équipements, portraits de coachs, bandeaux CUC).
 *                         → À RAPATRIER (cœur de la vitrine).
 *   - `film-poster`     : affiches de films / visuels de tournages.
 *                         → À RAPATRIER (utilisés par la filmographie).
 *   - `partner-logo`    : logos de partenaires / institutions (Qualiopi, AFDAS,
 *                         France Travail, régions…).
 *                         → À RAPATRIER (utilisés par la section partenaires).
 *   - `third-party`     : ressources techniques tierces (plugins WordPress,
 *                         drapeaux du traducteur, placeholders Instagram).
 *                         → NE PAS RAPATRIER (inutiles, remplacées par le code).
 *   - `document`        : PDF / plaquettes / documents téléchargeables.
 *                         → À RAPATRIER (à héberger dans Supabase Storage).
 *   - `video`           : fichiers vidéo directs (reportages TV).
 *                         → DÉCISION AU CAS PAR CAS (poids très élevé).
 *   - `broken`          : média cassé (HTTP ≥ 400).
 *                         → NE PAS RAPATRIER.
 *
 * Sortie :
 *   - scripts/media_classification.json
 *   - scripts/media_classification.md
 */

import fs from 'fs';
import path from 'path';

const INVENTORY_PATH = path.join('scripts', 'media_inventory.json');

if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`Inventaire introuvable : ${INVENTORY_PATH}`);
    console.error('Lancez d\'abord : node scripts/audit_original_media.mjs');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf-8'));
const inventory = report.inventory;

/** Ressources techniques tierces à ignorer. */
const THIRD_PARTY_PATTERNS = [
    /\/wp-content\/plugins\//i,
    /\/wp-content\/themes\//i,
    /google-language-translator/i,
    /instagram-feed\/img\/placeholder/i,
    /sb-instagram-feed-images/i,
    /\/wp-includes\//i,
];

/** Logos de partenaires / institutions. */
const PARTNER_PATTERNS = [
    /qualiopi/i,
    /afdas/i,
    /france-travail/i,
    /hauts-de-france/i,
    /europacorp/i,
    /gaumont/i,
    /pathe/i,
    /studiocanal/i,
    /nike/i,
    /kiloutou/i,
    /bandes-logos/i,
    /logos-stages/i,
    /logo-cuc-events/i,
    /logo-cuc\./i,
    /favicon/i,
    /cropped-favicon/i,
    /cuc-team-fond-noir/i,
];

/** Visuels propres au campus (photos, salles, équipements, portraits). */
const CUC_VISUAL_PATTERNS = [
    /\/uploads\/\d{4}\/\d{2}\/(?:IMG_|A7409|CUC-5\.0|CUC-TOWER|CUC-Tower|CUC-BRI|CUC-PROD|CUC-Ecole|CUC-session|CUC-TEAM)/i,
    /salle-\d/i,
    /espace-m[eé]canique/i,
    /airbag/i,
    /matelas/i,
    /rigging/i,
    /d[eé]fenestration/i,
    /city-stade/i,
    /man[eè]ge/i,
    /page-campus/i,
    /ecole-de-cascade/i,
    /img-equipe/i,
    /bg-equipe/i,
    /qg-staff/i,
    /slider-\d/i,
    /bandeau/i,
    /bande-affiches-film/i,
    /bandeau-images-films/i,
    /bandeau-films/i,
    /img-formation/i,
    /stage-/i,
    /team-building/i,
    /spectacles/i,
    /parkour/i,
    /xtrem-jump/i,
    /encart-plaquette/i,
    /titre-/i,
    /taux-satisfaction/i,
    /trait-logos/i,
    /bouton-/i,
    /photos-spectacle/i,
    /atelier-cinema/i,
    /freejump/i,
    /zo[eé]-bell-hall/i,
    /happybirthdaycuc/i,
    /reportage/i,
    /stuntrider/i,
    /coeur-de-cascadeurs/i,
    /cuc-session/i,
    /image1/i,
    /presentation-campus/i,
    /bandes-affiches-film/i,
    /img-campus/i,
    /zo[eë]-bell-hall/i,
    /sse-4web/i,
    /nero-\d/i,
    /dos-cuc-tower/i,
    /titres-cuc-prod/i,
    /^https:\/\/www\.campus-universcascades\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/(?:\d{6,}|MG_\d+|A7409\d+|NERO-\d+|1000053\d+|20240612_\d+)/i,
    /\/uploads\/\d{4}\/\d{2}\/00\d\.jpg$/i,
    /zoebell/i,
];

/** Portraits de coachs (fichiers numérotés `NN-prenom.png`). */
const COACH_PORTRAIT = /\/uploads\/\d{4}\/\d{2}\/\d{1,2}-[a-zà-ÿ-]+(?:-ok)?\.png$/i;

/** Affiches de films (titres de films connus + fichiers numérotés `NN-Titre.jpg`). */
const FILM_POSTER_PATTERNS = [
    /\/uploads\/\d{4}\/\d{2}\/\d{1,2}-[A-ZÀ-Ý]/,
    /john-wick/i,
    /mission-impossible/i,
    /fast-furious/i,
    /taken/i,
    /taxi/i,
    /dunkirk/i,
    /valerian/i,
    /james-bond/i,
    /spectre/i,
    /yamakasi/i,
    /lupin/i,
    /dune/i,
    /black-widow/i,
    /uncharted/i,
    /goliath/i,
    /braqueurs/i,
    /family-business/i,
    /bac-nord/i,
    /sentinelle/i,
    /bronx/i,
    /furies/i,
    /machine/i,
    /alibi/i,
    /mortel/i,
    /balle-perdue/i,
    /nikki-larson/i,
    /the-substance/i,
    /the-killer/i,
    /sous-la-seine/i,
    /le-comte-de-montecristo/i,
    /le-salaire-de-la-peur/i,
    /largo-winch/i,
    /stillwater/i,
    /fiasco/i,
    /wednesday/i,
    /murder-mystery/i,
    /overdrive/i,
    /babylone/i,
    /mesrine/i,
    /hunger-games/i,
    /lucy/i,
    /malavita/i,
    /raid-dingue/i,
    /from-paris-with-love/i,
    /danny-the-dog/i,
    /district13/i,
    /transporteur/i,
    /30-jours-max/i,
    /elyas/i,
    /lamour-ouf/i,
    /gtmax/i,
    /6underground/i,
    /355/i,
    /police/i,
    /les-mid[eé]rables/i,
    /bastille-day/i,
    /sk1/i,
    /un-prophete/i,
    /de-lautre-cot/i,
    /3-day-to-kill/i,
    /jason-bourne/i,
    /babylone-ad/i,
];

function classify(item) {
    if (item.status && item.status >= 400) return 'broken';
    if (item.kind === 'document') return 'document';
    if (item.kind === 'video') return 'video';

    const url = item.url;

    if (THIRD_PARTY_PATTERNS.some((re) => re.test(url))) return 'third-party';
    if (COACH_PORTRAIT.test(url)) return 'cuc-visual';
    if (PARTNER_PATTERNS.some((re) => re.test(url))) return 'partner-logo';
    if (FILM_POSTER_PATTERNS.some((re) => re.test(url))) return 'film-poster';
    if (CUC_VISUAL_PATTERNS.some((re) => re.test(url))) return 'cuc-visual';

    return 'unclassified';
}

const DECISION = {
    'cuc-visual': { action: 'RAPATRIER', priority: 1, note: 'Cœur de la vitrine — photos campus, salles, portraits coachs.' },
    'film-poster': { action: 'RAPATRIER', priority: 2, note: 'Affiches utilisées par la filmographie et les tournages.' },
    'partner-logo': { action: 'RAPATRIER', priority: 3, note: 'Logos partenaires / institutions.' },
    document: { action: 'RAPATRIER', priority: 4, note: 'Plaquettes et PDF téléchargeables.' },
    video: { action: 'CAS PAR CAS', priority: 5, note: 'Reportages TV — poids très élevé (60–120 Mo). Décider hébergement.' },
    'third-party': { action: 'IGNORER', priority: 9, note: 'Ressources techniques WordPress, inutiles.' },
    broken: { action: 'IGNORER', priority: 9, note: 'Média cassé (HTTP ≥ 400).' },
    unclassified: { action: 'À EXAMINER', priority: 6, note: 'Non classé automatiquement — revue manuelle.' },
};

const classified = inventory.map((item) => {
    const category = classify(item);
    return { ...item, category, decision: DECISION[category] };
});

classified.sort((a, b) => {
    if (a.decision.priority !== b.decision.priority) return a.decision.priority - b.decision.priority;
    return (b.bytes || 0) - (a.bytes || 0);
});

const groups = {};
for (const item of classified) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
}

function humanBytes(n) {
    if (!n && n !== 0) return '?';
    if (n < 1024) return `${n} o`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
    return `${(n / (1024 * 1024)).toFixed(2)} Mo`;
}

const summary = Object.entries(groups)
    .map(([cat, items]) => ({
        category: cat,
        count: items.length,
        bytes: items.reduce((s, it) => s + (it.bytes || 0), 0),
        action: DECISION[cat].action,
        note: DECISION[cat].note,
    }))
    .sort((a, b) => DECISION[a.category].priority - DECISION[b.category].priority);

const toRapatriate = classified.filter((it) => it.decision.action === 'RAPATRIER');
const totalToRapatriate = toRapatriate.reduce((s, it) => s + (it.bytes || 0), 0);

const out = {
    generatedAt: new Date().toISOString(),
    source: INVENTORY_PATH,
    summary,
    totals: {
        total: classified.length,
        toRapatriate: toRapatriate.length,
        toRapatriateBytes: totalToRapatriate,
        toRapatriateHuman: humanBytes(totalToRapatriate),
    },
    items: classified,
};

fs.writeFileSync(
    path.join('scripts', 'media_classification.json'),
    JSON.stringify(out, null, 2),
    'utf-8'
);

// Rapport Markdown
const md = [];
md.push('# Classification des médias — décision de rapatriement\n');
md.push(`Généré le ${out.generatedAt}\n`);
md.push('## Synthèse par catégorie\n');
md.push('| Catégorie | Nombre | Poids | Décision | Note |');
md.push('| --- | --- | --- | --- | --- |');
for (const s of summary) {
    md.push(`| ${s.category} | ${s.count} | ${humanBytes(s.bytes)} | **${s.action}** | ${s.note} |`);
}
md.push('');
md.push(`**Total à rapatrier : ${toRapatriate.length} médias — ${humanBytes(totalToRapatriate)}**\n`);

for (const s of summary) {
    const items = groups[s.category];
    md.push(`## ${s.category} — ${s.action} (${items.length})\n`);
    md.push('| Poids | URL | Pages |');
    md.push('| --- | --- | --- |');
    for (const it of items) {
        md.push(`| ${humanBytes(it.bytes)} | \`${it.url}\` | ${it.pages.join(', ')} |`);
    }
    md.push('');
}

fs.writeFileSync(path.join('scripts', 'media_classification.md'), md.join('\n'), 'utf-8');

console.log('=== CLASSIFICATION ===\n');
for (const s of summary) {
    console.log(`${s.category.padEnd(16)} ${String(s.count).padStart(4)}  ${humanBytes(s.bytes).padStart(10)}  → ${s.action}`);
}
console.log(`\nTotal à rapatrier : ${toRapatriate.length} médias (${humanBytes(totalToRapatriate)})`);
console.log('\nÉcrit : scripts/media_classification.json');
console.log('Écrit : scripts/media_classification.md');
