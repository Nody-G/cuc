/**
 * Service du panneau « Versions & restauration » — orchestration testable.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1) : ce module ne touche **jamais**
 * `pg`, `node:fs` ni le réseau. Toutes les dépendances sont injectées
 * (`readActor`, `verifyPassword`, `runRestore`), exactement comme dans
 * `src/lib/backup/restore.ts` — seule façon de prouver par un test hors réseau
 * et hors base qu'une vérification échouée **n'appelle aucune restauration**.
 *
 * Les trois gardes de `executeRestoreWithGuards` sont **côté serveur** ; l'IHM
 * ne fait que faciliter la saisie. Ordre imposé : rôle, puis ré-authentification
 * (« Confirmation UI », `plans/plan-backups-automatiques-2026.md` § 5.6).
 */

import type { BackupIndex, BackupIndexEntry, BackupManifest } from '@/lib/backup/contracts';
import { BackupConfigError, loadBackupConfig, type BackupConfig, type EnvSource } from '@/lib/backup/io/config';
import { assessBackupHealth } from '@/lib/backup/health';
import type { RestoreReport } from '@/lib/backup/restore';
import { RESTORE_UNTOUCHED_NOTES } from '../components/backup-view/backup-status.types';
import type {
    BackupConfigState,
    BackupFindingSummary,
    BackupLastSnapshotSummary,
    BackupSeverity,
    BackupStatusView,
    BackupVersionSummary,
    RestoreAppliedTable,
    RestoreOutcome,
    RestorePlanView,
    RestoreRequest,
} from '../components/backup-view/backup-status.types';

/** Rôles autorisés à déclencher une restauration (règle d'or des rôles). */
export const RESTORE_ROLES: readonly string[] = ['admin', 'directeur'];
/** Rôles autorisés à **lire** l'état des sauvegardes (Cockpit vitrine). */
export const COCKPIT_ROLES: readonly string[] = ['admin', 'directeur', 'secretaire'];

/** Vrai si le rôle appartient à la liste autorisée (jamais de repli permissif). */
export function hasRole(role: string, allowed: readonly string[]): boolean {
    return typeof role === 'string' && role.length > 0 && allowed.includes(role);
}

/**
 * Résultat d'inspection de la configuration : la config validée quand elle est
 * complète, sinon un état **nommant la variable manquante**.
 */
export type BackupConfigInspection =
    | { ok: true; config: BackupConfig; state: Extract<BackupConfigState, { kind: 'ready' }> }
    | { ok: false; state: Extract<BackupConfigState, { kind: 'incomplete' }> };

/** Inspecte la configuration sans jamais lever : un défaut devient un état affichable. */
export function inspectBackupConfiguration(env: EnvSource): BackupConfigInspection {
    try {
        const config = loadBackupConfig(env);
        return {
            ok: true,
            config,
            state: {
                kind: 'ready',
                storageKind: config.storage.kind,
                prefix: config.prefix,
                retention: config.retention,
            },
        };
    } catch (error) {
        if (error instanceof BackupConfigError) {
            const variable = error.variable ?? 'configuration';
            return { ok: false, state: { kind: 'incomplete', missingVariables: [variable], message: error.message } };
        }
        throw error; // jamais de catch silencieux
    }
}

/** Résumé affichable d'une entrée de catalogue, trié du plus récent au plus ancien. */
export function summarizeVersions(
    entries: readonly BackupIndexEntry[],
    rowsById: ReadonlyMap<string, number>,
): BackupVersionSummary[] {
    return [...entries]
        .sort((left, right) => (left.createdAt < right.createdAt ? 1 : left.createdAt > right.createdAt ? -1 : 0))
        .map((entry) => ({
            id: entry.id,
            createdAt: entry.createdAt,
            tier: entry.tier,
            status: entry.status,
            missingTables: [...(entry.missingTables ?? [])],
            rows: rowsById.get(entry.id) ?? null,
            bytes: entry.bytes,
            gitCommit: entry.gitCommit,
            partsCount: entry.partsCount,
        }));
}

function toFindingSummary(finding: { code: string; severity: BackupSeverity; message: string }): BackupFindingSummary {
    return { code: finding.code, severity: finding.severity, message: finding.message };
}

function toLastSnapshot(verdict: ReturnType<typeof assessBackupHealth>): BackupLastSnapshotSummary {
    return {
        id: verdict.lastSnapshot.id,
        createdAt: verdict.lastSnapshot.createdAt,
        ageHours: verdict.lastSnapshot.ageHours,
        status: verdict.lastSnapshot.status,
        tier: verdict.lastSnapshot.tier,
        rows: verdict.lastSnapshot.rows,
        bytes: verdict.lastSnapshot.bytes,
    };
}

/** Entrée du mapping : des faits déjà lus, jamais une I/O. */
export interface BuildBackupStatusInput {
    env: EnvSource;
    index: BackupIndex | null;
    manifests: readonly BackupManifest[];
    readError: string | null;
    now: Date;
}

