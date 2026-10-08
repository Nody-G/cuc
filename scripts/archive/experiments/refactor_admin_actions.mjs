#!/usr/bin/env node
/**
 * OBSOLÈTE — codemod à usage unique (2026-09-22).
 *
 * Découpe `src/app/(admin)/admin/actions.ts` (2765 lignes) en modules par
 * domaine sous `src/app/(admin)/admin/actions/**` (chacun `'use server'`),
 * puis remplace la source par une façade `'use server'` à ré-exports nommés :
 * la surface publique (`@/app/(admin)/admin/actions`) est conservée.
 * Conservé pour traçabilité (doctrine AGENTS.md : marquer plutôt que supprimer).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'src', 'app', '(admin)', 'admin', 'actions.ts');
const OUT_DIR = path.join(ROOT, 'src', 'app', '(admin)', 'admin', 'actions');

const lines = fs.readFileSync(SOURCE, 'utf8').split('\n');

/** Blocs : [préfixe exact de ligne, module cible]. */
const MARKERS = [
    ['export async function checkIsAdmin', 'auth'],
    ['export async function getCurrentUserProfile', 'auth'],
    ['export async function revalidateSite', 'revalidate'],
    ['export async function updateSessionStatus', 'sessions'],
    ['export async function createSession', 'sessions'],
    ['export async function deleteSession', 'sessions'],
    ['export async function upsertProgram', 'sessions'],
    ['export async function deleteProgram', 'sessions'],
    ['export async function updateAnnouncement', 'announcements'],
    ['export async function upsertTeamMember', 'team'],
    ['export async function upsertFilm', 'films'],
    ['export async function deleteTeamMember', 'team'],
    ['export async function deleteFilm', 'films'],
    ['export async function upsertSiteTranslation', 'translations'],
    ['export type SiteTranslationReadResult', 'translations'],
    ['export async function getSiteTranslation', 'translations'],
    ['export async function deleteSiteTranslation', 'translations'],
    ['export async function upsertPageContent', 'pages'],
    ['export async function setPagePublishState', 'pages'],
    ['export async function resetPageContentToDefault', 'pages'],
    ['export async function upsertPartner', 'partners-events'],
    ['export async function deletePartner', 'partners-events'],
    ['export async function upsertEvent', 'partners-events'],
    ['export async function deleteEvent', 'partners-events'],
    ['export async function updateSiteSettings', 'settings'],
    ['export async function loadMicrocopyCatalog', 'settings'],
    ['export async function saveMicrocopyOverrides', 'settings'],
    ['export async function upsertDiscipline', 'campus'],
    ['export async function deleteDiscipline', 'campus'],
    ['export async function upsertCampusPOI', 'campus'],
    ['export async function deleteCampusPOI', 'campus'],
    ['export async function upsertCampusPlacements3D', 'campus-3d'],
    ['export async function probeCampusPlacements3D', 'campus-3d'],
    ['export async function logAuditEvent', 'audit'],
    ['export async function uploadMediaFile', 'media'],
    ['export async function listMediaFolder', 'media'],
    ['export async function listMediaTree', 'media'],
    ['export async function getMediaReferences', 'media'],
    ['export async function createMediaFolder', 'media-organize'],
    ['export async function moveMediaObjects', 'media-organize'],
    ['export async function deleteMediaObjects', 'media-organize'],
    ['export async function listMediaFiles', 'media-organize'],
    ['export async function deleteMediaFile', 'media-organize'],
    ['export async function loginAdminAction', 'auth'],
    ['export async function listCockpitUsers', 'auth'],
    ['export async function updateUserRole', 'auth'],
    ['export async function submitInquiry', 'inquiries'],
    ['export async function updateInquiryStatus', 'inquiries'],
    ['export async function updateInquiryNotes', 'inquiries'],
    ['export async function deleteInquiry', 'inquiries'],
    ['export async function convertInquiryToCucSignStudent', 'inquiries-conversion'],
    ['export async function syncSessionsSeatCountsFromCucSign', 'sessions-sync'],
    ['export async function exportFullSiteBackup', 'backup'],
    ['export async function restoreFullSiteBackup', 'backup'],
    ['export type HealthState', 'health'],
    ['export interface HealthMetric', 'health'],
    ['export interface SystemHealthReport', 'health'],
    ['export async function getSystemHealth', 'health'],
];

const MODULE_TITLES = {
    auth: 'Authentification & comptes Cockpit',
    revalidate: 'Revalidation vitrine',
    sessions: 'Sessions & programmes de formation',
    'sessions-sync': 'Synchronisation des places de session (CUC Sign)',
    announcements: 'Annonces du site',
    team: 'Équipe (coachs)',
    films: 'Films',
    translations: 'Traductions EN (overlays)',
    pages: 'Pages vitrine (contenu, publication, révisions)',
    'partners-events': 'Partenaires & événements',
    settings: 'Réglages du site & micro-textes',
    campus: 'Disciplines & zones du campus',
    'campus-3d': 'Placements 3D du campus',
    audit: 'Journal d’audit',
    media: 'Médiathèque (lecture, upload, références)',
    'media-organize': 'Médiathèque (dossiers, déplacements, suppressions)',
    inquiries: 'Candidatures',
    'inquiries-conversion': 'Conversion candidature → élève CUC Sign',
    backup: 'Sauvegarde & restauration du site',
    health: 'Santé système',
};

