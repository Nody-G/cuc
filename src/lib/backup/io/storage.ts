/**
 * Sauvegarde automatique du site CUC — contrat d'adaptateur de stockage.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : définir **la forme
 * unique** d'un dépôt d'objets (local ou S3-compatible) et choisir
 * l'implémentation. Aucune donnée métier, aucune clé de chiffrement ici.
 *
 * Doctrine appliquée ([`.agents/rules/durability_health.md:71`](../../../.agents/rules/durability_health.md:71)) :
 * aucune méthode ne lève d'exception non documentée et aucun `catch` n'est
 * silencieux — **tout** appel retourne un `StorageResult` explicite.
 *
 * Les implémentations sont chargées **dynamiquement** par la fabrique : un
 * usage local (tests, dry-run) n'entraîne donc jamais le SDK S3, et le SDK S3
 * n'est jamais évalué dans un environnement qui n'en a pas besoin.
 */

/** Nature de l'implémentation : la racine « locale » existe pour les tests. */
export type StorageKind = 'local' | 's3';

/** Motifs d'échec typés d'une opération de stockage. */
export type StorageErrorCode =
    | 'invalid-key'
    | 'not-found'
    | 'config-incomplete'
    | 'unknown-storage-kind'
    | 'io-failure';

/** Échec explicite d'une opération : jamais un `throw` nu, jamais un silence. */
export interface StorageError {
    code: StorageErrorCode;
    message: string;
    objectKey?: string;
}

/** Union discriminée : l'appelant ne peut ignorer un échec. */
export type StorageResult<T> =
    | { ok: true; value: T }
    | { ok: false; error: StorageError };

/** Métadonnées d'un objet stocké. */
export interface StoredObject {
    objectKey: string;
    size: number;
    updatedAt?: string;
    etag?: string;
    contentType?: string;
    metadata?: Readonly<Record<string, string>>;
}

/** Métadonnées facultatives fournies à l'écriture. */
export interface PutObjectMeta {
    contentType?: string;
    cacheControl?: string;
    metadata?: Readonly<Record<string, string>>;
}

/**
 * Contrat unique de dépôt d'objets. `copyWithin` sert à la promotion GFS
 * (hisser une quotidienne en hebdomadaire/mensuelle sans la réécrire).
 */
export interface BackupStorage {
    readonly kind: StorageKind;
    put(objectKey: string, body: Uint8Array, meta?: PutObjectMeta): Promise<StorageResult<StoredObject>>;
    get(objectKey: string): Promise<StorageResult<Buffer>>;
    head(objectKey: string): Promise<StorageResult<StoredObject>>;
    list(prefix: string): Promise<StorageResult<StoredObject[]>>;
    remove(objectKey: string): Promise<StorageResult<void>>;
    copyWithin(sourceKey: string, targetKey: string): Promise<StorageResult<StoredObject>>;
    exists(objectKey: string): Promise<StorageResult<boolean>>;
}

/** Configuration d'un dépôt local (tests et dry-run uniquement). */
export interface LocalStorageSelection {
    kind: 'local';
    root: string;
}

/** Configuration d'un dépôt S3-compatible (Cloudflare R2 en production). */
export interface S3StorageSelection {
    kind: 's3';
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
}

/** Sélection d'implémentation produite par `config.ts`. */
export type StorageSelection = LocalStorageSelection | S3StorageSelection;

/** Fabrique un succès typé. */
export function storageOk<T>(value: T): StorageResult<T> {
    return { ok: true, value };
}

/** Fabrique un échec typé. */
export function storageFailure<T>(
    code: StorageErrorCode,
    message: string,
    objectKey?: string,
): StorageResult<T> {
    return { ok: false, error: objectKey === undefined ? { code, message } : { code, message, objectKey } };
}

/**
 * Vrai si la clé d'objet est sûre : relative, sans remontée de répertoire,
 * sans caractère de contrôle. Une clé douteuse est **refusée**, jamais
 * « normalisée » en silence.
 */
export function isSafeObjectKey(objectKey: string): boolean {
    if (typeof objectKey !== 'string' || objectKey.length === 0 || objectKey.length > 1024) return false;
    if (objectKey.startsWith('/') || objectKey.includes('\\')) return false;
    if (objectKey.includes('//') || objectKey.includes('\0')) return false;
    if (objectKey.includes('?') || objectKey.includes('#')) return false;
    if (/[\u0000-\u001f\u007f]/.test(objectKey)) return false;
    return objectKey.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

/**
 * Choisit l'implémentation de stockage. Un type inconnu retourne une erreur
 * explicite (`unknown-storage-kind`) — jamais un adaptateur par défaut.
 */
export async function createStorage(selection: StorageSelection): Promise<StorageResult<BackupStorage>> {
    const kind = (selection as { kind?: unknown } | null | undefined)?.kind;

    if (kind === 'local') {
        const { createLocalStorage } = await import('./storage-local');
        return createLocalStorage(selection as LocalStorageSelection);
    }
    if (kind === 's3') {
        const { createS3Storage } = await import('./storage-s3');
        return createS3Storage(selection as S3StorageSelection);
    }

    return storageFailure(
        'unknown-storage-kind',
        `Adaptateur de stockage inconnu « ${String(kind)} » — « local » ou « s3 » attendu.`,
    );
}
