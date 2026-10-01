#!/usr/bin/env node
/**
 * CLI — état du miroir média (lecture seule : ni Supabase en écriture, ni dépôt modifié).
 *
 *   npm run backup:media
 *
 * Affiche par bucket objets et taille, la déduplication effective, l'incrémental
 * depuis le dernier instantané et les objets en échec.
 */
import * as dotenv from 'dotenv';

import { gunzipBuffer } from '../../src/lib/backup/io/compress';
import { BACKUP_ENV, DEFAULT_KEY_ID, DEFAULT_STORAGE_PREFIX, parseEncryptionKey, resolveMediaCredentials, resolveStorageSelection } from '../../src/lib/backup/io/config';
import { decryptBuffer } from '../../src/lib/backup/io/crypto';
import { createDefaultMediaClient, MEDIA_BUCKET_PLAN, readBucketObjects } from '../../src/lib/backup/io/media';
import { createStorage } from '../../src/lib/backup/io/storage';
import { buildMediaIndex, diffMediaIndex, hashesToStore, type MediaObjectDescriptor } from '../../src/lib/backup/media-index';
import { loadPreviousMediaIndex } from '../../src/lib/backup/media-mirror';
import { buildIndexObjectKey } from '../../src/lib/backup/orchestrate';

dotenv.config({ path: '.env.local' });

/** Taille lisible (simple confort d'affichage). */
function humanBytes(value: number): string {
    if (value < 1024) return `${value} o`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
    return `${(value / (1024 * 1024)).toFixed(2)} Mo`;
}

async function main(): Promise<void> {
    const env = { ...process.env };
    const credentials = resolveMediaCredentials(env);
    if (credentials === null) {
        throw new Error(`Identifiants Storage absents — ${BACKUP_ENV.supabaseUrl} et ${BACKUP_ENV.supabaseServiceRoleKey} requis.`);
    }
    const client = await createDefaultMediaClient(credentials);
    const prefix = env[BACKUP_ENV.storagePrefix]?.trim() || DEFAULT_STORAGE_PREFIX;

    const storage = await createStorage(resolveStorageSelection(env));
    if (!storage.ok) throw new Error(`Stockage indisponible — ${storage.error.message}`);

    // Index précédent : optionnel, il ne sert qu'à mesurer l'incrémental.
    let key: Buffer | null = null;
    try {
        key = parseEncryptionKey(env[BACKUP_ENV.encryptionKey]);
    } catch {
        key = null;
    }
    const keyId = env[BACKUP_ENV.encryptionKeyId]?.trim() || DEFAULT_KEY_ID;
    const resolveKey = key === null ? null : (id: string): Uint8Array | null => (id === keyId ? key : null);
    const previous = resolveKey === null
        ? { ok: true, entries: [], reason: null }
        : await loadPreviousMediaIndex({
            storage: storage.value, indexObjectKey: buildIndexObjectKey(prefix),
            decrypt: (envelope) => decryptBuffer(envelope, resolveKey), decompress: gunzipBuffer, now: () => new Date(),
        });

    const descriptors: MediaObjectDescriptor[] = [];
    const failures: string[] = [];
    for (const plan of MEDIA_BUCKET_PLAN) {
        const read = await readBucketObjects({ client, bucket: plan.name });
        if (!read.ok) {
            failures.push(`${plan.name} : listage refusé [${read.error?.code}] — ${read.error?.message}`);
            continue;
        }
        descriptors.push(...read.objects);
        const bytes = read.objects.reduce((sum, object) => sum + object.size, 0);
        console.log(`Bucket ${plan.name} [${plan.regime}] — ${read.objects.length} objet(s), ${humanBytes(bytes)}`);
        failures.push(...read.failures.map((failure) => `${plan.name}/${failure}`));
    }

    const current = buildMediaIndex(descriptors);
    const unique = new Set(current.map((entry) => entry.sha256)).size;
    const diff = diffMediaIndex(previous.entries, current);
    const mirror = await storage.value.list(`${prefix}/media/`);

    console.log(`Index courant — ${current.length} objet(s) source, ${unique} blob(s) unique(s)`);
    console.log(`Déduplication — source ${current.length} vs blobs stockés ${mirror.ok ? mirror.value.length : 0} (${current.length - unique} chemin(s) mutualisé(s))`);
    console.log(`Incrémental — ajoutés ${diff.added.length}, modifiés ${diff.changed.length}, inchangés ${diff.unchanged.length}, disparus ${diff.removedFromSource.length}`);
    console.log(`À téléverser au prochain run — ${hashesToStore(diff).length} blob(s) unique(s)`);
    if (!previous.ok) console.error(`Index précédent indisponible (incrémental non mesurable) — ${previous.reason}`);
    if (key === null) console.error(`Clé de chiffrement absente — incrémental non mesurable (${BACKUP_ENV.encryptionKey}).`);

    if (failures.length > 0) {
        console.error(`${failures.length} objet(s) en échec :`);
        for (const failure of failures) console.error(`  · ${failure}`);
        process.exitCode = 1;
    }
}

main().catch((error: unknown) => {
    console.error(`[backup:media] ÉCHEC — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
