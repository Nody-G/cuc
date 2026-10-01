/**
 * Sauvegarde automatique du site CUC — constats de santé (domaine pur).
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : chaque fonction transforme des
 * faits **déjà lus** (instantanés, manifeste, politique GFS) en un constat
 * nommé, jamais en entrée/sortie. Aucune horloge implicite.
 *
 * Extrait de `health.ts` pour tenir le plafond de 300 lignes par fichier
 * (`AGENTS.md` § 2) ; `health.ts` orchestre les contrôles et porte le verdict.
 */

/** Gravité d'un constat, du plus bénin au plus grave. */
export type HealthSeverity = 'ok' | 'warning' | 'critical';

/** Un constat : un contrôle, une gravité, un message lisible. */
export interface HealthFinding {
    code: string;
    severity: HealthSeverity;
    message: string;
}

/** Décompte des tiers disponibles dans le catalogue. */
export interface BackupTierCounts {
    daily: number;
    weekly: number;
    monthly: number;
}

/** Un tier hebdomadaire n'est « attendu » qu'après 7 jours d'historique. */
export const WEEKLY_EXPECTATION_DAYS = 7;
/** Un tier mensuel n'est « attendu » qu'après 31 jours d'historique. */
export const MONTHLY_EXPECTATION_DAYS = 31;

/** Millisecondes d'un jour (partagé avec `health.ts`). */
export const DAY_MS = 86_400_000;

/** Arrondi à une décimale, sans zéro inutile. */
export function round1(value: number): string {
    return (Math.round(value * 10) / 10).toString();
}

/** Tri du plus ancien au plus récent (déterministe). */
export function compareAsc(left: { createdAt: string }, right: { createdAt: string }): number {
    return left.createdAt < right.createdAt ? -1 : left.createdAt > right.createdAt ? 1 : 0;
}

/** Constat de couverture : tables absentes / en trop, nommées explicitement. */
export function coverageFinding(present: ReadonlySet<string>, expected: readonly string[]): HealthFinding {
    const missing = expected.filter((table) => !present.has(table));
    const extra = [...present].filter((table) => !expected.includes(table));
    if (missing.length === 0 && extra.length === 0) {
        return { code: 'coverage-ok', severity: 'ok', message: `Couverture complète : ${present.size} table(s) du périmètre.` };
    }
    const parts: string[] = [];
    if (missing.length > 0) parts.push(`absentes : ${missing.join(', ')}`);
    if (extra.length > 0) parts.push(`en trop : ${extra.join(', ')}`);
    return { code: 'coverage-drift', severity: 'warning', message: `Dérive de périmètre détectée (${parts.join(' ; ')}).` };
}

/** Constat de trou dans la série (plus grand écart entre deux instantanés). */
export function continuityFinding(entries: readonly { createdAt: string; status: string }[], maxGapDays: number): HealthFinding {
    const usable = [...entries].filter((entry) => entry.status !== 'incomplete').sort(compareAsc);
    let maxGapMs = 0;
    let from: string | null = null;
    let to: string | null = null;
    for (let index = 1; index < usable.length; index += 1) {
        const start = Date.parse(usable[index - 1].createdAt);
        const end = Date.parse(usable[index].createdAt);
        if (Number.isNaN(start) || Number.isNaN(end)) continue;
        if (end - start > maxGapMs) {
            maxGapMs = end - start;
            from = usable[index - 1].createdAt;
            to = usable[index].createdAt;
        }
    }
    const gapDays = maxGapMs / DAY_MS;
    if (gapDays > maxGapDays) {
        return {
            code: 'continuity-gap',
            severity: 'warning',
            message: `Trou dans la série : ${round1(gapDays)} jour(s) sans instantané entre ${from ?? '—'} et ${to ?? '—'} (> ${maxGapDays} j).`,
        };
    }
    return { code: 'continuity-ok', severity: 'ok', message: `Série continue — plus grand écart ${round1(gapDays)} jour(s).` };
}

/** Constat de rétention : tiers attendus absents (une GFS sans mensuel n'en est pas une). */
export function tierFinding(
    spansDays: number | null,
    counts: BackupTierCounts,
    policy: { daily: number; weekly: number; monthly: number },
): HealthFinding {
    const expected: string[] = [];
    if (policy.weekly > 0 && spansDays !== null && spansDays >= WEEKLY_EXPECTATION_DAYS) expected.push('weekly');
    if (policy.monthly > 0 && spansDays !== null && spansDays >= MONTHLY_EXPECTATION_DAYS) expected.push('monthly');
    const absent = expected.filter((tier) => counts[tier as keyof BackupTierCounts] === 0);
    const summary = `quotidien ${counts.daily}, hebdo ${counts.weekly}, mensuel ${counts.monthly}`;
    if (absent.length > 0) {
        return {
            code: 'retention-tier-missing',
            severity: 'warning',
            message: `Rétention GFS incomplète — tier(s) attendu(s) absent(s) : ${absent.join(', ')} (disponibles : ${summary}).`,
        };
    }
    return { code: 'retention-tiers-ok', severity: 'ok', message: `Tiers disponibles — ${summary}.` };
}

/** Constat de chute de taille : compare le dernier instantané aux précédents. */
export function sizeFinding(
    last: { bytes: number },
    previous: readonly { bytes: number }[],
    ratio: number,
): HealthFinding | null {
    const nonEmpty = previous.filter((entry) => entry.bytes > 0);
    if (nonEmpty.length === 0) return null;
    const average = nonEmpty.reduce((sum, entry) => sum + entry.bytes, 0) / nonEmpty.length;
    if (last.bytes < average * ratio) {
        return {
            code: 'size-drop',
            severity: 'warning',
            message: `Chute de taille : dernier instantané ${last.bytes} o, moyenne des précédents ${Math.round(average)} o (< ${Math.round(ratio * 100)} %).`,
        };
    }
    return { code: 'size-ok', severity: 'ok', message: `Taille cohérente avec les instantanés précédents (${last.bytes} o).` };
}
