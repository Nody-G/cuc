/**
 * Sauvegarde automatique du site CUC — adaptateur système de fichiers.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : implémenter
 * `BackupStorage` sur un répertoire local, pour les **tests** et le **dry-run**
 * (aucun accès réseau, aucun secret). La production utilise `storage-s3.ts`.
 *
 * Aucune méthode ne lève : toute erreur du système de fichiers devient un
 * `StorageResult` en échec avec un code explicite.
 */

import { copyFile, mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { BackupStorage, LocalStorageSelection, StorageResult, StoredObject } from './storage';
import { isSafeObjectKey, storageFailure, storageOk } from './storage';

/** Vrai si l'erreur du système de fichiers signifie « objet absent ». */
function isMissing(error: unknown): boolean {
    return (error as { code?: string } | null)?.code === 'ENOENT';
}

function describe(error: unknown): string {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return 'cause inconnue';
}

/** Chemin absolu d'une clé d'objet, clé déjà validée comme sûre. */
function resolveObjectPath(root: string, objectKey: string): string {
    return path.join(root, ...objectKey.split('/'));
}

/** Implémente `BackupStorage` sur un répertoire racine. */
export function createLocalStorage(selection: LocalStorageSelection): StorageResult<BackupStorage> {
    const root = typeof selection?.root === 'string' ? selection.root.trim() : '';
    if (root.length === 0) {
        return storageFailure(
            'config-incomplete',
            'Stockage local refusé — racine absente (BACKUP_LOCAL_ROOT non renseignée).',
        );
    }

    const absoluteRoot = path.resolve(root);
    const storage: BackupStorage = {
        kind: 'local',

        async put(objectKey, body, meta): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(objectKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
            }
            const target = resolveObjectPath(absoluteRoot, objectKey);
            try {
                await mkdir(path.dirname(target), { recursive: true });
                await writeFile(target, body);
                const info = await stat(target);
                return storageOk({
                    objectKey,
                    size: info.size,
                    updatedAt: info.mtime.toISOString(),
                    contentType: meta?.contentType,
                    metadata: meta?.metadata,
                });
            } catch (error) {
                return storageFailure('io-failure', `Écriture refusée pour « ${objectKey} » — ${describe(error)}.`, objectKey);
            }
        },

        async get(objectKey): Promise<StorageResult<Buffer>> {
            if (!isSafeObjectKey(objectKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
            }
            try {
                return storageOk(await readFile(resolveObjectPath(absoluteRoot, objectKey)));
            } catch (error) {
                if (isMissing(error)) return storageFailure('not-found', `Objet absent « ${objectKey} ».`, objectKey);
                return storageFailure('io-failure', `Lecture refusée pour « ${objectKey} » — ${describe(error)}.`, objectKey);
            }
        },

        async head(objectKey): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(objectKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
            }
            try {
                const info = await stat(resolveObjectPath(absoluteRoot, objectKey));
                return storageOk({ objectKey, size: info.size, updatedAt: info.mtime.toISOString() });
            } catch (error) {
                if (isMissing(error)) return storageFailure('not-found', `Objet absent « ${objectKey} ».`, objectKey);
                return storageFailure('io-failure', `Statut indisponible pour « ${objectKey} » — ${describe(error)}.`, objectKey);
            }
        },

        async list(prefix): Promise<StorageResult<StoredObject[]>> {
            if (typeof prefix !== 'string') {
                return storageFailure('invalid-key', 'Préfixe de listage non textuel.');
            }
            const objects: StoredObject[] = [];

            const walk = async (directory: string, relative: string): Promise<void> => {
                const entries = await readdir(directory, { withFileTypes: true });
                for (const entry of entries) {
                    const childRelative = relative === '' ? entry.name : `${relative}/${entry.name}`;
                    const childAbsolute = path.join(directory, entry.name);
                    if (entry.isDirectory()) {
                        await walk(childAbsolute, childRelative);
                        continue;
                    }
                    if (!entry.isFile()) continue;
                    if (!childRelative.startsWith(prefix)) continue;
                    const info = await stat(childAbsolute);
                    objects.push({ objectKey: childRelative, size: info.size, updatedAt: info.mtime.toISOString() });
                }
            };

            try {
                await walk(absoluteRoot, '');
            } catch (error) {
                if (isMissing(error)) return storageOk([]);
                return storageFailure('io-failure', `Listage refusé sous « ${prefix} » — ${describe(error)}.`);
            }
            objects.sort((left, right) => (left.objectKey < right.objectKey ? -1 : left.objectKey > right.objectKey ? 1 : 0));
            return storageOk(objects);
        },

        async remove(objectKey): Promise<StorageResult<void>> {
            if (!isSafeObjectKey(objectKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
            }
            try {
                await unlink(resolveObjectPath(absoluteRoot, objectKey));
                return storageOk(undefined);
            } catch (error) {
                if (isMissing(error)) return storageFailure('not-found', `Objet absent « ${objectKey} ».`, objectKey);
                return storageFailure('io-failure', `Suppression refusée pour « ${objectKey} » — ${describe(error)}.`, objectKey);
            }
        },

        async copyWithin(sourceKey, targetKey): Promise<StorageResult<StoredObject>> {
            if (!isSafeObjectKey(sourceKey) || !isSafeObjectKey(targetKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${sourceKey} » → « ${targetKey} ».`);
            }
            const source = resolveObjectPath(absoluteRoot, sourceKey);
            const target = resolveObjectPath(absoluteRoot, targetKey);
            try {
                await mkdir(path.dirname(target), { recursive: true });
                await copyFile(source, target);
                const info = await stat(target);
                return storageOk({ objectKey: targetKey, size: info.size, updatedAt: info.mtime.toISOString() });
            } catch (error) {
                if (isMissing(error)) return storageFailure('not-found', `Objet source absent « ${sourceKey} ».`, sourceKey);
                return storageFailure('io-failure', `Copie refusée « ${sourceKey} » → « ${targetKey} » — ${describe(error)}.`);
            }
        },

        async exists(objectKey): Promise<StorageResult<boolean>> {
            if (!isSafeObjectKey(objectKey)) {
                return storageFailure('invalid-key', `Clé d'objet refusée « ${objectKey} ».`, objectKey);
            }
            try {
                const info = await stat(resolveObjectPath(absoluteRoot, objectKey));
                return storageOk(info.isFile());
            } catch (error) {
                if (isMissing(error)) return storageOk(false);
                return storageFailure('io-failure', `Existence indéterminable pour « ${objectKey} » — ${describe(error)}.`, objectKey);
            }
        },
    };

    return storageOk(storage);
}
