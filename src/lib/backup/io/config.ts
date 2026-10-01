/**
 * Sauvegarde automatique du site CUC — configuration et validation.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : charger **et
 * valider** la configuration depuis l'environnement, en produisant des erreurs
 * qui **nomment la variable en défaut**. Aucun secret n'a de valeur par défaut
 * silencieuse : une variable requise absente arrête l'appel.
 *
 * Ce module est la **seule source** des noms de variables d'environnement du
 * système de sauvegarde (`AGENTS.md` § 4) : les adaptateurs (`storage-s3.ts`)
 * les importent, ils ne les redéfinissent jamais.
 */

import type { RetentionPolicy } from '../contracts';
import { DEFAULT_RETENTION_POLICY } from '../retention';
import { AES_256_KEY_BYTES } from './crypto';
import type { LocalStorageSelection, S3StorageSelection, StorageKind, StorageSelection } from './storage';

/** Noms canoniques des variables d'environnement (source unique). */
export const BACKUP_ENV = {
    storageKind: 'BACKUP_STORAGE_KIND',
    localRoot: 'BACKUP_LOCAL_ROOT',
    storagePrefix: 'BACKUP_STORAGE_PREFIX',
    encryptionKey: 'BACKUP_ENCRYPTION_KEY',
    encryptionKeyId: 'BACKUP_ENCRYPTION_KEY_ID',
    databaseUrl: 'DATABASE_URL',
    databaseUrlFallback: 'SUPABASE_DB_URL',
    supabaseUrl: 'NEXT_PUBLIC_SUPABASE_URL',
    supabaseUrlFallback: 'SUPABASE_URL',
    supabaseServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
    s3Endpoint: 'BACKUP_S3_ENDPOINT',
    s3Bucket: 'BACKUP_S3_BUCKET',
    s3AccessKeyId: 'BACKUP_S3_ACCESS_KEY_ID',
    s3SecretAccessKey: 'BACKUP_S3_SECRET_ACCESS_KEY',
    s3Region: 'BACKUP_S3_REGION',
    s3ForcePathStyle: 'BACKUP_S3_FORCE_PATH_STYLE',
    retentionDaily: 'BACKUP_RETENTION_DAILY',
    retentionWeekly: 'BACKUP_RETENTION_WEEKLY',
    retentionMonthly: 'BACKUP_RETENTION_MONTHLY',
} as const;

/** Préfixe de stockage par défaut, sous la racine du dépôt objet. */
export const DEFAULT_STORAGE_PREFIX = 'cuc-backups';

/** Identifiant de clé par défaut (première génération). */
export const DEFAULT_KEY_ID = 'v1';

/** Région S3 par défaut : R2 exige la valeur `auto`. */
export const DEFAULT_S3_REGION = 'auto';

/** Cible de stockage par défaut : le dépôt hors projet (R2) — décision produit. */
export const DEFAULT_STORAGE_KIND: StorageKind = 's3';

/** Racine locale par défaut (tests et dry-run uniquement). */
export const DEFAULT_LOCAL_ROOT = '.backup-local-run';

/** Base64 strict : toute entrée hors de cet alphabet est refusée. */
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

/** Source d'environnement injectable (les tests ne touchent pas `process.env`). */
export type EnvSource = Record<string, string | undefined>;

/** Erreur de configuration nommée, porteuse de la variable fautive. */
export class BackupConfigError extends Error {
    readonly variable: string | null;

    constructor(message: string, variable: string | null = null) {
        super(message);
        this.name = 'BackupConfigError';
        this.variable = variable;
    }
}

/** Configuration complète et validée du système de sauvegarde. */
export interface BackupConfig {
    storage: StorageSelection;
    encryption: { key: Buffer; keyId: string };
    database: { connectionString: string };
    prefix: string;
    retention: RetentionPolicy;
}

function fail(message: string, variable: string | null): never {
    throw new BackupConfigError(message, variable);
}

function readRequired(env: EnvSource, variable: string): string {
    const raw = env?.[variable];
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        fail(`Variable d'environnement manquante ou vide : ${variable}.`, variable);
    }
    return raw.trim();
}

/**
 * Décode la clé de chiffrement (base64, **exactement 32 octets**).
 * Un base64 invalide, une taille de 31 ou 33 octets, ou une absence de
 * variable produisent trois messages distincts — jamais une clé devinée.
 */
export function parseEncryptionKey(raw: string | undefined, variable: string = BACKUP_ENV.encryptionKey): Buffer {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        fail(`Variable d'environnement manquante ou vide : ${variable}.`, variable);
    }
    const trimmed = raw.trim();
    if (trimmed.length % 4 !== 0 || !BASE64_PATTERN.test(trimmed)) {
        fail(`${variable} n'est pas un base64 valide (32 octets encodés attendus).`, variable);
    }
    const key = Buffer.from(trimmed, 'base64');
    if (key.byteLength !== AES_256_KEY_BYTES) {
        fail(`${variable} doit décoder exactement ${AES_256_KEY_BYTES} octets — ${key.byteLength} reçu(s).`, variable);
    }
    return key;
}

/** Résout la chaîne de connexion, avec le repli `SUPABASE_DB_URL`. */
export function resolveDatabaseUrl(env: EnvSource): string {
    const primary = env?.[BACKUP_ENV.databaseUrl];
    if (typeof primary === 'string' && primary.trim().length > 0) return primary.trim();
    const fallback = env?.[BACKUP_ENV.databaseUrlFallback];
    if (typeof fallback === 'string' && fallback.trim().length > 0) return fallback.trim();
    fail(
        `Variable d'environnement manquante : ${BACKUP_ENV.databaseUrl} (ou repli ${BACKUP_ENV.databaseUrlFallback}).`,
        BACKUP_ENV.databaseUrl,
    );
}

