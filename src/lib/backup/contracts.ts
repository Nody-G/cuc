/**
 * Sauvegarde automatique du site CUC — Types & Contrats.
 *
 * Couche « Types & Contrats » (`AGENTS.md` § 1) : ce fichier ne contient
 * **aucune logique**, aucune entrée/sortie, aucun accès réseau ni base. Il
 * décrit la forme des objets échangés entre le domaine pur (`whitelist`,
 * `manifest`, `integrity`, `fk-order`, `diff`, `retention`) et la couche I/O
 * des lots suivants.
 *
 * Règle absolue rappelée ici : la base est **partagée avec CUC Sign**
 * (`.agents/rules/cuc_sign_interconnection.md:9`). Aucun contrat de ce module
 * ne désigne une table CUC Sign comme inscriptible.
 *
 * Plan de référence : `plans/plan-backups-automatiques-2026.md` § 4.1 et § 6.1.
 */

/** Tier d'un instantané : trois tiers GFS + deux tiers hors politique. */
export type BackupTier = 'daily' | 'weekly' | 'monthly' | 'manual' | 'pre-restore';

/** Tiers d'un catalogue de rétention (les seuls soumis à la politique GFS). */
export type BackupIndexTier = 'daily' | 'weekly' | 'monthly';

/** Nature d'une partie d'instantané. */
export type BackupPartKind = 'table' | 'media-index' | 'config';

/**
 * État d'une entrée de catalogue :
 *  - `complete`   : toutes les tables demandées ont été sauvegardées ;
 *  - `degraded`   : instantané **valide et vérifiable**, mais au périmètre
 *                   réduit — au moins une table demandée était absente ;
 *  - `incomplete` : run interrompu, jamais un point de restauration.
 */
export type BackupStatus = 'complete' | 'degraded' | 'incomplete';

/**
 * Table demandée mais absente de la base : la dégradation est **tracée**,
 * jamais silencieuse. Ajout rétro-compatible — les manifestes et catalogues
 * déjà écrits (sans ce champ) restent lisibles.
 */
export interface BackupDegradation {
    table: string;
    reason: string;
}

/** Compression supportée (native `node:zlib`, aucune dépendance ajoutée). */
export type CompressionAlgorithm = 'gzip';

/** Chiffrement supporté (natif `node:crypto`, `createCipheriv`). */
export type CipherAlgorithm = 'aes-256-gcm';

/** Identité applicative inscrite dans le manifeste. */
export interface BackupAppInfo {
    name: string;
    version: string;
}

/** Code source associé à l'instantané (couche « code » du plan § 1). */
export interface BackupGitInfo {
    commit: string | null;
    branch: string | null;
}

/** Paramètres de chiffrement : algorithme et dérivation de clé (jamais la clé). */
export interface BackupEncryptionInfo {
    algorithm: CipherAlgorithm;
    keyDerivation: string;
}

/**
 * Une partie de l'instantané : une table de la liste blanche, un index média
 * ou un fragment de configuration. `table` est `null` pour tout ce qui n'est
 * pas directement une table.
 */
export interface BackupPart {
    kind: BackupPartKind;
    table: string | null;
    objectKey: string;
    rows: number;
    compressedBytes: number;
    plainBytes: number;
    sha256: string;
    compression: CompressionAlgorithm;
    cipher: CipherAlgorithm;
}

/** Comptages agrégés d'un instantané. */
export interface BackupTotals {
    parts: number;
    rows: number;
    bytes: number;
}

/**
 * Manifeste : description complète et auto-suffisante d'un instantané.
 * Écrit en clair, sans donnée personnelle (§ 4.1 du plan).
 */
