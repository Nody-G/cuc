import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { BackupPart, BackupRow } from './contracts';
import { gunzipBuffer, gzipBuffer, toNdjson } from './io/compress';
import { decryptBuffer, encryptBuffer } from './io/crypto';
import type { ApplyRestorePlan, RestoreApplyResult, RestoreDbClient } from './io/db-restore';
import { applyRestore } from './io/db-restore';
import { writeBackupIndex } from './io/index-store';
import type { BackupStorage } from './io/storage';
import { createLocalStorage } from './io/storage-local';
import { buildManifest, serializeManifest } from './manifest';
import { sha256Hex } from './naming';
import { RestoreError, runRestore, type RestoreDependencies } from './restore';

const PREFIX = 'cuc-backups';
const KEY = Buffer.alloc(32, 7);
const KEY_ID = 'v1';
const SNAPSHOT_ID = 'snapshot-20261001T023000Z-a1b2c3d';
const now = (): Date => new Date('2026-10-01T12:00:00.000Z');

/** État « base courante » simulé — aucune vraie base n'est jamais ouverte. */
interface State {
    rows: Record<string, BackupRow[]>;
}

/** Client factice : aucun test n'ouvre de connexion Postgres réelle. */
function createFakeClient(failOn?: (text: string) => Error | null) {
    const queries: string[] = [];
    const client: RestoreDbClient = {
        async connect(): Promise<void> { },
        async query(text: string): Promise<{ rows?: unknown[] }> {
            queries.push(text);
            const failure = failOn?.(text);
            if (failure !== null && failure !== undefined) throw failure;
            return { rows: [] };
        },
        async end(): Promise<void> { },
    };
    return { client, queries };
}

/** Dépôt local réel (dossier temporaire), clé de test : aucune donnée de production. */
async function createStorage(): Promise<BackupStorage> {
    const created = createLocalStorage({ kind: 'local', root: mkdtempSync(path.join(tmpdir(), 'cuc-restore-')) });
    if (!created.ok) throw new Error(created.error.message);
    return created.value;
}

/** Nombre d'objets sous le préfixe — sert à prouver qu'une simulation n'écrit rien. */
async function objectCount(storage: BackupStorage): Promise<number> {
    const listed = await storage.list(PREFIX);
    if (!listed.ok) throw new Error(listed.error.message);
    return listed.value.length;
}

/** Écrit un instantané complet : parties chiffrées + manifeste + catalogue. */
async function writeSnapshot(
    storage: BackupStorage,
    tables: readonly { table: string; rows: BackupRow[] }[],
): Promise<{ parts: BackupPart[] }> {
    const parts: BackupPart[] = [];
    for (const { table, rows } of tables) {
        const plain = Buffer.from(toNdjson(rows), 'utf8');
        const envelope = encryptBuffer(gzipBuffer(plain), KEY, KEY_ID);
        const objectKey = `${PREFIX}/data/${table}.ndjson.gz.enc`;
        const written = await storage.put(objectKey, envelope);
        if (!written.ok) throw new Error(written.error.message);
        parts.push({
            kind: 'table', table, objectKey, rows: rows.length, compressedBytes: envelope.byteLength,
            plainBytes: plain.byteLength, sha256: sha256Hex(envelope), compression: 'gzip', cipher: 'aes-256-gcm',
        });
    }
    const manifest = buildManifest({
        id: SNAPSHOT_ID, createdAt: '2026-10-01T02:30:00.000Z', tier: 'daily',
        app: { name: 'cuc-app', version: '0.1.0' },
        encryption: { algorithm: 'aes-256-gcm', keyDerivation: `aes-256-gcm/${KEY_ID}` },
        parts,
    });
    if (!(await storage.put(`${PREFIX}/manifest.json`, Buffer.from(serializeManifest(manifest), 'utf8'))).ok) {
        throw new Error('manifeste non écrit');
    }
    const indexed = await writeBackupIndex(
        storage,
        {
            formatVersion: 1, updatedAt: '2026-10-01T02:30:00.000Z',
            entries: [{
                id: SNAPSHOT_ID, createdAt: '2026-10-01T02:30:00.000Z', tier: 'daily', status: 'complete',
                partsCount: parts.length, bytes: manifest.totals.bytes, prefix: PREFIX, appVersion: '0.1.0', gitCommit: null,
            }],
        },
        `${PREFIX}/index.json`,
    );
    if (!indexed.ok) throw new Error(indexed.error.message);
    return { parts };
}

