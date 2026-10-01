/**
 * Sauvegarde automatique du site CUC — dépôt d'un run (parts et catalogue).
 *
 * Couche « I/O » (`AGENTS.md` § 1) : matérialiser une unité de charge utile
 * (compresser → chiffrer → empreinte de l'objet écrit), l'écrire, écrire le
 * catalogue par la porte unique d'`index-store.ts`, et nettoyer des objets déjà
 * écrits en cas d'échec. Aucune décision métier ici.
 *
 * Extrait d'[`orchestrate.ts`](./orchestrate.ts:1) pour tenir le plafond de
 * 300 lignes (`AGENTS.md` § 2) ; `orchestrate.ts` reste l'API publique.
 */

import type { BackupIndexEntry, BackupPart, BackupPartKind } from './contracts';
import { BackupRunError } from './errors';
import { emptyBackupIndex, writeBackupIndex } from './io/index-store';
import type { BackupStorage } from './io/storage';
import { sha256Hex } from './naming';

/** Une unité de charge utile avant compression/chiffrement. */
export interface PayloadUnit {
    kind: BackupPartKind;
    table: string | null;
    objectKey: string;
    rows: number;
    payload: Uint8Array;
}

/** Fonctions de transformation injectées (compression, chiffrement). */
export interface PartCrypto {
    compress: (plain: Uint8Array) => Buffer;
    encrypt: (plain: Uint8Array) => Buffer;
}

/** Compresse, chiffre et décrit une unité ; le digest porte sur l'objet écrit. */
export function materializePart(unit: PayloadUnit, crypto: PartCrypto): { part: BackupPart; envelope: Buffer } {
    const envelope = crypto.encrypt(crypto.compress(unit.payload));
    const part: BackupPart = {
        kind: unit.kind,
        table: unit.table,
        objectKey: unit.objectKey,
        rows: unit.rows,
        compressedBytes: envelope.byteLength,
        plainBytes: unit.payload.byteLength,
        sha256: sha256Hex(envelope),
        compression: 'gzip',
        cipher: 'aes-256-gcm',
    };
    return { part, envelope };
}

/** Écrit un objet ; l'échec typé du stockage devient une erreur nommée. */
export async function putObject(
    storage: BackupStorage,
    objectKey: string,
    body: Uint8Array,
    contentType: string,
    operation: string,
): Promise<void> {
    const written = await storage.put(objectKey, body, { contentType });
    if (!written.ok) {
        throw new BackupRunError(`${operation} refusée pour « ${objectKey} » [${written.error.code}] — ${written.error.message}.`, objectKey);
    }
}

/** Écrit le catalogue par la porte unique d'`index-store.ts`. */
export async function persistIndex(
    storage: BackupStorage,
    indexObjectKey: string,
    entries: readonly BackupIndexEntry[],
    updatedAt: string,
): Promise<void> {
    const written = await writeBackupIndex(storage, { ...emptyBackupIndex(updatedAt), entries: [...entries] }, indexObjectKey);
    if (!written.ok) throw new BackupRunError(`Catalogue non écrit [${written.error.code}] — ${written.error.message}.`, indexObjectKey);
}

/** Supprime les objets déjà écrits ; un objet absent n'est pas un échec. */
export async function discardWrittenObjects(storage: BackupStorage, keys: readonly string[]): Promise<string[]> {
    const failures: string[] = [];
    for (const key of [...keys].reverse()) {
        const removed = await storage.remove(key);
        if (!removed.ok && removed.error.code !== 'not-found') failures.push(`${key} [${removed.error.code}]`);
    }
    return failures;
}
