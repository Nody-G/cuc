#!/usr/bin/env node
/**
 * OBSOLÈTE — codemod à usage unique (2026-09-22).
 *
 * Découpe `src/lib/data/site-service.ts` (2253 lignes) en modules par entité
 * sous `src/lib/data/site/**`, puis remplace la source par une façade
 * `export *` : la surface publique (`@/lib/data/site-service`) est conservée.
 * Conservé pour traçabilité (doctrine AGENTS.md : marquer plutôt que supprimer).
 * Ne pas relancer : la source d'origine n'existe plus (une façade l'a remplacée).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'src', 'lib', 'data', 'site-service.ts');
const OUT_DIR = path.join(ROOT, 'src', 'lib', 'data', 'site');

const lines = fs.readFileSync(SOURCE, 'utf8').split('\n');

/** Blocs : [préfixe exact de ligne, module cible]. Ordre indifférent (tri par index). */
const MARKERS = [
    ['export interface SiteAnnouncement {', 'types'],
    ['export async function getPrograms', 'content'],
    ['export async function getTeam', 'team'],
    ['export async function getFilms', 'films'],
    ['export async function getCelebrities', 'films'],
    ['export async function getVideos', 'settings'],
    ['export async function getFilmBanners', 'films'],
    ['export async function getCampusFacilities', 'content'],
    ['export async function getCampusPlacements3D', 'settings'],
    ['export async function getActiveAnnouncement', 'settings'],
    ['export interface LayoutSection {', 'types'],
    ['export function normalizeSlug', 'pages'],
    ['export const DEFAULT_PAGE_CONTENTS', 'defaults/pages'],
    ['export interface SitePartner {', 'types'],
    ['export interface SiteSettings {', 'types'],
    ['export const DEFAULT_PARTNERS', 'defaults/partners'],
    ['export const DEFAULT_EVENTS', 'defaults/events'],
    ['export const DEFAULT_SITE_SETTINGS', 'defaults/settings'],
    ['export async function getAllPages', 'pages'],
    ['export async function getPageContent', 'pages'],
    ['export async function getPartners', 'partners'],
    ['export async function getEvents', 'events'],
    ['export async function getSiteSettings', 'settings'],
    ['export interface SiteInquiry {', 'types'],
    ['export const SAMPLE_INQUIRIES', 'defaults/samples'],
    ['export const SAMPLE_AUDIT_LOGS', 'defaults/samples'],
    ['export async function getInquiries', 'inquiries'],
    ['export async function getAuditLogs(', 'audit'],
    ['export async function getAuditLogsExtended', 'audit'],
    ['export async function getDisciplines', 'content'],
    ['export async function getCampusPOIs', 'content'],
    ['export async function getNavigation', 'navigation'],
    ['export async function getFooter', 'navigation'],
    ['export async function getSocialLinks', 'navigation'],
    ['export async function upsertNavigation', 'navigation'],
    ['export async function upsertFooter', 'navigation'],
    ['export async function upsertSocialLink', 'navigation'],
    ['export async function deleteSocialLink', 'navigation'],
    ['export type PageRevisionStatus', 'types'],
    ['export async function getPageRevisions', 'page-revisions'],
    ['export async function getPageRevision(', 'page-revisions'],
    ['export async function createPageRevision', 'page-revisions'],
    ['export async function restorePageRevision', 'page-revisions'],
    ['export async function deletePageRevision', 'page-revisions'],
    ['export interface PageRevisionDiffEntry', 'page-revisions'],
];

const MODULE_TITLES = {
    client: 'Client Supabase public partagé (fabrique isomorphe)',
    types: 'Types & contrats du service vitrine',
    content: 'Contenus vitrine (programmes, disciplines, campus, POI)',
    team: 'Équipe (coachs)',
    films: 'Catalogue films, célébrités doublées, affiches',
    settings: 'Réglages du site (settings, annonce active, vidéos, placements 3D)',
    pages: 'Pages vitrine (contenu, slug)',
    partners: 'Partenaires',
    events: 'Événements CUC Events',
    inquiries: 'Candidatures (inquiries)',
    audit: 'Journal d’audit',
    navigation: 'Navigation, pied de page, réseaux',
    'page-revisions': 'Révisions de page (CRUD + diff)',
    'defaults/pages': 'Données par défaut — pages vitrine (copie certifiée)',
    'defaults/partners': 'Données par défaut — partenaires',
    'defaults/events': 'Données par défaut — événements',
    'defaults/settings': 'Données par défaut — réglages',
    'defaults/samples': 'Données d’exemple — candidatures, audit',
};

const FACADE = [
    'types', 'content', 'team', 'films', 'settings', 'pages', 'partners', 'events',
    'inquiries', 'audit', 'navigation', 'page-revisions',
    'defaults/pages', 'defaults/partners', 'defaults/events', 'defaults/settings', 'defaults/samples',
];

/* ------------------------------------------------------------------ */
/* 1. Localisation des blocs                                          */
/* ------------------------------------------------------------------ */
function symbolOf(prefix) {
    const m = prefix.match(/^export (?:async function|function|const|interface|type) ([A-Za-z0-9_]+)/);
    return m ? m[1] : '';
}

