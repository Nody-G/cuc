/**
 * Sauvegarde automatique du site CUC — filet de sécurité d'une restauration.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1). Responsabilité unique : produire,
 * immédiatement avant une écriture, un instantané de l'état courant. Un
 * pré-instantané dégradé vaut zéro : le mode écriture doit alors s'abandonner
 * (`runRestore` refuse — `src/lib/backup/restore.ts`).
 *
 * Extraction depuis `scripts/backup/restore-cli-support.ts` : la fabrique est
 * désormais **partagée** par le CLI (`npm run backup:restore:write`) et par la
 * restauration du Cockpit (`actions/backup-versions.ts`) — une seule
 * implémentation, donc une seule sémantique de filet (une source par sujet,
 * `AGENTS.md` § 4). Le tier reste `daily` : `runBackup` ne catalogue que
 * daily/weekly/monthly, le filet est donc listable et directement réutilisable.
 */

import type { RetentionPolicy } from './contracts';
import { gzipBuffer } from './io/compress';
import { encryptBuffer } from './io/crypto';
import type { ListTablesResult, ReadTablesResult } from './io/db-read';
import { buildEnvFingerprint } from './io/env-fingerprint';
import type { BackupStorage } from './io/storage';
import { runBackup, type RunBackupDependencies } from './orchestrate';
import type { PreSnapshotOutcome } from './restore';

/** Éléments déjà résolus par l'appelant, nécessaires au pré-instantané. */
export interface PreSnapshotWiring {
    storage: BackupStorage;
    readTables: (tables: readonly string[]) => Promise<ReadTablesResult>;
    listTables: () => Promise<ListTablesResult>;
    key: Buffer;
    keyId: string;
    prefix: string;
    retention: RetentionPolicy;
    env: Record<string, string | undefined>;
    tables: readonly string[];
}

/** Fabrique le filet de sécurité : une sauvegarde réelle juste avant la restauration. */
export function createPreSnapshot(wiring: PreSnapshotWiring): () => Promise<PreSnapshotOutcome> {
    const dependencies: RunBackupDependencies = {
        readTables: wiring.readTables,
        listTables: wiring.listTables,
        storage: wiring.storage,
        compress: gzipBuffer,
        encrypt: (plain: Uint8Array) => encryptBuffer(plain, wiring.key, wiring.keyId),
        now: () => new Date(),
        appVersion: process.env.npm_package_version ?? '0.1.0',
        gitCommit: process.env.GITHUB_SHA ?? null,
        gitBranch: process.env.GITHUB_REF_NAME ?? null,
        config: {
            prefix: wiring.prefix,
            appName: 'cuc-app',
            encryption: { algorithm: 'aes-256-gcm', keyDerivation: `aes-256-gcm/${wiring.keyId}` },
            retention: wiring.retention,
            envFingerprint: buildEnvFingerprint(undefined, wiring.env),
        },
    };
    return async (): Promise<PreSnapshotOutcome> => {
        try {
            const report = await runBackup(dependencies, { tables: [...wiring.tables], tier: 'daily', write: true });
            return {
                ok: !report.degraded,
                snapshotId: report.snapshotId,
                degraded: report.degraded,
                error: report.degraded ? 'pré-instantané dégradé' : null,
            };
        } catch (error) {
            return {
                ok: false,
                snapshotId: null,
                degraded: false,
                error: error instanceof Error ? error.message : 'cause inconnue',
            };
        }
    };
}
