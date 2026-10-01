/**
 * Sauvegarde automatique du site CUC — lecture des tables du périmètre.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : **lire**. Ce module
 * ne contient que des ordres de lecture (`SELECT`) ; toute écriture en base
 * appartient au Lot 4.
 *
 * Sécurité CUC Sign : `assertBackupScope` est appelé sur **chaque** table reçue
 * **avant** toute ouverture de connexion. Une table CUC Sign (`students`,
 * `formations`, …) ou hors liste blanche fait donc échouer l'appel sans même
 * qu'une connexion soit tentée — le test de refus le prouve.
 */

import { createHash } from 'node:crypto';

import pg from 'pg';

import type { BackupRow } from '../contracts';
import { canonicalRow } from '../diff';
import { assertBackupScope } from '../whitelist';

/** Schéma unique ciblé par les lectures (aucun autre schéma n'est atteignable). */
const PUBLIC_SCHEMA = 'public';

/** Client minimal injectable : les tests n'ouvrent jamais de vraie connexion. */
export interface DbClient {
    connect(): Promise<void>;
    query<Row = Record<string, unknown>>(text: string): Promise<{ rows: Row[] }>;
    end(): Promise<void>;
}

/** Fabrique de client injectable (par défaut : `pg.Client`). */
export type DbClientFactory = (connectionString: string) => DbClient;

/** Entrées de la lecture. `clientFactory` permet un test sans Postgres. */
export interface ReadTablesInput {
    tables: readonly string[];
    connectionString: string;
    clientFactory?: DbClientFactory;
}

/** Résultat par table : lignes brutes et empreinte du contenu sérialisé. */
export interface TableRead {
    table: string;
    rows: BackupRow[];
    sha256: string;
}

/** Motifs d'échec typés d'une lecture. */
export interface DbReadFailure {
    code: 'invalid-input' | 'connection-failed' | 'query-failed' | 'close-failed';
    table: string | null;
    message: string;
}

/** Union discriminée : un échec de lecture n'est jamais masqué. */
export type ReadTablesResult = { ok: true; tables: TableRead[] } | { ok: false; error: DbReadFailure };

function describe(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return 'cause inconnue';
}

