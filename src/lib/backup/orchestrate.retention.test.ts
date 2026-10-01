/**
 * Orchestration de sauvegarde — **rétention GFS et promotions** (`orchestrate.ts`).
 *
 * Prouve que la purge conserve les nouveaux, promeut `daily → weekly` (dimanche)
 * et `daily → monthly` (premier du mois), et supprime réellement les objets.
 * Harnais : `orchestrate.harness.ts`.
 */
import type { BackupIndexEntry } from './contracts';
import { emptyBackupIndex, readBackupIndex, writeBackupIndex } from './io/index-store';
import { buildSnapshotPrefix, runBackup } from './orchestrate';
import { isFirstOfMonthUtc, isSundayUtc } from './retention';
import { INDEX_KEY, NOW, PREFIX, SAMPLE_ROWS, makeDeps, setupTempRoot, tempStorage, unwrap } from './orchestrate.harness';

const rootOf = setupTempRoot();

describe('backup/orchestrate — rétention GFS', () => {
    const SEED_DATES = ['2026-09-01', '2026-09-06', '2026-09-10', '2026-09-11', '2026-09-13', '2026-09-20', '2026-09-27'];
    const seedId = (date: string): string => `snapshot-${date.replace(/-/g, '')}T023000Z-seed`;
    const seedCreatedAt = (date: string): string => `${date}T02:30:00.000Z`;
    const SUNDAY = seedId('2026-09-27');
    const FIRST_OF_MONTH = seedId('2026-09-01');
    const PURGED = ['2026-09-01', '2026-09-06', '2026-09-10', '2026-09-11'].map(seedId);

    it('purge les plus anciens et promeut daily → weekly et daily → monthly', async () => {
        expect(isSundayUtc(seedCreatedAt('2026-09-27'))).toBe(true);
        expect(isFirstOfMonthUtc(seedCreatedAt('2026-09-01'))).toBe(true);

        const storage = tempStorage(rootOf());
        const seeded: BackupIndexEntry[] = SEED_DATES.map((date) => ({
            id: seedId(date),
            createdAt: seedCreatedAt(date),
            tier: 'daily',
            status: 'complete',
            partsCount: 1,
            bytes: 10,
            prefix: buildSnapshotPrefix(PREFIX, seedCreatedAt(date), seedId(date)),
            appVersion: '0.1.0',
            gitCommit: null,
        }));
        for (const entry of seeded) {
            unwrap(await storage.put(`${entry.prefix}/manifest.json`, Buffer.from('{"seed":true}')));
        }
        unwrap(await writeBackupIndex(storage, { ...emptyBackupIndex(NOW.toISOString()), entries: seeded }, INDEX_KEY));

        const report = await runBackup(makeDeps(storage, SAMPLE_ROWS, {}, { daily: 2, weekly: 1, monthly: 1 }), {
            tables: ['site_pages'],
            tier: 'daily',
            write: true,
        });

        expect(report.retention).not.toBeNull();
        expect(report.retention!.promoted).toEqual([
            { id: report.snapshotId, tier: 'monthly' },
            { id: SUNDAY, tier: 'weekly' },
        ]);
        expect([...report.retention!.purged].sort()).toEqual([...PURGED].sort());

        const entries = unwrap(await readBackupIndex(storage, INDEX_KEY)).entries;
        expect(entries.filter((entry) => entry.tier === 'daily')).toHaveLength(2);
        expect(entries.find((entry) => entry.id === report.snapshotId)?.tier).toBe('monthly');
        expect(entries.find((entry) => entry.id === SUNDAY)?.tier).toBe('weekly');
        expect(entries.some((entry) => entry.id === FIRST_OF_MONTH)).toBe(false);

        for (const entry of seeded) {
            expect(unwrap(await storage.exists(`${entry.prefix}/manifest.json`))).toBe(!PURGED.includes(entry.id));
        }
    });
});