/**
 * Construit la vue du dispositif. Trois cas, jamais confondus :
 * configuration incomplète (variable nommée), catalogue illisible (motif nommé),
 * état fiable (constats de `health.ts`, sans réimplémentation de règle).
 */
export function buildBackupStatusView(input: BuildBackupStatusInput): BackupStatusView {
    const inspection = inspectBackupConfiguration(input.env);
    const rowsById = new Map<string, number>(input.manifests.map((manifest) => [manifest.id, manifest.totals.rows]));
    const versions = input.index === null ? [] : summarizeVersions(input.index.entries, rowsById);

    if (!inspection.ok) {
        return {
            config: inspection.state,
            generatedAt: input.now.toISOString(),
            versions,
            lastSnapshot: null,
            findings: [{ code: 'config-incomplete', severity: 'critical', message: inspection.state.message }],
            severity: 'critical',
            readError: null,
        };
    }

    if (input.index === null) {
        const message = input.readError ?? 'Catalogue illisible — état indisponible.';
        return {
            config: inspection.state,
            generatedAt: input.now.toISOString(),
            versions,
            lastSnapshot: null,
            findings: [{ code: 'catalog-unreadable', severity: 'critical', message }],
            severity: 'critical',
            readError: message,
        };
    }

    const verdict = assessBackupHealth({
        index: input.index,
        manifests: input.manifests,
        policy: inspection.config.retention,
        now: input.now,
    });

    return {
        config: inspection.state,
        generatedAt: input.now.toISOString(),
        versions,
        lastSnapshot: toLastSnapshot(verdict),
        findings: verdict.findings.map(toFindingSummary),
        severity: verdict.severity,
        readError: null,
    };
}

/** Vue du plan de restauration : ce qui serait (ou a été) touché, et ce qui survit. */
export function toRestorePlanView(report: RestoreReport): RestorePlanView {
    return {
        snapshotId: report.snapshotId,
        dryRun: report.dryRun,
        tables: report.tables.map((table) => ({
            table: table.table,
            appendOnly: table.appendOnly,
            insert: table.insert,
            update: table.update,
            delete: table.delete,
            preserved: table.preserved,
            bridgePreserved: table.bridgePreserved,
            deleteAllowed: table.deleteAllowed,
            reason: table.reason,
        })),
        totals: { ...report.totals },
        writeOrder: [...report.writeOrder],
        deleteOrder: [...report.deleteOrder],
        untouched: [...RESTORE_UNTOUCHED_NOTES],
    };
}

/** Acteur courant, tel que lu côté serveur (jamais fourni par le client). */
export interface RestoreActor {
    role: string;
    email: string | null;
}

/** Dépendances injectées de la restauration : aucune n'a de valeur par défaut. */
export interface RestoreGuardDeps {
    readActor(): Promise<RestoreActor | null>;
    /** Vérifie le mot de passe du compte courant ; ne journalise rien. */
    verifyPassword(password: string): Promise<boolean>;
    runRestore(request: RestoreRequest): Promise<RestoreReport>;
}

function refusal(error: string): RestoreOutcome {
    return { ok: false, error, status: 'refused', preSnapshotId: null, tables: [] };
}

function toAppliedTables(report: RestoreReport): RestoreAppliedTable[] {
    return report.tables.map((table) => ({
        table: table.table,
        insert: table.insert,
        update: table.update,
        delete: table.delete,
        preserved: table.preserved,
    }));
}

/**
 * Applique une restauration **après** les trois vérifications serveur. Une
 * vérification en échec retourne un refus nommé **sans appeler `runRestore`** :
 * un appel forgé depuis le client ne peut donc rien écrire.
 */
export async function executeRestoreWithGuards(
    deps: RestoreGuardDeps,
    request: RestoreRequest,
): Promise<RestoreOutcome> {
    // Garde 1 — rôle lu dans la session (jamais dans les paramètres).
    const actor = await deps.readActor();
    if (actor === null || !hasRole(actor.role, RESTORE_ROLES)) {
        return refusal('Rôle insuffisant : une restauration est réservée aux comptes admin ou directeur.');
    }

    // Garde 2 — ré-authentification par mot de passe du compte courant.
    const password = typeof request.password === 'string' ? request.password : '';
    if (password.length === 0 || !(await deps.verifyPassword(password))) {
        return refusal('Mot de passe incorrect : ré-authentification refusée.');
    }

    // Garde 3 — phrase exacte `RESTAURER <snapshotId>`.
    const expected = `RESTAURER ${request.snapshotId}`;
    if (request.phrase !== expected) {
        return refusal(`Phrase de confirmation incorrecte : saisir exactement « ${expected} ».`);
    }

    try {
        const report = await deps.runRestore(request);
        const applied = report.status === 'applied';
        return {
            ok: applied,
            error: report.error,
            status: applied ? 'applied' : 'failed',
            preSnapshotId: report.preSnapshotId,
            tables: toAppliedTables(report),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'cause inconnue';
        return { ok: false, error: message, status: 'failed', preSnapshotId: null, tables: [] };
    }
}
