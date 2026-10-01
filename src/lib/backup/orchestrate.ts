/**
 * Sauvegarde automatique du site CUC — orchestration d'un run.
 *
 * Une seule responsabilité : enchaîner le circuit (périmètre → lecture → NDJSON →
 * gzip → AES-256-GCM → stockage → manifeste → catalogue → rétention) sans jamais
 * toucher `pg`, `@aws-sdk/*`, `node:fs` ni `process.env` : toutes les dépendances
 * sont injectées — seule façon de prouver par un test hors réseau et hors base
 * qu'un échec en cours de route ne corrompt pas le catalogue
 * (`.agents/rules/durability_health.md:71`).
 *
 * Découpé pour tenir le plafond de 300 lignes (`AGENTS.md` § 2) : le nommage
 * (`./naming`), l'erreur nommée (`./errors`) et le pré-vol d'inventaire
 * (`./preflight`) vivent dans leurs propres modules et sont réexportés ici.
 *
 * **Table absente non fatale** : si `listTables` est injecté, un pré-vol confronte
 * les tables demandées à l'inventaire réel de `public`. Une table déclarée mais
 * absente est **sautée**, la sauvegarde **se poursuit** avec les autres, et la
 * dégradation est **tracée** (manifeste `degraded`, entrée de catalogue
 * `degraded` + `missingTables`). Aucun cas silencieux.
 *
 * Choix imposés par les contrats livrés : `BackupPart.sha256` porte le digest de
 * l'objet **tel qu'écrit** ; `compressedBytes` porte sa taille (analogue de
 * `ciphertext_bytes`, § 4.1) ; l'empreinte d'environnement, absente du contrat de
 * manifeste, devient une **partie `config`** — aucun secret n'y figure.
 */
import type { BackupDegradation, BackupIndexEntry, BackupIndexTier, BackupManifest, BackupPart, BackupPartKind, BackupRow, BackupTier, CipherAlgorithm, RetentionPolicy } from './contracts';
import { BackupRunError } from './errors';
import { toNdjson } from './io/compress';
import type { ListTablesResult, ReadTablesResult } from './io/db-read';
import type { EnvFingerprint } from './io/env-fingerprint';
import { readBackupIndex } from './io/index-store';
import type { BackupStorage } from './io/storage';
import { buildManifest, serializeManifest } from './manifest';
import type { MediaGcReport } from './media-gc';
import type { MediaMirrorOutcome, MediaMirrorReport } from './media-mirror';
import { buildIndexObjectKey, buildSnapshotId, buildSnapshotPrefix } from './naming';
import { resolveRequestedTables } from './preflight';
import { applyRetention } from './retention-run';
import type { RetentionRunReport } from './retention-run';
import { discardWrittenObjects, materializePart, persistIndex, putObject, type PayloadUnit } from './run-parts';
import { assertBackupScope } from './whitelist';

// API publique préservée : les CLI et les tests importent ces symboles d'`orchestrate`.
export { BackupRunError } from './errors';
export { buildIndexObjectKey, buildSnapshotId, buildSnapshotPrefix, compactUtcStamp, normalizePrefix } from './naming';

/** Dépendances I/O injectées : lecture des tables, compression, chiffrement. */
export type BackupTableReader = (tables: readonly string[]) => Promise<ReadTablesResult>;
export type BackupCompressor = (plain: Uint8Array) => Buffer;
export type BackupEncryptor = (plain: Uint8Array) => Buffer;
/**
 * Inventaire des tables réellement présentes dans `public`, injecté en pré-vol.
 * **Optionnel** : sans lui, aucune dégradation n'est déduite (comportement
 * nominal strict, inchangé).
 */
export type BackupTableLister = () => Promise<ListTablesResult>;

