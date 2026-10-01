/**
 * Sauvegarde automatique du site CUC — politique de rétention GFS.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : 7 quotidiennes, 4 hebdomadaires,
 * 12 mensuelles. `now` est **injecté en paramètre** ; aucune horloge implicite
 * (`Date.now()` et `new Date()` ne sont jamais appelés). Les dates sont des
 * chaînes ISO 8601 UTC déjà lues par la couche I/O, découpées de façon
 * déterministe — le jour de la semaine est calculé par arithmétique pure
 * (Zeller), sans `Date`.
 *
 * Comportements tranchés et documentés :
 *  - une entrée `status: 'incomplete'` n'est **jamais** promue ni conservée
 *    comme point de restauration valide : elle est **purgée** ;
 *  - une entrée `status: 'degraded'` est un instantané **valide** au périmètre
 *    réduit : elle compte dans la rétention exactement comme une `complete` ;
 *  - une entrée datée dans le **futur** (dérive d'horloge, donnée douteuse)
 *    est conservée et jamais promue ;
 *  - les tiers déjà promus (hebdo/mensuel) sont **immuables** : jamais purgés
 *    par la rétention glissante ; les compteurs de la politique bornent donc
 *    les **promotions**, pas les entrées existantes.
 *
 * Plan de référence : `plans/plan-backups-automatiques-2026.md` § 3.4.
 */

import type {
    BackupIndexEntry,
    RetentionDecision,
    RetentionPolicy,
    RetentionPromotion,
} from './contracts';

/** Politique GFS de référence : 7 quotidiennes, 4 hebdomadaires, 12 mensuelles. */
export const DEFAULT_RETENTION_POLICY: RetentionPolicy = { daily: 7, weekly: 4, monthly: 12 };

/** Entrées du catalogue, horloge injectée, politique optionnelle. */
export interface SelectRetentionInput {
    entries: readonly BackupIndexEntry[];
    now: Date;
    policy?: RetentionPolicy;
}

/** Indice UTC du jour de la semaine, 0 = dimanche (Zeller, sans `Date`). */
function utcWeekdayIndex(createdAt: string): number {
    const year = Number(createdAt.slice(0, 4));
    const month = Number(createdAt.slice(5, 7));
    const day = Number(createdAt.slice(8, 10));

    const shiftedMonth = month <= 2 ? month + 12 : month;
    const shiftedYear = month <= 2 ? year - 1 : year;
    const century = Math.floor(shiftedYear / 100);
    const yearOfCentury = shiftedYear % 100;

    const zeller =
        (day +
            Math.floor((13 * (shiftedMonth + 1)) / 5) +
            yearOfCentury +
            Math.floor(yearOfCentury / 4) +
            Math.floor(century / 4) -
            2 * century) %
        7;

    // Zeller : 0 = samedi, 1 = dimanche, … On ramène l'origine à dimanche.
    return (zeller + 6) % 7;
}

/** Le snapshot a-t-il été pris un dimanche (UTC) ? */
export function isSundayUtc(createdAt: string): boolean {
    return utcWeekdayIndex(createdAt) === 0;
}

/** Le snapshot a-t-il été pris le 1er du mois (UTC) ? */
export function isFirstOfMonthUtc(createdAt: string): boolean {
    return Number(createdAt.slice(8, 10)) === 1;
}

/** Tri du plus récent au plus ancien, tie-break déterministe par identifiant. */
function compareEntriesDesc(left: BackupIndexEntry, right: BackupIndexEntry): number {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    if (leftTime !== rightTime) return rightTime - leftTime;
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

/**
 * Décide, pour un ensemble d'entrées et une horloge donnée, ce qui est
 * conservé, ce qui est purgé, et ce qui est promu. Fonction **pure** et
 * déterministe : le même `now` produit toujours la même décision.
 */
export function selectRetention(input: SelectRetentionInput): RetentionDecision {
    const policy = input.policy ?? DEFAULT_RETENTION_POLICY;
    const nowMs = input.now.getTime();

    const keep: string[] = [];
    const purge: string[] = [];
    const promote: RetentionPromotion[] = [];

    const sorted = [...input.entries].sort(compareEntriesDesc);

    for (const entry of sorted) {
        if (entry.status === 'incomplete') purge.push(entry.id);
    }

    // Instantanés utilisables : tout sauf les runs interrompus. Un `degraded` est
    // une sauvegarde réellement produite et vérifiable — jamais un échec.
    const usable = sorted.filter((entry) => entry.status !== 'incomplete');
    const dated: BackupIndexEntry[] = [];
    for (const entry of usable) {
        const timestamp = Date.parse(entry.createdAt);
        if (Number.isNaN(timestamp) || timestamp > nowMs) keep.push(entry.id);
        else dated.push(entry);
    }

    const alreadyPromoted = dated.filter((entry) => entry.tier !== 'daily');
    for (const entry of alreadyPromoted) keep.push(entry.id);

    const monthlySlots = Math.max(
        0,
        policy.monthly - alreadyPromoted.filter((entry) => entry.tier === 'monthly').length,
    );
    const weeklySlots = Math.max(
        0,
        policy.weekly - alreadyPromoted.filter((entry) => entry.tier === 'weekly').length,
    );

    const dailyCandidates = dated.filter((entry) => entry.tier === 'daily');
    const promoted = new Set<string>();

    for (const entry of dailyCandidates.filter((candidate) => isFirstOfMonthUtc(candidate.createdAt)).slice(0, monthlySlots)) {
        promote.push({ id: entry.id, tier: 'monthly' });
        promoted.add(entry.id);
    }
    for (const entry of dailyCandidates
        .filter((candidate) => !promoted.has(candidate.id) && isSundayUtc(candidate.createdAt))
        .slice(0, weeklySlots)) {
        promote.push({ id: entry.id, tier: 'weekly' });
        promoted.add(entry.id);
    }
    for (const id of promoted) keep.push(id);

    const remainingDaily = dailyCandidates.filter((entry) => !promoted.has(entry.id));
    const dailySlots = Math.max(0, policy.daily);
    for (const entry of remainingDaily.slice(0, dailySlots)) keep.push(entry.id);
    for (const entry of remainingDaily.slice(dailySlots)) purge.push(entry.id);

    return { keep, delete: purge, promote };
}
