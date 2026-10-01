/**
 * Miroir média — bout en bout **sans réseau ni Supabase** : client Storage
 * factice, dépôt local temporaire, vraie clé AES-256. Prouve le premier run, le
 * second run strictement incrémental (compteur d'écritures), le chiffrement
 * effectif, la dégradation tracée si un téléchargement échoue, et le
 * ramasse-miettes conservateur (blob référencé jamais supprimé, manifeste
 * illisible ⇒ aucune suppression).
 */
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { BackupIndexEntry, BackupPart } from './contracts';
import { gunzipBuffer, gzipBuffer } from './io/compress';
import { AES_256_KEY_BYTES, decryptBuffer, encryptBuffer } from './io/crypto';
import { writeBackupIndex } from './io/index-store';
import type { MediaClient } from './io/media';
import type { BackupStorage, StorageResult } from './io/storage';
import { createLocalStorage } from './io/storage-local';
import { buildManifest, serializeManifest } from './manifest';
import { buildMediaIndex, mediaKeyFor, type MediaIndexEntry } from './media-index';
import { collectMediaGarbage } from './media-gc';
import { loadPreviousMediaIndex, runMediaMirror, type MediaMirrorDependencies } from './media-mirror';
import { buildIndexObjectKey, sha256Hex } from './naming';

const KEY_ID = 'test-key';
const KEY = randomBytes(AES_256_KEY_BYTES);
const PREFIX = 'cuc-backups';
const INDEX_KEY = buildIndexObjectKey(PREFIX);
const CREATED_AT = '2026-10-01T02:30:00.000Z';
const KEY_BYTES: Uint8Array = KEY;

function encrypt(plain: Uint8Array): Buffer {
    return encryptBuffer(plain, KEY_BYTES, KEY_ID);
}
function decrypt(envelope: Uint8Array): Buffer {
    return decryptBuffer(envelope, (id) => (id === KEY_ID ? KEY_BYTES : null));
}
function unwrap<T>(result: StorageResult<T>): T {
    if (!result.ok) throw new Error(`stockage indisponible — ${result.error.code}: ${result.error.message}`);
    return result.value;
}

interface FakeWorld {
    folders: Record<string, Record<string, Record<string, { name: string; id: string | null; size: number; updatedAt: string | null }>>>;
    content: Record<string, Buffer>;
    failingPaths?: Set<string>;
}
function createFakeClient(world: FakeWorld): MediaClient {
    return {
        storage: {
            from(bucket: string) {
                return {
                    async list(folder = '', options = {}) {
                        const limit = options.limit ?? 100;
                        const offset = options.offset ?? 0;
                        const entries = Object.values(world.folders[bucket]?.[folder] ?? {}).slice(offset, offset + limit);
                        return { data: entries, error: null };
                    },
                    async download(objectPath: string) {
                        if (world.failingPaths?.has(objectPath)) return { data: null, error: { message: 'panne simulée' } };
                        const buffer = world.content[objectPath];
                        if (buffer === undefined) return { data: null, error: { message: 'absent' } };
                        return { data: buffer, error: null };
                    },
                };
            },
        },
    };
}
function file(name: string, id: string, size: number, updatedAt: string | null = null) {
    return { name, id, size, updatedAt };
}

let root = '';
beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'cuc-media-'));
});
afterEach(async () => {
    await rm(root, { recursive: true, force: true });
});

const WORLD: FakeWorld = {
    folders: {
        'cuc-vitrine-assets': { '': { one: file('one.png', '1', 3), two: file('two.png', '2', 3), three: file('three.png', '3', 6) } },
        avatars: { '': {} },
    },
    content: { 'one.png': Buffer.from('aaa'), 'two.png': Buffer.from('aaa'), 'three.png': Buffer.from('bbbbbb') },
};

function makeDeps(
    storage: BackupStorage,
    client: MediaClient | null,
    loadPreviousIndex: MediaMirrorDependencies['loadPreviousIndex'],
): MediaMirrorDependencies {
    return { client, storage, prefix: PREFIX, encrypt, loadPreviousIndex, now: () => new Date(CREATED_AT) };
}

function emptyPrevious() {
    return async () => ({ ok: true, entries: [] as MediaIndexEntry[], reason: null });
}

