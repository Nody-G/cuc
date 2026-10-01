/**
 * Sauvegarde automatique du site CUC — diagnostic de santé du dispositif.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : **aucune I/O**, aucune horloge
 * implicite (`now` est injecté), aucun accès réseau ni base. À partir du
 * catalogue (`index.json`), des manifestes déjà lus par la couche I/O et d'une
 * politique GFS, `assessBackupHealth` porte un verdict structuré sur l'état
 * réel du système de sauvegarde.
 *
 * Raison d'être : une sauvegarde qui s'arrête sans que personne ne le sache ne
 * répond pas à la question « est-ce que les backups fonctionnent ? ». Chaque
 * contrôle produit un constat nommé, avec une gravité, afin qu'un CLI trivial
 * se contente de lire le résultat sans réimplémenter de règle.
 *
 * `exitCode` : `0` sain, `2` avertissement, `1` critique — convention alignée
 * sur `scripts/audit_quotas.mjs:27`.
 *
 * Les fabriques de constats vivent dans `health-findings.ts` (plafond de 300
 * lignes, `AGENTS.md` § 2) ; ce fichier orchestre et porte le verdict global.
 */
import type {
    BackupIndex,
    BackupIndexEntry,
    BackupIndexTier,
    BackupManifest,
    BackupStatus,
    RetentionPolicy,
} from './contracts';
import {
    coverageFinding,
    continuityFinding,
    sizeFinding,
    tierFinding,
    DAY_MS,
    type BackupTierCounts,
    type HealthFinding,
    type HealthSeverity,
} from './health-findings';
import { BACKUP_TABLES } from './whitelist';

// API publique : les constats et leur gravité sont réexportés depuis ce module.
export type { BackupTierCounts, HealthFinding, HealthSeverity } from './health-findings';

/** Code de sortie attendu par le CLI : sain / avertissement / critique. */
export type HealthExitCode = 0 | 1 | 2;

/** Seuils ajustables ; tous ont un défaut explicite et documenté. */
export interface BackupHealthOptions {
    /** Âge maximal (heures) du dernier instantané avant bascule en `critical`. */
    maxAgeHours?: number;
    /** Écart maximal (jours) toléré entre deux instantanés de la série. */
    maxGapDays?: number;
    /** Périmètre de tables attendu (défaut : la liste blanche canonique). */
    expectedTables?: readonly string[];
    /** Faut-il exiger une part média dans le dernier instantané ? */
    mediaEnabled?: boolean;
    /** Ratio sous lequel une taille est jugée anormalement basse. */
    sizeDropRatio?: number;
}

/** Entrée du diagnostic : des faits déjà lus, rien d'autre. */
export interface AssessBackupHealthInput {
    index: BackupIndex;
    manifests: readonly BackupManifest[];
    policy: RetentionPolicy;
    now: Date;
    options?: BackupHealthOptions;
}

/** Résumé du dernier instantané, exploitable par un résumé GitHub ou un JSON. */
export interface BackupHealthLastSnapshot {
    id: string | null;
    createdAt: string | null;
    ageHours: number | null;
    status: BackupStatus | null;
    tier: BackupIndexTier | null;
    rows: number | null;
    bytes: number | null;
}

/** Verdict global : gravité, code de sortie, constats, résumé. */
export interface BackupHealthVerdict {
    severity: HealthSeverity;
    exitCode: HealthExitCode;
    findings: HealthFinding[];
    lastSnapshot: BackupHealthLastSnapshot;
    tiers: BackupTierCounts;
    snapshotCount: number;
}

/** Seuil de fraîcheur par défaut : 48 h (plan § 7.4). */
export const DEFAULT_MAX_AGE_HOURS = 48;
/** Écart de série toléré par défaut : plus de 2 jours = trou. */
export const DEFAULT_MAX_GAP_DAYS = 2;
/** Chute de taille considérée brutale : sous 50 % de la moyenne précédente. */
export const DEFAULT_SIZE_DROP_RATIO = 0.5;

const HOUR_MS = 3_600_000;

function rank(severity: HealthSeverity): number {
    if (severity === 'critical') return 2;
    if (severity === 'warning') return 1;
    return 0;
}

function compareDesc(left: BackupIndexEntry, right: BackupIndexEntry): number {
    return left.createdAt < right.createdAt ? 1 : left.createdAt > right.createdAt ? -1 : 0;
}

function ageHours(createdAt: string, nowMs: number): number | null {
    const timestamp = Date.parse(createdAt);
    if (Number.isNaN(timestamp)) return null;
    return (nowMs - timestamp) / HOUR_MS;
}

function spanDays(createdAt: string, nowMs: number): number | null {
    const timestamp = Date.parse(createdAt);
    if (Number.isNaN(timestamp)) return null;
    return (nowMs - timestamp) / DAY_MS;
}

function countTiers(entries: readonly BackupIndexEntry[]): BackupTierCounts {
    const counts: BackupTierCounts = { daily: 0, weekly: 0, monthly: 0 };
    for (const entry of entries) counts[entry.tier] += 1;
    return counts;
}

function emptyLastSnapshot(): BackupHealthLastSnapshot {
    return { id: null, createdAt: null, ageHours: null, status: null, tier: null, rows: null, bytes: null };
}

