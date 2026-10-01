/**
 * Orchestration de sauvegarde — **dégradation, tables absentes et échec propre**
 * (`orchestrate.ts`).
 *
 * Prouve qu'un `put` en échec laisse le catalogue sans entrée `complete`, qu'une
 * table absente est sautée sans rendre le run fatal, qu'aucun snapshot vide n'est
 * écrit et qu'un inventaire en échec remonte explicitement. Harnais : `orchestrate.harness.ts`.
 */
import { readBackupIndex } from './io/index-store';
import { BackupRunError, runBackup } from './orchestrate';
import { INDEX_KEY, SAMPLE_ROWS, makeDeps, setupTempRoot, tempStorage, unwrap, withFailingPut } from './orchestrate.harness';

const rootOf = setupTempRoot();

describe('backup/orchestrate — échec propre', () => {
    it('un put en échec laisse le catalogue sans entrée complete et nettoie les parts', async () => {
        const storage = tempStorage(rootOf());
        const deps = makeDeps(withFailingPut(storage, 'site_team.ndjson.gz.enc'), SAMPLE_ROWS);

        await expect(runBackup(deps, { tables: ['site_pages', 'site_team'], tier: 'daily', write: true })).rejects.toThrow(BackupRunError);

        const entries = unwrap(await readBackupIndex(storage, INDEX_KEY)).entries;
        expect(entries).toHaveLength(1);
        expect(entries.filter((entry) => entry.status === 'complete')).toHaveLength(0);
        expect(entries.filter((entry) => entry.status === 'incomplete')).toHaveLength(1);

        const prefix = entries[0].prefix;
        expect(unwrap(await storage.exists(`${prefix}/manifest.json`))).toBe(false);
        expect(unwrap(await storage.exists(`${prefix}/data/site_pages.ndjson.gz.enc`))).toBe(false);
    });
});

describe('backup/orchestrate — table absente (dégradation non fatale)', () => {
    it('saute la table absente, poursuit le run et trace la dégradation', async () => {
        const storage = tempStorage(rootOf());
        // L'inventaire réel ne contient pas site_team : elle est sautée.
        const deps = makeDeps(storage, SAMPLE_ROWS, {
            listTables: async () => ({ ok: true, tables: ['site_pages', 'site_inquiries'] }),
        });

        const report = await runBackup(deps, {
            tables: ['site_pages', 'site_team', 'site_inquiries'],
            tier: 'daily',
            write: true,
        });

        expect(report.degraded).toBe(true);
        expect(report.missingTables).toEqual([
            { table: 'site_team', reason: expect.stringContaining('sautée') },
        ]);
        expect(report.tables).toEqual(['site_pages', 'site_inquiries']);
        expect(report.parts.map((part) => part.table)).toEqual([null, 'site_pages', 'site_inquiries']);
        expect(report.manifest.degraded).toEqual(report.missingTables);

        // Le snapshot des tables présentes est bien écrit et exploitable.
        expect(unwrap(await storage.exists(report.manifestObjectKey))).toBe(true);
        expect(unwrap(await storage.exists(`${report.snapshotPrefix}/data/site_team.ndjson.gz.enc`))).toBe(false);

        const entry = unwrap(await readBackupIndex(storage, INDEX_KEY)).entries[0];
        expect(entry.status).toBe('degraded');
        expect(entry.missingTables).toEqual(['site_team']);
        expect(entry.prefix).toBe(report.snapshotPrefix);
    });

    it('signale la dégradation dans le rapport, y compris en dry-run', async () => {
        const storage = tempStorage(rootOf());
        const deps = makeDeps(storage, SAMPLE_ROWS, {
            listTables: async () => ({ ok: true, tables: ['site_pages'] }),
        });

        const report = await runBackup(deps, { tables: ['site_pages', 'site_vitals'], tier: 'daily', write: false });

        expect(report.degraded).toBe(true);
        expect(report.missingTables.map((item) => item.table)).toEqual(['site_vitals']);
        expect(unwrap(await storage.exists(INDEX_KEY))).toBe(false);
    });

    it('reste inchangé quand toutes les tables demandées existent (cas nominal)', async () => {
        const storage = tempStorage(rootOf());
        const deps = makeDeps(storage, SAMPLE_ROWS, {
            listTables: async () => ({ ok: true, tables: ['site_pages', 'site_inquiries', 'site_team'] }),
        });

        const report = await runBackup(deps, {
            tables: ['site_pages', 'site_inquiries'],
            tier: 'daily',
            write: true,
        });

        expect(report.degraded).toBe(false);
        expect(report.missingTables).toEqual([]);
        expect(report.manifest.degraded).toBeUndefined();

        const entry = unwrap(await readBackupIndex(storage, INDEX_KEY)).entries[0];
        expect(entry.status).toBe('complete');
        expect(entry.missingTables).toBeUndefined();
    });

    it('refuse un run dont aucune table demandée n’existe (aucun snapshot vide)', async () => {
        const storage = tempStorage(rootOf());
        const deps = makeDeps(storage, SAMPLE_ROWS, {
            listTables: async () => ({ ok: true, tables: [] }),
        });

        await expect(
            runBackup(deps, { tables: ['site_pages'], tier: 'daily', write: true }),
        ).rejects.toThrow(/Aucune des 1 tables/);
        expect(unwrap(await storage.exists(INDEX_KEY))).toBe(false);
    });

    it('remonte un échec explicite si l’inventaire lui-même échoue', async () => {
        const storage = tempStorage(rootOf());
        const deps = makeDeps(storage, SAMPLE_ROWS, {
            listTables: async () => ({
                ok: false,
                error: { code: 'connection-failed', table: null, message: 'base injoignable' },
            }),
        });

        await expect(
            runBackup(deps, { tables: ['site_pages'], tier: 'daily', write: true }),
        ).rejects.toThrow(BackupRunError);
        expect(unwrap(await storage.exists(INDEX_KEY))).toBe(false);
    });
});
