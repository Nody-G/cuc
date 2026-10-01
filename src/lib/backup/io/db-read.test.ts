import { BackupScopeError } from '../whitelist';
import { assertTablesInScope, buildSelectSql, digestRows, quoteIdentifier, readTables } from './db-read';

interface FakeClientOptions {
    rows?: Record<string, unknown>[];
    connectError?: unknown;
    queryError?: unknown;
    closeError?: unknown;
}

/** Client factice : aucun test n’ouvre de connexion Postgres réelle. */
function createFakeClient(options: FakeClientOptions = {}) {
    const queries: string[] = [];
    const state = { connected: false, ended: false };
    const client = {
        async connect(): Promise<void> {
            state.connected = true;
            if (options.connectError !== undefined) throw options.connectError;
        },
        async query<Row = Record<string, unknown>>(text: string): Promise<{ rows: Row[] }> {
            queries.push(text);
            if (options.queryError !== undefined) throw options.queryError;
            return { rows: (options.rows ?? []) as Row[] };
        },
        async end(): Promise<void> {
            state.ended = true;
            if (options.closeError !== undefined) throw options.closeError;
        },
    };
    return { client, queries, state };
}

describe('backup/io/db-read — lecture bornée par la liste blanche', () => {
    it('accepte les tables de la liste blanche', () => {
        expect(() => assertTablesInScope(['site_pages', 'site_team', 'site_inquiries'])).not.toThrow();
    });

    it('refuse les tables CUC Sign', () => {
        for (const table of ['students', 'formations', 'profiles', 'locations', 'signatures', 'evaluation_sessions']) {
            expect(() => assertTablesInScope([table])).toThrow(BackupScopeError);
        }
    });

    it('refuse un nom schéma-qualifié (schéma auth) et une table inconnue', () => {
        expect(() => assertTablesInScope(['auth.users'])).toThrow(BackupScopeError);
        expect(() => assertTablesInScope(['utilisateurs'])).toThrow(BackupScopeError);
    });

    it('échoue AVANT toute tentative de connexion sur une table CUC Sign', async () => {
        let factoryCalled = false;
        const clientFactory = () => {
            factoryCalled = true;
            throw new Error('connexion tentée alors que le périmètre est refusé');
        };

        await expect(
            readTables({ tables: ['students'], connectionString: 'postgres://unused/db', clientFactory }),
        ).rejects.toBeInstanceOf(BackupScopeError);
        expect(factoryCalled).toBe(false);
    });

    it('construit ses lectures sur le schéma public uniquement', () => {
        expect(buildSelectSql('site_pages')).toBe('SELECT * FROM "public"."site_pages"');
        expect(() => buildSelectSql('students')).toThrow(BackupScopeError);
    });

    it('échappe les identifiants sans jamais concaténer une entrée brute', () => {
        expect(quoteIdentifier('site_pages')).toBe('"site_pages"');
        expect(quoteIdentifier('nom"bizarre')).toBe('"nom""bizarre"');
    });

    it('produit une empreinte stable et sensible au contenu', () => {
        const ordered = [{ id: '1', title: 'A' }];
        const shuffled = [{ title: 'A', id: '1' }];
        const changed = [{ id: '1', title: 'B' }];

        expect(digestRows(ordered)).toMatch(/^[0-9a-f]{64}$/);
        expect(digestRows(ordered)).toBe(digestRows(shuffled));
        expect(digestRows(ordered)).not.toBe(digestRows(changed));
    });

    it('lit les tables demandées et referme toujours la connexion', async () => {
        const { client, queries, state } = createFakeClient({ rows: [{ id: 'p1' }, { id: 'p2' }] });

        const result = await readTables({
            tables: ['site_pages'],
            connectionString: 'postgres://fake/db',
            clientFactory: () => client,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.tables).toHaveLength(1);
            expect(result.tables[0].table).toBe('site_pages');
            expect(result.tables[0].rows).toEqual([{ id: 'p1' }, { id: 'p2' }]);
            expect(result.tables[0].sha256).toMatch(/^[0-9a-f]{64}$/);
        }
        expect(queries).toEqual(['SELECT * FROM "public"."site_pages"']);
        expect(state.connected).toBe(true);
        expect(state.ended).toBe(true);
    });

    it('ne contient que des ordres de lecture (aucune instruction d’écriture générée)', () => {
        const sql = buildSelectSql('site_team');
        expect(sql.startsWith('SELECT ')).toBe(true);
    });

    it('signale un échec de requête sans masquer la table fautive, et referme la connexion', async () => {
        const { client, state } = createFakeClient({ queryError: new Error('relation absente') });

        const result = await readTables({
            tables: ['site_pages'],
            connectionString: 'postgres://fake/db',
            clientFactory: () => client,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe('query-failed');
            expect(result.error.table).toBe('site_pages');
        }
        expect(state.ended).toBe(true);
    });

    it('signale un échec de connexion', async () => {
        const { client, state } = createFakeClient({ connectError: new Error('mot de passe refusé') });

        const result = await readTables({
            tables: ['site_pages'],
            connectionString: 'postgres://fake/db',
            clientFactory: () => client,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('connection-failed');
        expect(state.ended).toBe(true);
    });

    it('signale un échec de fermeture même quand la lecture a réussi', async () => {
        const { client } = createFakeClient({ rows: [{ id: 'p1' }], closeError: new Error('socket coupé') });

        const result = await readTables({
            tables: ['site_pages'],
            connectionString: 'postgres://fake/db',
            clientFactory: () => client,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('close-failed');
    });

    it('refuse une chaîne de connexion absente sans appeler de fabrique', async () => {
        let factoryCalled = false;
        const result = await readTables({
            tables: ['site_pages'],
            connectionString: '  ',
            clientFactory: () => {
                factoryCalled = true;
                throw new Error('ne doit pas être appelée');
            },
        });

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe('invalid-input');
        expect(factoryCalled).toBe(false);
    });
});
