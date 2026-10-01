#!/usr/bin/env node
/**
 * CLI — vérification réelle d'une sauvegarde (lecture seule, aucune écriture).
 *
 *   npm run backup:verify                         # le snapshot le plus récent : sha256 seul
 *   npm run backup:verify -- --deep               # + déchiffrement et décompression réels
 *   npm run backup:verify -- --snapshot=<id> --deep
 *
 * C'est ce contrôle qui sépare « un fichier existe » de « la sauvegarde est
 * restaurable » : chaque partie est relue depuis le dépôt, son `sha256` est
 * recalculé et confronté au manifeste (`integrity.ts`), puis — avec `--deep` —
 * réellement déchiffrée et décompressée pour compter les lignes. Sortie non
 * nulle dès qu'une seule partie est en défaut. Aucune écriture, aucun accès base.
 */
import { createHash } from 'node:crypto';

import * as dotenv from 'dotenv';

import { gunzipBuffer, parseNdjson } from '../../src/lib/backup/io/compress';
import {
    BACKUP_ENV,
    DEFAULT_KEY_ID,
    DEFAULT_STORAGE_PREFIX,
    parseEncryptionKey,
    resolveStorageSelection,
} from '../../src/lib/backup/io/config';
import { decryptBuffer } from '../../src/lib/backup/io/crypto';
import { readBackupIndex } from '../../src/lib/backup/io/index-store';
import { createStorage } from '../../src/lib/backup/io/storage';
import { verifyManifestIntegrity, verifyManifestTotals } from '../../src/lib/backup/integrity';
import type { PartDigest } from '../../src/lib/backup/contracts';
import { buildMediaIndex, mediaKeyFor, type MediaObjectDescriptor } from '../../src/lib/backup/media-index';
import { parseManifest } from '../../src/lib/backup/manifest';
import { buildIndexObjectKey } from '../../src/lib/backup/orchestrate';

dotenv.config({ path: '.env.local' });

const args = process.argv.slice(2);
const DEEP = args.includes('--deep');

/** Valeur d'une option `--nom=valeur`, sinon `null`. */
function option(name: string): string | null {
    const found = args.find((argument) => argument.startsWith(`--${name}=`));
    return found === undefined ? null : found.slice(name.length + 3);
}

