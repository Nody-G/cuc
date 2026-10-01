/**
 * Tests du diagnostic de santé — horloge injectée, aucune I/O.
 *
 * Chaque cas construit des faits minimaux (catalogue + manifestes) et vérifie
 * le constat produit, sa gravité et le code de sortie. Aucune lecture réseau,
 * aucune base, aucun stockage.
 */
import type {
    BackupDegradation,
    BackupIndex,
    BackupIndexEntry,
    BackupIndexTier,
    BackupManifest,
    BackupPart,
    BackupStatus,
    BackupTier,
    RetentionPolicy,
} from './contracts';
import { assessBackupHealth } from './health';
import { buildManifest } from './manifest';
import { BACKUP_TABLES } from './whitelist';

const POLICY: RetentionPolicy = { daily: 7, weekly: 4, monthly: 12 };
const NOW = new Date('2026-10-01T12:00:00.000Z');

/** Empreinte hexadécimale factice, valide (64 caractères [0-9a-f]). */
function fakeSha(seed: string): string {
    return seed.repeat(64).slice(0, 64);
}

function tablePart(table: string, rows: number, bytes: number): BackupPart {
    return {
        kind: 'table',
        table,
        objectKey: `data/${table}.ndjson.gz.enc`,
        rows,
        compressedBytes: bytes,
        plainBytes: bytes,
        sha256: fakeSha('a'),
        compression: 'gzip',
        cipher: 'aes-256-gcm',
    };
}

function mediaPart(): BackupPart {
    return {
        kind: 'media-index',
        table: null,
        objectKey: 'data/media-index.json.gz.enc',
        rows: 182,
        compressedBytes: 1000,
        plainBytes: 1000,
        sha256: fakeSha('b'),
        compression: 'gzip',
        cipher: 'aes-256-gcm',
    };
}

interface ManifestSpec {
    id: string;
    createdAt: string;
    tier?: BackupTier;
    tables?: readonly string[];
    rowsPerTable?: number;
    bytesPerTable?: number;
    media?: boolean;
    degraded?: readonly BackupDegradation[];
}

function makeManifest(spec: ManifestSpec): BackupManifest {
    const tables = spec.tables ?? BACKUP_TABLES;
    const rows = spec.rowsPerTable ?? 10;
    const bytes = spec.bytesPerTable ?? 1024;
    const parts: BackupPart[] = tables.map((table) => tablePart(table, rows, bytes));
    if (spec.media === true) parts.push(mediaPart());
    return buildManifest({
        id: spec.id,
        createdAt: spec.createdAt,
        tier: spec.tier ?? 'daily',
        app: { name: 'cuc-app', version: '0.1.0' },
        encryption: { algorithm: 'aes-256-gcm', keyDerivation: 'aes-256-gcm/v1' },
        parts,
        degraded: spec.degraded,
    });
}

interface EntrySpec {
    id: string;
    createdAt: string;
    tier?: BackupIndexTier;
    status?: BackupStatus;
    bytes?: number;
    missingTables?: readonly string[];
}

function makeEntry(spec: EntrySpec): BackupIndexEntry {
    const entry: BackupIndexEntry = {
        id: spec.id,
        createdAt: spec.createdAt,
        tier: spec.tier ?? 'daily',
        status: spec.status ?? 'complete',
        partsCount: BACKUP_TABLES.length + 2,
        bytes: spec.bytes ?? 1024,
        prefix: `cuc-backups/site/2026/10/${spec.id}`,
        appVersion: '0.1.0',
        gitCommit: 'abc1234',
    };
    if (spec.missingTables !== undefined) entry.missingTables = [...spec.missingTables];
    return entry;
}

function makeIndex(entries: readonly BackupIndexEntry[]): BackupIndex {
    return { formatVersion: 1, updatedAt: NOW.toISOString(), entries: [...entries] };
}

function codes(verdict: ReturnType<typeof assessBackupHealth>): string[] {
    return verdict.findings.map((finding) => finding.code);
}

