/**
 * Sauvegarde automatique du site CUC — application d'un plan de restauration.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : exécuter un plan de
 * restauration **dans une transaction unique**, et rien d'autre. Seul endroit du
 * dépôt autorisé à écrire en base — et il ne peut écrire que dans le périmètre,
 * parce que : `assertBackupScope` est appelé sur **chaque** table **avant** toute
 * instruction et toute connexion ; **aucun nom de table n'est écrit en dur ici**
 * (il vient du plan — règle vérifiée par `scripts/guard_cuc_sign_scope.mjs`) ;
 * aucune DDL, aucune policy RLS ; seuls les identifiants sont échappés
 * (`quoteIdentifier`), **les valeurs sont toujours paramétrées** et n'apparaissent
 * donc ni dans le texte d'une requête ni dans le rapport.
 *
 * Colonnes de pont CUC Sign : un `UPDATE` ne les touche **jamais** (retirées du
 * `SET`) — une liaison vivante ne peut pas être écrasée par une valeur périmée ;
 * un `INSERT` pose la valeur, et si la clé étrangère la refuse, l'insertion est
 * **rejouée avec `NULL`** sous `SAVEPOINT` (la transaction n'est pas empoisonnée)
 * et le fait est **tracé**. Aucune lecture n'est faite sur CUC Sign.
 */

import pg from 'pg';

import type { BackupRow, RestoreTableResult } from '../contracts';
import { assertBackupScope, getBridgeColumns } from '../whitelist';
import { quoteIdentifier } from './db-read';

/** Schéma unique ciblé : le SQL généré ne peut pas sortir de `public`. */
const PUBLIC_SCHEMA = 'public';

/** Code PostgreSQL d'une violation de clé étrangère. */
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Client minimal injectable. Diffère de celui de `db-read.ts` sur un point :
 * `query` accepte des **valeurs paramétrées**, sans quoi il n'existerait aucun
 * moyen sûr d'écrire une valeur.
 */
export interface RestoreDbClient {
    connect(): Promise<void>;
    query(text: string, values?: readonly unknown[]): Promise<{ rows?: unknown[] }>;
    end(): Promise<void>;
}

/** Fabrique de client injectable (par défaut : `pg.Client`). */
export type RestoreDbClientFactory = (connectionString: string) => RestoreDbClient;

/** Opérations à appliquer sur une table du périmètre. */
export interface RestoreTableOps {
    table: string;
    primaryKey: string;
    toInsert: readonly BackupRow[];
    toUpdate: readonly BackupRow[];
    toDelete: readonly BackupRow[];
    /** Lignes volontairement préservées (pont ou politique append-only). */
    preserved: number;
}

/** Plan complet : ordre d'écriture, ordre de suppression, opérations par table. */
export interface ApplyRestorePlan {
    writeOrder: readonly string[];
    deleteOrder: readonly string[];
    ops: readonly RestoreTableOps[];
}

/** Trace d'une valeur de pont abandonnée : jamais devinée, toujours dite. */
export interface BridgeFallback {
    table: string;
    columns: string[];
    reason: string;
}

/** Résultat d'application : un échec est toujours décrit, jamais masqué. */
export interface RestoreApplyResult {
    ok: boolean;
    committed: boolean;
    rolledBack: boolean;
    tables: RestoreTableResult[];
    bridgeFallbacks: BridgeFallback[];
    /** Texte des requêtes **sans aucune valeur** — utile au diagnostic et aux tests. */
    statements: string[];
    error: string | null;
}

/** Entrées de l'application : connexion, plan, fabrique injectable. */
export interface ApplyRestoreInput {
    connectionString: string;
    plan: ApplyRestorePlan;
    clientFactory?: RestoreDbClientFactory;
}

function describe(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return 'cause inconnue';
}

/** Vrai si l'erreur PostgreSQL est une violation de clé étrangère. */
function isForeignKeyViolation(error: unknown): boolean {
    return (error as { code?: string } | null)?.code === FOREIGN_KEY_VIOLATION;
}

/** Une valeur de pont est « renseignée » si elle n'est ni nulle ni vide. */
function isFilled(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
}

