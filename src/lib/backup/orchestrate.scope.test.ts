/**
 * Orchestration de sauvegarde — **périmètre et refus CUC Sign** (`orchestrate.ts`).
 *
 * Prouve que la garde de périmètre s'exécute **avant toute lecture** et qu'un
 * dry-run n'écrit strictement rien. Harnais : `orchestrate.harness.ts`.
 */
import type { ReadTablesResult } from './io/db-read';
import { runBackup } from './orchestrate';
import { BackupScopeError } from './whitelist';
import { INDEX_KEY, PREFIX, SAMPLE_ROWS, makeDeps, setupTempRoot, tempStorage, unwrap } from './orchestrate.harness';

const rootOf = setupTempRoot();

describe('backup/orchestrate — périmètre et dry-run', () => {
    it('refuse une table CUC Sign avant toute lecture', async () => {
        const storage = tempStorage(rootOf());
        const readTables = vi.fn(async (): Promise<ReadTablesResult> => ({ ok: true, tables: [] }));
        const deps = makeDeps(storage, SAMPLE_ROWS, { readTables });

        await expect(runBackup(deps, { tables: ['site_pages', 'students'], tier: 'daily', write: true })).rejects.toThrow(BackupScopeError);

        expect(readTables).not.toHaveBeenCalled();
        expect(unwrap(await storage.exists(INDEX_KEY))).toBe(false);
    });

    it('un dry-run n’écrit strictement rien', async () => {
        const storage = tempStorage(rootOf());
        const report = await runBackup(makeDeps(storage, SAMPLE_ROWS), {
            tables: ['site_pages', 'site_inquiries'],
            tier: 'daily',
            write: false,
        });

        expect(report.dryRun).toBe(true);
        expect(report.retention).toBeNull();
        expect(report.parts).toHaveLength(3);
        expect(unwrap(await storage.exists(INDEX_KEY))).toBe(false);
        expect(unwrap(await storage.exists(report.manifestObjectKey))).toBe(false);
        expect(unwrap(await storage.list(`${PREFIX}/`))).toEqual([]);
    });
});