async function main(): Promise<void> {
    const env = { ...process.env };
    const prefix = env[BACKUP_ENV.storagePrefix]?.trim() || DEFAULT_STORAGE_PREFIX;
    const requested = option('snapshot') ?? args.find((argument) => !argument.startsWith('--')) ?? null;

    const storage = await createStorage(resolveStorageSelection(env));
    if (!storage.ok) throw new Error(`Stockage indisponible — ${storage.error.message}`);

    const index = await readBackupIndex(storage.value, buildIndexObjectKey(prefix));
    if (!index.ok) throw new Error(`Catalogue illisible — ${index.error.message}`);

    const sorted = [...index.value.entries].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
    // Un snapshot `degraded` reste **vérifiable** : on le contrôle comme un autre.
    const entry =
        requested === null
            ? sorted.find((candidate) => candidate.status !== 'incomplete')
            : index.value.entries.find((candidate) => candidate.id === requested);
    if (entry === undefined) {
        throw new Error(`Snapshot « ${requested ?? 'le plus récent'} » introuvable dans le catalogue.`);
    }

    const manifestObject = await storage.value.get(`${entry.prefix}/manifest.json`);
    if (!manifestObject.ok) throw new Error(`Manifeste illisible — ${manifestObject.error.message}`);
    const parsed = parseManifest(manifestObject.value.toString('utf8'));
    if (!parsed.ok) throw new Error(`Manifeste refusé — ${parsed.error}`);

    const manifest = parsed.manifest;
    const failures: string[] = [];
    const totals = verifyManifestTotals(manifest);
    if (!totals.ok) failures.push('totaux du manifeste incohérents avec ses parties');

    const key = DEEP ? parseEncryptionKey(env[BACKUP_ENV.encryptionKey]) : null;
    const keyId = env[BACKUP_ENV.encryptionKeyId]?.trim() || DEFAULT_KEY_ID;
    const resolveKey = key === null ? null : (id: string): Uint8Array | null => (id === keyId ? key : null);

    console.log(
        `Snapshot ${manifest.id} [${manifest.tier}] — ${manifest.parts.length} partie(s), ${manifest.totals.rows} ligne(s), ${manifest.totals.bytes} octet(s)`,
    );
    if (entry.status === 'degraded') {
        const skipped = (entry.missingTables ?? []).join(', ') || 'non listées';
        console.log(`Snapshot DÉGRADÉ — table(s) absente(s) sautée(s) : ${skipped}`);
    }

    const digests: PartDigest[] = [];
    for (const part of manifest.parts) {
        const fetched = await storage.value.get(part.objectKey);
        if (!fetched.ok) {
            failures.push(`${part.objectKey} : ${fetched.error.code}`);
            console.log(`✗ ${part.objectKey} — ${fetched.error.code}`);
            continue;
        }
        digests.push({ objectKey: part.objectKey, sha256: createHash('sha256').update(fetched.value).digest('hex') });
        if (resolveKey === null) {
            const note = part.kind === 'media-index' ? ' — index média : blobs NON vérifiés (clé absente)' : '';
            console.log(`✓ ${part.objectKey} — sha256 vérifié (${part.rows} ligne(s))${note}`);
            continue;
        }
        try {
            const plain = gunzipBuffer(decryptBuffer(fetched.value, resolveKey));
            if (part.kind === 'media-index') {
                // Index média : chaque blob référencé doit exister et son contenu
                // déchiffré doit redonner l'empreinte annoncée (sinon sauvegarde inexpoitable).
                const index = buildMediaIndex(JSON.parse(plain.toString('utf8')) as MediaObjectDescriptor[]);
                let checked = 0;
                for (const entry of index) {
                    const blobKey = mediaKeyFor(entry.sha256, prefix);
                    const blob = await storage.value.get(blobKey);
                    if (!blob.ok) {
                        failures.push(`${blobKey} : blob média manquant (référencé par l’index)`);
                        continue;
                    }
                    const digest = createHash('sha256').update(decryptBuffer(blob.value, resolveKey)).digest('hex');
                    if (digest !== entry.sha256) failures.push(`${blobKey} : contenu média altéré`);
                    checked += 1;
                }
                const gap = index.length === checked ? '' : `, ${index.length - checked} en défaut`;
                console.log(`✓ ${part.objectKey} — index média (${index.length} objet(s), ${checked} blob(s) conforme(s)${gap})`);
                continue;
            }
            const rows = parseNdjson(plain.toString('utf8'));
            if (!rows.ok) throw new Error(rows.error);
            if (part.kind === 'table' && rows.rows.length !== part.rows) {
                throw new Error(`${rows.rows.length} ligne(s) lue(s) ≠ ${part.rows} déclarée(s)`);
            }
            console.log(`✓ ${part.objectKey} — déchiffré, décompressé, ${rows.rows.length} ligne(s)`);
        } catch (error) {
            failures.push(`${part.objectKey} : ${error instanceof Error ? error.message : 'cause inconnue'}`);
            console.log(`✗ ${part.objectKey} — illisible après déchiffrement`);
        }
    }
    for (const mismatch of verifyManifestIntegrity(manifest, digests)) {
        failures.push(`${mismatch.objectKey} : ${mismatch.reason}`);
    }

    if (failures.length > 0) {
        console.error(`${failures.length} défaut(s) — sauvegarde NON restaurable :`);
        for (const failure of failures) console.error(`  · ${failure}`);
        process.exitCode = 1;
        return;
    }
    console.log(
        `Vérification réussie — ${manifest.parts.length} partie(s) conforme(s)${DEEP ? ' et réellement exploitables' : ''}.`,
    );
}

main().catch((error: unknown) => {
    console.error(`[backup:verify] ÉCHEC — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
