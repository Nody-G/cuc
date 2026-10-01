#!/usr/bin/env -S tsx
/**
 * ==============================================================================
 * CUC — Réparation des overlays EN (`site_translations`) dérivés du FR
 * ==============================================================================
 * Outil de maintenance des DONNÉES de traduction. Il ne répare pas du code : il
 * ré-aligne l'overlay persisté (`site_translations.payload`, `locale='en'`) sur
 * le contrat d'édition bilingue, en réutilisant le socle **canonique**
 * `src/lib/i18n/localized-merge` — jamais une seconde logique de fusion.
 *
 * Invariants appliqués (ceux de `localized-merge.ts` /
 * `.agents/rules/cockpit_bilingual_editing.md`) :
 *   1. aucune valeur vide/`null` publiée — elle revient au français ;
 *   2. aucune racine verrouillée (`layout_sections`, `og_image`, identité,
 *      états — `PAGE_LOCKED_ROOTS`) ni clé technique dans un OBJET ;
 *   3. un tableau est écrit en bloc : mêmes ancres `id`, mêmes clés techniques
 *      que le français. Longueur égale ⇒ les clés techniques sont **ré-alignées
 *      depuis le FR** en conservant le texte traduit ; longueur divergente ⇒ le
 *      tableau est **retiré** (le FR fait foi : « rien plutôt qu'un tableau
 *      faux ») ;
 *   4. aucun chemin inventé hors du contenu français (clés orphelines de
 *      `labels` de la navigation / du pied de page incluses).
 *
 * Réutilisation canonique : `sanitizeOverlayPayload`, `diffTranslation`,
 * `mergeLocalized`, `findStaleArrays`, `isTechnicalKey`, `PAGE_LOCKED_ROOTS`.
 * `materializeArray` (ré-alignement des clés techniques d'un tableau) est privé
 * au module : il est exercé **transitivement** par `diffTranslation`, dont il est
 * l'unique producteur. Aucun code d'exécution n'est modifié.
 *
 * Sortie :
 *   - rapport lisible sur la sortie standard (avant/après par ligne) ;
 *   - artefact JSON `.cache/translation-overlay-repair.json`.
 *
 * Garde-fou : si la réparation supprimait du TEXTE traduit au-delà du cas
 * documenté « tableau structurellement divergent » (valeur non vide, différente
 * du FR, non technique, feuille éditoriale), le mode `--apply` REFUSE d'écrire et
 * sort en code 3 — sauf `--force`. C'est le « rien plutôt qu'un tableau faux »
 * étendu à toute forme de perte silencieuse.
 *
 * Usage :
 *   tsx scripts/repair_translation_overlays.ts                 # dry-run (défaut)
 *   tsx scripts/repair_translation_overlays.ts --entity=page   # périmètre réduit
 *   tsx scripts/repair_translation_overlays.ts --apply         # écrit
 * ==============================================================================
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import {
    diffTranslation,
    findStaleArrays,
    isTechnicalKey,
    mergeLocalized,
    PAGE_LOCKED_ROOTS,
    sanitizeOverlayPayload,
} from '../src/lib/i18n/localized-merge';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS: Record<string, string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const JSON_OUT = process.argv.includes('--json');
const ENTITY_FILTER = process.argv.find((a) => a.startsWith('--entity='))?.split('=')[1];

/** Racines éditoriales d'une page (miroir de `verify_page_translation_invariants`). */
const PAGE_ROOTS = ['title', 'meta_title', 'meta_description', 'hero', 'sections', 'sections_data'];

interface EntityDef {
    entity: string;
    label: string;
    table?: string;
    idField?: string;
    overlayOnly?: boolean;
    fields: { name: string; kind: string }[];
}

const REGISTRY = JSON.parse(readFileSync('src/lib/i18n/entities.json', 'utf8')) as {
    entities: EntityDef[];
};
const DEF_BY_ENTITY = new Map(REGISTRY.entities.map((d) => [d.entity, d]));

type Json = unknown;

