/**
 * Contrats de présentation du panneau « Versions & restauration » du Cockpit.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : ce fichier ne contient
 * **aucune logique**, aucun accès réseau ni base. Il décrit la forme des objets
 * échangés entre les Server Actions (`actions/backup-versions.ts`), le service à
 * dépendances injectées (`actions/backup-versions-service.ts`) et la vue
 * (`useBackupVersions.ts`, `BackupVersionsPanel.tsx`).
 *
 * Ces contrats décrivent l'état **réel** du dispositif de sauvegarde : ils ne
 * promettent jamais plus que ce que le moteur (`src/lib/backup/**`) fait.
 */

import type { BackupStatus } from '@/lib/backup/contracts';

/** État de configuration du dispositif, tel qu'affiché à l'opérateur. */
export type BackupConfigState =
    | { kind: 'ready'; storageKind: string; prefix: string; retention: { daily: number; weekly: number; monthly: number } }
    | { kind: 'incomplete'; missingVariables: string[]; message: string };

/** Résumé d'une version du catalogue, prêt à l'affichage. */
export interface BackupVersionSummary {
    id: string;
    createdAt: string;
    tier: string;
    status: BackupStatus;
    /** Tables demandées mais absentes : la dégradation est nommée, jamais tacite. */
    missingTables: string[];
    /** `null` = manifeste illisible : on affiche « — », jamais un faux 0. */
    rows: number | null;
    bytes: number;
    gitCommit: string | null;
    /** Total de lignes du catalogue, pour un indicateur de série. */
    partsCount: number;
}

/** Gravité d'un constat de santé (hiérarchie : critical > warning > ok). */
export type BackupSeverity = 'ok' | 'warning' | 'critical';

/** Constat de santé affichable (fabriqué par `health.ts`, jamais par la vue). */
export interface BackupFindingSummary {
    code: string;
    severity: BackupSeverity;
    message: string;
}

/** Résumé du dernier instantané : âge, statut, volume. */
export interface BackupLastSnapshotSummary {
    id: string | null;
    createdAt: string | null;
    ageHours: number | null;
    status: BackupStatus | null;
    tier: string | null;
    rows: number | null;
    bytes: number | null;
}

/** Vue complète du dispositif : configuration, versions, dernière, constats. */
export interface BackupStatusView {
    config: BackupConfigState;
    generatedAt: string;
    versions: BackupVersionSummary[];
    lastSnapshot: BackupLastSnapshotSummary | null;
    findings: BackupFindingSummary[];
    severity: BackupSeverity;
    /** Lecture refusée du catalogue, nommée ; `null` si l'état est fiable. */
    readError: string | null;
}

/** Réponse de `listBackupVersions()` : jamais une liste vide ambiguë. */
export type ListBackupVersionsResult =
    | { ok: true; view: BackupStatusView }
    | { ok: false; error: string };

/** Une ligne du plan de restauration (simulation ou application). */
export interface RestorePlanTable {
    table: string;
    appendOnly: boolean;
    insert: number;
    update: number;
    delete: number;
    preserved: number;
    bridgePreserved: number;
    deleteAllowed: boolean;
    reason: string;
}

/** Plan de restauration affiché **avant** toute décision. */
export interface RestorePlanView {
    snapshotId: string;
    dryRun: boolean;
    tables: RestorePlanTable[];
    totals: { insert: number; update: number; delete: number; preserved: number; bridgePreserved: number };
    writeOrder: string[];
    deleteOrder: string[];
    /** Rappel explicite de ce qu'une restauration ne touche **jamais**. */
    untouched: string[];
}

/** Réponse de `simulateRestore()` : plan ou refus nommé. */
export type SimulateRestoreResult =
    | { ok: true; plan: RestorePlanView }
    | { ok: false; error: string };

/** Demande de restauration : phrase exacte et mot de passe vérifiés côté serveur. */
export interface RestoreRequest {
    snapshotId: string;
    /** Doit valoir exactement `RESTAURER <snapshotId>`. */
    phrase: string;
    /** Jamais journalisé, jamais stocké. */
    password: string;
    tables?: string[];
}

/** Rapport par table d'une restauration appliquée. */
export interface RestoreAppliedTable {
    table: string;
    insert: number;
    update: number;
    delete: number;
    preserved: number;
}

/** Issue d'une demande de restauration : appliquée, refusée ou échouée. */
export interface RestoreOutcome {
    ok: boolean;
    error: string | null;
    status: 'applied' | 'failed' | 'refused';
    preSnapshotId: string | null;
    tables: RestoreAppliedTable[];
}

/**
 * Ce qu'une restauration versionnée ne touche **jamais** : les tables
 * append-only (`restore-policy.ts`) et les liaisons CUC Sign. Affiché tel quel
 * dans le dialogue de confirmation — un opérateur doit savoir ce qui survit.
 */
export const RESTORE_UNTOUCHED_NOTES: readonly string[] = [
    'Les candidatures reçues après l’instantané (site_inquiries) ne sont jamais supprimées.',
    'Les journaux (site_activity_logs, site_audit_logs) et la télémétrie (site_vitals) sont conservés ligne à ligne.',
    'L’historique des révisions de page (site_page_revisions) est conservé.',
    'Les liaisons CUC Sign (sessions, coachs, lieux) sont préservées : les colonnes de pont existantes ne sont jamais écrasées.',
    'Aucune table du produit CUC Sign ni du schéma auth n’est lue ou écrite.',
];
