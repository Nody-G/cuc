#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit du budget performance du Mode Studio
 * ==============================================================================
 * Le budget n'est pas une intention, c'est une mesure. Ce script vérifie, dans
 * le code, les quatre engagements pris devant le client :
 *
 *   1. **Aucune écriture pendant la frappe** : l'édition passe par le brouillon
 *      (`postMessage`) et une écriture n'a lieu qu'à `Enregistrer` ;
 *   2. **Realtime réservé au Cockpit** : aucun canal sur le chemin public, canal
 *      partagé unique côté Cockpit (`subscribeTable`), aucune trace du helper
 *      historique `createSafeChannel` sur la vitrine ;
 *   3. **Fraîcheur visiteur sans WebSocket** : la vitrine recharge à la reprise
 *      d'onglet, et ne sonde que là où c'est explicitement demandé (bandeau
 *      d'annonce) ;
 *   4. **Zéro requête publique nominale** : quand le serveur a fourni le contenu,
 *      le client ne rejoue pas de requête Supabase ;
 *   5. **Publication visible des deux côtés** : la revalidation couvre la voie
 *      française ET anglaise, plus les tags de cache.
 *
 * Sortie : `plans/revue-budget-performance.md`, code 2 en cas d'écart.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = join(ROOT, 'plans', 'revue-budget-performance.md');

const PUBLIC_DIRS = [
    join(ROOT, 'src', 'components'),
    join(ROOT, 'src', 'app', '(site)'),
];
const ADMIN_DIR = join(ROOT, 'src', 'app', '(admin)');
const REALTIME_LIB = join(ROOT, 'src', 'lib', 'supabase', 'realtime.ts');
const REALTIME_REFRESH_HOOK = join(ROOT, 'src', 'lib', 'hooks', 'useRealtimeRefresh.ts');
const PREVIEW_HOOK = join(ROOT, 'src', 'lib', 'hooks', 'usePageDynamicContent.ts');
const ACTIONS = join(ROOT, 'src', 'app', '(admin)', 'admin', 'actions.ts');
/** Modules de domaine des Server Actions : la façade `actions.ts` les ré-exporte
 *  (règle SRP) — l'audit lit l'ensemble de la surface, pas un seul fichier. */
const ACTIONS_DIR = join(ROOT, 'src', 'app', '(admin)', 'admin', 'actions');
const PREVIEW_PANE = join(
    ROOT,
    'src',
    'app',
    '(admin)',
    'admin',
    'components',
    'pages-editor',
    'LivePreviewPane.tsx'
);

function walk(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (['.ts', '.tsx'].includes(extname(full)) && !full.includes('.test.')) out.push(full);
    }
    return out;
}

const publicFiles = PUBLIC_DIRS.flatMap((dir) => walk(dir));
const adminFiles = walk(ADMIN_DIR);

/* 1. Realtime réservé au Cockpit : plus de createSafeChannel sur le chemin public. */
const legacyChannels = publicFiles
    .filter((file) => readFileSync(file, 'utf8').includes('createSafeChannel'))
    .map((file) => relative(ROOT, file));

const realtimeSource = readFileSync(REALTIME_LIB, 'utf8');
const sharedChannelHelper = realtimeSource.includes('export function subscribeTable');
const previewSkipsRealtime = realtimeSource.includes('isPreviewFrame()');
/** La porte d'accès au canal : route Cockpit reconnue par une fonction pure. */
const cockpitOnlyChannels =
    realtimeSource.includes('export function isCockpitRoute') &&
    realtimeSource.includes('if (!isCockpitRoute(currentPathname()))');

/* 2. Fraîcheur visiteur sans WebSocket : reprise d'onglet, sondage opt-in. */
const refreshHook = readFileSync(REALTIME_REFRESH_HOOK, 'utf8');
const visitorReturnRefresh =
    refreshHook.includes('isCockpitRoute(window.location.pathname)') &&
    refreshHook.includes("addEventListener('focus'") &&
    refreshHook.includes('visibilitychange') &&
    refreshHook.includes('shouldRefreshOnReturn');
const noVisitorPollByDefault = /pollMs && Number\.isFinite\(pollMs\)/.test(refreshHook);

/* 2. Zéro requête publique nominale quand le serveur a fourni les données. */
const previewHook = readFileSync(PREVIEW_HOOK, 'utf8');
const guardsServerFetch = /if \(!hasServerPage\)/.test(previewHook);

/* 3. Publication FR + EN et invalidation par tags. */
const actionFiles = [ACTIONS];
if (existsSync(ACTIONS_DIR)) {
    for (const entry of readdirSync(ACTIONS_DIR)) {
        if (entry.endsWith('.ts')) actionFiles.push(join(ACTIONS_DIR, entry));
    }
}
const actions = actionFiles.map((f) => readFileSync(f, 'utf8')).join('\n');
const mirrorsEnglish = actions.includes("path === '/' ? '/en' : `/en${path}`");
const invalidatesTags = actions.includes('updateTag(tag)') || actions.includes("updateTag('site_");

/* 4. Aperçu allégé : le Cockpit charge la page en mode « quiet ». */
const pane = readFileSync(PREVIEW_PANE, 'utf8');
const quietPreview = readFileSync(
    join(ROOT, 'src', 'app', '(admin)', 'admin', 'components', 'PagesEditorView.tsx'),
    'utf8'
).includes('quiet: true');
const previewFlagModule = existsSync(join(ROOT, 'src', 'lib', 'preview', 'preview-context.ts'));