async function rest(pathname: string): Promise<any[] | null> {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (res.status === 404) return null; // table absente du schéma : signalée, non bloquante
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

async function patchOverlay(entity: string, entityId: string, payload: Record<string, unknown>) {
    const q = `entity=eq.${encodeURIComponent(entity)}&entity_id=eq.${encodeURIComponent(entityId)}&locale=eq.en`;
    const res = await fetch(`${URL_BASE}/rest/v1/site_translations?${q}`, {
        method: 'PATCH',
        headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ payload, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`PATCH site_translations → ${res.status} ${await res.text()}`);
}

/* ------------------------------------------------------------------ *
 * Résolution de la source FR par entité
 * ------------------------------------------------------------------ */

const SOURCE_CACHE = new Map<string, Map<string, Record<string, unknown>>>();

async function sourceMap(entity: string, def: EntityDef): Promise<Map<string, Record<string, unknown>>> {
    if (SOURCE_CACHE.has(entity)) return SOURCE_CACHE.get(entity)!;
    const map = new Map<string, Record<string, unknown>>();

    if (entity === 'page') {
        const rows = await rest('site_pages?select=*');
        for (const r of rows ?? []) map.set(String(r.slug), r as Record<string, unknown>);
    } else if (entity === 'campus_facility') {
        const rows = await rest('site_settings?select=value&key=eq.campus_facilities');
        const list = (rows?.[0]?.value?.list ?? []) as Record<string, unknown>[];
        for (const r of list) if (r?.id !== undefined) map.set(String(r.id), r);
    } else if (def.table) {
        const rows = await rest(`${def.table}?select=*`);
        if (rows === null) {
            console.warn(`  ⚠️  ${def.label} : table « ${def.table} » absente — entité ignorée.`);
        } else {
            for (const r of rows) map.set(String(r[def.idField ?? 'id']), r as Record<string, unknown>);
        }
    }

    SOURCE_CACHE.set(entity, map);
    return map;
}

/** Racines FR d'une ligne source (page : racines éditoriales ; sinon : champs déclarés). */
function rootsFor(entity: string, def: EntityDef, row: Record<string, unknown>): Record<string, unknown> {
    const names = entity === 'page' ? PAGE_ROOTS : def.fields.map((f) => f.name);
    const out: Record<string, unknown> = {};
    for (const name of names) {
        const value = row[name];
        if (value !== undefined && value !== null) out[name] = value;
    }
    return out;
}

/* ------------------------------------------------------------------ *
 * Navigation / pied de page — ancres `labels` (miroir de `labels-codec.ts`)
 * ------------------------------------------------------------------ */

function navigationAnchorKeys(structure: any): Set<string> {
    const keys = new Set<string>();
    for (const item of structure?.items ?? []) {
        if (item?.id) keys.add(String(item.id));
        for (const child of item?.children ?? []) if (child?.id) keys.add(String(child.id));
    }
    return keys;
}

function footerAnchorKeys(structure: any): Set<string> {
    const keys = new Set<string>();
    for (const col of structure?.columns ?? []) {
        if (col?.id) keys.add(String(col.id));
        for (const link of col?.links ?? []) if (link?.id) keys.add(String(link.id));
    }
    if (structure?.brand) {
        keys.add('brand.tagline');
        keys.add('brand.description');
    }
    if (structure?.legal) {
        keys.add('legal.copyright');
        for (const link of structure.legal.links ?? []) if (link?.id) keys.add(`legal.${link.id}`);
    }
    return keys;
}

/* ------------------------------------------------------------------ *
 * Diff avant / après + classification
 * ------------------------------------------------------------------ */

interface Change {
    path: string;
    type: 'suppression' | 'modification' | 'ajout';
    before?: Json;
    after?: Json;
    fr?: Json;
    reason: string;
}

function lastSegment(path: string): string {
    return (path.split('.').pop() || '').replace(/\[\d+\]/g, '');
}

/** Diff structurel récursif entre le payload stocké et le payload réparé. */
function diffPayload(before: Json, after: Json, fr: Json, path: string, out: Change[]): void {
    if (Array.isArray(before)) {
        if (!Array.isArray(after)) {
            out.push({ path: path || '(racine)', type: 'suppression', before, fr, reason: 'array' });
            return;
        }
        const n = Math.max(before.length, after.length);
        for (let i = 0; i < n; i += 1) {
            diffPayload(before[i], after[i], Array.isArray(fr) ? fr[i] : undefined, `${path}[${i}]`, out);
        }
        return;
    }
    if (before !== null && typeof before === 'object') {
        if (after === undefined) {
            out.push({ path: path || '(racine)', type: 'suppression', before, fr, reason: 'object' });
            return;
        }
        const afterObj = after !== null && typeof after === 'object' ? (after as Record<string, Json>) : {};
        const frObj = fr !== null && typeof fr === 'object' && !Array.isArray(fr) ? (fr as Record<string, Json>) : {};
        const keys = new Set([...Object.keys(before as Record<string, Json>), ...Object.keys(afterObj)]);
        for (const key of keys) {
            diffPayload(
                (before as Record<string, Json>)[key],
                afterObj[key],
                frObj[key],
                path ? `${path}.${key}` : key,
                out
            );
        }
        return;
    }
    if (before === undefined && after !== undefined) {
        out.push({ path, type: 'ajout', after, fr, reason: 'leaf' });
    } else if (before !== undefined && after === undefined) {
        out.push({ path, type: 'suppression', before, fr, reason: 'leaf' });
    } else if (JSON.stringify(before) !== JSON.stringify(after)) {
        out.push({ path, type: 'modification', before, after, fr, reason: 'leaf' });
    }
}

/**
 * Sérialisation stable : les objets JSONB de Postgres reviennent avec les clés
 * réordonnées (tri par longueur puis alphabétique). Comparer deux payloads par
 * `JSON.stringify` produirait donc de faux « changements » ; on trie les clés.
 */
function stableStringify(value: Json): string {
    if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    const obj = value as Record<string, Json>;
    return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

/** Un changement retire-t-il du texte traduit ? (hors cas documentés) */
function classify(change: Change): { kind: string; contentLoss: boolean } {
    const key = lastSegment(change.path);
    const isTopLevel = !change.path.includes('.');

    if (change.type === 'modification') {
        return isTechnicalKey(key)
            ? { kind: 'réalignement clé technique (FR)', contentLoss: false }
            : { kind: 'modification de texte', contentLoss: false };
    }

    // suppressions
    if (change.fr !== undefined && stableStringify(change.before) === stableStringify(change.fr)) {
        return { kind: 'normalisation (identique au FR — FR fait foi)', contentLoss: false };
    }
    if (Array.isArray(change.before) && Array.isArray(change.fr) && change.before.length !== change.fr.length) {
        return { kind: 'tableau structurellement divergent (FR fait foi)', contentLoss: true };
    }
    if (Array.isArray(change.before)) {
        return { kind: 'tableau sans traduction (FR fait foi)', contentLoss: false };
    }
    if (isTopLevel && PAGE_LOCKED_ROOTS.includes(key)) {
        return { kind: 'racine verrouillée retirée', contentLoss: false };
    }
    if (typeof change.before === 'string' && change.before.trim() === '') {
        return { kind: 'valeur vide retirée', contentLoss: false };
    }
    if (isTechnicalKey(key)) {
        return { kind: 'clé technique hors tableau retirée', contentLoss: false };
    }
    if (change.path.startsWith('labels.')) {
        return { kind: 'clé labels orpheline retirée', contentLoss: false };
    }
    if (change.fr === undefined) {
        return { kind: 'chemin inconnu retiré (absent du FR)', contentLoss: false };
    }
    if (change.before !== null && typeof change.before === 'object') {
        return { kind: 'sous-arbre vidé retiré', contentLoss: false };
    }
    return { kind: 'PERTE DE CONTENU TRADUIT', contentLoss: true };
}

/**
 * Seuls ces changements réparent une VIOLATION d'invariant (le reste est une
 * normalisation cosmétique : une feuille identique au FR, retirée parce que le
 * socle ne persiste jamais de redondance). L'outil n'écrit que les lignes en
 * violation — une retouche chirurgicale, jamais une réécriture de masse.
 */
const VIOLATION_KINDS = new Set<string>([
    'réalignement clé technique (FR)',
    'racine verrouillée retirée',
    'valeur vide retirée',
    'clé technique hors tableau retirée',
    'clé labels orpheline retirée',
    'tableau structurellement divergent (FR fait foi)',
    'chemin inconnu retiré (absent du FR)',
    'modification de texte',
    'PERTE DE CONTENU TRADUIT',
]);

/** Type de changement, en tenant compte du caractère orphelin d'une ancre `labels`. */
function changeKind(change: Change, orphans: string[]): string {
    if (change.path.startsWith('labels.') && orphans.includes(lastSegment(change.path))) {
        return 'clé labels orpheline retirée';
    }
    return classify(change).kind;
}

/** Extrait court d'une valeur, pour le rapport. */
function trunc(value: Json): string {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    if (s === undefined) return '(absent)';
    return s.length > 96 ? `${s.slice(0, 96)}…` : s;
}

/* ------------------------------------------------------------------ *
 * Réparation d'une ligne
 * ------------------------------------------------------------------ */

function repairGeneric(frRoots: Record<string, unknown>, stored: Record<string, unknown>): Record<string, unknown> {
    const cleaned = sanitizeOverlayPayload(stored);
    const effective = mergeLocalized(frRoots, cleaned);
    return sanitizeOverlayPayload(diffTranslation(frRoots, effective));
}

function repairLabels(stored: Record<string, unknown>, anchors: Set<string>): { payload: Record<string, unknown>; orphans: string[] } {
    const orphans: string[] = [];
    const out: Record<string, unknown> = { ...stored };
    const labels = stored.labels;
    if (labels && typeof labels === 'object' && !Array.isArray(labels)) {
        const kept: Record<string, string> = {};
        for (const [key, value] of Object.entries(labels as Record<string, unknown>)) {
            if (!anchors.has(key)) {
                orphans.push(key);
                continue;
            }
            if (typeof value === 'string' && value.trim() === '') continue;
            kept[key] = value as string;
        }
        if (Object.keys(kept).length > 0) out.labels = kept;
        else delete out.labels;
    }
    return { payload: sanitizeOverlayPayload(out), orphans };
}

/* ------------------------------------------------------------------ *
 * Boucle principale
 * ------------------------------------------------------------------ */

interface RowReport {
    entity: string;
    entity_id: string;
    label: string;
    status: 'ok' | 'repaired' | 'normalisable' | 'skipped' | 'no-source';
    reason?: string;
    staleArrays: { path: string; frLength: number; enLength: number; idMismatch: boolean }[];
    orphanLabels: string[];
    changes: Change[];
    contentLoss: string[];
}

async function main(): Promise<void> {
    console.log(`🔧 Réparation des overlays EN — mode ${APPLY ? 'APPLY' : 'DRY-RUN'}${FORCE ? ' (--force)' : ''}`);

    const overlays = (await rest('site_translations?select=id,entity,entity_id,locale,payload&locale=eq.en&order=entity.asc,entity_id.asc')) ?? [];
    const reports: RowReport[] = [];

    let repairedRows = 0;
    let totalChanges = 0;
    let realignedKeys = 0;
    let droppedKeys = 0;
    let droppedArrays = 0;
    let orphanLabels = 0;
    let normalisableRows = 0;
    const lossyRows: string[] = [];

    for (const row of overlays) {
        const entity = String(row.entity);
        const entityId = String(row.entity_id);
        if (ENTITY_FILTER && entity !== ENTITY_FILTER) continue;

        const def = DEF_BY_ENTITY.get(entity);
        const label = def?.label ?? entity;
        const stored = (row.payload ?? {}) as Record<string, unknown>;

        const report: RowReport = {
            entity,
            entity_id: entityId,
            label,
            status: 'ok',
            staleArrays: [],
            orphanLabels: [],
            changes: [],
            contentLoss: [],
        };

        if (!def) {
            report.status = 'skipped';
            report.reason = `entité inconnue du registre (${entity})`;
            reports.push(report);
            continue;
        }

        // --- Navigation / pied de page : retrait des ancres `labels` orphelines ---
        if (entity === 'navigation' || entity === 'footer') {
            const table = entity === 'navigation' ? 'site_navigation' : 'site_footer';
            const rows = await rest(`${table}?select=id,structure&id=eq.${encodeURIComponent(entityId)}`);
            const structure = rows?.[0]?.structure;
            if (!structure) {
                report.status = 'no-source';
                report.reason = `structure FR introuvable dans ${table} (id=${entityId})`;
                reports.push(report);
                continue;
            }
            const anchors = entity === 'navigation' ? navigationAnchorKeys(structure) : footerAnchorKeys(structure);
            const { payload, orphans } = repairLabels(stored, anchors);
            report.orphanLabels = orphans;
            diffPayload(stored, payload, stored, '', report.changes);
            let hasViolation = orphans.length > 0;
            for (const c of report.changes) {
                if (classify(c).contentLoss) report.contentLoss.push(c.path);
                if (VIOLATION_KINDS.has(changeKind(c, orphans))) hasViolation = true;
            }
            if (stableStringify(payload) !== stableStringify(stored)) {
                report.status = hasViolation ? 'repaired' : 'normalisable';
                if (APPLY && hasViolation) await patchOverlay(entity, entityId, payload);
            }
            reports.push(report);
            if (report.status === 'repaired') repairedRows += 1;
            if (report.status === 'normalisable') normalisableRows += 1;
            orphanLabels += orphans.length;
            continue;
        }

        // --- Entités à champs plats (page, team, film, …) ---
        const map = await sourceMap(entity, def);
        const frRow = map.get(entityId);
        if (!frRow) {
            report.status = 'no-source';
            report.reason = `ligne FR introuvable (${def.table ?? 'site_settings'})`;
            reports.push(report);
            continue;
        }

        const frRoots = rootsFor(entity, def, frRow);
        if (Object.keys(frRoots).length === 0) {
            report.status = 'no-source';
            report.reason = 'aucun champ éditorial français';
            reports.push(report);
            continue;
        }

        report.staleArrays = findStaleArrays(frRoots, stored).map((s) => ({
            path: s.path || '(racine)',
            frLength: s.frLength,
            enLength: s.enLength,
            idMismatch: s.idMismatch,
        }));

        const repaired = repairGeneric(frRoots, stored);
        diffPayload(stored, repaired, frRoots, '', report.changes);
        let hasViolation = false;
        for (const c of report.changes) {
            if (classify(c).contentLoss) report.contentLoss.push(c.path);
            if (VIOLATION_KINDS.has(changeKind(c, report.orphanLabels))) hasViolation = true;
        }

        const changed = stableStringify(repaired) !== stableStringify(stored);
        if (changed) {
            report.status = hasViolation ? 'repaired' : 'normalisable';
            if (APPLY && hasViolation && report.contentLoss.length === 0) {
                await patchOverlay(entity, entityId, repaired);
            }
        }

        reports.push(report);
        if (report.status === 'repaired') {
            repairedRows += 1;
            totalChanges += report.changes.length;
            for (const c of report.changes) {
                const kind = changeKind(c, report.orphanLabels);
                if (kind === 'réalignement clé technique (FR)') realignedKeys += 1;
                if (c.type === 'suppression') droppedKeys += 1;
            }
            for (const s of report.staleArrays) if (s.frLength !== s.enLength) droppedArrays += 1;
            if (report.contentLoss.length > 0) lossyRows.push(`${entity}/${entityId}`);
        }
        if (report.status === 'normalisable') normalisableRows += 1;
    }

    // --- Rapport ---
    console.log('');
    console.log('Lignes en violation (réparées) :');
    for (const r of reports) {
        if (r.status !== 'repaired' && r.status !== 'skipped' && r.status !== 'no-source') continue;
        console.log(`  • ${r.entity}/${r.entity_id}  [${r.status}]${r.reason ? ` — ${r.reason}` : ''}`);
        for (const s of r.staleArrays) {
            console.log(`      ~ tableau ${s.path} : FR=${s.frLength} EN=${s.enLength}${s.idMismatch ? ' (ancre déplacée)' : ''}`);
        }
        if (r.orphanLabels.length) console.log(`      ~ labels orphelines : ${r.orphanLabels.join(', ')}`);
        for (const c of r.changes) {
            const kind = changeKind(c, r.orphanLabels);
            const arrow = c.type === 'suppression' ? '✗' : c.type === 'ajout' ? '+' : '↻';
            const detail = c.type === 'modification' ? `  ${trunc(c.before)} → ${trunc(c.after)}` : '';
            console.log(`      ${arrow} ${kind}  ${c.path}${detail}`);
        }
        if (r.contentLoss.length) {
            console.log(`      ⚠️  PERTE DE CONTENU : ${r.contentLoss.join(', ')}`);
        }
    }

    const normalisable = reports.filter((r) => r.status === 'normalisable');
    if (normalisable.length > 0) {
        console.log('');
        console.log(`Normalisations cosmétiques NON écrites (feuilles identiques au FR, aucune incidence publique) : ${normalisable.length} ligne(s)`);
        for (const r of normalisable.slice(0, 12)) {
            console.log(`  · ${r.entity}/${r.entity_id}  (${r.changes.length} feuille(s) redondante(s))`);
        }
        if (normalisable.length > 12) console.log(`  · … ${normalisable.length - 12} autre(s)`);
    }

    const summary = {
        generatedAt: new Date().toISOString(),
        mode: APPLY ? 'apply' : 'dry-run',
        rowsScanned: reports.length,
        rowsRepaired: reports.filter((r) => r.status === 'repaired').length,
        rowsNormalisable: normalisableRows,
        rowsSkipped: reports.filter((r) => r.status === 'skipped' || r.status === 'no-source').length,
        changes: totalChanges,
        realignedTechnicalKeys: realignedKeys,
        droppedKeys,
        droppedDivergentArrays: droppedArrays,
        orphanLabels,
        contentLossRows: lossyRows,
    };

    console.log('');
    console.log('Synthèse :');
    console.log(`  lignes balayées            : ${summary.rowsScanned}`);
    console.log(`  lignes réparées (violation) : ${summary.rowsRepaired}`);
    console.log(`  normalisations non écrites  : ${summary.rowsNormalisable}`);
    console.log(`  lignes sans source FR       : ${summary.rowsSkipped}`);
    console.log(`  clés techniques ré-alignées : ${summary.realignedTechnicalKeys}`);
    console.log(`  clés retirées              : ${summary.droppedKeys}`);
    console.log(`  tableaux divergents retirés : ${summary.droppedDivergentArrays}`);
    console.log(`  labels orphelines retirées  : ${summary.orphanLabels}`);
    console.log(`  lignes à PERTE DE CONTENU   : ${lossyRows.length}${lossyRows.length ? ` (${lossyRows.join(', ')})` : ''}`);

    mkdirSync('.cache', { recursive: true });
    writeFileSync('.cache/translation-overlay-repair.json', JSON.stringify({ summary, rows: reports }, null, 2), 'utf8');
    console.log('  artefact                   : .cache/translation-overlay-repair.json');

    if (JSON_OUT) console.log(JSON.stringify({ summary, rows: reports }, null, 2));

    if (lossyRows.length > 0 && APPLY && !FORCE) {
        console.error('');
        console.error('❌ PERTE DE CONTENU TRADUIT détectée → écriture refusée. Relancer avec --force après revue.');
        process.exit(3);
    }
    if (APPLY && lossyRows.length > 0) {
        console.warn('⚠️  Des lignes à perte de contenu ont été réparées (cas tableau divergent) ; le FR fait foi.');
    }
    console.log(APPLY ? '✅ Réparation appliquée.' : '✅ DRY-RUN terminé — aucune écriture.');
}

main().catch((err) => {
    console.error('❌', err);
    process.exit(1);
});
