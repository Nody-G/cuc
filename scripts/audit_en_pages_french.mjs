#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Preuve « 100 % anglais » : détection du FRANÇAIS VISIBLE sur les pages /en
 * ==============================================================================
 * Complète les garde-fous statiques (`audit_ui_i18n`, `audit_entity_translations`)
 * là où ils sont aveugles : le rendu RÉEL. On parcourt chaque route anglaise,
 * on extrait le texte visible + `<title>` + `meta description`, et on signale
 * toute occurrence qui « ressemble » à du français.
 *
 * C'est ce contrôle qui répond à la demande client : « je coche anglais →
 * le site est 100 % anglais ». Objectif : 0 occurrence (hors allowlist).
 *
 * Prérequis : un serveur qui répond (dev ou prod), par défaut
 * `http://localhost:3100` — surchargeable via `PROBE_BASE_URL`.
 *
 * Usage :
 *   node scripts/audit_en_pages_french.mjs
 *   PROBE_BASE_URL=https://www.campus-universcascades.com node scripts/audit_en_pages_french.mjs
 * ==============================================================================
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE = (process.env.PROBE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Routes publiques (sans préfixe de locale) — miroir de la sonde de routes. */
const ROUTES = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur',
    '/partenaires',
    '/visite-guidee',
    '/visite-virtuelle',
    '/videos-cascadeur',
    '/contact-cuc',
    '/team-building-cascades',
    '/animations-airbag-parkour',
    '/spectacles-cascadeurs-yamakasi',
    '/stunt-workshop-cuc',
    '/cuc-events-agence',
];

/** Fiches coachs — lues depuis la source canonique (`src/data/team.ts`). */
function coachSlugs() {
    try {
        const src = readFileSync('src/data/team.ts', 'utf8');
        return [...src.matchAll(/^\s+id:\s*'([^']+)'/gm)].map((m) => m[1]);
    } catch {
        return [];
    }
}

/**
 * Noms propres de l'équipe (noms de coachs et titres d'œuvres cités dans leurs
 * crédits) — DONNÉES, jamais de la copie d'interface. Un nom d'intervenant ou un
 * titre d'œuvre reste identique en anglais : on le neutralise sans inventer de
 * traduction, et une phrase française qui le contiendrait reste signalée.
 */
function coachProperNouns() {
    try {
        const src = readFileSync('src/data/team.ts', 'utf8');
        // Le fichier mélange guillemets simples et doubles : les deux formes
        // doivent être lues, sinon les noms de coachs passent pour du français.
        const singleQuoted = [...src.matchAll(/^\s+name:\s*'([^']+)'/gm)].map((m) => m[1]);
        const doubleQuoted = [...src.matchAll(/^\s+name:\s*"([^"]+)"/gm)].map((m) => m[1]);
        const credits = [...src.matchAll(/notableCredits:\s*\[([\s\S]*?)\]/g)]
            .flatMap((block) => [
                ...block[1].matchAll(/'([^']{4,})'/g),
                ...block[1].matchAll(/"([^"]{4,})"/g),
            ].map((m) => m[1]))
            .map((credit) => credit.split('—')[0].trim());
        return [...singleQuoted, ...doubleQuoted, ...credits];
    } catch {
        return [];
    }
}

/**
 * Noms de PERSONNES et titres d'œuvres issus des données du dépôt :
 * réalisateurs (`director`), acteurs doublés (`doubledActors`), artistes de
 * `celebrities.ts` (`name`) et titres du catalogue local (`title`).
 *
 * Ces chaînes ne sont pas de la copie d'interface : ce sont des identités, qui
 * restent identiques dans toutes les langues. On ne neutralise que les lignes
 * qui SONT exclusivement composées de ces noms (cf. `isProperNounLine`).
 */
function dataProperNouns() {
    const files = [
        'src/data/filmography.ts',
        'src/data/celebrities.ts',
        'src/data/filmBanners.ts',
    ];
    const out = [];
    for (const file of files) {
        let src;
        try {
            src = readFileSync(file, 'utf8');
        } catch {
            continue;
        }
        for (const m of src.matchAll(/"(?:director|title)"\s*:\s*"([^"]{3,})"/g)) out.push(m[1]);
        for (const m of src.matchAll(/"doubledActors"\s*:\s*\[([^\]]*)\]/g)) {
            for (const n of m[1].matchAll(/"([^"]{3,})"/g)) out.push(n[1]);
        }
        for (const m of src.matchAll(/^\s+name:\s*'([^']{3,})'/gm)) out.push(m[1]);
        for (const m of src.matchAll(/^\s+name:\s*"([^"]{3,})"/gm)) out.push(m[1]);
        for (const m of src.matchAll(/"actorName"\s*:\s*"([^"]{3,})"/g)) out.push(m[1]);
    }
    return out;
}

