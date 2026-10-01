import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { BackupIndex, BackupIndexEntry } from '../contracts';
import {
    INDEX_FORMAT_VERSION,
    INDEX_OBJECT_KEY,
    emptyBackupIndex,
    parseBackupIndex,
    readBackupIndex,
    writeBackupIndex,
} from './index-store';
import type { BackupStorage } from './storage';
import { createLocalStorage } from './storage-local';

const FIXED_NOW = '2026-10-01T10:00:00.000Z';

let root: string;
let storage: BackupStorage;

beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'cuc-backup-index-'));
    const created = createLocalStorage({ kind: 'local', root });
    if (!created.ok) throw new Error('stockage local non créé');
    storage = created.value;
});

afterEach(() => {
    rmSync(root, { recursive: true, force: true });
});

function entry(overrides: Partial<BackupIndexEntry> = {}): BackupIndexEntry {
    return {
        id: 'snapshot-20261001T023000Z',
        createdAt: '2026-10-01T02:30:00.000Z',
        tier: 'daily',
        status: 'complete',
        partsCount: 21,
        bytes: 4_194_304,
        prefix: 'site/2026/10/snapshot-20261001T023000Z',
        appVersion: '0.1.0',
        gitCommit: 'a1b2c3d',
        ...overrides,
    };
}

describe('backup/io/index-store — catalogue hors base', () => {
    it('retourne un index vide valide quand le catalogue est absent (pas une erreur)', async () => {
        const result = await readBackupIndex(storage, INDEX_OBJECT_KEY, () => FIXED_NOW);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toEqual({ formatVersion: INDEX_FORMAT_VERSION, updatedAt: FIXED_NOW, entries: [] });
        }
    });

    it('rend un index vide valide par la fabrique dédiée', () => {
        expect(emptyBackupIndex(FIXED_NOW).entries).toEqual([]);
        expect(emptyBackupIndex(FIXED_NOW).formatVersion).toBe(INDEX_FORMAT_VERSION);
    });

    it('fait un aller-retour écriture/lecture', async () => {
        const index: BackupIndex = { formatVersion: INDEX_FORMAT_VERSION, updatedAt: FIXED_NOW, entries: [entry()] };

        const written = await writeBackupIndex(storage, index);
        expect(written.ok).toBe(true);

        const read = await readBackupIndex(storage);
        expect(read.ok).toBe(true);
        if (read.ok) expect(read.value).toEqual(index);
    });

    it('signale explicitement un catalogue présent mais illisible', async () => {
        await storage.put(INDEX_OBJECT_KEY, Buffer.from('{ ceci n’est pas du JSON'));

        const read = await readBackupIndex(storage);

        expect(read.ok).toBe(false);
        if (!read.ok) expect(read.error.message).toContain('illisible');
    });

    it('signale un catalogue corrompu (entrée malformée, version inconnue)', async () => {
        await storage.put(
            INDEX_OBJECT_KEY,
            Buffer.from(JSON.stringify({ formatVersion: 1, updatedAt: FIXED_NOW, entries: [{ id: 'x' }] })),
        );
        const broken = await readBackupIndex(storage);
        expect(broken.ok).toBe(false);
        if (!broken.ok) expect(broken.error.message).toContain('entrée 1');

        const unknownVersion = parseBackupIndex(
            JSON.stringify({ formatVersion: 99, updatedAt: FIXED_NOW, entries: [] }),
        );
        expect(unknownVersion.ok).toBe(false);
        if (!unknownVersion.ok) expect(unknownVersion.error.message).toContain('99');
    });

    it('n’écrit aucune donnée personnelle : les champs hors contrat sont écartés', async () => {
        const tainted = {
            ...entry(),
            inquiry: { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+33600000000' },
        } as unknown as BackupIndexEntry;

        const written = await writeBackupIndex(storage, {
            formatVersion: INDEX_FORMAT_VERSION,
            updatedAt: FIXED_NOW,
            entries: [tainted],
        });

        expect(written.ok).toBe(true);
        const serialized = JSON.stringify(written.ok ? written.value : null);
        expect(serialized).not.toContain('Ada Lovelace');
        expect(serialized).not.toContain('ada@example.com');
        expect(serialized).not.toContain('+33600000000');
        if (written.ok) expect(Object.keys(written.value.entries[0])).not.toContain('inquiry');
    });

    it('écarte les champs non contractuels même quand ils sont déjà présents sur le stockage', async () => {
        const raw = {
            formatVersion: INDEX_FORMAT_VERSION,
            updatedAt: FIXED_NOW,
            entries: [{ ...entry(), inquiryName: 'Ada Lovelace' }],
        };
        await storage.put(INDEX_OBJECT_KEY, Buffer.from(JSON.stringify(raw)));

        const read = await readBackupIndex(storage);

        expect(read.ok).toBe(true);
        if (read.ok) {
            expect(read.value.entries).toHaveLength(1);
            expect(JSON.stringify(read.value.entries)).not.toContain('Ada Lovelace');
        }
    });

    it('refuse d’écrire une entrée malformée', async () => {
        const invalid = { id: 'x', createdAt: FIXED_NOW, tier: 'daily' } as unknown as BackupIndexEntry;

        const written = await writeBackupIndex(storage, {
            formatVersion: INDEX_FORMAT_VERSION,
            updatedAt: FIXED_NOW,
            entries: [invalid],
        });

        expect(written.ok).toBe(false);
        if (!written.ok) expect(written.error.code).toBe('io-failure');
    });
});
