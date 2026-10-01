/**
 * Sauvegarde automatique du site CUC — diff instantané ↔ base courante.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : le calcul le plus sensible de la
 * restauration, et le plus testé. Aucune I/O : les lignes courantes et les
 * lignes du snapshot sont **reçues en paramètres**.
 *
 * Deux règles non négociables (`plans/plan-backups-automatiques-2026.md` § 2.3
 * et § 5.3) :
 *  1. `assertBackupScope` est appelé sur la table d'entrée — une table hors
 *     liste blanche **échoue** ; jamais de diff vide silencieux.
 *  2. une ligne candidate au `toDelete`/`toUpdate` dont une colonne de pont
 *     est **renseignée en base courante** et **vide dans le snapshot** est
 *     **préservée** : jamais supprimée, jamais écrasée. Un appariement CUC Sign
 *     postérieur à l'instantané ne doit pas être défait.
 */

import type { BackupRow, TableDiff } from './contracts';
import { assertBackupScope, getBridgeColumns } from './whitelist';

/** Entrées du diff : la table, sa clé primaire et les deux jeux de lignes. */
export interface DiffTableInput {
    table: string;
    primaryKey: string;
    currentRows: readonly BackupRow[];
    snapshotRows: readonly BackupRow[];
    /** Colonnes de pont à protéger ; par défaut celles de `BRIDGE_COLUMNS`. */
    bridgeColumns?: readonly string[];
}

/** Valeur de la clé primaire, sous forme canonique (chaîne). */
function rowKey(row: BackupRow, primaryKey: string): string {
    const value = row[primaryKey];
    if (value === null || value === undefined) {
        throw new Error(`Ligne sans clé primaire « ${primaryKey} » — diff impossible.`);
    }
    return String(value);
}

/** Réécriture récursive des objets avec clés triées (les tableaux gardent l'ordre). */
function canonicalize(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value !== null && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const sorted: Record<string, unknown> = {};
        for (const key of Object.keys(record).sort()) sorted[key] = canonicalize(record[key]);
        return sorted;
    }
    return value;
}

/**
 * Forme canonique d'une ligne : l'ordre des clés JSON ne peut donc **jamais**
 * produire un faux `toUpdate`.
 */
export function canonicalRow(row: BackupRow): string {
    return JSON.stringify(canonicalize(row));
}

/** Une valeur de pont est « renseignée » si elle n'est ni nulle ni vide. */
function isFilled(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
}

/**
 * Un appariement CUC Sign est-il plus récent que l'instantané ?
 * Vrai si une colonne de pont est renseignée en base courante et vide (ou
 * absente) côté instantané — y compris quand la ligne est absente du snapshot.
 */
function protectsBridge(
    current: BackupRow,
    snapshot: BackupRow | undefined,
    bridgeColumns: readonly string[],
): boolean {
    return bridgeColumns.some(
        (column) => isFilled(current[column]) && !isFilled(snapshot?.[column]),
    );
}

/**
 * Calcule le diff d'une table. L'ordre de sortie est stable : il suit l'ordre
 * des lignes fournies (snapshot pour les insertions et mises à jour, base
 * courante pour les suppressions et les lignes préservées).
 */
export function diffTable(input: DiffTableInput): TableDiff {
    const { table, primaryKey, currentRows, snapshotRows } = input;
    assertBackupScope(table);
    if (typeof primaryKey !== 'string' || primaryKey.trim().length === 0) {
        throw new Error('Diff impossible — clé primaire absente.');
    }
    const bridgeColumns = input.bridgeColumns ?? getBridgeColumns(table);

    const currentByKey = new Map<string, BackupRow>();
    for (const row of currentRows) currentByKey.set(rowKey(row, primaryKey), row);

    const snapshotByKey = new Map<string, BackupRow>();
    for (const row of snapshotRows) snapshotByKey.set(rowKey(row, primaryKey), row);

    const toInsert: BackupRow[] = [];
    const toUpdate: BackupRow[] = [];
    const toDelete: BackupRow[] = [];
    const preservedBridgeRows: BackupRow[] = [];

    for (const row of snapshotRows) {
        const key = rowKey(row, primaryKey);
        const current = currentByKey.get(key);
        if (current === undefined) {
            toInsert.push(row);
            continue;
        }
        if (canonicalRow(row) === canonicalRow(current)) continue;
        if (protectsBridge(current, row, bridgeColumns)) {
            preservedBridgeRows.push(current);
            continue;
        }
        toUpdate.push(row);
    }

    for (const row of currentRows) {
        const key = rowKey(row, primaryKey);
        if (snapshotByKey.has(key)) continue;
        if (protectsBridge(row, undefined, bridgeColumns)) {
            preservedBridgeRows.push(row);
            continue;
        }
        toDelete.push(row);
    }

    return { table, toInsert, toUpdate, toDelete, preservedBridgeRows };
}
