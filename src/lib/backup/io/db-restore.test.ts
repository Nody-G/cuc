import { BackupScopeError } from '../whitelist';
import type { ApplyRestorePlan } from './db-restore';
import { applyRestore, buildDeleteSql, buildInsertSql, buildUpdateSql, selectUpdateColumns } from './db-restore';
import type { RestoreDbClient } from './db-restore';

/** Client factice : aucun test n'ouvre de connexion Postgres réelle. */
function createFakeClient(failOn?: (text: string, index: number) => Error | null) {
    const queries: string[] = [];
    const params: (readonly unknown[] | undefined)[] = [];
    const client: RestoreDbClient = {
        async connect(): Promise<void> { },
        async query(text: string, values?: readonly unknown[]): Promise<{ rows?: unknown[] }> {
            const index = queries.length;
            queries.push(text);
            params.push(values);
            const failure = failOn?.(text, index);
            if (failure !== undefined && failure !== null) throw failure;
            return { rows: [] };
        },
        async end(): Promise<void> { },
    };
    return { client, queries, params };
}

const plan = (overrides: Partial<ApplyRestorePlan> = {}): ApplyRestorePlan => ({
    writeOrder: ['site_team'],
    deleteOrder: [],
    ops: [{ table: 'site_team', primaryKey: 'id', toInsert: [{ id: 'a', role: 'Coach' }], toUpdate: [], toDelete: [], preserved: 0 }],
    ...overrides,
});

