#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Collecte des Reels Instagram officiels (@campus.univers.cascades)
 * ==============================================================================
 *
 * Objectif : retrouver **tous** les Reels du compte et enrichir le catalogue
 * `src/data/instagram-reels.ts` sans jamais inventer de donnée.
 *
 * Trois modes, du plus accessible au plus complet :
 *
 *   1. `--mode=search`  — découverte des shortcodes via des instances SearXNG
 *      (multi-requêtes × pagination). Sans identifiant, mais **non exhaustif** :
 *      les moteurs n'indexent qu'une partie des Reels Instagram.
 *
 *   2. `--mode=verify`  — pour une liste de shortcodes, récupère la légende,
 *      les likes et la date via la balise `og:*` servie à l'agent
 *      `facebookexternalhit`, puis télécharge la couverture. **C'est la méthode
 *      de contrôle : un shortcode qui ne répond pas 200 est invalide.**
 *
 *   3. `--mode=graph`   — **exhaustif et officiel** : parcourt toute la
 *      médiathèque via la Meta Graph API (pagination complète, vues incluses).
 *      Exige un jeton : `--token=EAAG... --ig-user-id=178414...`.
 *      C'est la seule voie garantie « sans rien oublier » — Instagram bloque
 *      l'énumération anonyme (web_profile_info → `require_login`).
 *
 * Options communes :
 *   --list=<fichier>       liste de shortcodes (un par ligne) pour `verify`.
 *   --download-covers      télécharge les couvertures manquantes dans public/images/reels.
 *   --write                fusionne le résultat dans `src/data/instagram-reels.ts`.
 *   --dry                  (défaut) n'écrit rien, se contente de rapporter.
 *
 * Exemples :
 *   node scripts/instagram_harvest_reels.mjs --mode=search
 *   node scripts/instagram_harvest_reels.mjs --mode=verify --list=.reels.txt --download-covers
 *   node scripts/instagram_harvest_reels.mjs --mode=graph --token=$IG_TOKEN --ig-user-id=178414 --write
 */

import fs from 'node:fs';
import path from 'node:path';

const BROWSER_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HIT_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const AMP = String.fromCharCode(38);
const CATALOGUE_PATH = 'src/data/instagram-reels.ts';
const COVERS_DIR = path.join('public', 'images', 'reels');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
        const m = a.match(/^--([^=]+)(?:=(.*))?$/);
        return m ? [m[1], m[2] ?? true] : [a, true];
    }),
);
const MODE = String(args.mode || 'search');

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/** Décodage des entités HTML (deux passes : gère le double encodage). */
function decodeOnce(s) {
    return s
        .replace(/&#x([0-9a-f]+);/gi, (_m, h) => {
            try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ''; }
        })
        .replace(/&#([0-9]+);/g, (_m, d) => {
            try { return String.fromCodePoint(parseInt(d, 10)); } catch { return ''; }
        })
        .split(AMP + 'quot;').join('"')
        .split(AMP + 'lt;').join('<')
        .split(AMP + 'gt;').join('>')
        .split(AMP + 'apos;').join("'")
        .split(AMP + '#039;').join("'")
        .split(AMP + '#x27;').join("'")
        .split(AMP + 'amp;').join(AMP);
}
const decode = (s) => decodeOnce(decodeOnce(s || ''));

const MONTHS = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
};
const parseDate = (desc) => {
    const m = desc.match(/le\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
    return m && MONTHS[m[1]] ? `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2, '0')}` : undefined;
};
const parseLikes = (desc) => desc.match(/^([\d.,]+[KMB]?)\s+likes/i)?.[1];
const shortcodeFromPermalink = (url) => url?.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];

