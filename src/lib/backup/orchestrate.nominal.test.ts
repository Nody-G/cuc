/**
 * Orchestration de sauvegarde — **circuit nominal et parts** (`orchestrate.ts`).
 *
 * Prouve, sans réseau et sans base : écriture des parts, du manifeste et du
 * catalogue, relecture réelle déchiffrable, alignement du `sha256` sur l'objet
 * réellement stocké, et absence de PII en clair. Harnais : `orchestrate.harness.ts`.
 */
import { createHash } from 'node:crypto';

import type { PartDigest } from './contracts';
import { gunzipBuffer, parseNdjson } from './io/compress';
import { decryptBuffer } from './io/crypto';
import { readBackupIndex } from './io/index-store';
import { verifyManifestIntegrity } from './integrity';
import {
    INDEX_KEY,
    PII_EMAIL,
    PII_NAME,
    PII_PHONE,
    SAMPLE_ROWS,
    resolveKey,
    runStandardBackup,
    setupTempRoot,
    unwrap,
} from './orchestrate.harness';

const rootOf = setupTempRoot();

describe('backup/orchestrate — circuit complet', () => {
    it('écrit les parts, le manifeste et le catalogue, puis relit une part exploitable', async () => {
        const { storage, report } = await runStandardBackup(rootOf());
        expect(report.dryRun).toBe(false);
        expect(report.tables).toEqual(['site_pages', 'site_inquiries']);
        expect(report.parts.map((part) => part.table)).toEqual([null, 'site_pages', 'site_inquiries']);
        expect(report.totals.parts).toBe(3);
        expect(report.totals.rows).toBe(3);
        expect(report.parts.every((part) => /^[0-9a-f]{64}$/.test(part.sha256))).toBe(true);

        const index = unwrap(await readBackupIndex(storage, INDEX_KEY));
        expect(index.entries).toHaveLength(1);
        expect(index.entries[0]).toMatchObject({
            id: report.snapshotId,
            tier: 'daily',
            status: 'complete',
            partsCount: 3,
            bytes: report.totals.bytes,
            prefix: report.snapshotPrefix,
            gitCommit: null,
        });

        const part = report.parts.find((candidate) => candidate.table === 'site_pages')!;
        const stored = unwrap(await storage.get(part.objectKey));
        const parsed = parseNdjson(gunzipBuffer(decryptBuffer(stored, resolveKey)).toString('utf8'));
        expect(parsed.ok).toBe(true);
        expect(parsed.ok ? parsed.rows : []).toEqual(SAMPLE_ROWS.site_pages);
    });

    it('déclare un sha256 qui correspond à l’objet réellement stocké', async () => {
        const { storage, report } = await runStandardBackup(rootOf());
        const digests: PartDigest[] = [];
        for (const part of report.manifest.parts) {
            const stored = unwrap(await storage.get(part.objectKey));
            digests.push({ objectKey: part.objectKey, sha256: createHash('sha256').update(stored).digest('hex') });
        }
        expect(verifyManifestIntegrity(report.manifest, digests)).toEqual([]);

        const tampered = digests.map((digest, index) => (index === 0 ? { ...digest, sha256: 'b'.repeat(64) } : digest));
        expect(verifyManifestIntegrity(report.manifest, tampered)).toHaveLength(1);
        expect(verifyManifestIntegrity(report.manifest, [])).toHaveLength(report.manifest.parts.length);
    });

    it('ne laisse aucune donnée personnelle de site_inquiries en clair', async () => {
        const { storage, report } = await runStandardBackup(rootOf());
        const indexRaw = unwrap(await storage.get(INDEX_KEY)).toString('utf8');
        const manifestRaw = unwrap(await storage.get(report.manifestObjectKey)).toString('utf8');
        const inquiry = report.parts.find((part) => part.table === 'site_inquiries')!;
        const partRaw = unwrap(await storage.get(inquiry.objectKey));

        for (const secret of [PII_NAME, PII_EMAIL, PII_PHONE]) {
            expect(indexRaw).not.toContain(secret);
            expect(manifestRaw).not.toContain(secret);
            expect(partRaw.toString('utf8')).not.toContain(secret);
        }
        // Témoin : la donnée est bien présente en clair avant chiffrement.
        expect(gunzipBuffer(decryptBuffer(partRaw, resolveKey)).toString('utf8')).toContain(PII_EMAIL);
    });
});
