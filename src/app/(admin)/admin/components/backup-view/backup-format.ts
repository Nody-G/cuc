/**
 * Formatage du panneau « Versions & restauration » — logique pure et testable.
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : aucune React, aucun accès réseau ni
 * base, aucune horloge implicite. Les composants et le hook ne font que
 * consommer ces fonctions ; aucun calcul lourd ne vit dans la vue.
 */

import type { BackupStatus } from '@/lib/backup/contracts';
import type { BackupSeverity } from './backup-status.types';

/** Préfixe canonique de la phrase de confirmation exigée côté serveur. */
export const RESTORE_CONFIRMATION_PREFIX = 'RESTAURER ';

/**
 * Phrase exacte attendue par `executeRestoreWithGuards`. Une seule source :
 * l'interface affiche ce que le serveur exige, jamais une variante libre.
 */
export function restoreConfirmationPhrase(snapshotId: string): string {
    return `${RESTORE_CONFIRMATION_PREFIX}${snapshotId}`;
}

/** Vrai si la phrase saisie correspond **exactement** à celle exigée. */
export function isRestorePhraseValid(snapshotId: string, phrase: string): boolean {
    return phrase === restoreConfirmationPhrase(snapshotId);
}

/** Taille lisible ; une valeur absente ou incohérente s'affiche « — ». */
export function formatBytes(bytes: number | null): string {
    if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

/** Âge lisible : heures sous 48 h, jours au-delà ; « âge inconnu » si absent. */
export function formatAgeHours(ageHours: number | null): string {
    if (ageHours === null || !Number.isFinite(ageHours)) return 'âge inconnu';
    if (ageHours < 48) return `${ageHours.toFixed(1)} h`;
    return `${(ageHours / 24).toFixed(1)} j`;
}

/** Date et heure locales ; une date illisible s'affiche « — ». */
export function formatDateTime(iso: string | null): string {
    if (iso === null) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Libellé français du statut d'un instantané, sans euphémisme. */
export function statusLabel(status: BackupStatus): string {
    if (status === 'complete') return 'Complet';
    if (status === 'degraded') return 'Dégradé';
    return 'Incomplet — run interrompu';
}

/** Rang de gravité : sert au tri et à la décision de bandeau. */
export function severityRank(severity: BackupSeverity): number {
    if (severity === 'critical') return 2;
    if (severity === 'warning') return 1;
    return 0;
}

/** Libellé français de la gravité d'un constat. */
export function severityLabel(severity: BackupSeverity): string {
    if (severity === 'critical') return 'Critique';
    if (severity === 'warning') return 'Avertissement';
    return 'OK';
}

/**
 * Classes de statut selon la gravité. Tokens déjà employés par les panneaux
 * voisins du Cockpit (remappés par `globals-cockpit-light.css`) : la garde
 * `cockpit-light-theme.test.ts` n'a donc aucune contrepartie à réclamer.
 */
export function severityToneClasses(severity: BackupSeverity): string {
    if (severity === 'critical') return 'bg-red-950/40 border-red-500/50 text-red-300';
    if (severity === 'warning') return 'bg-amber-950/30 border-amber-500/40 text-amber-200';
    return 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200';
}

/** Vrai si la dernière sauvegarde dépasse le seuil d'alerte (48 h par défaut). */
export function isStale(ageHours: number | null, maxAgeHours = 48): boolean {
    return ageHours === null || !Number.isFinite(ageHours) || ageHours > maxAgeHours;
}