/** Colonnes écrites par un `INSERT` : toutes celles de la ligne, jamais devinées. */
export function selectInsertColumns(row: BackupRow): string[] {
    return Object.keys(row);
}

/**
 * Colonnes écrites par un `UPDATE` : ni la clé primaire (elle est dans le
 * `WHERE`), ni une colonne de pont (une liaison vivante ne se réécrit pas).
 */
export function selectUpdateColumns(table: string, primaryKey: string, row: BackupRow): string[] {
    assertBackupScope(table);
    const bridges = new Set(getBridgeColumns(table));
    return Object.keys(row).filter((column) => column !== primaryKey && !bridges.has(column));
}

/** Instruction d'insertion : identifiants échappés, valeurs paramétrées. */
export function buildInsertSql(table: string, columns: readonly string[]): string {
    assertBackupScope(table);
    if (columns.length === 0) throw new Error('Insertion refusée — aucune colonne.');
    const names = columns.map(quoteIdentifier).join(', ');
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    return `INSERT INTO ${quoteIdentifier(PUBLIC_SCHEMA)}.${quoteIdentifier(table)} (${names}) VALUES (${placeholders})`;
}

/** Instruction de mise à jour : la clé primaire clôt le `WHERE`. */
export function buildUpdateSql(table: string, primaryKey: string, columns: readonly string[]): string {
    assertBackupScope(table);
    if (columns.length === 0) throw new Error('Mise à jour refusée — aucune colonne modifiable.');
    const assignments = columns.map((column, index) => `${quoteIdentifier(column)} = $${index + 1}`).join(', ');
    const where = `${quoteIdentifier(primaryKey)} = $${columns.length + 1}`;
    return `UPDATE ${quoteIdentifier(PUBLIC_SCHEMA)}.${quoteIdentifier(table)} SET ${assignments} WHERE ${where}`;
}

/** Instruction de suppression : bornée à la table et à la clé primaire. */
export function buildDeleteSql(table: string, primaryKey: string): string {
    assertBackupScope(table);
    const where = `${quoteIdentifier(primaryKey)} = $1`;
    return `DELETE FROM ${quoteIdentifier(PUBLIC_SCHEMA)}.${quoteIdentifier(table)} WHERE ${where}`;
}

/** Valeurs d'une ligne, dans l'ordre des colonnes (paramètres `$n`). */
function valuesFor(row: BackupRow, columns: readonly string[], extra: readonly unknown[] = []): unknown[] {
    return [...columns.map((column) => row[column]), ...extra];
}

/** Fabrique par défaut : client `pg`, SSL comme le reste du dépôt. */
function defaultClientFactory(connectionString: string): RestoreDbClient {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    return client as unknown as RestoreDbClient;
}

/**
 * Applique un plan de restauration dans **une transaction unique**.
 * `BEGIN` … `COMMIT`, et `ROLLBACK` sur toute erreur : un échec annule
 * l'intégralité de l'opération. Le périmètre est vérifié avant tout le reste —
 * une table hors liste blanche fait échouer l'appel **sans qu'aucune instruction
 * ne soit construite et sans qu'aucune connexion ne soit ouverte**.
 */
