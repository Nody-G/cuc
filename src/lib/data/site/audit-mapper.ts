/**
 * Normalisation d'une ligne `site_audit_logs` — le champ « entité ».
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions pures, sans accès
 * réseau, testables directement.
 *
 * **Pourquoi ce module existe.** La colonne s'appelle `target` en base (voir
 * `scripts/migration_apply_campus_pois_audit_logs.sql`), alors que le type
 * `AuditLogEntry` expose `entity` et que l'interface lit `entity` : le filtre
 * « Entité » et la colonne du même nom dans l'export CSV ne pouvaient donc
 * **jamais** rien renvoyer. Le défaut était invisible — un filtre vide ne
 * ressemble pas à une panne.
 *
 * Le corriger en renommant la colonne serait une migration destructive au sens du
 * §9 de `durability_health.md` (`ALTER COLUMN` sur une table alimentée), donc
 * soumise à l'accord du client. Le mapping appartient de toute façon au chemin de
 * lecture : c'est ici, et une seule fois, qu'on traduit la base vers le domaine.
 */

import type { AuditLogEntry } from './types';

/** Ligne brute : la colonne stockée s'appelle `target`, pas `entity`. */
export interface RawAuditLogRow {
    id?: unknown;
    user_name?: unknown;
    action?: unknown;
    target?: unknown;
    entity?: unknown;
    details?: unknown;
    created_at?: unknown;
}

/** Première valeur textuelle non vide — tolère les deux noms de champ. */
function firstText(...candidates: unknown[]): string {
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate;
    }
    return '';
}

/** Traduit une ligne de la table vers le modèle d'audit. */
export function toAuditLogEntry(row: RawAuditLogRow): AuditLogEntry {
    return {
        id: firstText(row.id),
        user_name: firstText(row.user_name),
        action: firstText(row.action),
        // `entity` d'abord : une ligne écrite par un futur code déjà normalisé
        // prime sur la colonne historique, sans jamais perdre l'information.
        entity: firstText(row.entity, row.target),
        details: typeof row.details === 'string' ? row.details : undefined,
        created_at: firstText(row.created_at),
    };
}

/** Traduit une liste, en ignorant les entrées non conformes. */
export function toAuditLogEntries(rows: readonly unknown[] | null | undefined): AuditLogEntry[] {
    if (!Array.isArray(rows)) return [];
    return rows
        .filter((row): row is RawAuditLogRow => Boolean(row) && typeof row === 'object')
        .map(toAuditLogEntry);
}