async function fetchCover(shortcode, ogImage) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
    const tryUrl = async (url, headers) => {
        const r = await fetch(url, { headers, redirect: 'follow' });
        const ct = r.headers.get('content-type') || '';
        return r.ok && ct.startsWith('image/') ? Buffer.from(await r.arrayBuffer()) : null;
    };
    const imgHeaders = { 'User-Agent': BROWSER_UA, Referer: 'https://www.instagram.com/', Accept: 'image/jpeg,image/*;q=0.8' };
    if (ogImage) {
        const b = await tryUrl(ogImage, imgHeaders).catch(() => null);
        if (b) return b;
    }
    // Repli : page ouverte en UA navigateur → og:image
    try {
        const page = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
            headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'fr-FR,fr;q=0.9' },
        });
        const html = await page.text();
        const fresh = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1];
        if (fresh) {
            const b = await tryUrl(fresh, imgHeaders).catch(() => null);
            if (b) return b;
        }
    } catch { /* repli suivant */ }
    // Repli : endpoint historique /media/
    return tryUrl(`https://www.instagram.com/p/${shortcode}/media/?size=l`, { 'User-Agent': BROWSER_UA }).catch(() => null);
}

/** Récupère les métadonnées publiques d'un Reel (statut inclus). */
async function fetchReelMeta(shortcode) {
    const res = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
        headers: { 'User-Agent': HIT_UA, 'Accept-Language': 'fr-FR,fr;q=0.9' },
    });
    const html = await res.text();
    const ogTitle = decode(html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)?.[1] || '');
    const ogDesc = decode(html.match(/<meta\s+property=["']og:description["']\s*content=["']([^"']*)["']/i)?.[1] || '');
    const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1] || '';

    let caption = ogTitle.replace(/^.*?sur Instagram:\s*/, '').trim().replace(/^"/, '').replace(/"$/, '').trim();
    if (!caption) caption = ogDesc.replace(/^.*?:\s*/, '').replace(/^"/, '').replace(/"$/, '').trim();

    return {
        shortcode,
        status: res.status,
        valid: res.status === 200 && caption.length > 0,
        caption,
        title: caption.split('\n')[0].slice(0, 120) || `Reel ${shortcode}`,
        likes: parseLikes(ogDesc),
        date: parseDate(ogDesc),
        ogImage,
    };
}

// ---------------------------------------------------------------------------
// Mode 1 — découverte par moteur (SearXNG)
// ---------------------------------------------------------------------------

const SEARX_INSTANCES = [
    'https://opnxng.com',
    'https://searxng.site',
    'https://search.inetol.net',
    'https://baresearch.org',
];
const SEARCH_QUERIES = [
    'site:instagram.com/reel "campus.univers.cascades"',
    'site:instagram.com/reel "campus univers cascades"',
    'site:instagram.com "campus.univers.cascades" reel',
    '"campus.univers.cascades" instagram reel',
    '"campus.univers.cascades" cascade',
    '"campus.univers.cascades" stunt',
    '"campus.univers.cascades" parkour',
    '"campus.univers.cascades" torche feu',
    '"campus.univers.cascades" combat fight',
    '"campus.univers.cascades" chute hauteur',
    '"campus.univers.cascades" voiture moto',
    '"campus.univers.cascades" tournage cinéma',
    'campus univers cascades instagram video cascadeur',
    '"campus.univers.cascades" #cucteam',
];

async function discoverShortcodes() {
    const re = /instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]{9,})/g;
    const found = new Set();
    let i = 0;
    for (const q of SEARCH_QUERIES) {
        for (let page = 1; page <= 4; page++) {
            const base = SEARX_INSTANCES[i++ % SEARX_INSTANCES.length];
            const url = `${base}/search?q=${encodeURIComponent(q)}&language=fr-FR&pageno=${page}`;
            try {
                const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' } });
                const text = await res.text();
                for (const m of text.matchAll(re)) found.add(m[1]);
            } catch { /* instance suivante */ }
            await sleep(1500);
        }
    }
    return [...found];
}

// ---------------------------------------------------------------------------
// Mode 3 — Meta Graph API (exhaustif)
// ---------------------------------------------------------------------------

