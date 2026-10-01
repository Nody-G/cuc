/**
 * Sauvegarde automatique du site CUC — nommage des identifiants et des clés.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : les conventions de nommage d'un
 * instantané et de ses objets (préfixe de stockage, identifiant, clé de
 * catalogue, arborescence § 3.5 du plan). Aucune I/O, aucune horloge implicite :
 * l'horodatage est reçu en paramètre. `node:crypto` ne sert qu'à l'empreinte
 * SHA-256 d'un tampon déjà matérialisé.
 *
 * Extrait d'`orchestrate.ts` pour tenir le plafond de 300 lignes par fichier
 * (`AGENTS.md` § 2) ; `orchestrate.ts` réexporte ces symboles, l'API publique
 * reste donc inchangée.
 */
import { createHash } from 'node:crypto';

import { BackupRunError } from './errors';

/** Normalise un préfixe de stockage ; refuse le vide (jamais de racine implicite). */
export function normalizePrefix(prefix: string): string {
    const normalized = typeof prefix === 'string' ? prefix.replace(/^\/+|\/+$/g, '') : '';
    if (normalized.length === 0) throw new BackupRunError('Préfixe de stockage absent — orchestration refusée.');
    return normalized;
}
/** Clé d'objet du catalogue, sous le préfixe de sauvegarde (source unique). */
export function buildIndexObjectKey(prefix: string): string { return `${normalizePrefix(prefix)}/index.json`; }
/** Horodatage compact `YYYYMMDDTHHMMSSZ`, sans ponctuation. */
export function compactUtcStamp(createdAt: string): string { return createdAt.replace(/[-:]/g, '').replace(/\.\d+/, ''); }
/** Identifiant de snapshot : `snapshot-<horodatage>-<court commit|nogit>`. */
export function buildSnapshotId(createdAt: string, gitCommit: string | null): string {
    const suffix = typeof gitCommit === 'string' && gitCommit.length > 0 ? gitCommit.slice(0, 7) : 'nogit';
    return `snapshot-${compactUtcStamp(createdAt)}-${suffix}`;
}
/** Préfixe d'un instantané, conforme à l'arborescence du plan § 3.5. */
export function buildSnapshotPrefix(prefix: string, createdAt: string, snapshotId: string): string {
    return `${normalizePrefix(prefix)}/site/${createdAt.slice(0, 4)}/${createdAt.slice(5, 7)}/${snapshotId}`;
}
/** Empreinte SHA-256 hexadécimale d'un tampon déjà matérialisé. */
export function sha256Hex(bytes: Uint8Array): string { return createHash('sha256').update(bytes).digest('hex'); }
