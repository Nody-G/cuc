/**
 * Sauvegarde automatique du site CUC — pré-vol d'inventaire.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : confronter la liste **demandée** à
 * l'inventaire **réel** avant toute lecture de données. Une table déclarée mais
 * absente est **sautée** et **tracée** ; la sauvegarde se poursuit avec les
 * autres — un mode de défaillance utilisable pour un système de reprise après
 * sinistre, jamais « zéro sauvegarde » à cause d'une table renommée.
 *
 * Extrait d'`orchestrate.ts` pour tenir le plafond de 300 lignes (`AGENTS.md` § 2).
 */
import type { BackupDegradation } from './contracts';
import { BackupRunError } from './errors';
import type { ListTablesResult } from './io/db-read';

/** Inventaire injecté des tables réellement présentes dans `public`. */
export type TableLister = () => Promise<ListTablesResult>;

/** Résolution du périmètre : tables réellement présentes + tables absentes tracées. */
export interface RequestedTablesResolution {
    tables: string[];
    missing: BackupDegradation[];
}

/**
 * Confronte les tables demandées à l'inventaire réel. Sans inventaire injecté,
 * la liste demandée est conservée telle quelle (comportement nominal inchangé).
 * Deux refus explicites, jamais silencieux : inventaire illisible, ou aucune
 * table demandée n'existant (interdiction d'un instantané vide).
 */
export async function resolveRequestedTables(
    requested: readonly string[],
    listTables: TableLister | undefined,
): Promise<RequestedTablesResolution> {
    if (listTables === undefined) return { tables: [...requested], missing: [] };

    const inventory = await listTables();
    if (!inventory.ok) {
        throw new BackupRunError(`Inventaire des tables refusé [${inventory.error.code}] — ${inventory.error.message}.`);
    }
    const present = new Set(inventory.tables);
    const tables = requested.filter((table) => present.has(table));
    const missing: BackupDegradation[] = requested
        .filter((table) => !present.has(table))
        .map((table) => ({
            table,
            reason: 'Table absente de l’inventaire réel de public — sautée (sauvegarde dégradée).',
        }));
    if (tables.length === 0) {
        throw new BackupRunError(
            `Aucune des ${requested.length} tables demandées n’existe en base — sauvegarde refusée (aucun snapshot vide).`,
        );
    }
    return { tables, missing };
}