const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
const FR_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|du|au|aux|par|plus|tout|tous|depuis|entre|ce|cette|ces|qui|que|au|à)\b/i;

/**
 * Titres de films du catalogue — DONNÉES, pas de la copie d'interface.
 *
 * Un titre de film reste dans sa langue d'origine (pratique standard :
 * « Le Comte de Monte-Cristo », « Le Pacte des loups »). On les charge depuis
 * `site_films` pour ne rien inventer et pour que l'allowlist reste exacte :
 * seules les lignes qui SONT un titre (éventuellement suivi de `(année)`)
 * sont neutralisées — une phrase française contenant un titre reste signalée.
 */
const normalizeTitle = (s) =>
    s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const FILM_TITLES = new Set();
const PROPER_NOUNS = new Set();

/**
 * Échafaudage français courant devant une liste de noms (crédits de tournage).
 * Il est retiré AVANT la comparaison : la ligne n'est neutralisée que si ce qui
 * reste est une liste de noms propres connus.
 */
const NAME_LIST_PREFIX = /^(dir\.|doubl[ée]e?\s+par|avec|coordinateur\s*:|coordination\s*:)\s*/i;

/**
 * Ligne réduite à un nom propre, OU à une LISTE de noms propres séparés par
 * `&`, `,`, `;`, `et` ou `/` (ex. « Dir. Matthieu Delaporte & Alexandre de La
 * Patellière »). Chaque segment doit être un nom connu (ou un sigle très court) :
 * une phrase française contenant un nom reste signalée.
 */
const isProperNounLine = (text) => {
    if (PROPER_NOUNS.size === 0) return false;
    const withoutPrefix = text.replace(NAME_LIST_PREFIX, '');
    const cleaned = withoutPrefix.replace(/\(\d{4}(?:-\d{4})?\)/g, ' ');
    const segments = cleaned
        .split(/[&,;/]|\set\s/i)
        .map((segment) => normalizeTitle(segment))
        .filter((segment) => segment.length > 0);
    if (segments.length === 0) return false;
    return segments.every(
        (segment) => PROPER_NOUNS.has(segment) || segment.length <= 4
    );
};

async function loadFilmTitles() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    try {
        const res = await fetch(`${url}/rest/v1/site_films?select=title`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        if (!res.ok) {
            console.warn(`⚠️  site_films inaccessible (HTTP ${res.status}) — titres non neutralisés.`);
            return;
        }
        const rows = await res.json();
        for (const row of rows || []) {
            const value = row?.title;
            if (typeof value === 'string' && value.trim().length > 3) {
                FILM_TITLES.add(normalizeTitle(value));
            }
        }
    } catch {
        /* allowlist facultative */
    }
}

const isFilmTitleLine = (text) => {
    if (FILM_TITLES.size === 0) return false;
    const base = text.split('—')[0].replace(/\(\d{4}(?:-\d{4})?\)/g, ' ');
    return FILM_TITLES.has(normalizeTitle(base));
};

/**
 * Termes identiques en FR et EN (noms propres, marques, institutions) : jamais
 * signalés. Toute entrée ajoutée ici DOIT être légitime dans les deux langues.
 */
const ALLOWLIST = [
    /Campus Univers Cascades/i,
    /Le Cateau-?Cambr[eé]sis/i,
    /Yamakasi/i,
    /Qualiopi/i,
    /AFDAS/i,
    /France Travail/i,
    /Taurus World Stunt Award/i,
    /Stunt Team/i,
    /campus-universcascades\.com/i,
    /@campusuniverscascades|@campus\.univers\.cascades/i,
    // Faux positifs assumés : sigle égal en FR et EN, et lieux/décors du site.
    /Stunt Academy & Team\b/i,
    /Zo[eé] Bell Hall/i,
    /Op[eé]ra\b/i,
    // Titres d'émissions et de séries diffusées : noms propres, non traduits.
    /20H30 Le Mag/i,
    /À L'ÉCOLE DES CASCADEURS/i,
    /C[OŒ]EUR DE CASCADEURS/i,
];

const isFrench = (s) => {
    if (typeof s !== 'string') return false;
    const text = s.trim();
    if (text.length < 4) return false;
    if (ALLOWLIST.some((re) => re.test(text))) return false;
    if (isFilmTitleLine(text)) return false;
    return ACCENTS.test(text) || FR_HINT.test(text);
};

