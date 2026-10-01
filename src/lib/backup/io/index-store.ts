/**
 * Sauvegarde automatique du site CUC — catalogue des versions (`index.json`).
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : lire et écrire le
 * catalogue **sur le stockage objet**, jamais dans Postgres
 * (`plans/plan-backups-automatiques-2026.md` § 4.4 : un catalogue ne doit pas
 * mourir avec la base qu'il catalogue).
 *
 * Garantie de non-fuite : chaque entrée est **reconstruite** champ par champ à
 * la lecture. Tout champ non contractuel est donc écarté, ce qui rend
 * structurellement impossible la présence d'un contenu de `site_inquiries`
 * (ou de toute autre donnée personnelle) dans l'index.
 *
 * Types = `BackupIndex` / `BackupIndexEntry` de [`contracts.ts`](../contracts.ts:94).
 */

import type { BackupIndex, BackupIndexEntry, BackupIndexTier, BackupStatus } from '../contracts';
import type { BackupStorage, StorageResult } from './storage';
import { storageFailure, storageOk } from './storage';

/** Clé d'objet du catalogue, à la racine du préfixe de sauvegarde. */
export const INDEX_OBJECT_KEY = 'index.json';

/** Version de format du catalogue reconnue par ce module. */
export const INDEX_FORMAT_VERSION = 1;

const TIERS: readonly BackupIndexTier[] = ['daily', 'weekly', 'monthly'];
/** `degraded` = instantané valide au périmètre réduit (table absente sautée). */
const STATUSES: readonly BackupStatus[] = ['complete', 'degraded', 'incomplete'];

/** Index vide **valide** : un catalogue absent n'est pas une erreur. */
export function emptyBackupIndex(updatedAt: string): BackupIndex {
    return { formatVersion: INDEX_FORMAT_VERSION, updatedAt, entries: [] };
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Reconstruit une entrée à partir des **seuls** champs contractuels.
 * Retourne `null` si un champ obligatoire manque ou est malformé.
 * `missingTables`, facultatif, n'est conservé que s'il porte des noms : un
 * catalogue déjà écrit (sans ce champ) se relit donc à l'identique.
 */
export function normalizeIndexEntry(value: unknown): BackupIndexEntry | null {
    const record = asRecord(value);
    if (record === null) return null;

    if (typeof record.id !== 'string' || record.id.trim().length === 0) return null;
    if (typeof record.createdAt !== 'string' || record.createdAt.trim().length === 0) return null;
    if (!TIERS.includes(record.tier as BackupIndexTier)) return null;
    if (!STATUSES.includes(record.status as BackupStatus)) return null;
    if (!isNonNegativeInteger(record.partsCount)) return null;
    if (!isNonNegativeInteger(record.bytes)) return null;
    if (typeof record.prefix !== 'string') return null;
    if (typeof record.appVersion !== 'string') return null;

    const gitCommit = typeof record.gitCommit === 'string' ? record.gitCommit : null;
    const missingTables = Array.isArray(record.missingTables)
        ? record.missingTables.filter((name): name is string => typeof name === 'string' && name.length > 0)
        : [];

    const entry: BackupIndexEntry = {
        id: record.id,
        createdAt: record.createdAt,
        tier: record.tier as BackupIndexTier,
        status: record.status as BackupStatus,
        partsCount: record.partsCount,
        bytes: record.bytes,
        prefix: record.prefix,
        appVersion: record.appVersion,
        gitCommit,
    };
    if (missingTables.length > 0) entry.missingTables = missingTables;
    return entry;
}

/**
 * Analyse un catalogue sérialisé. Un JSON présent mais illisible ou corrompu
 * produit une **erreur explicite** — jamais un index vide silencieux.
 */
export function parseBackupIndex(raw: string, source: string = INDEX_OBJECT_KEY): StorageResult<BackupIndex> {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return storageFailure('io-failure', `${source} illisible — contenu vide.`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return storageFailure('io-failure', `${source} illisible — JSON invalide.`);
    }

    const record = asRecord(parsed);
    if (record === null) return storageFailure('io-failure', `${source} corrompu — la racine n'est pas un objet.`);
    if (record.formatVersion !== INDEX_FORMAT_VERSION) {
        return storageFailure(
            'io-failure',
            `${source} corrompu — version de format « ${String(record.formatVersion)} » inconnue.`,
        );
    }
    if (typeof record.updatedAt !== 'string' || record.updatedAt.trim().length === 0) {
        return storageFailure('io-failure', `${source} corrompu — horodatage de mise à jour absent.`);
    }
    if (!Array.isArray(record.entries)) {
        return storageFailure('io-failure', `${source} corrompu — liste d'entrées absente.`);
    }

    const entries: BackupIndexEntry[] = [];
    for (let index = 0; index < record.entries.length; index += 1) {
        const entry = normalizeIndexEntry(record.entries[index]);
        if (entry === null) {
            return storageFailure('io-failure', `${source} corrompu — entrée ${index + 1} malformée.`);
        }
        entries.push(entry);
    }

    return storageOk({ formatVersion: INDEX_FORMAT_VERSION, updatedAt: record.updatedAt, entries });
}

/**
 * Lit le catalogue. Absent ⇒ index vide valide (dégradation gracieuse) ;
 * présent mais corrompu ⇒ échec typé.
 */
export async function readBackupIndex(
    storage: BackupStorage,
    objectKey: string = INDEX_OBJECT_KEY,
    now: () => string = () => new Date().toISOString(),
): Promise<StorageResult<BackupIndex>> {
    const fetched = await storage.get(objectKey);
    if (!fetched.ok) {
        if (fetched.error.code === 'not-found') return storageOk(emptyBackupIndex(now()));
        return storageFailure(fetched.error.code, fetched.error.message, objectKey);
    }
    return parseBackupIndex(fetched.value.toString('utf8'), objectKey);
}

/** Écrit le catalogue (JSON lisible, entrées reconstruites, donc sans PII). */
export async function writeBackupIndex(
    storage: BackupStorage,
    index: BackupIndex,
    objectKey: string = INDEX_OBJECT_KEY,
): Promise<StorageResult<BackupIndex>> {
    const entries: BackupIndexEntry[] = [];
    for (const candidate of index?.entries ?? []) {
        const entry = normalizeIndexEntry(candidate);
        if (entry === null) {
            return storageFailure('io-failure', `${objectKey} refusé — une entrée est malformée.`);
        }
        entries.push(entry);
    }

    const normalized: BackupIndex = {
        formatVersion: INDEX_FORMAT_VERSION,
        updatedAt: index?.updatedAt ?? new Date().toISOString(),
        entries,
    };

    const written = await storage.put(objectKey, Buffer.from(JSON.stringify(normalized, null, 2), 'utf8'), {
        contentType: 'application/json',
    });
    if (!written.ok) return storageFailure(written.error.code, written.error.message, objectKey);
    return storageOk(normalized);
}
