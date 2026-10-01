#!/usr/bin/env node
/**
 * CLI — catalogue des sauvegardes disponibles (lecture seule, aucune écriture).
 *
 *   npm run backup:list
 *
 * Lit `index.json` sur le dépôt objet via `io/index-store.ts` (porte unique) et
 * affiche un tableau : id, date, tier, statut, taille, parts, version, commit.
 * Aucune clé de chiffrement ni connexion base n'est requise.
 */
import * as dotenv from 'dotenv';

import { BACKUP_ENV, DEFAULT_STORAGE_PREFIX, resolveStorageSelection } from '../../src/lib/backup/io/config';
import { readBackupIndex } from '../../src/lib/backup/io/index-store';
import { createStorage } from '../../src/lib/backup/io/storage';
import { buildIndexObjectKey } from '../../src/lib/backup/orchestrate';

dotenv.config({ path: '.env.local' });

/** Taille lisible (aucune donnée métier, simple confort d'affichage). */
function humanBytes(value: number): string {
    if (value < 1024) return `${value} o`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
    return `${(value / (1024 * 1024)).toFixed(2)} Mo`;
}

async function main(): Promise<void> {
    const env = { ...process.env };
    const prefix = env[BACKUP_ENV.storagePrefix]?.trim() || DEFAULT_STORAGE_PREFIX;

    const storage = await createStorage(resolveStorageSelection(env));
    if (!storage.ok) throw new Error(`Stockage indisponible — ${storage.error.message}`);

    const index = await readBackupIndex(storage.value, buildIndexObjectKey(prefix));
    if (!index.ok) throw new Error(`Catalogue illisible — ${index.error.message}`);

    const entries = [...index.value.entries].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
    if (entries.length === 0) {
        console.log(`Catalogue vide sous « ${prefix} » — mis à jour ${index.value.updatedAt}.`);
        return;
    }

    console.log(`${entries.length} sauvegarde(s) — catalogue mis à jour ${index.value.updatedAt}`);
    console.log(['ID', 'DATE (UTC)', 'TIER', 'STATUT', 'TAILLE', 'PARTS', 'APP', 'COMMIT'].join('\t'));
    for (const entry of entries) {
        console.log(
            [
                entry.id,
                entry.createdAt,
                entry.tier,
                entry.status,
                humanBytes(entry.bytes),
                String(entry.partsCount),
                entry.appVersion,
                entry.gitCommit ?? '—',
            ].join('\t'),
        );
    }
    if (entries.some((entry) => entry.status === 'incomplete')) {
        console.log('Attention : une entrée « incomplete » est un run interrompu, purgée à la prochaine rétention.');
    }
    if (entries.some((entry) => entry.status === 'degraded')) {
        console.log('Attention : une entrée « degraded » est un snapshot valide au périmètre réduit — une table demandée était absente et a été sautée.');
    }
}

main().catch((error: unknown) => {
    console.error(`[backup:list] ÉCHEC — ${error instanceof Error ? error.message : 'cause inconnue'}`);
    process.exitCode = 1;
});
