/**
 * Tests du mapping de la vue « Versions & restauration » — logique pure,
 * doubles injectés, aucun réseau, aucune base.
 *
 * Convention du dépôt : aucun import de `vitest` (`globals: true`).
 */

import type { BackupIndex } from '@/lib/backup/contracts';
import { BACKUP_TABLES } from '@/lib/backup/whitelist';
import type { RestoreReport } from '@/lib/backup/restore';
import {
    buildBackupStatusView,
    summarizeVersions,
    toRestorePlanView,
} from './backup-versions-service';

/** Environnement complet et valide (dépôt local : aucun accès réseau). */
const COMPLETE_ENV: Record<string, string> = {
    BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 5).toString('base64'),
    DATABASE_URL: 'postgres://user:secret@localhost:5432/cuc',
    BACKUP_STORAGE_KIND: 'local',
    BACKUP_LOCAL_ROOT: '.backup-test-run',
};

/** Manifeste synthétique couvrant la liste blanche (aucune donnée réelle). */
function fakeManifest(id: string, rows: number) {
    return {
        formatVersion: 1,
        id,
        createdAt: '2026-10-01T02:30:00.000Z',
        app: { name: 'cuc-app', version: '0.1.0' },
        git: { commit: 'abc', branch: 'main' },
        encryption: { algorithm: 'aes-256-gcm' as const, keyDerivation: 'aes-256-gcm/v1' },
        parts: BACKUP_TABLES.map((table) => ({
            kind: 'table' as const,
            table,
            objectKey: `prefix/${id}/data/${table}.ndjson.gz.enc`,
            rows: 1,
            compressedBytes: 10,
            plainBytes: 20,
            sha256: 'x',
            compression: 'gzip' as const,
            cipher: 'aes-256-gcm' as const,
        })),
        totals: { parts: BACKUP_TABLES.length, rows, bytes: 2048 },
        tier: 'daily' as const,
    };
}

describe('summarizeVersions', () => {
    it('trie du plus récent au plus ancien et remplit les comptages connus', () => {
        const index: BackupIndex = {
            formatVersion: 1,
            updatedAt: '2026-10-01T03:00:00.000Z',
            entries: [
                { id: 'old', createdAt: '2026-09-28T02:30:00.000Z', tier: 'daily', status: 'complete', partsCount: 21, bytes: 100, prefix: 'p/old', appVersion: '0.1.0', gitCommit: null },
                { id: 'new', createdAt: '2026-10-01T02:30:00.000Z', tier: 'daily', status: 'degraded', partsCount: 20, bytes: 200, prefix: 'p/new', appVersion: '0.1.0', gitCommit: 'abc', missingTables: ['site_vitals'] },
            ],
        };

        const versions = summarizeVersions(index.entries, new Map([['new', 42]]));

        expect(versions.map((version) => version.id)).toEqual(['new', 'old']);
        expect(versions[0].rows).toBe(42);
        expect(versions[0].missingTables).toEqual(['site_vitals']);
        expect(versions[1].rows).toBeNull(); // manifeste non lu ⇒ « — », jamais un faux 0
    });
});

describe('buildBackupStatusView', () => {
    it('signale une configuration incomplète en gravité critique, sans inventer de version', () => {
        const view = buildBackupStatusView({
            env: { BACKUP_STORAGE_KIND: 'local' },
            index: null,
            manifests: [],
            readError: null,
            now: new Date('2026-10-01T04:00:00.000Z'),
        });

        expect(view.config.kind).toBe('incomplete');
        expect(view.severity).toBe('critical');
        expect(view.versions).toEqual([]);
        expect(view.findings[0].code).toBe('config-incomplete');
    });

    it('expose des versions et un constat nommé quand le catalogue est lisible', () => {
        const index: BackupIndex = {
            formatVersion: 1,
            updatedAt: '2026-10-01T03:00:00.000Z',
            entries: [
                { id: 'snapshot-1', createdAt: '2026-10-01T02:30:00.000Z', tier: 'daily', status: 'complete', partsCount: 21, bytes: 2048, prefix: 'cuc-backups/snapshot-1', appVersion: '0.1.0', gitCommit: 'abc' },
            ],
        };

        const view = buildBackupStatusView({
            env: { ...COMPLETE_ENV },
            index,
            manifests: [fakeManifest('snapshot-1', 21)],
            readError: null,
            now: new Date('2026-10-01T04:00:00.000Z'),
        });

        expect(view.config.kind).toBe('ready');
        expect(view.versions).toHaveLength(1);
        expect(view.versions[0].rows).toBe(21);
        expect(view.lastSnapshot?.id).toBe('snapshot-1');
        expect(view.findings.length).toBeGreaterThan(0);
    });

    it('nomme une lecture de catalogue impossible sans la confondre avec une absence de version', () => {
        const view = buildBackupStatusView({
            env: { ...COMPLETE_ENV },
            index: null,
            manifests: [],
            readError: 'Catalogue illisible [io-failure] — index.json illisible.',
            now: new Date('2026-10-01T04:00:00.000Z'),
        });

        expect(view.readError).toContain('Catalogue illisible');
        expect(view.findings[0].code).toBe('catalog-unreadable');
        expect(view.severity).toBe('critical');
    });
});

describe('toRestorePlanView', () => {
    it('reprend chaque table et rappelle ce qui n’est pas touché', () => {
        const report = {
            snapshotId: 'snapshot-1',
            dryRun: true,
            status: 'simulated',
            tables: [
                { table: 'site_pages', appendOnly: false, insert: 2, update: 1, delete: 1, preserved: 0, bridgePreserved: 0, deleteAllowed: true, reason: 'contenu' },
                { table: 'site_inquiries', appendOnly: true, insert: 0, update: 0, delete: 0, preserved: 3, bridgePreserved: 0, deleteAllowed: false, reason: 'append-only' },
            ],
            totals: { insert: 2, update: 1, delete: 1, preserved: 3, bridgePreserved: 0 },
            writeOrder: ['site_pages', 'site_inquiries'],
            deleteOrder: ['site_inquiries', 'site_pages'],
            preSnapshotId: null,
            postCheck: null,
            bridgeFallbacks: [],
            error: null,
            durationMs: 5,
        } satisfies RestoreReport;

        const plan = toRestorePlanView(report);

        expect(plan.dryRun).toBe(true);
        expect(plan.tables.map((table) => table.table)).toEqual(['site_pages', 'site_inquiries']);
        expect(plan.totals.preserved).toBe(3);
        expect(plan.untouched.join(' ')).toContain('site_inquiries');
        expect(plan.untouched.join(' ')).toContain('CUC Sign');
    });
});