const located = MARKERS.map(([prefix, mod]) => {
    const idx = lines.findIndex((l) => l.startsWith(prefix));
    if (idx < 0) throw new Error(`Marqueur introuvable : ${prefix}`);
    return { idx, mod, symbol: symbolOf(prefix) };
}).sort((a, b) => a.idx - b.idx);

/* ------------------------------------------------------------------ */
/* 2. En-tête : imports d'origine + client partagé                    */
/* ------------------------------------------------------------------ */
const clientFnIdx = lines.findIndex((l) => l.startsWith('function getSupabaseClient'));
if (clientFnIdx < 0) throw new Error('getSupabaseClient introuvable');
let docStart = clientFnIdx;
while (docStart > 0 && !lines[docStart].startsWith('/**')) docStart--;

const importsText = lines.slice(0, docStart).join('\n').trimEnd();
const clientText = lines
    .slice(docStart, located[0].idx)
    .join('\n')
    .trimEnd()
    .replace('function getSupabaseClient(', 'export function getSupabaseClient(');

/* ------------------------------------------------------------------ */
/* 3. Découpage (le commentaire JSDoc reste collé à son bloc)          */
/* ------------------------------------------------------------------ */
function startWithComment(i) {
    let s = i;
    let j = i - 1;
    if (j >= 0 && lines[j].trim() === '') j--;
    if (j >= 0 && lines[j].trimEnd().endsWith('*/')) {
        while (j >= 0 && !lines[j].trimStart().startsWith('/**')) j--;
        if (j >= 0) s = j;
        if (s - 1 >= 0 && lines[s - 1].trim() === '') s--;
    }
    return s;
}

const blocks = located.map((entry, i) => {
    const start = startWithComment(entry.idx);
    const end = i + 1 < located.length ? startWithComment(located[i + 1].idx) - 1 : lines.length - 1;
    return { mod: entry.mod, text: lines.slice(start, end + 1).join('\n').trim() };
});

/* ------------------------------------------------------------------ */
/* 4. Génération des imports par module                                */
/* ------------------------------------------------------------------ */
const importStatements = [...importsText.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];/g)]
    .map((m) => ({
        tokens: m[1].split(',').map((s) => s.trim()).filter(Boolean),
        source: m[2],
    }));

const symbols = [
    { symbol: 'getSupabaseClient', mod: 'client' },
    ...located.map((e) => ({ symbol: e.symbol, mod: e.mod })).filter((e) => e.symbol),
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uses = (text, name) => new RegExp(`\\b${escapeRe(name)}\\b`).test(text);

function relativeImport(fromMod, toMod) {
    const rel = path.posix.relative(path.posix.dirname(fromMod), toMod);
    return rel.startsWith('.') ? rel : `./${rel}`;
}

const modules = new Map();
const push = (mod, text) => modules.set(mod, [...(modules.get(mod) ?? []), text]);
for (const b of blocks) push(b.mod, b.text);
push('client', clientText);

for (const [mod, chunks] of modules) {
    const body = chunks.join('\n\n');
    const header =
        `/**\n * ${MODULE_TITLES[mod] ?? mod} — extrait de \`site-service.ts\` (façade conservée).\n` +
        ` * Règle SRP : \`AGENTS.md\` § 1-2.\n */`;
    const imports = [];
    for (const imp of importStatements) {
        const kept = imp.tokens.filter((t) => uses(body, t.replace(/^type\s+/, '')));
        if (kept.length) imports.push(`import { ${kept.join(', ')} } from '${imp.source}';`);
    }
    for (const s of symbols) {
        if (s.mod === mod) continue;
        if (uses(body, s.symbol)) imports.push(`import { ${s.symbol} } from '${relativeImport(mod, s.mod)}';`);
    }
    const file = path.join(OUT_DIR, `${mod}.ts`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${header}\n\n${imports.join('\n')}\n\n${body}\n`, 'utf8');
    console.log(`écrit ${path.relative(ROOT, file).replace(/\\/g, '/')} (${body.split('\n').length} lignes)`);
}

/* ------------------------------------------------------------------ */
/* 5. Façade                                                           */
/* ------------------------------------------------------------------ */
const facade =
    '/**\n' +
    ' * Façade `site-service` — l’implémentation est découpée dans `./site/**`\n' +
    ' * (un module par entité, règle SRP `AGENTS.md` § 1-2).\n' +
    ' *\n' +
    ' * Tous les imports existants (`@/lib/data/site-service`) restent valides :\n' +
    ' * la surface publique est strictement identique. Le client Supabase public\n' +
    ' * vit dans `./site/client` et n’est pas ré-exporté (il était privé).\n' +
    ' */\n\n' +
    `${FACADE.map((m) => `export * from './site/${m}';`).join('\n')}\n`;

fs.writeFileSync(SOURCE, facade, 'utf8');
console.log(`façade écrite : ${path.relative(ROOT, SOURCE).replace(/\\/g, '/')} (${facade.split('\n').length} lignes)`);
