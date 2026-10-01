/**
 * Sauvegarde automatique du site CUC — manifeste.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : construire, sérialiser, parser et
 * valider un manifeste. **Aucune I/O** : l'horodatage, la version d'application,
 * le commit Git et les empreintes sont **reçus en paramètres**, jamais lus ici.
 * Aucune horloge implicite (`Date` n'est jamais appelé), aucune lecture réseau.
 *
 * Refus strict : un manifeste sans partie, une partie de table hors liste
 * blanche, ou une empreinte SHA-256 malformée est **rejeté**. `parseManifest`
 * retourne une union typée succès/échec et ne lève jamais d'exception non typée.
 *
 * Plan de référence : `plans/plan-backups-automatiques-2026.md` § 4.1 et § 4.3.
 */

import type {
    BackupDegradation,
    BackupManifest,
    BackupPart,
    BackupTotals,
    BackupTier,
    CipherAlgorithm,
    ManifestParseResult,
} from './contracts';
import { isBackupTable } from './whitelist';

/** Version de format reconnue par ce module (refus explicite au-delà). */
export const BACKUP_FORMAT_VERSION = 1;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const TIERS: readonly BackupTier[] = ['daily', 'weekly', 'monthly', 'manual', 'pre-restore'];
const CIPHERS: readonly CipherAlgorithm[] = ['aes-256-gcm'];

/** Faits déjà lus par la couche I/O, à assembler en manifeste. */
export interface BuildManifestInput {
    id: string;
    createdAt: string;
    app: { name: string; version: string };
    git?: { commit?: string | null; branch?: string | null };
    encryption: { algorithm: CipherAlgorithm; keyDerivation: string };
    parts: readonly BackupPart[];
    tier: BackupTier;
    /** Tables demandées mais absentes : trace explicite d'une dégradation. */
    degraded?: readonly BackupDegradation[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Contrôle d'une partie, partagé par `buildManifest` et `parseManifest`.
 * Retourne `null` si la partie est valide, sinon le motif du refus.
 */
export function describePartProblem(part: unknown): string | null {
    const record = asRecord(part);
    if (!record) return 'une partie n’est pas un objet.';

    const kind = record.kind;
    if (kind !== 'table' && kind !== 'media-index' && kind !== 'config') {
        return `nature de partie inconnue « ${String(kind)} ».`;
    }

    const table = record.table;
    if (kind === 'table') {
        if (!isNonEmptyString(table)) return 'une partie de table ne nomme aucune table.';
        if (!isBackupTable(table)) return `la table « ${table} » est hors périmètre de sauvegarde.`;
    } else if (table !== null && table !== undefined) {
        return `une partie « ${kind} » ne doit désigner aucune table.`;
    }

    const objectKey = record.objectKey;
    if (!isNonEmptyString(objectKey)) return 'une partie ne porte aucune clé d’objet.';
    if (!isNonNegativeInteger(record.rows)) return `comptage de lignes invalide pour « ${objectKey} ».`;
    if (!isNonNegativeInteger(record.compressedBytes)) return `taille compressée invalide pour « ${objectKey} ».`;
    if (!isNonNegativeInteger(record.plainBytes)) return `taille en clair invalide pour « ${objectKey} ».`;
    if (typeof record.sha256 !== 'string' || !SHA256_PATTERN.test(record.sha256)) {
        return `empreinte SHA-256 malformée pour « ${objectKey} ».`;
    }
    if (record.compression !== 'gzip') return `compression non supportée pour « ${objectKey} ».`;
    if (!CIPHERS.includes(record.cipher as CipherAlgorithm)) {
        return `chiffrement non supporté pour « ${objectKey} ».`;
    }
    return null;
}

/**
 * Valide un bloc de dégradation facultatif. Retourne `null` si la forme est
 * malformée (refus explicite), sinon la liste normalisée — vide si absent.
 * Rend les manifestes déjà écrits (sans ce champ) parfaitement lisibles.
 */
function normalizeDegraded(value: unknown): BackupDegradation[] | null {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value)) return null;
    const degraded: BackupDegradation[] = [];
    for (const entry of value) {
        const record = asRecord(entry);
        if (!record) return null;
        if (!isNonEmptyString(record.table) || typeof record.reason !== 'string') return null;
        degraded.push({ table: record.table, reason: record.reason });
    }
    return degraded;
}

/** Totaux dérivés des parties : comptage de parties, lignes et octets. */
export function computeTotals(parts: readonly BackupPart[]): BackupTotals {
    return {
        parts: parts.length,
        rows: parts.reduce((sum, part) => sum + part.rows, 0),
        bytes: parts.reduce((sum, part) => sum + part.compressedBytes, 0),
    };
}

/**
 * Assemble un manifeste à partir des faits fournis. Les totaux sont calculés,
 * jamais reçus. Une partie hors périmètre fait échouer la construction.
 */