describe('backup/media-mirror — miroir incrémental chiffré', () => {
    it('premier run : téléverse les blobs uniques et produit l’index', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const outcome = await runMediaMirror(
            makeDeps(storage, createFakeClient(WORLD), emptyPrevious()),
            { snapshotPrefix: `${PREFIX}/site/2026/10/s1`, write: true },
        );

        expect(outcome.degraded).toBe(false);
        expect(outcome.media).not.toBeNull();
        // trois objets, deux contenus identiques ⇒ 2 blobs uniques
        expect(outcome.report.sourceObjects).toBe(3);
        expect(outcome.report.uniqueBlobs).toBe(2);
        expect(outcome.report.uploaded).toBe(2);
        expect(outcome.report.deduplicatedPaths).toBe(1);

        const entries = JSON.parse(Buffer.from(outcome.media!.payload).toString('utf8')) as MediaIndexEntry[];
        expect(entries).toHaveLength(3);
        for (const hash of new Set(entries.map((entry) => entry.sha256))) {
            const blob = await storage.get(mediaKeyFor(hash, PREFIX));
            expect(blob.ok).toBe(true);
        }
    });

    it('chiffre effectivement : le blob stocké n’est pas en clair et se déchiffre', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        await runMediaMirror(makeDeps(storage, createFakeClient(WORLD), emptyPrevious()), {
            snapshotPrefix: `${PREFIX}/site/2026/10/s1`,
            write: true,
        });

        const hash = sha256Hex(Buffer.from('bbbbbb'));
        const stored = await storage.get(mediaKeyFor(hash, PREFIX));
        expect(stored.ok).toBe(true);
        if (!stored.ok) return;
        expect(stored.value.equals(Buffer.from('bbbbbb'))).toBe(false); // jamais en clair
        expect(decrypt(stored.value).toString('utf8')).toBe('bbbbbb');
    });

    it('second run : aucun re-téléversement (incrémental prouvé par le compteur d’écritures)', async () => {
        const base = unwrap(createLocalStorage({ kind: 'local', root }));
        const first = await runMediaMirror(makeDeps(base, createFakeClient(WORLD), emptyPrevious()), {
            snapshotPrefix: `${PREFIX}/site/2026/10/s1`,
            write: true,
        });
        const previous = JSON.parse(Buffer.from(first.media!.payload).toString('utf8')) as MediaIndexEntry[];

        let writes = 0;
        const counted: BackupStorage = {
            ...base,
            async put(objectKey, body, meta) {
                writes += 1;
                return base.put(objectKey, body, meta);
            },
        };
        const second = await runMediaMirror(
            makeDeps(counted, createFakeClient(WORLD), async () => ({ ok: true, entries: previous, reason: null })),
            { snapshotPrefix: `${PREFIX}/site/2026/10/s2`, write: true },
        );

        expect(second.report.uploaded).toBe(0);
        expect(second.report.unchanged).toBe(3);
        expect(second.report.added).toBe(0);
        expect(writes).toBe(0);
    });

    it('dégrade de façon tracée si un téléchargement échoue', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const world: FakeWorld = { ...WORLD, failingPaths: new Set(['three.png']) };
        const outcome = await runMediaMirror(makeDeps(storage, createFakeClient(world), emptyPrevious()), {
            snapshotPrefix: `${PREFIX}/site/2026/10/s1`,
            write: true,
        });

        expect(outcome.degraded).toBe(true);
        expect(outcome.failures.join(' ')).toContain('three.png');
    });

    it('sans client (creds absents), le run média est explicitement dégradé et sans part', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const outcome = await runMediaMirror(makeDeps(storage, null, emptyPrevious()), {
            snapshotPrefix: `${PREFIX}/site/2026/10/s1`,
            write: true,
        });
        expect(outcome.degraded).toBe(true);
        expect(outcome.media).toBeNull();
    });
});