/** Dépendances injectées : base simulée, clé de test, aucune I/O réseau. */
function buildDeps(storage: BackupStorage, state: State, overrides: Partial<RestoreDependencies> = {}): RestoreDependencies {
    return {
        storage,
        indexObjectKey: `${PREFIX}/index.json`,
        readTables: async (tables) => ({
            ok: true,
            tables: tables.map((table) => ({ table, rows: state.rows[table] ?? [], sha256: '' })),
        }),
        digest: sha256Hex,
        decrypt: (envelope) => decryptBuffer(envelope, (keyId) => (keyId === KEY_ID ? KEY : null)),
        decompress: gunzipBuffer,
        applyRestore: vi.fn(async () => ({
            ok: true, committed: true, rolledBack: false, tables: [], bridgeFallbacks: [], statements: [], error: null,
        })),
        preSnapshot: vi.fn(async () => ({ ok: true, snapshotId: 'snapshot-pre', degraded: false, error: null })),
        now,
        ...overrides,
    };
}

/**
 * Moteur d'application réel (transaction + SQL) sur client factice, qui reflète
 * ensuite l'effet du plan sur l'état simulé — comme le ferait la base.
 */
function realEngine(state: State, failOn?: (text: string) => Error | null) {
    const captured: { statements: string[] } = { statements: [] };
    const apply = async (plan: ApplyRestorePlan): Promise<RestoreApplyResult> => {
        const { client, queries } = createFakeClient(failOn);
        const result = await applyRestore({ connectionString: 'postgres://fake/db', plan, clientFactory: () => client });
        captured.statements = queries;
        if (!result.ok) return result;
        // Colonnes de pont abandonnées (FK refusée) : la base contient bien NULL.
        const nulled = new Map(result.bridgeFallbacks.map((fallback) => [fallback.table, fallback.columns]));
        for (const op of plan.ops) {
            const current = state.rows[op.table] ?? [];
            const removed = new Set(op.toDelete.map((row) => String(row[op.primaryKey])));
            const byKey = new Map(current.filter((row) => !removed.has(String(row[op.primaryKey]))).map((row) => [String(row[op.primaryKey]), row]));
            for (const row of [...op.toUpdate, ...op.toInsert]) {
                const columns = nulled.get(op.table);
                const restored = columns === undefined ? row : Object.fromEntries(Object.entries(row).map(([key, value]) => [key, columns.includes(key) ? null : value]));
                byKey.set(String(row[op.primaryKey]), restored);
            }
            state.rows[op.table] = [...byKey.values()];
        }
        return result;
    };
    return { apply, captured };
}

const pagesRow = (slug: string, title: string): BackupRow => ({ slug, title, is_published: true });