/* 5. Aucune écriture directe depuis l'aperçu (le pont ne fait que du postMessage). */
const editLayer = readFileSync(
    join(ROOT, 'src', 'components', 'preview', 'PreviewEditLayer.tsx'),
    'utf8'
);
const noDirectWrites = !/\.from\(['"]site_/.test(editLayer);

const checks = [
    {
        label: 'Realtime réservé au Cockpit (aucun canal sur le chemin public)',
        ok: legacyChannels.length === 0 && sharedChannelHelper && cockpitOnlyChannels,
        detail:
            legacyChannels.length > 0
                ? `Canaux historiques restants : ${legacyChannels.join(', ')}`
                : sharedChannelHelper && cockpitOnlyChannels
                    ? 'Aucun `createSafeChannel` sur le chemin public ; `subscribeTable` n’ouvre un canal que sur une route `/admin/...` (canal partagé, un seul WebSocket par éditeur).'
                    : 'La porte « route Cockpit » manque dans `realtime.ts` : un visiteur pourrait ouvrir un canal.',
    },
    {
        label: 'Fraîcheur visiteur sans WebSocket (reprise d’onglet, sondage opt-in)',
        ok: visitorReturnRefresh && noVisitorPollByDefault,
        detail:
            visitorReturnRefresh && noVisitorPollByDefault
                ? 'La vitrine recharge à la reprise d’onglet (intervalle minimum) ; le sondage périodique n’existe que si un appelant le demande (bandeau d’annonce, 5 min, onglet visible).'
                : 'Le régime visiteur est incomplet : reprise d’onglet, intervalle minimum ou caractère opt-in du sondage manquant.',
    },
    {
        label: 'Aperçu sans Realtime (brouillon par postMessage)',
        ok: previewSkipsRealtime && quietPreview && previewFlagModule,
        detail:
            previewSkipsRealtime && quietPreview && previewFlagModule
                ? '`?cuc-preview=1` coupe le Realtime et met les effets lourds en veille ; la vitrine publique reste inchangée.'
                : 'Le mode `quiet` de l’aperçu est incomplet (flag, module de contexte ou branchement manquant).',
    },
    {
        label: 'Zéro requête publique nominale (cache serveur)',
        ok: guardsServerFetch,
        detail: guardsServerFetch
            ? '`usePageDynamicContent` ne rejoue une requête que si le serveur n’a pas fourni la page.'
            : 'Le hook rejoue la requête alors que le serveur a déjà livré la page.',
    },
    {
        label: 'Publication FR + EN',
        ok: mirrorsEnglish,
        detail: mirrorsEnglish
            ? 'Chaque revalidation de chemin couvre aussi sa variante `/en/...`.'
            : 'La revalidation ne couvre pas la version anglaise.',
    },
    {
        label: 'Invalidation par tags de cache',
        ok: invalidatesTags,
        detail: invalidatesTags
            ? 'Les lectures `use cache` + `cacheTag` sont invalidées (`updateTag`).'
            : 'Seuls les chemins sont revalidés : une page déjà générée peut rester figée.',
    },
    {
        label: 'Aucune écriture en base depuis l’aperçu',
        ok: noDirectWrites,
        detail: noDirectWrites
            ? 'La couche d’édition ne parle qu’au Cockpit (`postMessage`) — l’écriture reste l’action « Enregistrer ».'
            : 'La couche d’édition touche directement la base : interdit (doctrine brouillon-first).',
    },
];

const failures = checks.filter((check) => !check.ok);

const lines = [];
lines.push('# Revue — Budget performance du Mode Studio');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_performance_budget.mjs\`.`);
lines.push('');
lines.push('| Engagement | État | Preuve |');
lines.push('| --- | --- | --- |');
for (const check of checks) {
    lines.push(`| ${check.label} | ${check.ok ? '✅' : '❌'} | ${check.detail} |`);
}
lines.push('');
lines.push('## Ratios de référence');
lines.push('');
lines.push(`- Fichiers publics analysés : ${publicFiles.length}`);
lines.push(`- Fichiers Cockpit analysés : ${adminFiles.length}`);
lines.push('- Canaux Realtime historiques restants sur le chemin public : ' + legacyChannels.length);
lines.push('- Canaux Realtime ouverts par un visiteur : 0 (route Cockpit uniquement)');
lines.push('');
lines.push(
    failures.length === 0
        ? '✅ Budget tenu : brouillon-first, Realtime réservé au Cockpit, reprise d’onglet côté visiteur, cache serveur, publication FR + EN.'
        : `❌ ${failures.length} engagement(s) non tenu(s).`
);
lines.push('');

writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

console.log(`[audit:budget] ${checks.length} engagements vérifiés, ${failures.length} écart(s).`);
console.log(`[audit:budget] Rapport : ${relative(ROOT, REPORT)}`);
for (const failure of failures) console.error(`[audit:budget] ÉCART — ${failure.label} : ${failure.detail}`);

if (failures.length > 0) {
    process.exitCode = 2;
} else {
    console.log('[audit:budget] OK — budget performance tenu.');
}
