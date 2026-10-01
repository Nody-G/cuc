/**
 * Sauvegarde automatique du site CUC — index des médias Storage.
 *
 * Couche « Domaine pur » (`AGENTS.md` § 1) : aucun accès réseau, aucune base,
 * aucune horloge implicite. L'empreinte SHA-256 du contenu est **fournie** par
 * la couche I/O ([`io/media.ts`](./io/media.ts:1)) ; ce module ne fait que
 * normaliser, trier, comparer et dériver des clés **adressées par contenu**.
 *
 * Rien de binaire, aucune donnée personnelle : une entrée ne porte que le
 * bucket, le chemin d'origine, la taille, l'empreinte et la date de
 * modification connue. C'est le contrat qui rend le miroir **incrémental** :
 * `diffMediaIndex` isole les seuls objets ajoutés/modifiés, et `mediaKeyFor`
 * fait qu'un contenu identique n'est stocké qu'une fois, quel que soit son
 * nombre de chemins d'origine.
 *
 * Plan de référence : `plans/plan-backups-automatiques-2026.md` § 6.3.
 */

/** Entrée normalisée : ni contenu binaire, ni donnée personnelle. */
export interface MediaIndexEntry {
    bucket: string;
    path: string;
    size: number;
    sha256: string;
    lastModified: string | null;
}

/** Description brute reçue de la couche I/O — l'empreinte est déjà calculée. */
export interface MediaObjectDescriptor {
    bucket: string;
    path: string;
    size: number;
    sha256: string;
    lastModified?: string | null;
}

/** Différentiel entre deux index : la raison d'être de l'incrémental. */
export interface MediaIndexDiff {
    added: MediaIndexEntry[];
    changed: MediaIndexEntry[];
    unchanged: MediaIndexEntry[];
    removedFromSource: MediaIndexEntry[];
}

/** Erreur de domaine : une entrée malformée est refusée, jamais « corrigée ». */
export class MediaIndexError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MediaIndexError';
    }
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const BUCKET_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/** Clé logique d'une entrée : bucket + chemin, sans ambiguïté. */
export function mediaEntryKey(entry: { bucket: string; path: string }): string {
    return `${entry.bucket}/${entry.path}`;
}

/** Vrai si le hash est un SHA-256 hexadécimal minuscule bien formé. */
export function isValidMediaHash(hash: unknown): hash is string {
    return typeof hash === 'string' && SHA256_PATTERN.test(hash);
}

/**
 * Contrôle d'une entrée, partagé par la construction et la relecture.
 * Retourne `null` si l'entrée est valide, sinon le motif exact du refus.
 * Bornes explicites : chemin vide, chemin absolu/remontant, hash malformé,
 * taille négative ou non entière.
 */
export function describeMediaEntryProblem(candidate: unknown): string | null {
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
        return 'une entrée média n’est pas un objet.';
    }
    const record = candidate as Record<string, unknown>;
    if (!isNonEmptyString(record.bucket) || !BUCKET_PATTERN.test(record.bucket)) {
        return 'un nom de bucket média est vide ou malformé.';
    }
    const path = record.path;
    if (!isNonEmptyString(path)) return 'un chemin média est vide.';
    if (path.startsWith('/') || path.includes('\\') || path.includes('..')) {
        return `le chemin média « ${path} » est refusé (absolu ou remontant).`;
    }
    if (/[\u0000-\u001f\u007f]/.test(path)) {
        return `le chemin média « ${path} » porte un caractère de contrôle.`;
    }
    if (typeof record.size !== 'number' || !Number.isInteger(record.size) || record.size < 0) {
        return `la taille de « ${path} » est invalide — entier positif ou nul attendu.`;
    }
    if (!isValidMediaHash(record.sha256)) {
        return `l’empreinte SHA-256 de « ${path} » est malformée.`;
    }
    const lastModified = record.lastModified;
    if (lastModified !== null && lastModified !== undefined && !isNonEmptyString(lastModified)) {
        return `la date de modification de « ${path} » est invalide.`;
    }
    return null;
}

/** Tri déterministe par clé : deux index égaux se comparent sans ambiguïté. */
function compareKeys(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Normalise et trie les objets d'un inventaire. Un doublon de clé (même bucket
 * et même chemin) est **refusé** : une entrée ambiguë ne rentre jamais dans un
 * index. Le tri garantit que le manifeste est stable et comparable d'un jour à
 * l'autre.
 */