describe('backup/restore — retour arrière versionné', () => {
    it('en simulation, ne modifie rien du tout', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil')] }]);
        const state: State = { rows: { site_pages: [pagesRow('/', 'Modifié depuis')] } };
        const deps = buildDeps(storage, state);
        const before = await objectCount(storage);

        const report = await runRestore(deps, { write: false });

        expect(report.status).toBe('simulated');
        expect(report.dryRun).toBe(true);
        expect(report.totals.update).toBe(1);
        expect(deps.applyRestore).not.toHaveBeenCalled();
        expect(deps.preSnapshot).not.toHaveBeenCalled();
        expect(await objectCount(storage)).toBe(before);
    });

    it('abandonne tout avant la moindre écriture si une part est altérée', async () => {
        const storage = await createStorage();
        const { parts } = await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil')] }]);
        await storage.put(parts[0].objectKey, Buffer.from('part altérée'));
        const deps = buildDeps(storage, { rows: {} });

        await expect(runRestore(deps, { write: true })).rejects.toBeInstanceOf(RestoreError);
        await expect(runRestore(deps, { write: true })).rejects.toThrow(/Intégrité invalide/);
        expect(deps.applyRestore).not.toHaveBeenCalled();
        expect(deps.preSnapshot).not.toHaveBeenCalled();
    });

    it('applique dans une transaction unique et annule tout par ROLLBACK', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil')] }]);
        const state: State = { rows: { site_pages: [pagesRow('/', 'Modifié depuis')] } };
        const engine = realEngine(state, (text) => (text.startsWith('UPDATE') ? new Error('conflit simulé') : null));
        const deps = buildDeps(storage, state, { applyRestore: engine.apply });

        const report = await runRestore(deps, { write: true });

        expect(report.status).toBe('failed');
        expect(report.error).toContain('conflit simulé');
        expect(report.preSnapshotId).toBe('snapshot-pre');
        expect(engine.captured.statements).toContain('BEGIN');
        expect(engine.captured.statements).toContain('ROLLBACK');
        expect(engine.captured.statements).not.toContain('COMMIT');
    });

    it('retire du plan les suppressions d’une table append-only et les compte comme préservées', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [
            { table: 'site_pages', rows: [pagesRow('/', 'Accueil')] },
            { table: 'site_inquiries', rows: [] },
        ]);
        const state: State = { rows: { site_pages: [pagesRow('/', 'Accueil')], site_inquiries: [{ id: 'inq_1', full_name: 'Candidat' }] } };
        const captured: { plan: ApplyRestorePlan | null } = { plan: null };
        const deps = buildDeps(storage, state, {
            applyRestore: async (plan) => {
                captured.plan = plan;
                return { ok: true, committed: true, rolledBack: false, tables: [], bridgeFallbacks: [], statements: [], error: null };
            },
        });

        const report = await runRestore(deps, { write: true });

        const inquiries = captured.plan?.ops.find((op) => op.table === 'site_inquiries');
        expect(inquiries?.toDelete).toEqual([]);
        expect(inquiries?.preserved).toBe(1);
        expect(report.tables.find((table) => table.table === 'site_inquiries')).toMatchObject({
            appendOnly: true, delete: 0, preserved: 1, deleteAllowed: false,
        });
        expect(report.status).toBe('applied');
    });

    it('ne réécrit jamais une colonne de pont par un UPDATE', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_sessions', rows: [{ id: 's1', title: 'A', cuc_sign_formation_id: null }] }]);
        const state: State = { rows: { site_sessions: [{ id: 's1', title: 'B', cuc_sign_formation_id: null }] } };
        const engine = realEngine(state);
        const deps = buildDeps(storage, state, { applyRestore: engine.apply });

        const report = await runRestore(deps, { write: true });

        expect(report.status).toBe('applied');
        const update = engine.captured.statements.find((statement) => statement.startsWith('UPDATE'));
        expect(update).toContain('"title" = $1');
        expect(update).not.toContain('cuc_sign_formation_id');
        expect(state.rows.site_sessions).toEqual([{ id: 's1', title: 'A', cuc_sign_formation_id: null }]);
    });

    it('rejoue en NULL une insertion refusée par la clé étrangère du pont, et le trace', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_sessions', rows: [{ id: 's2', title: 'N', cuc_sign_formation_id: 'formation-1' }] }]);
        const state: State = { rows: { site_sessions: [] } };
        let inserts = 0;
        const engine = realEngine(state, (text) => {
            if (!text.startsWith('INSERT')) return null;
            inserts += 1;
            return inserts === 1 ? Object.assign(new Error('fk'), { code: '23503' }) : null;
        });
        const deps = buildDeps(storage, state, { applyRestore: engine.apply });

        const report = await runRestore(deps, { write: true });

        expect(report.status).toBe('applied');
        expect(report.bridgeFallbacks).toHaveLength(1);
        expect(report.bridgeFallbacks[0]).toMatchObject({ table: 'site_sessions', columns: ['cuc_sign_formation_id'] });
        expect(engine.captured.statements).toContain('ROLLBACK TO SAVEPOINT restore_bridge');
        expect(state.rows.site_sessions).toEqual([{ id: 's2', title: 'N', cuc_sign_formation_id: null }]);
    });

    it('abandonne l’écriture sans pré-instantané valide', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil')] }]);
        const state: State = { rows: { site_pages: [pagesRow('/', 'Modifié depuis')] } };

        for (const outcome of [
            { ok: false, snapshotId: null, degraded: false, error: 'sauvegarde impossible' },
            { ok: true, snapshotId: 'snapshot-degrade', degraded: true, error: null },
        ]) {
            const deps = buildDeps(storage, state, { preSnapshot: vi.fn(async () => outcome) });
            await expect(runRestore(deps, { write: true })).rejects.toThrow(/Pré-instantané absent ou dégradé/);
            expect(deps.applyRestore).not.toHaveBeenCalled();
        }
    });

    it('signale un écart de recomptage après restauration', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil'), pagesRow('/contact', 'Contact')] }]);
        const state: State = { rows: { site_pages: [pagesRow('/', 'Accueil')] } };
        const deps = buildDeps(storage, state); // la transaction « réussit » sans rien changer

        const report = await runRestore(deps, { write: true });

        expect(report.status).toBe('failed');
        expect(report.postCheck?.ok).toBe(false);
        expect(report.postCheck?.mismatches[0]).toContain('site_pages');
        expect(report.error).toContain('Recomptage post-restauration en écart');
        expect(report.preSnapshotId).toBe('snapshot-pre');
    });

    it('refuse une table demandée absente de l’instantané et un identifiant inconnu', async () => {
        const storage = await createStorage();
        await writeSnapshot(storage, [{ table: 'site_pages', rows: [pagesRow('/', 'Accueil')] }]);
        const state: State = { rows: {} };

        await expect(runRestore(buildDeps(storage, state), { write: false, tables: ['site_team'] })).rejects.toThrow(/absente/);
        await expect(runRestore(buildDeps(storage, state), { write: false, snapshotId: 'snapshot-inconnu' })).rejects.toThrow(/introuvable/);
    });
});
