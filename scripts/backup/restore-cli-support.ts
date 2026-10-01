/**
 * Support du CLI de restauration — affichage, confirmation forte, filet de sécurité.
 *
 * Isolé du CLI (`restore_backup.ts`) pour tenir la cible de taille (`AGENTS.md` § 2)
 * et parce que ce sont deux responsabilités distinctes : ici **la présentation et
 * le filet**, là-bas **le câblage des dépendances**. Aucune règle métier ici.
 */
import { appendFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import type { RestoreReport } from '../../src/lib/backup/restore';

/**
 * Le filet de sécurité vit désormais dans la bibliothèque
 * (`src/lib/backup/pre-snapshot.ts`) : le CLI et la restauration du Cockpit
 * (`src/app/(admin)/admin/actions/backup-versions.ts`) partagent donc **une
 * seule** implémentation de pré-instantané (`AGENTS.md` § 4).
 */
export { createPreSnapshot, type PreSnapshotWiring } from '../../src/lib/backup/pre-snapshot';

/** Plan lisible : par table, inséré, modifié, supprimé, préservé. */
export function renderRestoreReport(report: RestoreReport): string {
    const head = [
        `${report.dryRun ? 'SIMULATION — aucune écriture' : `RESTAURATION ${report.status === 'applied' ? 'APPLIQUÉE' : 'ÉCHOUÉE'}`} : ${report.snapshotId}`,
        `Pré-instantané : ${report.preSnapshotId ?? '—'} · ordre FK : ${report.writeOrder.join(' > ') || '—'}`,
        ...report.tables.map(
            (table) =>
                `  ${table.table}${table.appendOnly ? ' [append-only]' : ''} : +${table.insert} ~${table.update} -${table.delete} =${table.preserved} (ponts ${table.bridgePreserved})`,
        ),
        `TOTAL : +${report.totals.insert} ~${report.totals.update} -${report.totals.delete} =${report.totals.preserved} · ponts préservés ${report.totals.bridgePreserved}`,
    ];
    if (report.bridgeFallbacks.length > 0) {
        head.push(`Ponts insérés en NULL : ${report.bridgeFallbacks.map((item) => `${item.table}(${item.columns.join(',')})`).join(', ')}`);
    }
    if (report.postCheck !== null && !report.postCheck.ok) head.push(`RECOMPTAGE EN ÉCART : ${report.postCheck.mismatches.join(' ; ')}`);
    if (report.error !== null) head.push(`ERREUR : ${report.error}`);
    return head.join('\n');
}

/** Affiche le rapport et l'ajoute au résumé d'étape GitHub lorsqu'il existe. */
export function emitReport(text: string): void {
    console.log(text);
    const summary = process.env.GITHUB_STEP_SUMMARY;
    if (typeof summary === 'string' && summary.length > 0) appendFileSync(summary, `${text}\n`);
}

/** Phrase interactive exacte, ou `--yes` + jeton d'environnement égal à l'id. */
export async function confirmRestore(snapshotId: string, yes: boolean): Promise<boolean> {
    const phrase = `RESTAURER ${snapshotId}`;
    if (yes && process.env.RESTORE_CONFIRM_TOKEN === snapshotId) return true;
    if (!process.stdin.isTTY) return false;
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
        return (await rl.question(`Pour confirmer, saisir exactement « ${phrase} » : `)).trim() === phrase;
    } finally {
        rl.close();
    }
}