function buildVerdict(
    findings: readonly HealthFinding[],
    lastSnapshot: BackupHealthLastSnapshot,
    tiers: BackupTierCounts,
    snapshotCount: number,
): BackupHealthVerdict {
    let severity: HealthSeverity = 'ok';
    for (const finding of findings) {
        if (rank(finding.severity) > rank(severity)) severity = finding.severity;
    }
    const exitCode: HealthExitCode = severity === 'critical' ? 1 : severity === 'warning' ? 2 : 0;
    return { severity, exitCode, findings: [...findings], lastSnapshot, tiers, snapshotCount };
}

/**
 * Porte un verdict sur le dispositif de sauvegarde. Fonction **pure** : le même
 * couple (catalogue, manifestes, horloge) produit toujours le même verdict.
 */
export function assessBackupHealth(input: AssessBackupHealthInput): BackupHealthVerdict {
    const options = input.options ?? {};
    const maxAgeHours = options.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;
    const maxGapDays = options.maxGapDays ?? DEFAULT_MAX_GAP_DAYS;
    const expectedTables = options.expectedTables ?? BACKUP_TABLES;
    const mediaEnabled = options.mediaEnabled ?? true;
    const sizeDropRatio = options.sizeDropRatio ?? DEFAULT_SIZE_DROP_RATIO;
    const nowMs = input.now.getTime();

    const entries = [...input.index.entries].sort(compareDesc);
    const tiers = countTiers(entries);

    if (entries.length === 0) {
        return buildVerdict(
            [
                {
                    code: 'catalog-empty',
                    severity: 'critical',
                    message: 'Catalogue vide — aucun instantané disponible : le dispositif ne produit rien (ou le catalogue a été perdu).',
                },
            ],
            emptyLastSnapshot(),
            tiers,
            0,
        );
    }

    const findings: HealthFinding[] = [];
    const last = entries[0];

    // (1) Fraîcheur — le contrôle le plus important : un système mort doit hurler.
    const age = ageHours(last.createdAt, nowMs);
    if (age === null) {
        findings.push({ code: 'freshness-unreadable', severity: 'critical', message: `Horodatage illisible pour l'instantané « ${last.id} ».` });
    } else if (age > maxAgeHours) {
        findings.push({
            code: 'freshness-stale',
            severity: 'critical',
            message: `Dernier instantané vieux de ${age.toFixed(1)} h (> ${maxAgeHours} h) — le dispositif de sauvegarde est probablement arrêté.`,
        });
    } else {
        findings.push({ code: 'freshness-ok', severity: 'ok', message: `Dernier instantané il y a ${age.toFixed(1)} h (seuil ${maxAgeHours} h).` });
    }

    // (2) Complétude du dernier instantané.
    if (last.status === 'incomplete') {
        findings.push({ code: 'completeness-incomplete', severity: 'critical', message: 'Le dernier run est « incomplete » — run interrompu, jamais un point de restauration.' });
    } else if (last.status === 'degraded') {
        const missing = last.missingTables ?? [];
        findings.push({
            code: 'completeness-degraded',
            severity: 'warning',
            message: `Dernier instantané « degraded » — table(s) absente(s) sautée(s) : ${missing.length > 0 ? missing.join(', ') : 'non listées'}.`,
        });
    } else {
        findings.push({ code: 'completeness-ok', severity: 'ok', message: 'Dernier instantané complet.' });
    }

    // (3) Couverture et (4) non-vacuité : exigent le manifeste du dernier instantané.
    const manifest = input.manifests.find((candidate) => candidate.id === last.id);
    if (manifest === undefined) {
        findings.push({
            code: 'manifest-missing',
            severity: 'critical',
            message: `Manifeste introuvable pour l'instantané « ${last.id} » — couverture et non-vacuité invérifiables.`,
        });
    } else {
        const present = new Set<string>();
        for (const part of manifest.parts) {
            if (part.kind === 'table' && typeof part.table === 'string') present.add(part.table);
        }
        findings.push(coverageFinding(present, expectedTables));

        if (manifest.totals.rows === 0) {
            findings.push({ code: 'non-vacuity-empty', severity: 'critical', message: 'Instantané vide (0 ligne toutes tables confondues) — symptôme d’un problème de droits, pas d’une base vide.' });
        } else {
            findings.push({ code: 'non-vacuity-ok', severity: 'ok', message: `Instantané non vide : ${manifest.totals.rows} ligne(s).` });
        }

        if (mediaEnabled && !manifest.parts.some((part) => part.kind === 'media-index')) {
            findings.push({ code: 'media-missing', severity: 'warning', message: 'Aucune part média dans le dernier instantané alors que la sauvegarde des médias est activée.' });
        }
    }

    // (5) Cohérence des tailles par rapport aux instantanés précédents.
    const size = sizeFinding(last, entries.slice(1, 4), sizeDropRatio);
    if (size !== null) findings.push(size);

    // (6) Historique : tiers réellement disponibles.
    findings.push(tierFinding(spanDays(entries[entries.length - 1].createdAt, nowMs), tiers, input.policy));

    // (7) Continuité : trou dans la série même si le dernier est frais.
    findings.push(continuityFinding(entries, maxGapDays));

    const lastSnapshot: BackupHealthLastSnapshot = {
        id: last.id,
        createdAt: last.createdAt,
        ageHours: age,
        status: last.status,
        tier: last.tier,
        rows: manifest?.totals.rows ?? null,
        bytes: last.bytes,
    };

    return buildVerdict(findings, lastSnapshot, tiers, entries.length);
}