/**
 * Accès **lecture seule** au Storage Supabase (médias). Ces variables sont
 * **optionnelles** : un run de données seules doit continuer à fonctionner
 * sans elles (`plans/plan-backups-automatiques-2026.md` § 9, Lot 5).
 */
export interface MediaCredentials {
    url: string;
    serviceRoleKey: string;
}

function firstNonEmpty(...values: Array<string | undefined>): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
    return null;
}

/**
 * Résout les identifiants Storage. Absents tous les deux ⇒ `null` (médias non
 * sauvegardés, le run reste possible pour les données) ; un seul présent ⇒
 * erreur explicite **nommant la variable manquante**, jamais un client bancal.
 */
export function resolveMediaCredentials(env: EnvSource): MediaCredentials | null {
    const url = firstNonEmpty(env?.[BACKUP_ENV.supabaseUrl], env?.[BACKUP_ENV.supabaseUrlFallback]);
    const serviceRoleKey = firstNonEmpty(env?.[BACKUP_ENV.supabaseServiceRoleKey]);

    if (url === null && serviceRoleKey === null) return null;
    if (url === null) {
        fail(
            `Sauvegarde des médias demandée mais ${BACKUP_ENV.supabaseUrl} (ou repli ${BACKUP_ENV.supabaseUrlFallback}) est absente.`,
            BACKUP_ENV.supabaseUrl,
        );
    }
    if (serviceRoleKey === null) {
        fail(
            `Sauvegarde des médias demandée mais ${BACKUP_ENV.supabaseServiceRoleKey} est absente.`,
            BACKUP_ENV.supabaseServiceRoleKey,
        );
    }
    return { url, serviceRoleKey };
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
    if (typeof raw !== 'string') return fallback;
    const normalized = raw.trim().toLowerCase();
    if (['1', 'true', 'yes', 'oui'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'non'].includes(normalized)) return false;
    return fallback;
}

/** Sélection d'adaptateur : `local` (tests/dry-run) ou `s3` (production). */
export function resolveStorageSelection(env: EnvSource): StorageSelection {
    const kind = (env?.[BACKUP_ENV.storageKind]?.trim() || DEFAULT_STORAGE_KIND) as StorageKind;

    if (kind === 'local') {
        const root = env?.[BACKUP_ENV.localRoot]?.trim() || DEFAULT_LOCAL_ROOT;
        const selection: LocalStorageSelection = { kind: 'local', root };
        return selection;
    }
    if (kind === 's3') {
        const selection: S3StorageSelection = {
            kind: 's3',
            endpoint: readRequired(env, BACKUP_ENV.s3Endpoint),
            bucket: readRequired(env, BACKUP_ENV.s3Bucket),
            accessKeyId: readRequired(env, BACKUP_ENV.s3AccessKeyId),
            secretAccessKey: readRequired(env, BACKUP_ENV.s3SecretAccessKey),
            region: env?.[BACKUP_ENV.s3Region]?.trim() || DEFAULT_S3_REGION,
            forcePathStyle: parseBoolean(env?.[BACKUP_ENV.s3ForcePathStyle], true),
        };
        return selection;
    }

    return fail(
        `Adaptateur de stockage inconnu « ${String(kind)} » dans ${BACKUP_ENV.storageKind} — « local » ou « s3 » attendu.`,
        BACKUP_ENV.storageKind,
    );
}

function parseRetentionCount(env: EnvSource, variable: string, fallback: number): number {
    const raw = env?.[variable];
    if (typeof raw !== 'string' || raw.trim().length === 0) return fallback;
    const value = Number(raw.trim());
    if (!Number.isInteger(value) || value < 0) {
        fail(`${variable} doit être un entier positif ou nul — « ${raw} » reçu.`, variable);
    }
    return value;
}

/** Politique GFS : 7 / 4 / 12 par défaut, surchargeable variable par variable. */
export function resolveRetentionPolicy(env: EnvSource): RetentionPolicy {
    return {
        daily: parseRetentionCount(env, BACKUP_ENV.retentionDaily, DEFAULT_RETENTION_POLICY.daily),
        weekly: parseRetentionCount(env, BACKUP_ENV.retentionWeekly, DEFAULT_RETENTION_POLICY.weekly),
        monthly: parseRetentionCount(env, BACKUP_ENV.retentionMonthly, DEFAULT_RETENTION_POLICY.monthly),
    };
}

/**
 * Charge la configuration complète. Ordre de validation volontaire :
 * clé de chiffrement, puis connexion base, puis stockage, puis rétention —
 * un secret manquant est donc signalé avant toute considération secondaire.
 */
export function loadBackupConfig(env: EnvSource = process.env): BackupConfig {
    const key = parseEncryptionKey(env?.[BACKUP_ENV.encryptionKey]);
    const connectionString = resolveDatabaseUrl(env);
    const storage = resolveStorageSelection(env);
    const prefix = env?.[BACKUP_ENV.storagePrefix]?.trim() || DEFAULT_STORAGE_PREFIX;
    const keyId = env?.[BACKUP_ENV.encryptionKeyId]?.trim() || DEFAULT_KEY_ID;

    return { storage, encryption: { key, keyId }, database: { connectionString }, prefix, retention: resolveRetentionPolicy(env) };
}
