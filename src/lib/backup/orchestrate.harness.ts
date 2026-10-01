/**
 * Harnais partagé des tests de `orchestrate.ts`.
 *
 * Fichier **hors** convention `*.test.ts` : Vitest ne le collecte donc pas comme
 * suite. Il ne fait aucun réseau et n'ouvre aucune base : adaptateur
 * `storage-local.ts` sur un répertoire temporaire, lecteur de tables factice,
 * **vraie** clé AES-256, horloge fixe.
 */
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { BackupRow, RetentionPolicy } from './contracts';
import { gzipBuffer } from './io/compress';
import { encryptBuffer } from './io/crypto';
import type { EnvFingerprint } from './io/env-fingerprint';
import type { BackupStorage, StorageResult } from './io/storage';
import { storageFailure } from './io/storage';
import { createLocalStorage } from './io/storage-local';
import type { BackupReport, RunBackupDependencies } from './orchestrate';
import { buildIndexObjectKey, runBackup } from './orchestrate';

export const KEY_ID = 'test-key';
export const KEY = randomBytes(32);
export const NOW = new Date('2026-10-01T02:30:00.000Z');
export const PREFIX = 'cuc-backups';
export const INDEX_KEY = buildIndexObjectKey(PREFIX);
export const PII_EMAIL = 'alice@example.com';
export const PII_NAME = 'Alice Martin';
export const PII_PHONE = '+33600000000';

export const ENV_FINGERPRINT: EnvFingerprint = {
    keys: ['DATABASE_URL', 'BACKUP_ENCRYPTION_KEY'],
    present: { DATABASE_URL: true, BACKUP_ENCRYPTION_KEY: true },
    sha256OfNames: 'f'.repeat(64),
};

export const SAMPLE_ROWS: Record<string, BackupRow[]> = {
    site_pages: [
        { id: 'p1', slug: 'accueil', title: 'Accueil' },
        { id: 'p2', slug: 'contact', title: 'Contact CUC' },
    ],
    site_inquiries: [{ id: 'q1', name: PII_NAME, email: PII_EMAIL, phone: PII_PHONE, message: 'Bonjour' }],
};

export function unwrap<T>(result: StorageResult<T>): T {
    if (!result.ok) throw new Error(`stockage indisponible — ${result.error.code}: ${result.error.message}`);
    return result.value;
}

export function resolveKey(keyId: string): Uint8Array | null {
    return keyId === KEY_ID ? KEY : null;
}

export function makeDeps(
    storage: BackupStorage,
    rows: Record<string, BackupRow[]>,
    overrides: Partial<RunBackupDependencies> = {},
    retention: RetentionPolicy = { daily: 7, weekly: 0, monthly: 0 },
): RunBackupDependencies {
    return {
        readTables: async (tables) => ({
            ok: true,
            tables: tables.map((table) => ({
                table,
                rows: rows[table] ?? [],
                sha256: createHash('sha256').update(table).digest('hex'),
            })),
        }),
        storage,
        compress: gzipBuffer,
        encrypt: (plain) => encryptBuffer(plain, KEY, KEY_ID),
        now: () => new Date(NOW.getTime()),
        appVersion: '0.1.0',
        gitCommit: null,
        gitBranch: 'main',
        config: {
            prefix: PREFIX,
            appName: 'cuc-app',
            encryption: { algorithm: 'aes-256-gcm', keyDerivation: 'aes-256-gcm/key-id' },
            retention,
            envFingerprint: ENV_FINGERPRINT,
        },
        ...overrides,
    };
}

/** Adaptateur réel enveloppé : un `put` ciblé échoue, tout le reste fonctionne. */
export function withFailingPut(storage: BackupStorage, fragment: string): BackupStorage {
    return {
        ...storage,
        async put(objectKey, body, meta) {
            if (objectKey.includes(fragment)) {
                return storageFailure('io-failure', `panne simulée pour « ${objectKey} ».`, objectKey);
            }
            return storage.put(objectKey, body, meta);
        },
    };
}

/** Stockage local neuf (adaptateur réel) sur la racine temporaire fournie. */
export function tempStorage(root: string): BackupStorage {
    return unwrap(createLocalStorage({ kind: 'local', root }));
}

/** Run nominal complet : deux tables, tier `daily`, écriture réelle sur disque. */
export async function runStandardBackup(root: string): Promise<{ storage: BackupStorage; report: BackupReport }> {
    const storage = tempStorage(root);
    const report = await runBackup(makeDeps(storage, SAMPLE_ROWS), {
        tables: ['site_pages', 'site_inquiries'],
        tier: 'daily',
        write: true,
    });
    return { storage, report };
}

/**
 * Enregistre les hooks `beforeEach` / `afterEach` du répertoire temporaire et
 * renvoie un accesseur vers la racine courante (globals Vitest : `globals: true`).
 */
export function setupTempRoot(): () => string {
    let root = '';
    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), 'cuc-backup-'));
    });
    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });
    return () => root;
}