function symbolOf(prefix) {
    const m = prefix.match(/^export (?:async function|function|const|interface|type) ([A-Za-z0-9_]+)/);
    return m ? m[1] : '';
}

const located = MARKERS.map(([prefix, mod]) => {
    const idx = lines.findIndex((l) => l.startsWith(prefix));
    if (idx < 0) throw new Error(`Marqueur introuvable : ${prefix}`);
    return { idx, mod, symbol: symbolOf(prefix) };
}).sort((a, b) => a.idx - b.idx);

/* En-tête : imports d'origine (la directive 'use server' est re-générée). */
const firstBlockStart = located[0].idx;
let headerDocStart = firstBlockStart;
while (headerDocStart > 0 && !lines[headerDocStart].startsWith('/**')) headerDocStart--;
const importsText = lines
    .slice(0, headerDocStart)
    .join('\n')
    .replace(/^'use server';\s*/, '')
    .trimEnd();

/* Découpage : la JSDoc reste collée au bloc ; une bannière `/*` ne l'absorbe JAMAIS. */
function startWithComment(i) {
    let s = i;
    let j = i - 1;
    if (j >= 0 && lines[j].trim() === '') j--;
    if (j >= 0 && lines[j].trimEnd().endsWith('*/')) {
        while (j >= 0) {
            const t = lines[j].trimStart();
            if (t.startsWith('/**')) break;
            if (t.startsWith('/*')) return i; // bannière `/*` : ne pas absorber
            j--;
        }
        if (j >= 0) s = j;
        if (s - 1 >= 0 && lines[s - 1].trim() === '') s--;
    }
    return s;
}

const blocks = located.map((entry, i) => {
    const start = startWithComment(entry.idx);
    const end = i + 1 < located.length ? startWithComment(located[i + 1].idx) - 1 : lines.length - 1;
    if (end < start) throw new Error(`Bloc vide pour ${entry.symbol}`);
    return { mod: entry.mod, symbol: entry.symbol, text: lines.slice(start, end + 1).join('\n').trim() };
});

/* Imports par module. */
const importStatements = [...importsText.matchAll(/import\s*(?:type\s*)?\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];/g)]
    .map((m) => ({
        tokens: m[1].split(',').map((s) => s.trim()).filter(Boolean),
        source: m[2],
    }));

const symbols = located.map((e) => ({ symbol: e.symbol, mod: e.mod })).filter((e) => e.symbol);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uses = (text, name) => new RegExp(`\\b${escapeRe(name)}\\b`).test(text);
const relImport = (fromMod, toMod) => {
    const rel = path.posix.relative(path.posix.dirname(fromMod), toMod);
    return rel.startsWith('.') ? rel : `./${rel}`;
};

const modules = new Map();
for (const b of blocks) modules.set(b.mod, [...(modules.get(b.mod) ?? []), b.text]);

const manifest = new Map(); // mod -> { fns: [], types: [] }
for (const [mod, chunks] of modules) {
    const body = chunks.join('\n\n');
    const header =
        `/**\n * ${MODULE_TITLES[mod] ?? mod} — extrait de \`actions.ts\` (façade conservée).\n` +
        ` * Règle SRP : \`AGENTS.md\` § 1-2. Server Actions : docs Next.js (\`use server\`).\n */`;
    const imports = [];
    for (const imp of importStatements) {
        const kept = imp.tokens.filter((t) => uses(body, t.replace(/^type\s+/, '')));
        if (kept.length) imports.push(`import { ${kept.join(', ')} } from '${imp.source}';`);
    }
    for (const s of symbols) {
        if (s.mod === mod) continue;
        if (uses(body, s.symbol)) imports.push(`import { ${s.symbol} } from '${relImport(mod, s.mod)}';`);
    }
    const file = path.join(OUT_DIR, `${mod}.ts`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `'use server';\n\n${header}\n\n${imports.join('\n')}\n\n${body}\n`, 'utf8');

    const fns = blocks.filter((b) => b.mod === mod && b.text.startsWith('export async function')).map((b) => b.symbol);
    const regexFns = [...body.matchAll(/export async function ([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    const types = [...body.matchAll(/export (?:type|interface) ([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    manifest.set(mod, { fns: [...new Set([...fns, ...regexFns])], types: [...new Set(types)] });
    console.log(`écrit actions/${mod}.ts (${body.split('\n').length} lignes, ${regexFns.length} action(s), ${types.length} type(s))`);
}

/* Façade : surface publique strictement identique. */
const facadeParts = ['\'use server\';\n'];
facadeParts.push(
    '/**\n' +
    ' * Façade des Server Actions du Cockpit — l’implémentation est découpée dans\n' +
    ' * `./actions/**` (un module par domaine, règle SRP `AGENTS.md` § 1-2).\n' +
    ' *\n' +
    ' * Surface publique strictement identique : tous les imports existants\n' +
    ' * (`@/app/(admin)/admin/actions`) restent valides.\n' +
    ' */\n'
);
for (const [mod, { fns, types }] of manifest) {
    if (fns.length) facadeParts.push(`export { ${fns.join(', ')} } from './actions/${mod}';`);
    if (types.length) facadeParts.push(`export type { ${types.join(', ')} } from './actions/${mod}';`);
}
fs.writeFileSync(SOURCE, `${facadeParts.join('\n')}\n`, 'utf8');
console.log(`façade écrite : actions.ts (${facadeParts.join('\n').split('\n').length} lignes)`);