/** Échappement d'identifiant : guillemets doublés, jamais de concaténation nue. */
export function quoteIdentifier(identifier: string): string {
    if (typeof identifier !== 'string' || identifier.length === 0) {
        throw new Error('Identifiant SQL vide — requête refusée.');
    }
    return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Garde de périmètre appliquée à une liste de tables. Lève
 * `BackupScopeError` (fail-fast) sur la première table hors périmètre.
 */
export function assertTablesInScope(tables: readonly string[]): void {
    if (!Array.isArray(tables)) {
        throw new Error('Liste de tables absente — lecture refusée.');
    }
    for (const table of tables) assertBackupScope(table);
}

/** Instruction de lecture d'une table, schéma `public` imposé. */
export function buildSelectSql(table: string): string {
    assertBackupScope(table);
    return `SELECT * FROM ${quoteIdentifier(PUBLIC_SCHEMA)}.${quoteIdentifier(table)}`;
}

/**
 * Empreinte SHA-256 du contenu : sérialisation canonique du Lot 1
 * ([`canonicalRow()`](../diff.ts:56)), une ligne par entrée. Deux lectures de
 * mêmes lignes produisent donc toujours la même empreinte.
 */
export function digestRows(rows: readonly BackupRow[]): string {
    return createHash('sha256').update(rows.map((row) => canonicalRow(row)).join('\n')).digest('hex');
}

/** Fabrique par défaut : client `pg` en lecture, SSL comme `audit_quotas.mjs`. */
function defaultClientFactory(connectionString: string): DbClient {
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    return client as unknown as DbClient;
}

/** Lit toutes les tables demandées sur une connexion déjà établie. */
async function readAllTables(client: DbClient, tables: readonly string[]): Promise<ReadTablesResult> {
    const reads: TableRead[] = [];
    for (const table of tables) {
        try {
            const response = await client.query(buildSelectSql(table));
            const rows = (response.rows ?? []) as BackupRow[];
            reads.push({ table, rows, sha256: digestRows(rows) });
        } catch (error) {
            return { ok: false, error: { code: 'query-failed', table, message: describe(error) } };
        }
    }
    return { ok: true, tables: reads };
}

/**
 * Lit les tables du périmètre. Échoue **avant toute connexion** si une table
 * est hors liste blanche ; la connexion est toujours refermée (`finally`),
 * y compris en cas d'erreur, et un échec de fermeture est signalé.
 */
export async function readTables(input: ReadTablesInput): Promise<ReadTablesResult> {
    const tables = input?.tables;
    if (!Array.isArray(tables)) {
        return { ok: false, error: { code: 'invalid-input', table: null, message: 'Liste de tables absente.' } };
    }

    // Fail-fast de périmètre : aucune connexion n'est ouverte avant ce contrôle.
    assertTablesInScope(tables);

    const connectionString = typeof input?.connectionString === 'string' ? input.connectionString.trim() : '';
    if (connectionString.length === 0) {
        return {
            ok: false,
            error: { code: 'invalid-input', table: null, message: 'Chaîne de connexion absente — lecture refusée.' },
        };
    }

    const client = (input.clientFactory ?? defaultClientFactory)(connectionString);
    let outcome: ReadTablesResult = {
        ok: false,
        error: { code: 'connection-failed', table: null, message: 'Connexion interrompue avant lecture.' },
    };
    let closeError: unknown = null;

    try {
        await client.connect();
        outcome = await readAllTables(client, tables);
    } catch (error) {
        outcome = { ok: false, error: { code: 'connection-failed', table: null, message: describe(error) } };
    } finally {
        try {
            await client.end();
        } catch (error) {
            closeError = error;
        }
    }

    if (!outcome.ok) return outcome;
    if (closeError !== null) {
        return { ok: false, error: { code: 'close-failed', table: null, message: describe(closeError) } };
    }
    return outcome;
}

/** Inventaire du schéma `public` — lecture seule d'`information_schema`. */
export type ListTablesResult = { ok: true; tables: string[] } | { ok: false; error: DbReadFailure };

/** Entrées de l'inventaire ; `clientFactory` permet un test sans Postgres. */
export interface ListTablesInput {
    connectionString: string;
    clientFactory?: DbClientFactory;
}

/** Requête d'inventaire : noms de tables de `public`, ordre stable. */
export const PUBLIC_TABLES_SQL =
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name";

/**
 * Énumère les tables du schéma `public` — **lecture seule**, aucune écriture,
 * aucune autre requête. Sert de pré-vol à l'orchestration : confronter la
 * liste demandée à la base réelle **avant** toute lecture de données.
 */
export async function listPublicTables(input: ListTablesInput): Promise<ListTablesResult> {
    const connectionString = typeof input?.connectionString === 'string' ? input.connectionString.trim() : '';
    if (connectionString.length === 0) {
        return {
            ok: false,
            error: { code: 'invalid-input', table: null, message: 'Chaîne de connexion absente — inventaire refusé.' },
        };
    }

    const client = (input.clientFactory ?? defaultClientFactory)(connectionString);
    let outcome: ListTablesResult = {
        ok: false,
        error: { code: 'connection-failed', table: null, message: 'Connexion interrompue avant inventaire.' },
    };
    let closeError: unknown = null;

    try {
        await client.connect();
        const response = await client.query(PUBLIC_TABLES_SQL);
        const tables = (response.rows ?? [])
            .map((row) => (row as { table_name?: unknown }).table_name)
            .filter((name): name is string => typeof name === 'string' && name.length > 0);
        outcome = { ok: true, tables };
    } catch (error) {
        outcome = { ok: false, error: { code: 'query-failed', table: null, message: describe(error) } };
    } finally {
        try {
            await client.end();
        } catch (error) {
            closeError = error;
        }
    }

    if (!outcome.ok) return outcome;
    if (closeError !== null) {
        return { ok: false, error: { code: 'close-failed', table: null, message: describe(closeError) } };
    }
    return outcome;
}