/** Écrit un instantané média minimal (manifeste + part + entrée de catalogue). */
async function writeMediaSnapshot(storage: BackupStorage, prefix: string, id: string, entries: MediaIndexEntry[]) {
    const snapshotPrefix = `${prefix}/site/2026/10/${id}`;
    const payload = Buffer.from(JSON.stringify(entries), 'utf8');
    const envelope = encryptBuffer(gzipBuffer(payload), KEY_BYTES, KEY_ID);
    const part: BackupPart = {
        kind: 'media-index', table: null, objectKey: `${snapshotPrefix}/data/media-index.json.gz.enc`,
        rows: entries.length, compressedBytes: envelope.byteLength, plainBytes: payload.byteLength,
        sha256: sha256Hex(envelope), compression: 'gzip', cipher: 'aes-256-gcm',
    };
    await storage.put(part.objectKey, envelope, { contentType: 'application/octet-stream' });
    const manifest = buildManifest({
        id, createdAt: CREATED_AT, tier: 'daily', app: { name: 'cuc-app', version: '0.1.0' },
        git: { commit: null, branch: null }, encryption: { algorithm: 'aes-256-gcm', keyDerivation: 'k' }, parts: [part],
    });
    await storage.put(`${snapshotPrefix}/manifest.json`, Buffer.from(serializeManifest(manifest), 'utf8'), { contentType: 'application/json' });
    const entry: BackupIndexEntry = {
        id, createdAt: CREATED_AT, tier: 'daily', status: 'complete', partsCount: 1, bytes: envelope.byteLength,
        prefix: snapshotPrefix, appVersion: '0.1.0', gitCommit: null,
    };
    await writeBackupIndex(storage, { formatVersion: 1, updatedAt: CREATED_AT, entries: [entry] }, `${prefix}/index.json`);
    return { snapshotPrefix };
}

describe('backup/media-mirror — ramasse-miettes conservateur', () => {
    it('ne supprime jamais un blob référencé ; supprime un orphelin', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const keptHash = sha256Hex(Buffer.from('kept'));
        const orphanHash = sha256Hex(Buffer.from('orphan'));
        const entries = buildMediaIndex([{ bucket: 'cuc-vitrine-assets', path: 'keep.png', size: 4, sha256: keptHash }]);
        await writeMediaSnapshot(storage, PREFIX, 's1', entries);

        const keptKey = mediaKeyFor(keptHash, PREFIX);
        const orphanKey = mediaKeyFor(orphanHash, PREFIX);
        await storage.put(keptKey, Buffer.from('blob-keep'), {});
        await storage.put(orphanKey, Buffer.from('blob-orphan'), {});

        const report = await collectMediaGarbage({
            storage, prefix: PREFIX, indexObjectKey: INDEX_KEY, decrypt, decompress: gunzipBuffer, now: () => new Date(CREATED_AT),
        });

        expect(report.aborted).toBe(false);
        expect(report.removed).toEqual([orphanKey]);
        const kept = await storage.exists(keptKey);
        expect(kept.ok && kept.value).toBe(true);
        const orphan = await storage.exists(orphanKey);
        expect(orphan.ok && orphan.value).toBe(false);
    });

    it('un manifeste illisible bloque toute suppression', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const orphanKey = mediaKeyFor(sha256Hex(Buffer.from('orphan')), PREFIX);
        await storage.put(orphanKey, Buffer.from('blob-orphan'), {});

        const entry: BackupIndexEntry = {
            id: 'ghost', createdAt: CREATED_AT, tier: 'daily', status: 'complete', partsCount: 1, bytes: 0,
            prefix: `${PREFIX}/site/2026/10/ghost`, appVersion: '0.1.0', gitCommit: null,
        };
        await writeBackupIndex(storage, { formatVersion: 1, updatedAt: CREATED_AT, entries: [entry] }, INDEX_KEY);

        const report = await collectMediaGarbage({
            storage, prefix: PREFIX, indexObjectKey: INDEX_KEY, decrypt, decompress: gunzipBuffer, now: () => new Date(CREATED_AT),
        });

        expect(report.aborted).toBe(true);
        expect(report.reason).toContain('illisible');
        expect(report.removed).toEqual([]);
        const orphan = await storage.exists(orphanKey);
        expect(orphan.ok && orphan.value).toBe(true); // conservé : en cas de doute, on garde
    });

    it('relit l’index du dernier instantané conservé', async () => {
        const storage = unwrap(createLocalStorage({ kind: 'local', root }));
        const entries = buildMediaIndex([{ bucket: 'cuc-vitrine-assets', path: 'keep.png', size: 4, sha256: sha256Hex(Buffer.from('kept')) }]);
        await writeMediaSnapshot(storage, PREFIX, 's1', entries);

        const loaded = await loadPreviousMediaIndex({
            storage, indexObjectKey: INDEX_KEY, decrypt, decompress: gunzipBuffer, now: () => new Date(CREATED_AT),
        });
        expect(loaded.ok).toBe(true);
        expect(loaded.entries.map((entry) => entry.path)).toEqual(['keep.png']);
    });
});
