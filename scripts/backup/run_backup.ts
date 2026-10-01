#!/usr/bin/env node
/**
 * CLI de sauvegarde — adaptateur mince de `src/lib/backup/orchestrate.ts`.
 *
 * Convention du dépôt : **dry-run par défaut**, écriture sur `--write` seulement
 * (même convention que les scripts `db:migrate:*`). En dry-run, l'adaptateur
 * **local** est imposé : aucun identifiant S3 n'est requis, et rien n'est écrit.
 *
 *   npm run backup:run
 *   npm run backup:run:write
 *   npm run backup:run:write -- --tier=weekly --tables=site_pages,site_team
 *   npm run backup:run:write -- --no-media      # run de données seul, rapide
 *
 * Codes de sortie : `0` = run sain, `2` = **sauvegarde dégradée** (table
 * absente sautée, ou partie média dégradée — les deux sont tracées et le
 * snapshot reste écrit), `1` = échec. La lecture base du pré-vol et le miroir
 * média sont strictement en **lecture seule** côté Supabase.
 */
import { appendFileSync } from 'node:fs';

import * as dotenv from 'dotenv';

import { gunzipBuffer, gzipBuffer } from '../../src/lib/backup/io/compress';
import { BACKUP_ENV, loadBackupConfig, resolveMediaCredentials } from '../../src/lib/backup/io/config';
import { decryptBuffer, encryptBuffer } from '../../src/lib/backup/io/crypto';
import { listPublicTables, readTables } from '../../src/lib/backup/io/db-read';
import { buildEnvFingerprint } from '../../src/lib/backup/io/env-fingerprint';
import { createDefaultMediaClient, type MediaClient } from '../../src/lib/backup/io/media';
import { createStorage } from '../../src/lib/backup/io/storage';
import { collectMediaGarbage } from '../../src/lib/backup/media-gc';
import { loadPreviousMediaIndex, runMediaMirror } from '../../src/lib/backup/media-mirror';
import { buildIndexObjectKey, runBackup, type BackupReport } from '../../src/lib/backup/orchestrate';
import { BACKUP_TABLES } from '../../src/lib/backup/whitelist';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
// `--no-media` : run de données seul, rapide, jamais dégradé par l'absence de Storage.
const NO_MEDIA = process.argv.includes('--no-media');
const TIERS = ['daily', 'weekly', 'monthly'] as const;

/** Valeur d'une option `--nom=valeur`, sinon `null`. */
function option(name: string): string | null {
    const found = process.argv.find((argument) => argument.startsWith(`--${name}=`));
    return found === undefined ? null : found.slice(name.length + 3);
}

/** Récapitulatif lisible, réutilisable comme résumé d'étape GitHub. */
function summary(report: BackupReport): string {
    const head = [
        `${report.dryRun ? 'DRY-RUN — aucune écriture' : 'Sauvegarde écrite'} : ${report.snapshotId} [${report.tier}]`,
        `Tables ${report.tables.length} · parties ${report.totals.parts} · lignes ${report.totals.rows} · octets ${report.totals.bytes} · ${report.durationMs} ms`,
        `Préfixe : ${report.snapshotPrefix}`,
    ];
    if (report.media !== null) {
        const media = report.media;
        head.push(
            `Médias — ${media.sourceObjects} objet(s) source · ${media.uniqueBlobs} blob(s) unique(s) · téléversés ${media.uploaded} · réutilisés ${media.reusedBlobs} · inchangés ${media.unchanged}${media.degraded ? ' — DÉGRADÉ' : ''}`,
        );
    }
    if (report.garbage !== null) {
        head.push(
            report.garbage.aborted
                ? `Ramasse-miettes média — ABANDONNÉ : ${report.garbage.reason ?? 'motif inconnu'}`
                : `Ramasse-miettes média — ${report.garbage.removed.length} blob(s) supprimé(s) · ${report.garbage.referencedBlobs} référencé(s)`,
        );
    }
    if (report.degraded) {
        const skipped = report.missingTables.map((item) => item.table).join(', ');
        head.push(`DÉGRADÉ — ${report.missingTables.length} table(s) sautée(s)${skipped.length > 0 ? ` : ${skipped}` : ''}`);
    }
    if (report.retention === null) return head.join('\n');
    const purged = report.retention.purged.length === 0 ? 'aucune' : report.retention.purged.join(', ');
    const promoted = report.retention.promoted.map((item) => `${item.id} → ${item.tier}`).join(', ') || 'aucune';
    return [...head, `Purgés (${report.retention.purged.length}) : ${purged}`, `Promus : ${promoted}`].join('\n');
}

