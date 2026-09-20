/**
 * AUDIT DES MÉDIAS DE L'ANCIEN SITE WORDPRESS
 * ============================================
 *
 * Objectif : inventorier de façon exhaustive tous les médias hébergés sur
 * l'ancien site `https://www.campus-universcascades.com/` (WordPress) afin de
 * préparer leur rapatriement vers Supabase Storage (bucket `cuc-vitrine-assets`).
 *
 * Ce script est en LECTURE SEULE : il ne télécharge aucun binaire, il ne
 * modifie rien. Il produit un inventaire JSON exploitable.
 *
 * Ce qu'il collecte :
 *   - Images  : <img src>, <img data-src>, srcset, background-image, <source srcset>
 *   - Documents : PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP
 *   - Vidéos : MP4, WEBM, MOV (fichiers directs, pas les iframes YouTube/Vimeo)
 *   - Métadonnées : page source, balise/attribut d'origine, alt, poids (HEAD)
 *
 * Sortie :
 *   - scripts/media_inventory.json  (inventaire complet dédoublonné)
 *   - scripts/media_inventory.md    (rapport lisible par un humain)
 *
 * Usage :
 *   node scripts/audit_original_media.mjs
 *   node scripts/audit_original_media.mjs --no-head   (saute la requête de poids)
 */

import fs from 'fs';
import path from 'path';

const ORIGIN = 'https://www.campus-universcascades.com';
const SKIP_HEAD = process.argv.includes('--no-head');

const PAGES = [
    { slug: '/', url: `${ORIGIN}/` },
    { slug: '/formation-de-cascadeur', url: `${ORIGIN}/formation-de-cascadeur/` },
    { slug: '/stages-cascades-parkour-2', url: `${ORIGIN}/stages-cascades-parkour-2/` },
    { slug: '/stunt-workshop-cuc', url: `${ORIGIN}/stunt-workshop-cuc/` },
    { slug: '/visite-guidee', url: `${ORIGIN}/visite-guidee/` },
    { slug: '/equipe-cascadeurs-pro', url: `${ORIGIN}/equipe-cascadeurs-pro/` },
    { slug: '/videos-cascadeur', url: `${ORIGIN}/videos-cascadeur/` },
    { slug: '/cuc-team-cascadeur', url: `${ORIGIN}/cuc-team-cascadeur/` },
    { slug: '/cuc-events-agence', url: `${ORIGIN}/cuc-events-agence/` },
    { slug: '/contact-cuc', url: `${ORIGIN}/contact-cuc/` },
    // Pages secondaires connues / probables
    { slug: '/team-building-cascades', url: `${ORIGIN}/team-building-cascades/` },
    { slug: '/animations-airbag-parkour', url: `${ORIGIN}/animations-airbag-parkour/` },
    { slug: '/spectacles-cascadeurs-yamakasi', url: `${ORIGIN}/spectacles-cascadeurs-yamakasi/` },
    { slug: '/mentions-legales', url: `${ORIGIN}/mentions-legales/` },
    { slug: '/politique-de-confidentialite', url: `${ORIGIN}/politique-de-confidentialite/` },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg|avif|bmp|ico|tiff?)(\?.*)?$/i;
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|csv|txt)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