describe('backup/io/db-restore — écriture bornée par le périmètre', () => {
    it('échoue sur une table CUC Sign sans construire de statement ni ouvrir de connexion', async () => {
        let factoryCalled = false;
        const clientFactory = () => {
            factoryCalled = true;
            throw new Error('connexion tentée alors que le périmètre est refusé');
        };
        const bad = plan({
            writeOrder: ['students'],
            ops: [{ table: 'students', primaryKey: 'id', toInsert: [], toUpdate: [], toDelete: [], preserved: 0 }],
        });

        await expect(applyRestore({ connectionString: 'postgres://unused/db', plan: bad, clientFactory })).rejects.toBeInstanceOf(
            BackupScopeError,
        );
        expect(factoryCalled).toBe(false);
    });

    it('échappe systématiquement les identifiants', () => {
        expect(buildInsertSql('site_pages', ['slug', 'title'])).toBe(
            'INSERT INTO "public"."site_pages" ("slug", "title") VALUES ($1, $2)',
        );
        expect(buildInsertSql('site_pages', ['slug', 'we"ird'])).toContain('"we""ird"');
        expect(buildUpdateSql('site_team', 'id', ['role'])).toBe('UPDATE "public"."site_team" SET "role" = $1 WHERE "id" = $2');
        expect(buildDeleteSql('site_team', 'id')).toBe('DELETE FROM "public"."site_team" WHERE "id" = $1');
        expect(() => buildInsertSql('students', ['id'])).toThrow(BackupScopeError);
        expect(() => buildDeleteSql('students', 'id')).toThrow(BackupScopeError);
    });

    it('retire la clé primaire et les colonnes de pont du SET d’une mise à jour', () => {
        const columns = selectUpdateColumns('site_sessions', 'id', {
            id: 's1',
            title: 'A',
            cuc_sign_formation_id: 'formation-1',
            program_id: 'p1',
        });
        expect(columns).toEqual(['title', 'program_id']);
    });

    it('n’émet aucune instruction DDL et referme toujours la connexion', async () => {
        const { client, queries } = createFakeClient();
        const result = await applyRestore({
            connectionString: 'postgres://fake/db',
            plan: plan({
                writeOrder: ['site_team'],
                deleteOrder: ['site_team'],
                ops: [
                    {
                        table: 'site_team', primaryKey: 'id',
                        toInsert: [{ id: 'a', role: 'Coach' }], toUpdate: [{ id: 'b', role: 'Directeur' }],
                        toDelete: [{ id: 'c' }], preserved: 0,
                    },
                ],
            }),
            clientFactory: () => client,
        });

        expect(result.ok).toBe(true);
        expect(result.committed).toBe(true);
        expect(queries[0]).toBe('BEGIN');
        expect(queries[queries.length - 1]).toBe('COMMIT');
        for (const statement of queries) {
            expect(statement).toMatch(/^(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE SAVEPOINT|INSERT|UPDATE|DELETE)/);
            expect(statement).not.toMatch(/CREATE|ALTER|DROP|TRUNCATE|GRANT/i);
        }
        expect(result.tables[0]).toMatchObject({ inserted: 1, updated: 1, deleted: 1, ok: true });
    });

    it('n’écrit jamais une colonne de pont dans un UPDATE mais la pose sur un INSERT', async () => {
        const { client, queries } = createFakeClient();
        const result = await applyRestore({
            connectionString: 'postgres://fake/db',
            plan: plan({
                writeOrder: ['site_sessions'],
                ops: [
                    {
                        table: 'site_sessions', primaryKey: 'id',
                        toInsert: [{ id: 's2', title: 'Neuf', cuc_sign_formation_id: 'formation-2' }],
                        toUpdate: [{ id: 's1', title: 'Corrigé', cuc_sign_formation_id: 'formation-1' }],
                        toDelete: [], preserved: 0,
                    },
                ],
            }),
            clientFactory: () => client,
        });

        expect(result.ok).toBe(true);
        const update = queries.find((statement) => statement.startsWith('UPDATE'));
        expect(update).toContain('"title" = $1');
        expect(update).not.toContain('cuc_sign_formation_id');
        const insert = queries.find((statement) => statement.startsWith('INSERT'));
        expect(insert).toContain('cuc_sign_formation_id');
    });

    it('rejoue une insertion refusée par la clé étrangère du pont, avec NULL, et le trace', async () => {
        let inserts = 0;
        const { client, queries, params } = createFakeClient((text) => {
            if (!text.startsWith('INSERT')) return null;
            inserts += 1;
            return inserts === 1 ? Object.assign(new Error('fk'), { code: '23503' }) : null;
        });
        const result = await applyRestore({
            connectionString: 'postgres://fake/db',
            plan: plan({
                writeOrder: ['site_sessions'],
                ops: [
                    {
                        table: 'site_sessions', primaryKey: 'id',
                        toInsert: [{ id: 's1', title: 'A', cuc_sign_formation_id: 'formation-inconnue' }],
                        toUpdate: [], toDelete: [], preserved: 0,
                    },
                ],
            }),
            clientFactory: () => client,
        });

        expect(result.ok).toBe(true);
        expect(queries).toContain('ROLLBACK TO SAVEPOINT restore_bridge');
        expect(result.bridgeFallbacks).toHaveLength(1);
        expect(result.bridgeFallbacks[0]).toMatchObject({ table: 'site_sessions', columns: ['cuc_sign_formation_id'] });
        expect(params.some((values) => values?.includes(null))).toBe(true);
        expect(result.tables[0].inserted).toBe(1);
    });

    it('annule tout par ROLLBACK dès qu’une instruction échoue', async () => {
        const { client, queries } = createFakeClient((text) =>
            text.startsWith('DELETE') ? Object.assign(new Error('relation absente'), { code: '42P01' }) : null,
        );
        const result = await applyRestore({
            connectionString: 'postgres://fake/db',
            plan: plan({
                deleteOrder: ['site_team'],
                ops: [
                    {
                        table: 'site_team', primaryKey: 'id', toInsert: [], toUpdate: [],
                        toDelete: [{ id: 'obsolete' }], preserved: 0,
                    },
                ],
            }),
            clientFactory: () => client,
        });

        expect(result.ok).toBe(false);
        expect(result.committed).toBe(false);
        expect(result.rolledBack).toBe(true);
        expect(queries).toContain('ROLLBACK');
        expect(queries).not.toContain('COMMIT');
        expect(result.error).toContain('relation absente');
        expect(result.tables[0].error).toContain('relation absente');
    });

    it('refuse un plan incohérent et une connexion absente sans appeler de fabrique', async () => {
        let factoryCalled = false;
        const clientFactory = () => {
            factoryCalled = true;
            throw new Error('ne doit pas être appelée');
        };
        const incoherent = await applyRestore({ connectionString: 'postgres://fake/db', plan: plan({ writeOrder: ['site_pages'] }), clientFactory });
        expect(incoherent.ok).toBe(false);
        expect(incoherent.error).toContain('Plan incohérent');

        const noConnection = await applyRestore({ connectionString: '   ', plan: plan(), clientFactory });
        expect(noConnection.ok).toBe(false);
        expect(noConnection.error).toContain('Chaîne de connexion absente');
        expect(factoryCalled).toBe(false);
    });
});