describe('assessBackupHealth', () => {
    it('instantané frais et complet → ok, code de sortie 0', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 's1', createdAt })]),
            manifests: [makeManifest({ id: 's1', createdAt, media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('ok');
        expect(verdict.exitCode).toBe(0);
        expect(codes(verdict)).toContain('freshness-ok');
        expect(codes(verdict)).toContain('completeness-ok');
        expect(codes(verdict)).toContain('non-vacuity-ok');
        expect(verdict.snapshotCount).toBe(1);
        expect(verdict.lastSnapshot.id).toBe('s1');
    });

    it('instantané vieux de 5 jours → critique', () => {
        const createdAt = '2026-09-26T02:30:00.000Z';
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'old', createdAt })]),
            manifests: [makeManifest({ id: 'old', createdAt, media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('critical');
        expect(verdict.exitCode).toBe(1);
        expect(codes(verdict)).toContain('freshness-stale');
    });

    it('instantané « incomplete » → critique', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'run', createdAt, status: 'incomplete' })]),
            manifests: [makeManifest({ id: 'run', createdAt, media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('critical');
        expect(codes(verdict)).toContain('completeness-incomplete');
        // Une entrée incomplète ne compte pas dans la continuité.
        expect(verdict.snapshotCount).toBe(1);
    });

    it('instantané « degraded » → avertissement, tables manquantes nommées', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const tables = BACKUP_TABLES.filter((table) => table !== 'site_vitals');
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'deg', createdAt, status: 'degraded', missingTables: ['site_vitals'] })]),
            manifests: [makeManifest({ id: 'deg', createdAt, tables, media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('warning');
        expect(verdict.exitCode).toBe(2);
        const degraded = verdict.findings.find((finding) => finding.code === 'completeness-degraded');
        expect(degraded?.message).toContain('site_vitals');
    });

    it('table absente du manifeste → dérive de couverture signalée nommément', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const tables = BACKUP_TABLES.filter((table) => table !== 'site_team');
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'drift', createdAt })]),
            manifests: [makeManifest({ id: 'drift', createdAt, tables, media: true })],
            policy: POLICY,
            now: NOW,
        });

        const drift = verdict.findings.find((finding) => finding.code === 'coverage-drift');
        expect(drift).toBeDefined();
        expect(drift?.message).toContain('site_team');
        expect(drift?.severity).toBe('warning');
    });

    it('instantané vide (0 ligne) → critique', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'empty', createdAt, bytes: 0 })]),
            manifests: [makeManifest({ id: 'empty', createdAt, rowsPerTable: 0, bytesPerTable: 0 })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('critical');
        expect(codes(verdict)).toContain('non-vacuity-empty');
    });

    it('trou dans la série quotidienne → signalé même si le dernier est frais', () => {
        const entries = [
            makeEntry({ id: 's1', createdAt: '2026-09-20T02:30:00.000Z' }),
            makeEntry({ id: 's2', createdAt: '2026-09-25T02:30:00.000Z' }),
            makeEntry({ id: 's3', createdAt: '2026-10-01T02:30:00.000Z' }),
        ];
        const verdict = assessBackupHealth({
            index: makeIndex(entries),
            manifests: [makeManifest({ id: 's3', createdAt: '2026-10-01T02:30:00.000Z', media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('warning');
        expect(codes(verdict)).toContain('continuity-gap');
        expect(codes(verdict)).not.toContain('freshness-stale');
    });

    it('tier mensuel attendu mais absent → signalé', () => {
        const entries = [
            makeEntry({ id: 'week', createdAt: '2026-08-15T02:30:00.000Z', tier: 'weekly' }),
            makeEntry({ id: 'fresh', createdAt: '2026-10-01T02:30:00.000Z' }),
        ];
        const verdict = assessBackupHealth({
            index: makeIndex(entries),
            manifests: [makeManifest({ id: 'fresh', createdAt: '2026-10-01T02:30:00.000Z', media: true })],
            policy: POLICY,
            now: NOW,
        });

        const tiers = verdict.findings.find((finding) => finding.code === 'retention-tier-missing');
        expect(tiers).toBeDefined();
        expect(tiers?.message).toContain('monthly');
    });

    it('catalogue vide → critique explicite, jamais une erreur de lecture', () => {
        const verdict = assessBackupHealth({
            index: makeIndex([]),
            manifests: [],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('critical');
        expect(verdict.exitCode).toBe(1);
        expect(verdict.snapshotCount).toBe(0);
        expect(verdict.lastSnapshot.id).toBeNull();
        expect(codes(verdict)).toEqual(['catalog-empty']);
    });

    it('manifeste absent pour le dernier instantané → critique (couverture invérifiable)', () => {
        const createdAt = '2026-10-01T02:30:00.000Z';
        const verdict = assessBackupHealth({
            index: makeIndex([makeEntry({ id: 'ghost', createdAt })]),
            manifests: [],
            policy: POLICY,
            now: NOW,
        });

        expect(verdict.severity).toBe('critical');
        expect(codes(verdict)).toContain('manifest-missing');
    });

    it('chute brutale de taille → avertissement', () => {
        const entries = [
            makeEntry({ id: 'tiny', createdAt: '2026-10-01T02:30:00.000Z', bytes: 100 }),
            makeEntry({ id: 'p1', createdAt: '2026-09-30T02:30:00.000Z', bytes: 10000 }),
            makeEntry({ id: 'p2', createdAt: '2026-09-29T02:30:00.000Z', bytes: 10000 }),
        ];
        const verdict = assessBackupHealth({
            index: makeIndex(entries),
            manifests: [makeManifest({ id: 'tiny', createdAt: '2026-10-01T02:30:00.000Z', media: true })],
            policy: POLICY,
            now: NOW,
        });

        expect(codes(verdict)).toContain('size-drop');
        expect(verdict.severity).toBe('warning');
    });
});
