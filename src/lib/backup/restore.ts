/**
 * Sauvegarde automatique du site CUC — orchestration d'une restauration.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1) : enchaîner la séquence de retour
 * arrière **sans jamais toucher `pg`, `node:fs` ni `process.env`** — toutes les
 * dépendances sont injectées, exactement comme dans
 * [`orchestrate.ts`](./orchestrate.ts:63). C'est la seule façon de prouver par un
 * test hors réseau et hors base qu'une part altérée arrête tout **avant** la
 * moindre écriture.
 *
 * Ordre imposé : (a) instantané (`incomplete` refusé), (b) intégrité + non-vacuité,
 * (c) déchiffrement, (d) périmètre, (e) plan de diff puis politique de suppression
 * ([`restore-policy.ts`](./restore-policy.ts:1), les suppressions append-only sont
 * retirées du plan), (f) simulation par défaut, (g) pré-instantané obligatoire en
 * écriture, (h) transaction unique puis recomptage, (i) rapport. Aucun `catch`
 * silencieux : tout échec est nommé et remonté, ou décrit dans le rapport.
 */

import type { BackupIndexEntry, BackupManifest, BackupRow, PartDigest, TableDiff } from './contracts';
import { diffTable } from './diff';
import { computeDeleteOrder, orderByDependencies } from './fk-order';
import { verifyManifestIntegrity, verifyManifestTotals } from './integrity';
import { parseNdjson } from './io/compress';
import type { ApplyRestorePlan, BridgeFallback, RestoreApplyResult, RestoreTableOps } from './io/db-restore';
import type { ReadTablesResult } from './io/db-read';
import { readBackupIndex } from './io/index-store';
import type { BackupStorage } from './io/storage';
import { parseManifest } from './manifest';
import { resolveDeletePolicy } from './restore-policy';
import { primaryKeyOf } from './table-keys';
import { assertBackupScope } from './whitelist';

/** Erreur d'orchestration de restauration : nommée, jamais avalée. */
export class RestoreError extends Error {
    readonly step: string;

    constructor(step: string, message: string) {
        super(message);
        this.name = 'RestoreError';
        this.step = step;
    }
}

/** Résultat du filet de sécurité : un pré-instantané dégradé ne vaut rien. */
export interface PreSnapshotOutcome {
    ok: boolean;
    snapshotId: string | null;
    degraded: boolean;
    error: string | null;
}

/** Dépendances injectées : aucune n'a de valeur par défaut implicite. */
export interface RestoreDependencies {
    storage: BackupStorage;
    indexObjectKey: string;
    readTables: (tables: readonly string[]) => Promise<ReadTablesResult>;
    digest: (bytes: Uint8Array) => string;
    decrypt: (envelope: Uint8Array) => Buffer;
    decompress: (input: Uint8Array) => Buffer;
    applyRestore: (plan: ApplyRestorePlan) => Promise<RestoreApplyResult>;
    preSnapshot: () => Promise<PreSnapshotOutcome>;
    now: () => Date;
}

/** Options : `write: false` est la simulation (convention du dépôt). */
export interface RunRestoreOptions {
    snapshotId?: string | null;
    tables?: readonly string[] | null;
    allowDelete?: readonly string[];
    write: boolean;
}

/** Rapport par table : ce qui sera (ou a été) touché, et ce qui est préservé. */
export interface RestoreTableReport {
    table: string;
    appendOnly: boolean;
    insert: number;
    update: number;
    delete: number;
    preserved: number;
    bridgePreserved: number;
    deleteAllowed: boolean;
    reason: string;
}

/** Rapport structuré d'une simulation, d'une application ou d'un échec. */
export interface RestoreReport {
    snapshotId: string;
    dryRun: boolean;
    status: 'simulated' | 'applied' | 'failed';
    tables: RestoreTableReport[];
    totals: { insert: number; update: number; delete: number; preserved: number; bridgePreserved: number };
    writeOrder: readonly string[];
    deleteOrder: readonly string[];
    preSnapshotId: string | null;
    postCheck: { ok: boolean; mismatches: string[] } | null;
    bridgeFallbacks: BridgeFallback[];
    error: string | null;
    durationMs: number;
}

function describe(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return 'cause inconnue';
}

/** Résout l'entrée de catalogue demandée ; refuse un run interrompu. */
function resolveEntry(entries: readonly BackupIndexEntry[], requested: string | null): BackupIndexEntry {
    const sorted = [...entries].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
    const entry =
        requested === null ? sorted.find((candidate) => candidate.status !== 'incomplete') : entries.find((candidate) => candidate.id === requested);
    if (entry === undefined) {
        throw new RestoreError('resolution', `Instantané « ${requested ?? 'le plus récent'} » introuvable dans le catalogue.`);
    }
    if (entry.status === 'incomplete') {
        throw new RestoreError('resolution', `Instantané « ${entry.id} » incomplet (run interrompu) — jamais un point de restauration.`);
    }
    return entry;
}