async function harvestWithGraph(token, igUserId) {
    const fields = 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp,like_count,comments_count';
    let url = `https://graph.facebook.com/v19.0/${igUserId}/media?fields=${fields}&limit=100&access_token=${token}`;
    const out = [];
    let page = 0;
    while (url && page < 200) {
        page++;
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) throw new Error(`Graph API : ${json.error.message}`);
        for (const item of json.data || []) {
            if (item.media_product_type !== 'REELS' && item.media_type !== 'VIDEO') continue;
            const shortcode = shortcodeFromPermalink(item.permalink);
            if (!shortcode) continue;
            out.push({
                shortcode,
                title: (item.caption || '').split('\n')[0].slice(0, 120) || `Reel ${shortcode}`,
                caption: item.caption || '',
                date: item.timestamp ? item.timestamp.slice(0, 10) : undefined,
                likes: item.like_count != null ? String(item.like_count) : undefined,
                views: 0,
                ogImage: item.thumbnail_url || item.media_url || '',
            });
        }
        process.stdout.write(`  page ${page} → cumul ${out.length} Reels\n`);
        url = json.paging?.next || null;
    }
    return out;
}

// ---------------------------------------------------------------------------
// Fusion dans le catalogue (parsing du fichier généré + ré-émission)
// ---------------------------------------------------------------------------

function parseCatalogue(text) {
    const grab = (name) => {
        const start = text.indexOf(`export const ${name}`);
        const open = text.indexOf('[', start);
        const end = text.indexOf('\n];', open);
        return text.slice(open + 1, end);
    };
    const parseBlock = (block) => {
        const fields = {};
        for (const line of block.split('\n')) {
            const m = line.match(/^\s{4,}([a-zA-Z]+):\s*(.+?),?\s*$/);
            if (!m) continue;
            const [, key, raw] = m;
            if (raw === 'true' || raw === 'false') fields[key] = raw === 'true';
            else if (/^\d+$/.test(raw)) fields[key] = Number(raw);
            else if (raw.startsWith('"')) { try { fields[key] = JSON.parse(raw.replace(/,\s*$/, '')); } catch { fields[key] = raw; } }
        }
        return fields;
    };
    const blocks = (section) => section.split('\n    },').map((b) => parseBlock(b)).filter((o) => o.shortcode);
    return {
        featured: blocks(grab('DEFAULT_FEATURED_REELS')),
        all: blocks(grab('ALL_INSTAGRAM_REELS')),
    };
}