export async function applyRestore(input: ApplyRestoreInput): Promise<RestoreApplyResult> {
    const plan = input?.plan;
    const ops: readonly RestoreTableOps[] = Array.isArray(plan?.ops) ? plan.ops : [];

    // Fail-fast de périmètre — avant toute instruction et toute connexion.
    for (const op of ops) assertBackupScope(op.table);
    for (const order of [plan?.deleteOrder ?? [], plan?.writeOrder ?? []]) {
        for (const table of order) assertBackupScope(table);
    }

    const opByTable = new Map(ops.map((op) => [op.table, op]));
    const results = new Map<string, RestoreTableResult>();
    for (const op of ops) {
        results.set(op.table, {
            table: op.table, ok: false, inserted: 0, updated: 0, deleted: 0, preserved: op.preserved, error: null,
        });
    }
    for (const table of [...(plan?.deleteOrder ?? []), ...(plan?.writeOrder ?? [])]) {
        if (!opByTable.has(table)) {
            return {
                ok: false, committed: false, rolledBack: false, tables: [...results.values()],
                bridgeFallbacks: [], statements: [],
                error: `Plan incohérent — « ${table} » apparaît dans un ordre sans opération associée.`,
            };
        }
    }

    const statements: string[] = [];
    const bridgeFallbacks: BridgeFallback[] = [];
    let committed = false;
    let rolledBack = false;
    let error: string | null = null;
    let activeTable: string | null = null;

    const connectionString = typeof input?.connectionString === 'string' ? input.connectionString.trim() : '';
    if (connectionString.length === 0) {
        return {
            ok: false, committed: false, rolledBack: false, tables: [...results.values()],
            bridgeFallbacks, statements, error: 'Chaîne de connexion absente — restauration refusée.',
        };
    }

    const client = (input.clientFactory ?? defaultClientFactory)(connectionString);
    const run = async (text: string, values?: readonly unknown[]): Promise<void> => {
        statements.push(text);
        await client.query(text, values);
    };
    const count = (table: string, field: 'inserted' | 'updated' | 'deleted'): void => {
        const result = results.get(table);
        if (result !== undefined) result[field] += 1;
    };

    try {
        await client.connect();
        await run('BEGIN');
        // (1) Suppressions d'abord : enfants avant parents (ordre FK inversé).
        for (const table of plan.deleteOrder) {
            activeTable = table;
            const op = opByTable.get(table) as RestoreTableOps;
            const sql = buildDeleteSql(table, op.primaryKey);
            for (const row of op.toDelete) {
                await run(sql, [row[op.primaryKey]]);
                count(table, 'deleted');
            }
        }
        // (2) Écritures ensuite : parents avant enfants.
        for (const table of plan.writeOrder) {
            activeTable = table;
            const op = opByTable.get(table) as RestoreTableOps;
            for (const row of op.toUpdate) {
                const columns = selectUpdateColumns(table, op.primaryKey, row);
                if (columns.length === 0) continue; // rien d'autre que la clé et les ponts
                await run(buildUpdateSql(table, op.primaryKey, columns), valuesFor(row, columns, [row[op.primaryKey]]));
                count(table, 'updated');
            }
            for (const row of op.toInsert) {
                const columns = selectInsertColumns(row);
                const sql = buildInsertSql(table, columns);
                const bridges = getBridgeColumns(table).filter((column) => isFilled(row[column]));
                if (bridges.length === 0) {
                    await run(sql, valuesFor(row, columns));
                    count(table, 'inserted');
                    continue;
                }
                await run('SAVEPOINT restore_bridge');
                try {
                    await run(sql, valuesFor(row, columns));
                } catch (caught) {
                    if (!isForeignKeyViolation(caught)) throw caught;
                    // La FK du pont refuse la valeur : on rejoue avec NULL, et on le dit.
                    await run('ROLLBACK TO SAVEPOINT restore_bridge');
                    const nulled: Record<string, unknown> = { ...row };
                    for (const column of bridges) nulled[column] = null;
                    await run(sql, valuesFor(nulled, columns));
                    bridgeFallbacks.push({
                        table,
                        columns: [...bridges],
                        reason: 'Valeur de pont refusée par la clé étrangère — insertion rejouée avec NULL.',
                    });
                }
                await run('RELEASE SAVEPOINT restore_bridge');
                count(table, 'inserted');
            }
        }
        await run('COMMIT');
        committed = true;
    } catch (caught) {
        error = describe(caught);
        try {
            await run('ROLLBACK');
            rolledBack = true;
        } catch (rollbackError) {
            error = `${error} ; échec du ROLLBACK : ${describe(rollbackError)}`;
        }
        const failed = activeTable === null ? undefined : results.get(activeTable);
        if (failed !== undefined) failed.error = error;
        activeTable = null;
    } finally {
        try {
            await client.end();
        } catch {
            /* fermeture non bloquante : l'échec est déjà décrit par le résultat */
        }
    }

    const tables = [...results.values()].map((result) => ({
        ...result,
        ok: committed && result.error === null,
    }));
    return { ok: committed, committed, rolledBack, tables, bridgeFallbacks, statements, error };
}