/** Périmètre ciblé : sous-ensemble demandé, chaque table vérifiée avant calcul. */
function selectTables(available: readonly string[], requested: readonly string[] | null): string[] {
    if (requested === null) return [...available];
    const missing = requested.filter((table) => !available.includes(table));
    if (missing.length > 0) {
        throw new RestoreError('perimetre', `Table(s) demandée(s) absente(s) de l'instantané : ${missing.join(', ')}.`);
    }
    return [...requested];
}

/** Recompte post-restauration : écart ⇒ échec explicite, jamais un silence. */
async function verifyCounts(
    deps: RestoreDependencies,
    tables: readonly string[],
    expected: ReadonlyMap<string, number>,
    deleteRestricted: ReadonlySet<string>,
): Promise<{ ok: boolean; mismatches: string[] }> {
    const reads = await deps.readTables(tables);
    if (!reads.ok) return { ok: false, mismatches: [`relecture refusée [${reads.error.code}] — ${reads.error.message}`] };
    const actual = new Map(reads.tables.map((read) => [read.table, read.rows.length]));
    const mismatches: string[] = [];
    for (const table of tables) {
        const want = expected.get(table) ?? 0;
        const got = actual.get(table) ?? 0;
        // Table où la suppression reste refusée : seuls ajouts et mises à jour ont eu
        // lieu, le comptage final ne peut donc qu'être supérieur ou égal à l'instantané.
        const tolerant = deleteRestricted.has(table);
        if (tolerant ? got < want : got !== want) {
            mismatches.push(`${table} : ${got} ligne(s) après restauration, ${want} attendue(s).`);
        }
    }
    return { ok: mismatches.length === 0, mismatches };
}

/**
 * Exécute une restauration. Retourne un rapport en simulation et en succès ;
 * **lève** `RestoreError` sur tout point de refus (intégrité, périmètre,
 * pré-instantané absent) : une opération qui ne peut pas aboutir ne doit pas
 * ressembler à un résultat exploitable.
 */
