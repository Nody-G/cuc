/**
 * Sauvegarde automatique du site CUC — adaptateur S3-compatible (Cloudflare R2).
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : traduire le contrat
 * `BackupStorage` en commandes S3, sur un dépôt **hors du projet Supabase**
 * (`plans/plan-backups-automatiques-2026.md` § 3.2).
 *
 * Garanties : le client se construit **sans aucun appel réseau** (un
 * `S3CommandSender` factice est injectable, donc les tests ne sortent jamais du
 * processus) ; une configuration incomplète échoue en **nommant la variable** ;
 * les journaux d'erreur ne contiennent **jamais** les identifiants.
 */

import {
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

import { BACKUP_ENV } from './config';
import type {
    BackupStorage,
    PutObjectMeta,
    S3StorageSelection,
    StorageError,
    StorageResult,
    StoredObject,
} from './storage';
import { isSafeObjectKey, storageFailure, storageOk } from './storage';

/** Surface minimale d'un client S3 : injectable, donc testable hors réseau. */
export interface S3CommandSender {
    send(command: { input?: unknown }): Promise<unknown>;
}

/** Garde de bouclage : un listage paginé ne peut pas être infini. */
const MAX_LIST_PAGES = 1000;

/** Configuration passée à `S3Client` : aucune requête n'est émise ici. */
export function buildS3ClientConfig(selection: S3StorageSelection): {
    endpoint: string;
    region: string;
    forcePathStyle: boolean;
    credentials: { accessKeyId: string; secretAccessKey: string };
} {
    return {
        endpoint: selection.endpoint,
        region: selection.region,
        forcePathStyle: selection.forcePathStyle,
        credentials: { accessKeyId: selection.accessKeyId, secretAccessKey: selection.secretAccessKey },
    };
}

/** Instancie le client S3/R2 (construction pure, sans entrée/sortie réseau). */
export function createS3Client(selection: S3StorageSelection): S3Client {
    return new S3Client(buildS3ClientConfig(selection));
}

/**
 * Valide la sélection S3. Retourne `null` si elle est exploitable, sinon une
 * erreur **nommant explicitement** la variable d'environnement en défaut.
 */
export function validateS3Selection(selection: S3StorageSelection | null | undefined): StorageError | null {
    const required: ReadonlyArray<[keyof S3StorageSelection, string]> = [
        ['endpoint', BACKUP_ENV.s3Endpoint],
        ['bucket', BACKUP_ENV.s3Bucket],
        ['accessKeyId', BACKUP_ENV.s3AccessKeyId],
        ['secretAccessKey', BACKUP_ENV.s3SecretAccessKey],
    ];
    for (const [field, variable] of required) {
        const value = selection?.[field];
        if (typeof value !== 'string' || value.trim().length === 0) {
            return { code: 'config-incomplete', message: `Variable d'environnement manquante ou vide : ${variable}.` };
        }
    }
    return null;
}

/** Neutralise toute occurrence d'un secret dans un message journalisé. */
function redact(message: string, secrets: readonly string[]): string {
    let sanitized = message;
    for (const secret of secrets) {
        if (typeof secret === 'string' && secret.length >= 8) sanitized = sanitized.split(secret).join('[redacted]');
    }
    return sanitized;
}

/**
 * Journalise un échec (identifiants masqués) et retourne son motif lisible.
 * Aucun champ brut de l'erreur du SDK n'est repris : seuls le nom, le statut
 * HTTP et un message expurgé sortent du processus.
 */
function reportFailure(operation: string, error: unknown, secrets: readonly string[]): string {
    const candidate = error as { name?: unknown; message?: unknown; $metadata?: { httpStatusCode?: unknown } };
    const name = typeof candidate?.name === 'string' ? candidate.name : 'Error';
    const status = candidate?.$metadata?.httpStatusCode;
    const message = typeof candidate?.message === 'string' ? redact(candidate.message, secrets) : 'cause masquée';
    const detail = `${name}${typeof status === 'number' ? ` (HTTP ${status})` : ''}: ${message}`;

    console.error(`[backup][s3] ${operation} — échec : ${detail}`);
    return detail;
}

function isNotFound(error: unknown): boolean {
    const candidate = error as { name?: unknown; $metadata?: { httpStatusCode?: unknown } };
    return (
        candidate?.name === 'NotFound' ||
        candidate?.name === 'NoSuchKey' ||
        candidate?.$metadata?.httpStatusCode === 404
    );
}

function stripQuotes(value: unknown): string | undefined {
    return typeof value === 'string' ? value.replace(/^"|"$/g, '') : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toStoredObject(objectKey: string, source: Record<string, unknown>): StoredObject {
    return {
        objectKey,
        size: typeof source.ContentLength === 'number' ? source.ContentLength : 0,
        updatedAt: source.LastModified instanceof Date ? source.LastModified.toISOString() : undefined,
        etag: stripQuotes(source.ETag),
        contentType: typeof source.ContentType === 'string' ? source.ContentType : undefined,
        metadata: (source.Metadata as Record<string, string> | undefined) ?? undefined,
    };
}

/** Convertit un corps de réponse S3 en `Buffer`, sans dépendre du type exact. */
async function readBody(body: unknown): Promise<Buffer | null> {
    if (Buffer.isBuffer(body)) return body;
    const candidate = body as { byteLength?: unknown; transformToByteArray?: () => Promise<Uint8Array> };
    if (typeof candidate?.transformToByteArray === 'function') {
        return Buffer.from(await candidate.transformToByteArray());
    }
    return typeof candidate?.byteLength === 'number' ? Buffer.from(body as Uint8Array) : null;
}

function invalidKey<T>(objectKey: string): StorageResult<T> {
    return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
}

/**
 * Implémente `BackupStorage` sur un dépôt S3-compatible. `sender` est injectable
 * pour les tests : **aucun test unitaire ne touche le réseau**.
 */
export function createS3Storage(
    selection: S3StorageSelection,
    sender?: S3CommandSender,
): StorageResult<BackupStorage> {
    const problem = validateS3Selection(selection);
    if (problem !== null) return { ok: false, error: problem };

    const secrets: readonly string[] = [selection.accessKeyId, selection.secretAccessKey];
    const bucket = selection.bucket;
    const client: S3CommandSender = sender ?? (createS3Client(selection) as unknown as S3CommandSender);

    const storage: BackupStorage = {
        kind: 's3',

        async put(objectKey, body, meta?: PutObjectMeta): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(objectKey)) return invalidKey(objectKey);
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: objectKey,
                Body: body,
                ContentType: meta?.contentType,
                CacheControl: meta?.cacheControl,
                Metadata: meta?.metadata as Record<string, string> | undefined,
            });
            try {
                const response = asRecord(await client.send(command));
                return storageOk({
                    objectKey,
                    size: body.byteLength,
                    etag: stripQuotes(response.ETag),
                    contentType: meta?.contentType,
                    metadata: meta?.metadata,
                });
            } catch (error) {
                return storageFailure('io-failure', `Écriture refusée pour « ${objectKey} » — ${reportFailure('put', error, secrets)}.`, objectKey);
            }
        },

        async get(objectKey): Promise<StorageResult<Buffer>> {
            if (!isSafeObjectKey(objectKey)) return invalidKey(objectKey);
            try {
                const response = asRecord(await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey })));
                const buffer = await readBody(response.Body);
                if (buffer === null) return storageFailure('io-failure', `Corps illisible renvoyé pour « ${objectKey} ».`, objectKey);
                return storageOk(buffer);
            } catch (error) {
                if (isNotFound(error)) return storageFailure('not-found', `Objet absent « ${objectKey} ».`, objectKey);
                return storageFailure('io-failure', `Lecture refusée pour « ${objectKey} » — ${reportFailure('get', error, secrets)}.`, objectKey);
            }
        },

        async head(objectKey): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(objectKey)) return invalidKey(objectKey);
            try {
                const response = asRecord(await client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey })));
                return storageOk(toStoredObject(objectKey, response));
            } catch (error) {
                if (isNotFound(error)) return storageFailure('not-found', `Objet absent « ${objectKey} ».`, objectKey);
                return storageFailure('io-failure', `Statut indisponible pour « ${objectKey} » — ${reportFailure('head', error, secrets)}.`, objectKey);
            }
        },

        async list(prefix): Promise<StorageResult<StoredObject[]>> {
            if (typeof prefix !== 'string') return storageFailure('invalid-key', 'Préfixe de listage non textuel.');
            const objects: StoredObject[] = [];
            let token: string | undefined;
            let pages = 0;

            try {
                do {
                    const response = asRecord(
                        await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token })),
                    );
                    for (const item of Array.isArray(response.Contents) ? response.Contents : []) {
                        const record = asRecord(item);
                        if (typeof record.Key === 'string') objects.push(toStoredObject(record.Key, record));
                    }
                    token = typeof response.NextContinuationToken === 'string' ? response.NextContinuationToken : undefined;
                    pages += 1;
                } while (token !== undefined && token.length > 0 && pages < MAX_LIST_PAGES);
            } catch (error) {
                return storageFailure('io-failure', `Listage refusé sous « ${prefix} » — ${reportFailure('list', error, secrets)}.`);
            }

            objects.sort((left, right) => (left.objectKey < right.objectKey ? -1 : left.objectKey > right.objectKey ? 1 : 0));
            return storageOk(objects);
        },

        async remove(objectKey): Promise<StorageResult<void>> {
            if (!isSafeObjectKey(objectKey)) return invalidKey(objectKey);
            try {
                await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
                return storageOk(undefined);
            } catch (error) {
                return storageFailure('io-failure', `Suppression refusée pour « ${objectKey} » — ${reportFailure('remove', error, secrets)}.`, objectKey);
            }
        },

        async copyWithin(sourceKey, targetKey): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(sourceKey) || !isSafeObjectKey(targetKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${sourceKey} » → « ${targetKey} ».`);
            }
            const command = new CopyObjectCommand({
                Bucket: bucket,
                Key: targetKey,
                CopySource: encodeURIComponent(`${bucket}/${sourceKey}`),
            });
            try {
                const response = asRecord(await client.send(command));
                return storageOk({ objectKey: targetKey, size: 0, etag: stripQuotes(response.ETag) });
            } catch (error) {
                return storageFailure('io-failure', `Copie refusée « ${sourceKey} » → « ${targetKey} » — ${reportFailure('copyWithin', error, secrets)}.`, targetKey);
            }
        },

        async exists(objectKey): Promise<StorageResult<boolean>> {
            const result = await storage.head(objectKey);
            if (result.ok) return storageOk(true);
            if (result.error.code === 'not-found') return storageOk(false);
            return { ok: false, error: result.error };
        },
    };

    return storageOk(storage);
}