export interface BackupManifest {
    formatVersion: number;
    id: string;
    createdAt: string;
    app: BackupAppInfo;
    git: BackupGitInfo;
    encryption: BackupEncryptionInfo;
    parts: BackupPart[];
    totals: BackupTotals;
    tier: BackupTier;
    /**
     * Tables demandées mais absentes à l'exécution (§ correctif « table
     * absente non fatale »). **Absent** d'un manifeste sain et des manifestes
     * déjà écrits : le champ est purement optionnel.
     */
    degraded?: BackupDegradation[];
}

/** Entrée du catalogue de versions (`index.json`, hors projet Supabase). */
export interface BackupIndexEntry {
    id: string;
    createdAt: string;
    tier: BackupIndexTier;
    status: BackupStatus;
    partsCount: number;
    bytes: number;
    prefix: string;
    appVersion: string;
    gitCommit: string | null;
    /**
     * Marqueur de dégradation : noms des tables demandées mais absentes.
     * Optionnel — absent des entrées `complete` et des catalogues déjà écrits.
     */
    missingTables?: string[];
}

/** Catalogue des versions disponibles, reconstruisible depuis les manifestes. */
export interface BackupIndex {
    formatVersion: number;
    updatedAt: string;
    entries: BackupIndexEntry[];
}

/** Politique de rétention GFS : 7 quotidiennes, 4 hebdomadaires, 12 mensuelles. */
export interface RetentionPolicy {
    daily: number;
    weekly: number;
    monthly: number;
}

/** Tier cible d'une promotion de rétention. */
export type RetentionTier = 'weekly' | 'monthly';

/** Promotion proposée : un instantané quotidien hissé en hebdo ou mensuel. */
export interface RetentionPromotion {
    id: string;
    tier: RetentionTier;
}

/** Décision de rétention : conservés, purgés, promus. */
export interface RetentionDecision {
    keep: string[];
    delete: string[];
    promote: RetentionPromotion[];
}

/** Ligne brute d'une table du périmètre (forme libre : colonnes réelles). */
export type BackupRow = Readonly<Record<string, unknown>>;

/**
 * Diff d'une table entre l'état courant et un instantané.
 * `preservedBridgeRows` porte les lignes **volontairement non touchées** parce
 * qu'elles portent un appariement CUC Sign postérieur à l'instantané (§ 5.3).
 */
export interface TableDiff {
    table: string;
    toInsert: BackupRow[];
    toUpdate: BackupRow[];
    toDelete: BackupRow[];
    preservedBridgeRows: BackupRow[];
}

/** Résultat d'une restauration, table par table : l'échec n'est jamais masqué. */
export interface RestoreTableResult {
    table: string;
    ok: boolean;
    inserted: number;
    updated: number;
    deleted: number;
    preserved: number;
    error: string | null;
}

/** Empreinte fournie par la couche I/O (jamais calculée dans le domaine pur). */
export interface PartDigest {
    objectKey: string;
    sha256: string;
}

/** Défaut d'intégrité constaté sur une partie, avec sa cause explicite. */
export interface PartIntegrityFailure {
    objectKey: string;
    table: string | null;
    expectedSha256: string;
    actualSha256: string | null;
    reason: 'digest-missing' | 'digest-mismatch';
}

/** Contrôle de cohérence des totaux : lu vs recalculé indépendamment. */
export interface TotalsCheck {
    ok: boolean;
    expected: BackupTotals;
    actual: BackupTotals;
}

/** Résultat d'un tri topologique : ordre calculé et cycles détectés (données). */
export interface DependencyOrderResult {
    order: string[];
    cycles: string[][];
}

/** Analyse de manifeste réussie. */
export interface ManifestParseSuccess {
    ok: true;
    manifest: BackupManifest;
}

/** Analyse de manifeste refusée, avec un motif lisible et typé. */
export interface ManifestParseFailure {
    ok: false;
    error: string;
}

/**
 * Résultat d'analyse d'un manifeste : union discriminée par `ok`.
 * `parseManifest` ne lève jamais d'exception non typée (§ 7.1).
 */
export type ManifestParseResult = ManifestParseSuccess | ManifestParseFailure;