async function main(): Promise<void> {
    const tier = option('tier') ?? 'daily';
    if (!TIERS.includes(tier as (typeof TIERS)[number])) {
        throw new Error(`--tier invalide « ${tier} » — daily, weekly ou monthly attendu.`);
    }
    const tablesOption = option('tables');
    const tables =
        tablesOption === null
            ? [...BACKUP_TABLES]
            : tablesOption.split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);
    if (tables.length === 0) throw new Error('--tables vide — aucune table à sauvegarder.');

    const env = { ...process.env };
    if (!WRITE) env[BACKUP_ENV.storageKind] = 'local'; // dry-run : aucun identifiant S3 requis
    const config = loadBackupConfig(env);

    const storage = await createStorage(config.storage);
    if (!storage.ok) throw new Error(`Stockage indisponible — ${storage.error.message}`);

    // Accès média : lecture seule Supabase. Creds absentes ⇒ partie média
    // dégradée, jamais un échec du run de données (`--no-media` pour l'éviter).
    const mediaEnabled = !NO_MEDIA;
    const credentials = mediaEnabled ? resolveMediaCredentials(env) : null;
    const client: MediaClient | null =
        mediaEnabled && credentials !== null ? await createDefaultMediaClient(credentials) : null;
    const indexObjectKey = buildIndexObjectKey(config.prefix);
    const resolveKey = (id: string): Uint8Array | null => (id === config.encryption.keyId ? config.encryption.key : null);
    const decrypt = (envelope: Uint8Array): Buffer => decryptBuffer(envelope, resolveKey);

    const mirrorMedia = mediaEnabled
        ? (input: { snapshotPrefix: string; write: boolean }) =>
            runMediaMirror(
                {
                    client,
                    storage: storage.value,
                    prefix: config.prefix,
                    encrypt: (plain) => encryptBuffer(plain, config.encryption.key, config.encryption.keyId),
                    loadPreviousIndex: () =>
                        loadPreviousMediaIndex({ storage: storage.value, indexObjectKey, decrypt, decompress: gunzipBuffer, now: () => new Date() }),
                    now: () => new Date(),
                },
                input,
            )
        : undefined;
    const collectMedia =
        mediaEnabled && client !== null
            ? () =>
                collectMediaGarbage({ storage: storage.value, prefix: config.prefix, indexObjectKey, decrypt, decompress: gunzipBuffer, now: () => new Date() })
            : undefined;

    const report = await runBackup(
        {
            readTables: (requested) =>
                readTables({ tables: requested, connectionString: config.database.connectionString }),
            listTables: () => listPublicTables({ connectionString: config.database.connectionString }),
            storage: storage.value,
            compress: gzipBuffer,
            encrypt: (plain) => encryptBuffer(plain, config.encryption.key, config.encryption.keyId),
            now: () => new Date(),
            appVersion: process.env.npm_package_version ?? '0.1.0',
            gitCommit: process.env.GITHUB_SHA ?? null,
            gitBranch: process.env.GITHUB_REF_NAME ?? null,
            mirrorMedia,
            collectMediaGarbage: collectMedia,
            config: {
                prefix: config.prefix,
                appName: 'cuc-app',
                encryption: { algorithm: 'aes-256-gcm', keyDerivation: `aes-256-gcm/${config.encryption.keyId}` },
                retention: config.retention,
                envFingerprint: buildEnvFingerprint(undefined, env),
            },
        },
        { tables, tier: tier as (typeof TIERS)[number], write: WRITE, media: mediaEnabled },
    );

    const text = summary(report);
    console.log(text);
    const stepSummary = process.env.GITHUB_STEP_SUMMARY;
    if (typeof stepSummary === 'string' && stepSummary.length > 0) appendFileSync(stepSummary, `${text}\n`);

    if (report.degraded) {
        // Code de sortie distinct : la dégradation doit être visiblement rouge,
        // sans nier qu'un snapshot valide des tables présentes a bien été écrit.
        const mediaNote = report.media?.degraded === true ? `, médias dégradés (${report.media.failures.length} échec(s))` : '';
        console.error(
            `[backup] DÉGRADÉ — snapshot ${report.snapshotId} écrit, ${report.missingTables.length} table(s) absente(s) sautée(s)${mediaNote}.`,
        );
        process.exitCode = 2;
    }
}

main().catch((error: unknown) => {
    console.error(`[backup] ÉCHEC — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
