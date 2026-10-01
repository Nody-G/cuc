import type { BackupPart } from './contracts';
import {
    BACKUP_FORMAT_VERSION,
    buildManifest,
    computeTotals,
    parseManifest,
    serializeManifest,
} from './manifest';

const PAGE_DIGEST = 'a'.repeat(64);
const TEAM_DIGEST = 'b'.repeat(64);

const PAGES_PART: BackupPart = {
    kind: 'table',
    table: 'site_pages',
    objectKey: 'data/site_pages.ndjson.gz.enc',
    rows: 15,
    compressedBytes: 1024,
    plainBytes: 4096,
    sha256: PAGE_DIGEST,
    compression: 'gzip',
    cipher: 'aes-256-gcm',
};

const TEAM_PART: BackupPart = {
    kind: 'table',
    table: 'site_team',
    objectKey: 'data/site_team.ndjson.gz.enc',
    rows: 20,
    compressedBytes: 2048,
    plainBytes: 8192,
    sha256: TEAM_DIGEST,
    compression: 'gzip',
    cipher: 'aes-256-gcm',
};

const BUILD_INPUT = {
    id: 'snapshot-20261001T023000Z-a1b2c3d',
    createdAt: '2026-10-01T02:30:00.000Z',
    app: { name: 'Campus Univers Cascades', version: '0.1.0' },
    git: { commit: 'a1b2c3d4', branch: 'main' },
    encryption: { algorithm: 'aes-256-gcm' as const, keyDerivation: 'scrypt' },
    parts: [PAGES_PART, TEAM_PART],
    tier: 'daily' as const,
};

function reparseForTampering(manifest: unknown): Record<string, unknown> {
    return JSON.parse(JSON.stringify(manifest)) as Record<string, unknown>;
}

describe('backup/manifest — construction, sérialisation, analyse', () => {
    it('fait un aller-retour sérialisation → analyse stable', () => {
        const manifest = buildManifest(BUILD_INPUT);
        const result = parseManifest(serializeManifest(manifest));

        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.manifest).toEqual(manifest);
        expect(result.manifest.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    });

    it('calcule les totaux (parties, lignes, octets) à partir des parties', () => {
        expect(computeTotals([PAGES_PART, TEAM_PART])).toEqual({
            parts: 2,
            rows: 35,
            bytes: 3072,
        });
        expect(buildManifest(BUILD_INPUT).totals).toEqual({ parts: 2, rows: 35, bytes: 3072 });
    });

    it('refuse un manifeste dont une partie référence une table non blanche', () => {
        const tampered = reparseForTampering(buildManifest(BUILD_INPUT));
        const parts = tampered.parts as Record<string, unknown>[];
        parts[0].table = 'students';

        const result = parseManifest(JSON.stringify(tampered));
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error).toMatch(/hors périmètre/);
    });

    it('refuse un manifeste dont une empreinte SHA-256 est malformée', () => {
        const tampered = reparseForTampering(buildManifest(BUILD_INPUT));
        const parts = tampered.parts as Record<string, unknown>[];
        parts[1].sha256 = 'pas-une-empreinte';

        const result = parseManifest(JSON.stringify(tampered));
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error).toMatch(/SHA-256 malformée/);
    });

    it('refuse un manifeste sans aucune partie', () => {
        const tampered = reparseForTampering(buildManifest(BUILD_INPUT));
        tampered.parts = [];

        const result = parseManifest(JSON.stringify(tampered));
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error).toMatch(/aucune partie/i);
    });

    it('refuse un contenu illisible sans lever d’exception non typée', () => {
        expect(parseManifest('{')).toEqual({ ok: false, error: 'Manifeste illisible — JSON invalide.' });
        expect(parseManifest('').ok).toBe(false);
        expect(parseManifest('[]').ok).toBe(false);
    });

    it('refuse la construction d’un manifeste avec une table hors périmètre', () => {
        expect(() =>
            buildManifest({ ...BUILD_INPUT, parts: [{ ...PAGES_PART, table: 'profiles' }] }),
        ).toThrow(/hors périmètre/);
    });

    it('conserve le bloc de dégradation à l’aller-retour, sans toucher les manifestes sains', () => {
        const degraded = [{ table: 'site_vitals', reason: 'absente de public' }];
        const withDegraded = buildManifest({ ...BUILD_INPUT, degraded });

        expect(withDegraded.degraded).toEqual(degraded);
        const roundTrip = parseManifest(serializeManifest(withDegraded));
        expect(roundTrip.ok).toBe(true);
        if (roundTrip.ok) expect(roundTrip.manifest.degraded).toEqual(degraded);

        expect(buildManifest(BUILD_INPUT).degraded).toBeUndefined();
    });
});