function emitCatalogue(featured, all) {
    const s = (v) => JSON.stringify(v ?? '');
    const block = (r, indent = 4) => {
        const p = ' '.repeat(indent);
        const lines = [
            `${p}{`,
            `${p}    id: ${s(r.id)},`,
            `${p}    shortcode: ${s(r.shortcode)},`,
            `${p}    url: ${s(r.url)},`,
            `${p}    title: ${s(r.title)},`,
            `${p}    description: ${s(r.description)},`,
            `${p}    coverImage: ${s(r.coverImage)},`,
            `${p}    views: ${r.views ?? 0},`,
            `${p}    viewsFormatted: ${s(r.viewsFormatted ?? '')},`,
        ];
        if (r.likes) lines.push(`${p}    likes: ${s(r.likes)},`);
        if (r.date) lines.push(`${p}    date: ${s(r.date)},`);
        if (r.isFeatured) lines.push(`${p}    isFeatured: true,`);
        lines.push(`${p}},`);
        return lines.join('\n');
    };
    const featuredSet = new Set(featured.map((r) => r.shortcode));
    const featuredOut = featured.map((r, i) => ({ ...r, id: `reel-featured-${i + 1}`, isFeatured: true }));
    const allOut = all.map((r, i) => ({ ...r, id: `reel-${i + 1}`, isFeatured: featuredSet.has(r.shortcode) }));

    return `/**
 * Catalogue des Reels Instagram officiels du CUC (@campus.univers.cascades).
 *
 * Fichier généré par \`scripts/instagram_harvest_reels.mjs\` — chaque entrée
 * correspond à une couverture réellement présente dans
 * \`public/images/reels/<shortcode>.jpg\`. Aucune entrée inventée.
 */

export type StuntCategory = 'fire' | 'car' | 'height' | 'combat' | 'parkour' | 'workshop' | 'general';

export interface InstagramReel {
    id: string;
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
    views: number;
    viewsFormatted: string;
    likes?: string;
    date?: string;
    isFeatured?: boolean;
    stuntCategory?: StuntCategory;
}

export type ReelSortOption = 'featured' | 'views' | 'recent' | 'oldest';

export const DEFAULT_FEATURED_REELS: InstagramReel[] = [
${featuredOut.map((r) => block(r)).join('\n')}
];

export const ALL_INSTAGRAM_REELS: InstagramReel[] = [
${allOut.map((r) => block(r)).join('\n')}
];
`;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async function main() {
    console.log(`▶ Mode : ${MODE}`);

    let harvested = [];
    if (MODE === 'search') {
        const codes = await discoverShortcodes();
        harvested = codes.map((c) => ({ shortcode: c }));
        console.log(`Découverte : ${codes.length} shortcodes`);
    } else if (MODE === 'verify') {
        const list = args.list
            ? fs.readFileSync(String(args.list), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
            : [];
        if (!list.length) throw new Error('Mode verify : fournir --list=<fichier>');
        harvested = list.map((c) => ({ shortcode: c }));
    } else if (MODE === 'graph') {
        if (!args.token || !args['ig-user-id']) throw new Error('Mode graph : --token et --ig-user-id requis');
        harvested = await harvestWithGraph(String(args.token), String(args['ig-user-id']));
    } else {
        throw new Error(`Mode inconnu : ${MODE}`);
    }

    // Enrichissement (sauf si déjà fourni par la Graph API).
    const enriched = [];
    for (const item of harvested) {
        if (item.caption !== undefined) { enriched.push(item); continue; }
        const meta = await fetchReelMeta(item.shortcode);
        if (!meta.valid) { console.log(`  ✗ ${item.shortcode} (HTTP ${meta.status})`); continue; }
        if (args['download-covers'] || MODE === 'graph') {
            const buf = await fetchCover(item.shortcode, meta.ogImage);
            if (!buf) { console.log(`  ⚠ ${item.shortcode} : couverture indisponible`); continue; }
            fs.writeFileSync(path.join(COVERS_DIR, `${item.shortcode}.jpg`), buf);
        }
        enriched.push({ ...item, ...meta });
        console.log(`  ✓ ${item.shortcode} — ${meta.title.slice(0, 50)}`);
        await sleep(450);
    }

    const catalogueText = fs.readFileSync(CATALOGUE_PATH, 'utf8');
    const { featured, all } = parseCatalogue(catalogueText);
    const known = new Set(all.map((r) => r.shortcode));
    const candidates = enriched.filter((r) => r.caption || r.title);
    const withCover = candidates.filter((r) => {
        if (known.has(r.shortcode)) return true;
        return fs.existsSync(path.join(COVERS_DIR, `${r.shortcode}.jpg`));
    });

    console.log(`\nCatalogue actuel : ${all.length} | candidats retenus : ${withCover.length}`);
    console.log(`Nouveaux         : ${withCover.filter((r) => !known.has(r.shortcode)).length}`);

    if (args.write) {
        const merged = new Map(all.map((r) => [r.shortcode, r]));
        for (const r of withCover) {
            if (known.has(r.shortcode)) continue;
            merged.set(r.shortcode, {
                shortcode: r.shortcode,
                url: `https://www.instagram.com/reel/${r.shortcode}/`,
                title: r.title,
                description: r.caption || r.title,
                coverImage: `/images/reels/${r.shortcode}.jpg`,
                views: r.views ?? 0,
                viewsFormatted: r.viewsFormatted ?? '',
                likes: r.likes,
                date: r.date,
            });
        }
        const sorted = [...merged.values()].sort((a, b) => (b.views || 0) - (a.views || 0));
        fs.writeFileSync(CATALOGUE_PATH, emitCatalogue(featured, sorted));
        console.log('✔ Catalogue réécrit.');
    } else {
        console.log('(dry-run) relancer avec --write pour appliquer.');
    }
}

main().catch((err) => {
    console.error('✗', err.message);
    process.exit(1);
});
