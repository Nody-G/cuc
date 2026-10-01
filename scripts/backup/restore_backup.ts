#!/usr/bin/env node
/**
 * CLI de restauration versionnée — adaptateur mince de `src/lib/backup/restore.ts`.
 * Simulation par défaut ; écriture sur `--write` seulement. Le plan est affiché
 * AVANT la confirmation. Confirmation forte non contournable : phrase exacte
 * `RESTAURER <id>` saisie interactivement, ou `--yes` **combiné** à
 * `RESTORE_CONFIRM_TOKEN` égal à l'identifiant. Sinon : refus, sortie non nulle.
 *
 *   npm run backup:restore -- --snapshot=<id> [--tables=a,b]
 *   npm run backup:restore:write -- --snapshot=<id> [--yes] [--allow-delete=<table>]
 *
 * L'affichage, la confirmation et le filet vivent dans `./restore-cli-support`.
 */
import { gunzipBuffer } from '../../src/lib/backup/io/compress';
import { loadBackupConfig, type BackupConfig } from '../../src/lib/backup/io/config';
import { decryptBuffer } from '../../src/lib/backup/io/crypto';
import { applyRestore, type ApplyRestorePlan } from '../../src/lib/backup/io/db-restore';
import { listPublicTables, readTables } from '../../src/lib/backup/io/db-read';
import { readBackupIndex } from '../../src/lib/backup/io/index-store';
import type { BackupStorage } from '../../src/lib/backup/io/storage';
import { createStorage } from '../../src/lib/backup/io/storage';
import { sha256Hex } from '../../src/lib/backup/naming';
import { runRestore, type RestoreReport, type RestoreDependencies, type RunRestoreOptions } from '../../src/lib/backup/restore';
import { BACKUP_TABLES } from '../../src/lib/backup/whitelist';

import { confirmRestore, createPreSnapshot, emitReport, renderRestoreReport } from './restore-cli-support';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ARGS = process.argv.slice(2);
const WRITE = ARGS.includes('--write');
const YES = ARGS.includes('--yes');

/** Valeur d'une option `--nom=valeur`, sinon `null`. */
const option = (name: string): string | null => {
    const found = ARGS.find((argument) => argument.startsWith(`--${name}=`));
    return found === undefined ? null : found.slice(name.length + 3);
};
/** Toutes les valeurs d'une option répétable (`--allow-delete=<table>`). */
const repeated = (name: string): string[] =>
    ARGS.filter((argument) => argument.startsWith(`--${name}=`)).map((argument) => argument.slice(name.length + 3)).filter((value) => value.length > 0);
/** Liste `--tables=a,b,c`, sinon `null` (périmètre complet de l'instantané). */
const tableOption = (): string[] | null => {
    const raw = option('tables');
    if (raw === null) return null;
    const tables = raw.split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);
    if (tables.length === 0) throw new Error('--tables vide — aucune table à restaurer.');
    return tables;
};

/** Câble toutes les dépendances d'un run : un seul point de composition. */
function buildDependencies(config: BackupConfig, storage: BackupStorage, env: Record<string, string | undefined>): RestoreDependencies {
    const connectionString = config.database.connectionString;
    const readCurrent = (tables: readonly string[]) => readTables({ tables, connectionString });
    return {
        storage,
        indexObjectKey: `${config.prefix}/index.json`,
        readTables: readCurrent,
        digest: sha256Hex,
        decrypt: (envelope: Uint8Array) => decryptBuffer(envelope, (keyId) => (keyId === config.encryption.keyId ? config.encryption.key : null)),
        decompress: gunzipBuffer,
        applyRestore: (plan: ApplyRestorePlan) => applyRestore({ connectionString, plan }),
        preSnapshot: createPreSnapshot({
            storage, readTables: readCurrent,
            listTables: () => listPublicTables({ connectionString }),
            key: config.encryption.key, keyId: config.encryption.keyId,
            prefix: config.prefix, retention: config.retention, env,
            // Périmètre du filet : `--tables` sinon toute la liste blanche.
            tables: tableOption() ?? [...BACKUP_TABLES],
        }),
        now: () => new Date(),
    };
}

async function main(): Promise<void> {
    const env = { ...process.env };
    const config = loadBackupConfig(env);
    const created = await createStorage(config.storage);
    if (!created.ok) throw new Error(`Stockage indisponible — ${created.error.message}`);

    const index = await readBackupIndex(created.value, `${config.prefix}/index.json`);
    if (!index.ok) throw new Error(`Catalogue illisible — ${index.error.message}`);
    const requested = option('snapshot') ?? ARGS.find((argument) => !argument.startsWith('--')) ?? null;
    const sorted = [...index.value.entries].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
    const entry = requested === null ? sorted.find((candidate) => candidate.status !== 'incomplete') : index.value.entries.find((candidate) => candidate.id === requested);
    if (entry === undefined) throw new Error(`Instantané « ${requested ?? 'le plus récent'} » introuvable dans le catalogue.`);

    const dependencies = buildDependencies(config, created.value, env);
    const options: RunRestoreOptions = { snapshotId: entry.id, tables: tableOption(), allowDelete: repeated('allow-delete'), write: false };
    const simulated: RestoreReport = await runRestore(dependencies, options);
    emitReport(renderRestoreReport(simulated));
    if (!WRITE) return;

    if (!(await confirmRestore(entry.id, YES))) {
        console.error(`[backup:restore] ABANDON — confirmation manquante (phrase « RESTAURER ${entry.id} » ou --yes + RESTORE_CONFIRM_TOKEN=${entry.id}).`);
        process.exitCode = 1;
        return;
    }
    const applied = await runRestore(dependencies, { ...options, write: true });
    emitReport(renderRestoreReport(applied));
    if (applied.status !== 'applied') process.exitCode = 1;
}

main().catch((error: unknown) => {
    console.error(`[backup:restore] ÉCHEC — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
