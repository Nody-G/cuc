/**
 * Sauvegarde automatique du site CUC — ramasse-miettes média conservateur.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1). Responsabilité unique : retirer du
 * miroir les blobs qui ne sont **référencés par aucun manifeste conservé** du
 * catalogue, et **jamais un autre**.
 *
 * Extrait de [`media-mirror.ts`](./media-mirror.ts:1) pour tenir le plafond de
 * 300 lignes (`AGENTS.md` § 2). Règles de prudence, non négociables :
 *  - un seul catalogue, manifeste ou index média **illisible** ⇒ abandon total,
 *    aucune suppression, motif signalé ;
 *  - un listage en échec ⇒ abandon total ;
 *  - une clé de forme inconnue ⇒ conservée (en cas de doute, on garde) ;
 *  - un blob référencé ⇒ jamais supprimé.
 */

import { readBackupIndex } from './io/index-store';
import { isValidMediaHash, referencedHashes } from './media-index';
import { loadMediaIndexFromManifest, type MediaIndexReader } from './media-mirror';
import { parseManifest } from './manifest';

/** Dépendances du ramasse-miettes conservateur. */
export interface MediaGcDependencies extends MediaIndexReader {
    prefix: string;
    indexObjectKey: string;
    now: () => Date;
}

/** Rapport du ramasse-miettes : un abandon est toujours motivé. */
export interface MediaGcReport {
    aborted: boolean;
    reason: string | null;
    scannedBlobs: number;
    referencedBlobs: number;
    removed: string[];
    failed: string[];
}

function normalizePrefix(prefix: string): string {
    return typeof prefix === 'string' ? prefix.replace(/^\/+|\/+$/g, '') : '';
}

/**
 * Exécute le ramasse-miettes. Il **refuse toute suppression** — et le signale —
 * dès qu'un catalogue, un manifeste ou un index média est illisible, ou que le
 * listage du miroir échoue.
 */
export async function collectMediaGarbage(deps: MediaGcDependencies): Promise<MediaGcReport> {
    const abort = (reason: string, scannedBlobs = 0): MediaGcReport => ({
        aborted: true, reason, scannedBlobs, referencedBlobs: 0, removed: [], failed: [],
    });

    const index = await readBackupIndex(deps.storage, deps.indexObjectKey, () => deps.now().toISOString());
    if (!index.ok) return abort(`catalogue illisible [${index.error.code}] — aucune suppression.`);

    const referenced = new Set<string>();
    for (const entry of index.value.entries) {
        const manifestObject = await deps.storage.get(`${entry.prefix}/manifest.json`);
        if (!manifestObject.ok) return abort(`manifeste « ${entry.id} » illisible — aucune suppression.`);
        const parsed = parseManifest(manifestObject.value.toString('utf8'));
        if (!parsed.ok) return abort(`manifeste « ${entry.id} » refusé — aucune suppression.`);
        const loaded = await loadMediaIndexFromManifest(deps, parsed.manifest);
        if (!loaded.ok) return abort(`index média de « ${entry.id} » illisible — aucune suppression.`);
        for (const hash of referencedHashes(loaded.entries)) referenced.add(hash);
    }

    const listed = await deps.storage.list(`${normalizePrefix(deps.prefix)}/media/`);
    if (!listed.ok) return abort(`listage du miroir refusé [${listed.error.code}] — aucune suppression.`);

    const removed: string[] = [];
    const failed: string[] = [];
    for (const object of listed.value) {
        const objectKey = object.objectKey;
        const hash = objectKey.slice(objectKey.lastIndexOf('/') + 1);
        if (!isValidMediaHash(hash)) continue; // forme inconnue : conservée
        if (referenced.has(hash)) continue; // référencé : jamais supprimé
        const removal = await deps.storage.remove(objectKey);
        if (removal.ok || removal.error.code === 'not-found') removed.push(objectKey);
        else failed.push(`${objectKey} [${removal.error.code}]`);
    }
    return {
        aborted: false, reason: null, scannedBlobs: listed.value.length,
        referencedBlobs: referenced.size, removed, failed,
    };
}