/** Normalise une URL relative en URL absolue. */
function absolutize(raw, base) {
    if (!raw) return null;
    let url = raw.trim();
    if (url.startsWith('data:')) return null;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${ORIGIN}${url}`;
    if (/^https?:\/\//i.test(url)) return url;
    try {
        return new URL(url, base).href;
    } catch {
        return null;
    }
}

/** Retire les suffixes de redimensionnement WordPress (-300x200) pour regrouper les variantes. */
function wpBaseKey(url) {
    try {
        const u = new URL(url);
        const dir = u.pathname.substring(0, u.pathname.lastIndexOf('/'));
        const file = u.pathname.substring(u.pathname.lastIndexOf('/') + 1);
        const stripped = file.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '');
        return `${u.host}${dir}/${stripped}`;
    } catch {
        return url;
    }
}

function classify(url) {
    if (IMAGE_EXT.test(url)) return 'image';
    if (DOC_EXT.test(url)) return 'document';
    if (VIDEO_EXT.test(url)) return 'video';
    return 'other';
}

/** Extrait toutes les URLs de médias d'un document HTML. */
function extractFromHtml(html, pageUrl) {
    const found = [];
    const push = (raw, kind, alt = '') => {
        const abs = absolutize(raw, pageUrl);
        if (!abs) return;
        found.push({ url: abs, kind, alt });
    };

    // <img src="..."> et <img data-src="...">
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
        const tag = m[0];
        const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : '';
        const src = tag.match(/\bsrc=["']([^"']+)["']/i);
        const dataSrc = tag.match(/\bdata-src=["']([^"']+)["']/i);
        const dataLazy = tag.match(/\bdata-lazy-src=["']([^"']+)["']/i);
        if (src) push(src[1], 'img-src', alt);
        if (dataSrc) push(dataSrc[1], 'img-data-src', alt);
        if (dataLazy) push(dataLazy[1], 'img-data-lazy-src', alt);
        // srcset
        const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i);
        if (srcset) {
            for (const part of srcset[1].split(',')) {
                const u = part.trim().split(/\s+/)[0];
                if (u) push(u, 'img-srcset', alt);
            }
        }
    }

    // <source srcset="..."> (picture / video)
    for (const m of html.matchAll(/<source\b[^>]*>/gi)) {
        const tag = m[0];
        const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i);
        const src = tag.match(/\bsrc=["']([^"']+)["']/i);
        if (srcset) {
            for (const part of srcset[1].split(',')) {
                const u = part.trim().split(/\s+/)[0];
                if (u) push(u, 'source-srcset');
            }
        }
        if (src) push(src[1], 'source-src');
    }

    // background-image: url(...)
    for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
        push(m[1], 'background-image');
    }

    // <a href="..."> vers documents / vidéos
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
        const href = m[1];
        if (DOC_EXT.test(href) || VIDEO_EXT.test(href)) push(href, 'a-href');
    }

    // URLs brutes de wp-content/uploads dans le HTML (JSON-LD, scripts, etc.)
    for (const m of html.matchAll(/https?:\/\/[^"'\s\\)<>]+wp-content\/uploads\/[^"'\s\\)<>]+/gi)) {
        push(m[0], 'raw-html');
    }

    return found;
}

async function headInfo(url) {
    if (SKIP_HEAD) return { status: null, bytes: null, contentType: null };
    try {
        const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA } });
        const len = res.headers.get('content-length');
        return {
            status: res.status,
            bytes: len ? Number(len) : null,
            contentType: res.headers.get('content-type'),
        };
    } catch (e) {
        return { status: null, bytes: null, contentType: null, error: e.message };
    }
}

function humanBytes(n) {
    if (!n && n !== 0) return '?';
    if (n < 1024) return `${n} o`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
    return `${(n / (1024 * 1024)).toFixed(2)} Mo`;
}

async function run() {
    console.log('=== AUDIT DES MÉDIAS DE L\'ANCIEN SITE WORDPRESS ===\n');

    /** @type {Map<string, {url:string, kind:string, pages:Set<string>, tags:Set<string>, alts:Set<string>, variants:Set<string>}>} */
    const registry = new Map();
    const pageErrors = [];

    for (const page of PAGES) {
        process.stdout.write(`→ ${page.slug} ... `);
        let html;
        try {
            const res = await fetch(page.url, { headers: { 'User-Agent': UA } });
            if (!res.ok) {
                console.log(`HTTP ${res.status}`);
                pageErrors.push({ slug: page.slug, status: res.status });
                continue;
            }
            html = await res.text();
        } catch (e) {
            console.log(`ERREUR: ${e.message}`);
            pageErrors.push({ slug: page.slug, error: e.message });
            continue;
        }

        const items = extractFromHtml(html, page.url);
        let added = 0;
        for (const item of items) {
            const key = wpBaseKey(item.url);
            let entry = registry.get(key);
            if (!entry) {
                entry = {
                    url: item.url,
                    kind: classify(item.url),
                    pages: new Set(),
                    tags: new Set(),
                    alts: new Set(),
                    variants: new Set(),
                };
                registry.set(key, entry);
                added++;
            }
            entry.pages.add(page.slug);
            entry.tags.add(item.kind);
            if (item.alt) entry.alts.add(item.alt);
            entry.variants.add(item.url);
        }
        console.log(`${items.length} références, ${added} nouvelles`);
    }

    console.log(`\n${registry.size} médias uniques détectés. Récupération des poids...\n`);

    const inventory = [];
    let i = 0;
    for (const [key, entry] of registry) {
        i++;
        const info = await headInfo(entry.url);
        inventory.push({
            key,
            url: entry.url,
            kind: entry.kind,
            pages: [...entry.pages].sort(),
            tags: [...entry.tags].sort(),
            alts: [...entry.alts],
            variants: [...entry.variants].sort(),
            variantCount: entry.variants.size,
            status: info.status,
            bytes: info.bytes,
            contentType: info.contentType,
            error: info.error || null,
        });
        if (i % 25 === 0) process.stdout.write(`  ${i}/${registry.size}\r`);
    }

    // Tri : type, puis poids décroissant
    inventory.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        return (b.bytes || 0) - (a.bytes || 0);
    });

    const byKind = inventory.reduce((acc, it) => {
        acc[it.kind] = (acc[it.kind] || 0) + 1;
        return acc;
    }, {});

    const totalBytes = inventory.reduce((s, it) => s + (it.bytes || 0), 0);
    const broken = inventory.filter((it) => it.status && it.status >= 400);
    const unreachable = inventory.filter((it) => it.status === null && it.error);

    const report = {
        generatedAt: new Date().toISOString(),
        origin: ORIGIN,
        pagesCrawled: PAGES.length,
        pageErrors,
        totals: {
            uniqueMedia: inventory.length,
            byKind,
            totalBytes,
            totalHuman: humanBytes(totalBytes),
            broken: broken.length,
            unreachable: unreachable.length,
        },
        inventory,
    };

    const jsonPath = path.join('scripts', 'media_inventory.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

    // Rapport Markdown
    const md = [];
    md.push('# Inventaire des médias — ancien site WordPress\n');
    md.push(`Généré le ${report.generatedAt}\n`);
    md.push(`Origine : \`${ORIGIN}\` — ${PAGES.length} pages crawlées\n`);
    md.push('## Synthèse\n');
    md.push('| Type | Nombre |');
    md.push('| --- | --- |');
    for (const [kind, count] of Object.entries(byKind).sort()) {
        md.push(`| ${kind} | ${count} |`);
    }
    md.push(`| **Total** | **${inventory.length}** |\n`);
    md.push(`Poids cumulé estimé : **${humanBytes(totalBytes)}**`);
    md.push(`Médias cassés (HTTP ≥ 400) : **${broken.length}**`);
    md.push(`Médias injoignables : **${unreachable.length}**\n`);

    if (pageErrors.length) {
        md.push('## Pages en erreur\n');
        for (const e of pageErrors) md.push(`- \`${e.slug}\` → ${e.status || e.error}`);
        md.push('');
    }

    for (const kind of ['image', 'document', 'video', 'other']) {
        const list = inventory.filter((it) => it.kind === kind);
        if (!list.length) continue;
        md.push(`## ${kind} (${list.length})\n`);
        md.push('| Poids | Statut | URL | Pages |');
        md.push('| --- | --- | --- | --- |');
        for (const it of list) {
            md.push(`| ${humanBytes(it.bytes)} | ${it.status ?? '?'} | \`${it.url}\` | ${it.pages.join(', ')} |`);
        }
        md.push('');
    }

    const mdPath = path.join('scripts', 'media_inventory.md');
    fs.writeFileSync(mdPath, md.join('\n'), 'utf-8');

    console.log('\n=== RÉSULTAT ===');
    console.log(`Médias uniques : ${inventory.length}`);
    for (const [kind, count] of Object.entries(byKind).sort()) {
        console.log(`  - ${kind}: ${count}`);
    }
    console.log(`Poids cumulé : ${humanBytes(totalBytes)}`);
    console.log(`Cassés : ${broken.length} | Injoignables : ${unreachable.length}`);
    console.log(`\nÉcrit : ${jsonPath}`);
    console.log(`Écrit : ${mdPath}`);
}

run().catch((e) => {
    console.error('Échec de l\'audit :', e);
    process.exit(1);
});