/** Faits d'environnement reçus en paramètres — `process.env` n'est jamais lu ici. */
export interface BackupOrchestrationConfig {
    prefix: string;
    appName: string;
    encryption: { algorithm: CipherAlgorithm; keyDerivation: string };
    retention: RetentionPolicy;
    envFingerprint: EnvFingerprint;
}
/** Toutes les dépendances d'un run : aucune n'a de valeur par défaut implicite. */
export interface RunBackupDependencies {
    readTables: BackupTableReader;
    /** Pré-vol facultatif : inventaire réel des tables de `public`. */
    listTables?: BackupTableLister;
    storage: BackupStorage;
    compress: BackupCompressor;
    encrypt: BackupEncryptor;
    now: () => Date;
    config: BackupOrchestrationConfig;
    appVersion: string;
    gitCommit: string | null;
    gitBranch: string | null;
    /** Miroir média optionnel : sans lui, le run reste un run de données. */
    mirrorMedia?: MediaMirrorHook;
    /** Ramasse-miettes média optionnel, exécuté après la rétention. */
    collectMediaGarbage?: MediaGcHook;
}
/** `write: false` = dry-run strict ; `media: false` = run de données seul. */
export interface RunBackupOptions { tables: readonly string[]; tier: BackupTier; write: boolean; media?: boolean }
/** Miroir média injecté : lit le Storage et écrit les blobs dans le dépôt. */
export type MediaMirrorHook = (input: { snapshotPrefix: string; write: boolean }) => Promise<MediaMirrorOutcome>;
/** Ramasse-miettes média injecté, exécuté après la rétention. */
export type MediaGcHook = () => Promise<MediaGcReport>;
/** Vue d'une partie, exploitable par un CLI ou un `$GITHUB_STEP_SUMMARY`. */
export interface BackupPartReport { kind: BackupPartKind; table: string | null; objectKey: string; rows: number; plainBytes: number; storedBytes: number; sha256: string }
/** Décision de rétention réellement appliquée (rapport d'orchestration). */
export type BackupRetentionReport = RetentionRunReport;
/** Rapport structuré d'un run — succès comme dry-run. */
export interface BackupReport {
    snapshotId: string;
    createdAt: string;
    tier: BackupIndexTier;
    dryRun: boolean;
    snapshotPrefix: string;
    manifestObjectKey: string;
    indexObjectKey: string;
    /** Tables **réellement** sauvegardées (présentes dans l'inventaire). */
    tables: string[];
    /** Vrai dès qu'une table demandée a été sautée : le run est dégradé. */
    degraded: boolean;
    /** Tables demandées mais absentes, avec le motif — jamais silencieux. */
    missingTables: BackupDegradation[];
    parts: BackupPartReport[];
    totals: BackupManifest['totals'];
    manifest: BackupManifest;
    retention: BackupRetentionReport | null;
    /** Rapport du miroir média ; `null` si la sauvegarde média est désactivée. */
    media: MediaMirrorReport | null;
    /** Clé d'objet de la part `media-index` ; `null` si aucune part média. */
    mediaIndexObjectKey: string | null;
    /** Rapport du ramasse-miettes média ; `null` si non exécuté. */
    garbage: MediaGcReport | null;
    durationMs: number;
}
const INDEX_TIERS: readonly BackupIndexTier[] = ['daily', 'weekly', 'monthly'];

/** Refuse un tier hors catalogue : un instantané « manual » ne se catalogue pas. */
function assertIndexTier(tier: BackupTier): BackupIndexTier {
    if (!INDEX_TIERS.includes(tier as BackupIndexTier)) throw new BackupRunError(`Tier « ${String(tier)} » hors catalogue — daily, weekly ou monthly attendu.`);
    return tier as BackupIndexTier;
}
/** Périmètre : fail-fast, **avant toute lecture** — CUC Sign hors d'atteinte. */
function normalizeTables(tables: readonly string[]): string[] {
    if (!Array.isArray(tables) || tables.length === 0) throw new BackupRunError('Périmètre vide — aucune table à sauvegarder.');
    const unique: string[] = [];
    for (const table of tables) {
        assertBackupScope(table);
        if (!unique.includes(table)) unique.push(table);
    }
    return unique;
}