export async function runRestore(deps: RestoreDependencies, options: RunRestoreOptions): Promise<RestoreReport> {
    const startedAt = deps.now().getTime();
    const write = options.write === true;
    const allowDelete = new Set(options.allowDelete ?? []);

    // (a) résolution de l'instantané
    const index = await readBackupIndex(deps.storage, deps.indexObjectKey, () => deps.now().toISOString());
    if (!index.ok) throw new RestoreError('catalogue', `Catalogue illisible [${index.error.code}] — ${index.error.message}.`);
    const entry = resolveEntry(index.value.entries, options.snapshotId ?? null);

    const manifestObject = await deps.storage.get(`${entry.prefix}/manifest.json`);
    if (!manifestObject.ok) throw new RestoreError('manifeste', `Manifeste illisible [${manifestObject.error.code}] — ${manifestObject.error.message}.`);
    const parsed = parseManifest(manifestObject.value.toString('utf8'));
    if (!parsed.ok) throw new RestoreError('manifeste', `Manifeste refusé — ${parsed.error}`);
    const manifest: BackupManifest = parsed.manifest;

    // (b) intégrité et non-vacuité — AVANT toute écriture
    const bytesByKey = new Map<string, Buffer>();
    const digests: PartDigest[] = [];
    for (const part of manifest.parts) {
        const fetched = await deps.storage.get(part.objectKey);
        if (!fetched.ok) throw new RestoreError('integrite', `Partie « ${part.objectKey} » illisible [${fetched.error.code}].`);
        bytesByKey.set(part.objectKey, fetched.value);
        digests.push({ objectKey: part.objectKey, sha256: deps.digest(fetched.value) });
    }
    const failures = verifyManifestIntegrity(manifest, digests).map((failure) => `${failure.objectKey} : ${failure.reason}`);
    const totals = verifyManifestTotals(manifest);
    if (!totals.ok) failures.push('totaux du manifeste incohérents avec ses parties');
    if (failures.length > 0) throw new RestoreError('integrite', `Intégrité invalide — ${failures.join(' ; ')}.`);

    // (c) déchiffrement / décompression / lignes
    const rowsByTable = new Map<string, BackupRow[]>();
    for (const part of manifest.parts) {
        if (part.kind !== 'table' || part.table === null) continue;
        const envelope = bytesByKey.get(part.objectKey);
        if (envelope === undefined) throw new RestoreError('parties', `Partie « ${part.objectKey} » absente de la lecture.`);
        let plain: Buffer;
        try {
            plain = deps.decompress(deps.decrypt(envelope));
        } catch (error) {
            throw new RestoreError('dechiffrement', `Partie « ${part.objectKey} » illisible — ${describe(error)}.`);
        }
        const rows = parseNdjson(plain.toString('utf8'), part.objectKey);
        if (!rows.ok) throw new RestoreError('parties', rows.error);
        if (rows.rows.length !== part.rows) {
            throw new RestoreError('parties', `Comptage incohérent pour « ${part.objectKey} » : ${rows.rows.length} lue(s) ≠ ${part.rows} déclarée(s).`);
        }
        rowsByTable.set(part.table, rows.rows);
    }
    if (![...rowsByTable.values()].some((rows) => rows.length > 0)) {
        throw new RestoreError('non-vacuite', 'Instantané vide — restauration refusée (aucune ligne exploitable).');
    }

    // (d) pré-vol de périmètre
    for (const table of rowsByTable.keys()) assertBackupScope(table);
    const selected = selectTables([...rowsByTable.keys()], options.tables ?? null);

    // (e) plan : diff par table, puis politique de suppression
    const reads = await deps.readTables(selected);
    if (!reads.ok) throw new RestoreError('etat-courant', `Lecture refusée [${reads.error.code}] — ${reads.error.message}.`);
    const currentByTable = new Map(reads.tables.map((read) => [read.table, read.rows]));

    const ops: RestoreTableOps[] = [];
    const reports: RestoreTableReport[] = [];
    const restricted = new Set<string>();
    for (const table of selected) {
        const snapshotRows: BackupRow[] = rowsByTable.get(table) ?? [];
        const currentRows: readonly BackupRow[] = currentByTable.get(table) ?? [];
        const diff: TableDiff = diffTable({ table, primaryKey: primaryKeyOf(table), currentRows, snapshotRows });
        const policy = resolveDeletePolicy({ table, allowDelete: allowDelete.has(table) });
        const deletions = policy.allowed ? diff.toDelete : [];
        const preserved = diff.preservedBridgeRows.length + (policy.allowed ? 0 : diff.toDelete.length);
        if (policy.appendOnly && !policy.allowed) restricted.add(table);
        ops.push({
            table,
            primaryKey: primaryKeyOf(table),
            toInsert: diff.toInsert,
            toUpdate: diff.toUpdate,
            toDelete: deletions,
            preserved,
        });
        reports.push({
            table, appendOnly: policy.appendOnly, insert: diff.toInsert.length, update: diff.toUpdate.length,
            delete: deletions.length, preserved, bridgePreserved: diff.preservedBridgeRows.length,
            deleteAllowed: policy.allowed, reason: policy.reason,
        });
    }

    const order = orderByDependencies(selected);
    if (order.cycles.length > 0) {
        throw new RestoreError('ordre-fk', `Graphe de dépendances cyclique — ${order.cycles.map((cycle) => cycle.join(' → ')).join(' ; ')}.`);
    }
    const deleteOrder = computeDeleteOrder(selected);
    const plan: ApplyRestorePlan = { writeOrder: order.order, deleteOrder, ops };
    const aggregateTotals = reports.reduce(
        (sum, report) => ({
            insert: sum.insert + report.insert, update: sum.update + report.update, delete: sum.delete + report.delete,
            preserved: sum.preserved + report.preserved, bridgePreserved: sum.bridgePreserved + report.bridgePreserved,
        }),
        { insert: 0, update: 0, delete: 0, preserved: 0, bridgePreserved: 0 },
    );
    const finish = (
        status: RestoreReport['status'],
        error: string | null,
        postCheck: RestoreReport['postCheck'],
        preSnapshotId: string | null,
        bridgeFallbacks: BridgeFallback[],
    ): RestoreReport => ({
        snapshotId: entry.id, dryRun: !write, status, tables: reports, totals: aggregateTotals,
        writeOrder: plan.writeOrder, deleteOrder: plan.deleteOrder, preSnapshotId, postCheck,
        bridgeFallbacks, error, durationMs: deps.now().getTime() - startedAt,
    });

    // (f) simulation par défaut : rien n'est écrit
    if (!write) return finish('simulated', null, null, null, []);

    // (g) filet obligatoire : sans pré-instantané valide, pas de retour arrière
    const pre = await deps.preSnapshot();
    if (!pre.ok || pre.degraded || pre.snapshotId === null) {
        throw new RestoreError(
            'pre-instantane',
            `Pré-instantané absent ou dégradé (${pre.error ?? (pre.degraded ? 'dégradé' : 'inconnu')}) — écriture refusée : sans filet, pas de retour arrière.`,
        );
    }

    // (h) application en transaction unique, puis recomptage
    const applied = await deps.applyRestore(plan);
    if (!applied.ok) {
        return finish('failed', applied.error ?? 'Transaction annulée.', null, pre.snapshotId, applied.bridgeFallbacks);
    }
    const expected = new Map(reports.map((report) => [report.table, rowsByTable.get(report.table)?.length ?? 0]));
    const post = await verifyCounts(deps, selected, expected, restricted);
    return finish(
        post.ok ? 'applied' : 'failed',
        post.ok ? null : 'Recomptage post-restauration en écart — restauration à réexaminer.',
        post, pre.snapshotId, applied.bridgeFallbacks,
    );
}