export function buildManifest(input: BuildManifestInput): BackupManifest {
    if (!isNonEmptyString(input.id)) throw new Error('Manifeste invalide — identifiant manquant.');
    if (typeof input.createdAt !== 'string' || !ISO_TIMESTAMP_PATTERN.test(input.createdAt)) {
        throw new Error('Manifeste invalide — horodatage ISO 8601 (UTC) attendu.');
    }
    if (!TIERS.includes(input.tier)) throw new Error('Manifeste invalide — tier inconnu.');
    if (!CIPHERS.includes(input.encryption.algorithm)) {
        throw new Error('Manifeste invalide — algorithme de chiffrement non supporté.');
    }
    if (!isNonEmptyString(input.encryption.keyDerivation)) {
        throw new Error('Manifeste invalide — dérivation de clé non documentée.');
    }
    if (!isNonEmptyString(input.app.name) || !isNonEmptyString(input.app.version)) {
        throw new Error('Manifeste invalide — identité applicative incomplète.');
    }

    const parts: BackupPart[] = [];
    for (const part of input.parts) {
        const problem = describePartProblem(part);
        if (problem !== null) throw new Error(`Manifeste invalide — ${problem}`);
        parts.push(part);
    }
    if (parts.length === 0) throw new Error('Manifeste invalide — aucune partie.');

    const degraded = normalizeDegraded(input.degraded);
    if (degraded === null) throw new Error('Manifeste invalide — bloc de dégradation malformé.');

    const manifest: BackupManifest = {
        formatVersion: BACKUP_FORMAT_VERSION,
        id: input.id,
        createdAt: input.createdAt,
        app: { name: input.app.name, version: input.app.version },
        git: { commit: input.git?.commit ?? null, branch: input.git?.branch ?? null },
        encryption: {
            algorithm: input.encryption.algorithm,
            keyDerivation: input.encryption.keyDerivation,
        },
        parts,
        totals: computeTotals(parts),
        tier: input.tier,
    };
    if (degraded.length > 0) manifest.degraded = degraded;
    return manifest;
}

/** Sérialisation stable : les clés gardent l'ordre du contrat. */
export function serializeManifest(manifest: BackupManifest): string {
    return JSON.stringify(manifest, null, 2);
}

/**
 * Analyse stricte d'un manifeste sérialisé. Retourne toujours une union typée.
 * Refuse notamment : racine non-objet, format inconnu, aucune partie, partie de
 * table hors liste blanche, empreinte SHA-256 malformée.
 */
export function parseManifest(raw: string): ManifestParseResult {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return { ok: false, error: 'Manifeste illisible — contenu vide.' };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return { ok: false, error: 'Manifeste illisible — JSON invalide.' };
    }

    const record = asRecord(parsed);
    if (!record) return { ok: false, error: 'Manifeste invalide — la racine n’est pas un objet.' };

    const formatVersion = record.formatVersion;
    if (formatVersion !== BACKUP_FORMAT_VERSION) {
        return { ok: false, error: `Version de format inconnue « ${String(formatVersion)} ».` };
    }

    const id = record.id;
    if (!isNonEmptyString(id)) return { ok: false, error: 'Manifeste invalide — identifiant manquant.' };

    const createdAt = record.createdAt;
    if (typeof createdAt !== 'string' || !ISO_TIMESTAMP_PATTERN.test(createdAt)) {
        return { ok: false, error: 'Manifeste invalide — horodatage ISO 8601 (UTC) attendu.' };
    }

    const app = asRecord(record.app);
    if (!app || !isNonEmptyString(app.name) || !isNonEmptyString(app.version)) {
        return { ok: false, error: 'Manifeste invalide — identité applicative incomplète.' };
    }

    const git = asRecord(record.git);
    if (!git) return { ok: false, error: 'Manifeste invalide — bloc Git absent.' };

    const encryption = asRecord(record.encryption);
    if (!encryption || !CIPHERS.includes(encryption.algorithm as CipherAlgorithm)) {
        return { ok: false, error: 'Manifeste invalide — chiffrement non supporté.' };
    }
    if (!isNonEmptyString(encryption.keyDerivation)) {
        return { ok: false, error: 'Manifeste invalide — dérivation de clé non documentée.' };
    }

    if (!Array.isArray(record.parts) || record.parts.length === 0) {
        return { ok: false, error: 'Manifeste refusé — aucune partie.' };
    }
    for (const part of record.parts) {
        const problem = describePartProblem(part);
        if (problem !== null) return { ok: false, error: `Manifeste refusé — ${problem}` };
    }

    const tier = record.tier;
    if (typeof tier !== 'string' || !TIERS.includes(tier as BackupTier)) {
        return { ok: false, error: 'Manifeste invalide — tier inconnu.' };
    }

    const totals = asRecord(record.totals);
    if (
        !totals ||
        !isNonNegativeInteger(totals.parts) ||
        !isNonNegativeInteger(totals.rows) ||
        !isNonNegativeInteger(totals.bytes)
    ) {
        return { ok: false, error: 'Manifeste invalide — totaux absents ou malformés.' };
    }

    const degraded = normalizeDegraded(record.degraded);
    if (degraded === null) return { ok: false, error: 'Manifeste refusé — bloc de dégradation malformé.' };

    const manifest: BackupManifest = {
        formatVersion: BACKUP_FORMAT_VERSION,
        id,
        createdAt,
        app: { name: app.name, version: app.version },
        git: {
            commit: typeof git.commit === 'string' ? git.commit : null,
            branch: typeof git.branch === 'string' ? git.branch : null,
        },
        encryption: { algorithm: 'aes-256-gcm', keyDerivation: encryption.keyDerivation },
        parts: record.parts as BackupPart[],
        totals: { parts: totals.parts, rows: totals.rows, bytes: totals.bytes },
        tier: tier as BackupTier,
    };
    if (degraded.length > 0) manifest.degraded = degraded;

    return { ok: true, manifest };
}