export function buildMediaIndex(objects: readonly MediaObjectDescriptor[]): MediaIndexEntry[] {
    if (!Array.isArray(objects)) throw new MediaIndexError('Index média refusé — liste d’objets absente.');
    const entries: MediaIndexEntry[] = [];
    const seen = new Set<string>();
    for (const candidate of objects) {
        const problem = describeMediaEntryProblem(candidate);
        if (problem !== null) throw new MediaIndexError(`Index média refusé — ${problem}`);
        const descriptor = candidate as MediaObjectDescriptor;
        const entry: MediaIndexEntry = {
            bucket: descriptor.bucket,
            path: descriptor.path,
            size: descriptor.size,
            sha256: descriptor.sha256,
            lastModified: descriptor.lastModified ?? null,
        };
        const key = mediaEntryKey(entry);
        if (seen.has(key)) throw new MediaIndexError(`Index média refusé — doublon « ${key} ».`);
        seen.add(key);
        entries.push(entry);
    }
    entries.sort((left, right) => compareKeys(mediaEntryKey(left), mediaEntryKey(right)));
    return entries;
}

/**
 * Calcule le différentiel entre l'index précédent et l'index courant.
 * `added`/`changed` sont les seuls objets à téléverser ; `unchanged` prouve
 * l'incrémental ; `removedFromSource` nourrit le ramasse-miettes.
 */
export function diffMediaIndex(
    previous: readonly MediaIndexEntry[],
    current: readonly MediaIndexEntry[],
): MediaIndexDiff {
    const before = new Map(previous.map((entry) => [mediaEntryKey(entry), entry]));
    const after = new Map(current.map((entry) => [mediaEntryKey(entry), entry]));
    const added: MediaIndexEntry[] = [];
    const changed: MediaIndexEntry[] = [];
    const unchanged: MediaIndexEntry[] = [];
    const removedFromSource: MediaIndexEntry[] = [];

    for (const [key, entry] of after) {
        const prior = before.get(key);
        if (prior === undefined) added.push(entry);
        else if (prior.sha256 !== entry.sha256) changed.push(entry);
        else unchanged.push(entry);
    }
    for (const [key, entry] of before) {
        if (!after.has(key)) removedFromSource.push(entry);
    }

    const sortEntries = (list: MediaIndexEntry[]): MediaIndexEntry[] =>
        list.sort((left, right) => compareKeys(mediaEntryKey(left), mediaEntryKey(right)));
    return {
        added: sortEntries(added),
        changed: sortEntries(changed),
        unchanged: sortEntries(unchanged),
        removedFromSource: sortEntries(removedFromSource),
    };
}

/** Hashes distincts d'une liste d'entrées, triés (jamais de doublon). */
export function uniqueHashes(entries: readonly MediaIndexEntry[]): string[] {
    return [...new Set(entries.map((entry) => entry.sha256))].sort(compareKeys);
}

/** Hashes référencés par un index — utilisés par le ramasse-miettes. */
export function referencedHashes(index: readonly MediaIndexEntry[]): string[] {
    return uniqueHashes(index);
}

/** Hashes à téléverser : union dédupliquée des objets ajoutés et modifiés. */
export function hashesToStore(diff: MediaIndexDiff): string[] {
    return uniqueHashes([...diff.added, ...diff.changed]);
}

/**
 * Clé de stockage **adressée par contenu** : `media/<sha256>`. Un contenu
 * identique ne peut donc occuper qu'un seul emplacement, et un fichier
 * inchangé n'est jamais réécrit. Un préfixe optionnel situe la clé sous la
 * racine du dépôt de sauvegarde.
 */
export function mediaKeyFor(hash: string, prefix = ''): string {
    if (!isValidMediaHash(hash)) {
        throw new MediaIndexError(`Clé média refusée — empreinte SHA-256 malformée « ${String(hash)} ».`);
    }
    const base = `media/${hash}`;
    const normalized = typeof prefix === 'string' ? prefix.replace(/^\/+|\/+$/g, '') : '';
    return normalized.length === 0 ? base : `${normalized}/${base}`;
}
