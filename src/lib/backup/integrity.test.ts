import type { BackupPart, PartDigest } from './contracts';
import { verifyManifestIntegrity, verifyManifestTotals, verifyPartDigest } from './integrity';
import { buildManifest } from './manifest';

const DIGEST_A = 'a'.repeat(64);
const DIGEST_B = 'b'.repeat(64);
const DIGEST_WRONG = 'c'.repeat(64);

const PART_A: BackupPart = {
    kind: 'table',
    table: 'site_pages',
    objectKey: 'data/site_pages.ndjson.gz.enc',
    rows: 15,
    compressedBytes: 1024,
    plainBytes: 4096,
    sha256: DIGEST_A,
    compression: 'gzip',
    cipher: 'aes-256-gcm',
};

const PART_B: BackupPart = {
    kind: 'table',
    table: 'site_team',
    objectKey: 'data/site_team.ndjson.gz.enc',
    rows: 20,
    compressedBytes: 2048,
    plainBytes: 8192,
    sha256: DIGEST_B,
    compression: 'gzip',
    cipher: 'aes-256-gcm',
};

const MANIFEST = buildManifest({
    id: 'snapshot-20261001T023000Z-a1b2c3d',
    createdAt: '2026-10-01T02:30:00.000Z',
    app: { name: 'Campus Univers Cascades', version: '0.1.0' },
    git: { commit: 'a1b2c3d4', branch: 'main' },
    encryption: { algorithm: 'aes-256-gcm', keyDerivation: 'scrypt' },
    parts: [PART_A, PART_B],
    tier: 'daily',
});

describe('backup/integrity — digests et totaux', () => {
    it('compare des empreintes identiques, y compris en casse différente', () => {
        expect(verifyPartDigest(DIGEST_A, DIGEST_A)).toBe(true);
        expect(verifyPartDigest(DIGEST_A, DIGEST_A.toUpperCase())).toBe(true);
        expect(verifyPartDigest(DIGEST_A, DIGEST_WRONG)).toBe(false);
    });

    it('traite une empreinte absente comme un échec, jamais comme un succès', () => {
        expect(verifyPartDigest(DIGEST_A, null)).toBe(false);
        expect(verifyPartDigest(DIGEST_A, undefined)).toBe(false);
        expect(verifyPartDigest(DIGEST_A, 'trop-court')).toBe(false);
    });

    it('détecte le digest d’une partie qui ne correspond pas', () => {
        const provided: PartDigest[] = [
            { objectKey: PART_A.objectKey, sha256: DIGEST_A },
            { objectKey: PART_B.objectKey, sha256: DIGEST_WRONG },
        ];

        const failures = verifyManifestIntegrity(MANIFEST, provided);
        expect(failures).toHaveLength(1);
        expect(failures[0]).toMatchObject({
            objectKey: PART_B.objectKey,
            table: 'site_team',
            expectedSha256: DIGEST_B,
            actualSha256: DIGEST_WRONG,
            reason: 'digest-mismatch',
        });
    });

    it('signale toute partie dont le digest n’a pas été fourni', () => {
        const failures = verifyManifestIntegrity(MANIFEST, []);
        expect(failures).toHaveLength(2);
        expect(failures.every((failure) => failure.reason === 'digest-missing')).toBe(true);
        expect(verifyManifestIntegrity(MANIFEST, [
            { objectKey: PART_A.objectKey, sha256: DIGEST_A },
            { objectKey: PART_B.objectKey, sha256: DIGEST_B },
        ])).toEqual([]);
    });

    it('accepte des totaux cohérents et refuse des totaux incohérents', () => {
        expect(verifyManifestTotals(MANIFEST)).toEqual({
            ok: true,
            expected: { parts: 2, rows: 35, bytes: 3072 },
            actual: { parts: 2, rows: 35, bytes: 3072 },
        });

        const incoherent = { ...MANIFEST, totals: { parts: 2, rows: 999, bytes: 3072 } };
        const check = verifyManifestTotals(incoherent);
        expect(check.ok).toBe(false);
        expect(check.expected.rows).toBe(999);
        expect(check.actual.rows).toBe(35);
    });
});
