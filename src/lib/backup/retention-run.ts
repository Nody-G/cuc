/**
 * Sauvegarde automatique du site CUC — application de la rétention GFS.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1) : promotions de tier, purge des
 * objets des entrées retirées, puis réécriture du catalogue — toujours dans cet
 * ordre (`plans/plan-backups-automatiques-2026.md` § 3.4 : la purge supprime
 * les objets **puis** réécrit l'index, jamais l'inverse).
 *
 * Extrait d'[`orchestrate.ts`](./orchestrate.ts:1) pour tenir le plafond de
 * 300 lignes ; la politique pure reste dans [`retention.ts`](./retention.ts:1).
 */

import type { BackupIndexEntry, RetentionPolicy, RetentionPromotion } from './contracts';
import { BackupRunError } from './errors';
import type { BackupStorage } from './io/storage';
import { selectRetention } from './retention';
import { persistIndex } from './run-parts';

/** Décision de rétention réellement appliquée. */
export interface RetentionRunReport {
    promoted: RetentionPromotion[];
    purged: string[];
}

/**
 * Applique la rétention : décision pure (`selectRetention`), purge best-effort
 * motivée, puis catalogue réécrit sans les entrées purgées. Une entrée sans
 * préfixe fait échouer la purge — jamais une suppression au hasard.
 */
export async function applyRetention(
    storage: BackupStorage,
    indexObjectKey: string,
    entries: readonly BackupIndexEntry[],
    now: Date,
    policy: RetentionPolicy,
    updatedAt: string,
): Promise<RetentionRunReport> {
    const decision = selectRetention({ entries, now, policy });
    const promotions = new Map<string, RetentionPromotion['tier']>(decision.promote.map((promotion) => [promotion.id, promotion.tier]));
    const promoted = entries.map((entry) => {
        const tier = promotions.get(entry.id);
        return tier === undefined ? entry : { ...entry, tier };
    });
    const purged: string[] = [];
    for (const entry of promoted) {
        if (!decision.delete.includes(entry.id)) continue;
        if (entry.prefix.trim().length === 0) {
            throw new BackupRunError(`Catalogue incohérent — entrée « ${entry.id} » sans préfixe : purge refusée.`);
        }
        const listed = await storage.list(`${entry.prefix}/`);
        if (!listed.ok) {
            throw new BackupRunError(`Listage refusé sous « ${entry.prefix}/ » [${listed.error.code}] — ${listed.error.message}.`);
        }
        for (const object of listed.value) {
            const removed = await storage.remove(object.objectKey);
            if (!removed.ok && removed.error.code !== 'not-found') {
                throw new BackupRunError(`Purge refusée pour « ${object.objectKey} » [${removed.error.code}] — ${removed.error.message}.`, object.objectKey);
            }
        }
        purged.push(entry.id);
    }
    await persistIndex(storage, indexObjectKey, promoted.filter((entry) => !decision.delete.includes(entry.id)), updatedAt);
    return { promoted: decision.promote, purged };
}