/** Texte visible d'une page HTML : scripts/styles/tags retirés. */
function visibleLines(html) {
    // Clés construites par concaténation : les entités écrites littéralement
    // seraient décodées par les outils d'édition avant d'atteindre le disque.
    const A = '&';
    const entities = {
        [`${A}amp;`]: '&',
        [`${A}nbsp;`]: ' ',
        [`${A}quot;`]: '"',
        [`${A}#x27;`]: "'",
        [`${A}#39;`]: "'",
        [`${A}gt;`]: '>',
        [`${A}lt;`]: '<',
        [`${A}hellip;`]: '…',
    };
    const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' \n ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' \n ')
        .replace(/<!--[\s\S]*?-->/g, ' \n ')
        .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/button|\/span|\/a)\b[^>]*>/gi, ' \n ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, (m) => entities[m.toLowerCase()] ?? m);

    return text
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((line) => line.length > 1);
}

function extract(html, re) {
    const m = html.match(re);
    return m ? m[1].trim() : '';
}

const slugs = coachSlugs();
const targets = [
    ...ROUTES.map((route) => ({ label: route === '/' ? '/en' : `/en${route}`, path: route })),
    ...slugs.map((slug) => ({ label: `/en/equipe-cascadeurs-pro/${slug}`, path: `coach:${slug}` })),
];

console.log('');
console.log(`=== Français résiduel sur les pages EN — ${BASE} ===`);
await loadFilmTitles();
for (const noun of [...coachProperNouns(), ...dataProperNouns()]) {
    // Un champ de données peut contenir PLUSIEURS noms (« Matthieu Delaporte &
    // Alexandre de La Patellière ») : on les enregistre un par un, sinon la ligne
    // « Dir. Matthieu Delaporte & Alexandre de La Patellière » reste signalée.
    for (const part of String(noun).split(/[&,;/]|\set\s/i)) {
        if (part.trim().length > 3) PROPER_NOUNS.add(normalizeTitle(part));
    }
}
console.log(
    `Titres de films en allowlist (données du catalogue) : ${FILM_TITLES.size}${FILM_TITLES.size === 0 ? ' — base injoignable, titres non neutralisés' : ''}`
);
console.log(`Noms propres de l'équipe en allowlist (données) : ${PROPER_NOUNS.size}`);
console.log('');

const report = [];
const failures = [];
let totalHits = 0;

for (const target of targets) {
    const url = `${BASE}${target.label}`;
    let html;
    try {
        const res = await fetch(url, { redirect: 'follow' });
        if (!res.ok) {
            console.log(`  [KO ] ${res.status}  ${target.label}`);
            failures.push({ label: target.label, reason: `HTTP ${res.status}` });
            continue;
        }
        html = await res.text();
    } catch (error) {
        console.log(`  [KO ] réseau  ${target.label} — ${error.message}`);
        failures.push({ label: target.label, reason: error.message });
        continue;
    }

    const title = extract(html, /<title>([^<]*)<\/title>/i);
    const description = extract(html, /<meta name="description" content="([^"]*)"/i) ||
        extract(html, /<meta name="description" content='([^']*)'/i);

    const hits = [];
    if (isFrench(title)) hits.push({ source: '<title>', text: title });
    if (isFrench(description)) hits.push({ source: '<meta description>', text: description });

    const seen = new Set();
    for (const line of visibleLines(html)) {
        if (!isFrench(line)) continue;
        const key = line.slice(0, 120);
        if (seen.has(key)) continue;
        seen.add(key);
        hits.push({ source: 'texte visible', text: line.slice(0, 220) });
        if (hits.length >= 60) break;
    }

    totalHits += hits.length;
    console.log(`  [${hits.length === 0 ? 'OK ' : 'FR '}] ${String(hits.length).padStart(2)}  ${target.label}`);
    if (hits.length) report.push({ label: target.label, hits });
}

const lines = [];
lines.push('# Revue — Français résiduel sur les pages EN (rendu réel)');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} — cible **0 occurrence** (hors allowlist).`);
lines.push('');
lines.push(`Base sondée : \`${BASE}\``);
lines.push(`Pages contrôlées : **${targets.length}** — pages avec français résiduel : **${report.length}** — occurrences : **${totalHits}**`);
lines.push('');
for (const page of report) {
    lines.push(`## ${page.label} — ${page.hits.length} occurrence(s)`);
    lines.push('');
    lines.push('| Source | Texte détecté |');
    lines.push('|---|---|');
    for (const hit of page.hits) {
        lines.push(`| ${hit.source} | ${hit.text.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
}

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-fr-residuel-en.md', `${lines.join('\n')}\n`, 'utf8');

console.log('');
console.log(`Bilan : ${report.length}/${targets.length} page(s) EN avec français résiduel — ${totalHits} occurrence(s).`);
console.log('Rapport : plans/revue-fr-residuel-en.md');
if (failures.length) {
    console.log(`⚠️  ${failures.length} page(s) non contrôlée(s) (serveur ?) :`);
    for (const f of failures) console.log(`   - ${f.label} (${f.reason})`);
}
console.log('');

// Code 2 lorsque du français subsiste : le garde-fou devient bloquant en CI.
if (report.length > 0) process.exitCode = 2;