/**
 * Exécute un run complet : (a) périmètre, (a bis) pré-vol des tables réellement
 * présentes, (b) lecture, (c) parts (NDJSON → gzip → AES-256-GCM → `put`, digest
 * de l'objet écrit), (d) manifeste, (e) écriture du manifeste, (f) catalogue
 * consolidé, (g) rétention. L'entrée de catalogue est marquée `incomplete`
 * **avant** toute part : un échec laisse un catalogue marqué, jamais un faux
 * `complete` ; toute erreur remonte et les objets écrits sont retirés (aucun
 * catch silencieux). Une table absente rend le run **dégradé** (code de sortie
 * distinct côté CLI), jamais un échec total.
 */
export async function runBackup(deps: RunBackupDependencies, options: RunBackupOptions): Promise<BackupReport> {
    const requested = normalizeTables(options.tables); // (a) périmètre, avant toute lecture
    const { tables, missing } = await resolveRequestedTables(requested, deps.listTables); // (a bis) pré-vol
    const tier = assertIndexTier(options.tier);
    const startedAt = deps.now().getTime();
    const createdAt = deps.now().toISOString();
    const snapshotId = buildSnapshotId(createdAt, deps.gitCommit);
    const snapshotPrefix = buildSnapshotPrefix(deps.config.prefix, createdAt, snapshotId);
    const indexObjectKey = buildIndexObjectKey(deps.config.prefix);
    const manifestObjectKey = `${snapshotPrefix}/manifest.json`;
    const write = options.write === true;

    // (a ter) miroir média : incrémental, chiffré, dégradation tracée, jamais silencieuse.
    const mediaEnabled = options.media !== false;
    const mediaOutcome =
        mediaEnabled && deps.mirrorMedia !== undefined ? await deps.mirrorMedia({ snapshotPrefix, write }) : null;
    const degraded = missing.length > 0 || (mediaOutcome?.degraded ?? false);
    const mediaIndexObjectKey =
        mediaOutcome?.media === null || mediaOutcome?.media === undefined
            ? null
            : `${snapshotPrefix}/data/media-index.json.gz.enc`;

    const reads = await deps.readTables(tables); // (b) seule lecture de données du système
    if (!reads.ok) {
        const where = reads.error.table === null ? '' : ` sur « ${reads.error.table} »`;
        throw new BackupRunError(`Lecture refusée [${reads.error.code}]${where} — ${reads.error.message}.`, reads.error.table);
    }
    const rowsByTable = new Map<string, readonly BackupRow[]>();
    for (const read of reads.tables) rowsByTable.set(read.table, read.rows);

    const units: PayloadUnit[] = [{
        kind: 'config', table: null, rows: 0,
        objectKey: `${snapshotPrefix}/data/env-fingerprint.json.gz.enc`,
        payload: Buffer.from(JSON.stringify(deps.config.envFingerprint, null, 2), 'utf8'),
    }];
    for (const table of tables) {
        const rows = rowsByTable.get(table);
        if (rows === undefined) throw new BackupRunError(`Table « ${table} » absente du résultat de lecture — instantané refusé.`, table);
        units.push({
            kind: 'table', table, rows: rows.length,
            objectKey: `${snapshotPrefix}/data/${table}.ndjson.gz.enc`,
            payload: Buffer.from(toNdjson(rows), 'utf8'),
        });
    }
    if (mediaOutcome?.media !== null && mediaOutcome?.media !== undefined) {
        units.push({
            kind: 'media-index', table: null, rows: mediaOutcome.media.rows,
            objectKey: `${snapshotPrefix}/data/media-index.json.gz.enc`,
            payload: mediaOutcome.media.payload,
        });
    }

    const parts: BackupPart[] = [];
    const writtenKeys: string[] = [];
    const existing: BackupIndexEntry[] = [];
    const catalogueEntry = (
        status: BackupIndexEntry['status'],
        totals: BackupManifest['totals'],
        absent: readonly string[] = [],
    ): BackupIndexEntry => {
        const entry: BackupIndexEntry = {
            id: snapshotId, createdAt, tier, status, partsCount: totals.parts, bytes: totals.bytes,
            prefix: snapshotPrefix, appVersion: deps.appVersion, gitCommit: deps.gitCommit,
        };
        if (absent.length > 0) entry.missingTables = [...absent];
        return entry;
    };

    try {
        if (write) {
            const current = await readBackupIndex(deps.storage, indexObjectKey, () => createdAt);
            if (!current.ok) throw new BackupRunError(`Catalogue illisible [${current.error.code}] — ${current.error.message}.`);
            existing.push(...current.value.entries);
            await persistIndex(deps.storage, indexObjectKey, [...existing, catalogueEntry('incomplete', { parts: 0, rows: 0, bytes: 0 })], createdAt);
        }

        for (const unit of units) { // (c) parts : le digest porte sur l'objet tel qu'écrit
            const { part, envelope } = materializePart(unit, deps);
            parts.push(part);
            if (write) {
                await putObject(deps.storage, part.objectKey, envelope, 'application/octet-stream', 'Écriture');
                writtenKeys.push(part.objectKey);
            }
        }

        const manifest = buildManifest({ // (d) manifeste assemblé par le domaine pur
            id: snapshotId, createdAt, tier,
            app: { name: deps.config.appName, version: deps.appVersion },
            git: { commit: deps.gitCommit, branch: deps.gitBranch },
            encryption: deps.config.encryption, parts,
            degraded: missing, // trace explicite, omise quand le run est sain
        });
        let retention: BackupRetentionReport | null = null;
        let garbage: MediaGcReport | null = null;

        if (write) {
            // (e) manifeste, puis (f) catalogue consolidé APRÈS succès de toutes les parts.
            await putObject(deps.storage, manifestObjectKey, Buffer.from(serializeManifest(manifest), 'utf8'), 'application/json', 'Écriture du manifeste');
            writtenKeys.push(manifestObjectKey);
            const catalogue = [
                ...existing,
                catalogueEntry(degraded ? 'degraded' : 'complete', manifest.totals, missing.map((item) => item.table)),
            ];
            await persistIndex(deps.storage, indexObjectKey, catalogue, createdAt);
            // (g) rétention : promotions puis purge des objets retirés.
            retention = await applyRetention(deps.storage, indexObjectKey, catalogue, deps.now(), deps.config.retention, createdAt);
            // (g bis) ramasse-miettes média conservateur, APRÈS la rétention ; un index
            // média non fiable interdit toute suppression.
            if (deps.collectMediaGarbage !== undefined && (mediaOutcome === null || mediaOutcome.report.indexReliable)) {
                garbage = await deps.collectMediaGarbage();
            }
        }

        return {
            snapshotId, createdAt, tier, dryRun: !write, snapshotPrefix, manifestObjectKey, indexObjectKey,
            tables: [...tables], degraded, missingTables: missing, totals: manifest.totals, manifest, retention,
            media: mediaOutcome?.report ?? null, mediaIndexObjectKey, garbage,
            parts: parts.map((part) => ({
                kind: part.kind, table: part.table, objectKey: part.objectKey, rows: part.rows,
                plainBytes: part.plainBytes, storedBytes: part.compressedBytes, sha256: part.sha256,
            })),
            durationMs: deps.now().getTime() - startedAt,
        };
    } catch (error) {
        // (h) aucun catch silencieux : nettoyage best-effort, puis remontée de l'échec.
        const failures = await discardWrittenObjects(deps.storage, writtenKeys);
        const cause = error instanceof Error ? `${error.name}: ${error.message}` : 'cause inconnue';
        const residue = failures.length === 0 ? '' : ` Objets non supprimés : ${failures.join(', ')}.`;
        throw new BackupRunError(`Sauvegarde interrompue — ${cause}${residue}`);
    }
}
