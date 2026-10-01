/**
 * Sauvegarde automatique du site CUC — miroir incrémental des médias.
 *
 * Couche « Orchestration » (`AGENTS.md` § 1) : enchaîner le miroir **sans jamais
 * toucher `node:fs`, `process.env` ni un SDK Supabase** — toutes les dépendances
 * sont injectées, exactement comme dans [`orchestrate.ts`](./orchestrate.ts:182).
 *
 * Circuit : (a) listage des buckets du plan, (b) index courant déterministe,
 * (c) comparaison à l'index du dernier instantané conservé, (d) téléversement
 * **chiffré** des seuls objets `added`/`changed` sous une clé adressée par
 * contenu, (e) part `media-index`. Le ramasse-miettes conservateur vit désormais
 * dans [`media-gc.ts`](./media-gc.ts:1) (extrait pour le plafond de 300 lignes) :
 * il ne supprime un blob que s'il n'est référencé par **aucun** manifeste
 * conservé, et un seul manifeste illisible bloque toute suppression.
 *
 * Aucun accès en écriture à Supabase : le module ne fait que lire le Storage et
 * écrire dans le dépôt de sauvegarde (R2 / local).
 */

import type { BackupManifest } from './contracts';
import { readBackupIndex } from './io/index-store';
import {
    MEDIA_BUCKET_PLAN,
    downloadObject,
    readBucketObjects,
    type MediaBucketRegime,
    type MediaClient,
} from './io/media';
import type { BackupStorage } from './io/storage';
import {
    buildMediaIndex,
    diffMediaIndex,
    hashesToStore,
    mediaKeyFor,
    type MediaIndexEntry,
    type MediaObjectDescriptor,
} from './media-index';
import { parseManifest } from './manifest';

/** Lecture d'un index média : succès/failure explicite, jamais d'exception nue. */
export interface MediaIndexLoad {
    ok: boolean;
    entries: MediaIndexEntry[];
    reason: string | null;
}

/** Dépendances minimales pour relire un index média depuis le dépôt. */
export interface MediaIndexReader {
    storage: BackupStorage;
    decrypt: (envelope: Uint8Array) => Buffer;
    decompress: (input: Uint8Array) => Buffer;
}

/** Sélection et résolution du dernier instantané conservé. */
export interface PreviousIndexDependencies extends MediaIndexReader {
    indexObjectKey: string;
    now: () => Date;
}

/** Résumé d'un bucket traité, pour le rapport et la CLI d'état. */
export interface MediaBucketReport {
    name: string;
    regime: MediaBucketRegime;
    objects: number;
    bytes: number;
}

/** Rapport complet d'un run média : tous les compteurs, aucune donnée binaire. */
export interface MediaMirrorReport {
    buckets: MediaBucketReport[];
    sourceObjects: number;
    uniqueBlobs: number;
    deduplicatedPaths: number;
    storedBlobs: number;
    uploaded: number;
    reusedBlobs: number;
    unchanged: number;
    added: number;
    changed: number;
    removedFromSource: number;
    degraded: boolean;
    /** Faux dès qu'un listage échoue : interdit alors tout ramasse-miettes. */
    indexReliable: boolean;
    failures: string[];
}

/** Charge utile de la part `media-index` (chiffrée par l'orchestrateur de run). */
export interface MediaMirrorPayload {
    rows: number;
    payload: Uint8Array;
}

/** Résultat du miroir : la part à rattacher au manifeste, ou `null`. */
export interface MediaMirrorOutcome {
    media: MediaMirrorPayload | null;
    degraded: boolean;
    failures: string[];
    report: MediaMirrorReport;
}

/** Dépendances injectées du miroir. `client: null` = creds absents. */
export interface MediaMirrorDependencies {
    client: MediaClient | null;
    storage: BackupStorage;
    prefix: string;
    encrypt: (plain: Uint8Array) => Buffer;
    loadPreviousIndex: () => Promise<MediaIndexLoad>;
    now: () => Date;
}

/** Options du miroir : `write: false` interdit tout téléversement. */
export interface MediaMirrorOptions {
    snapshotPrefix: string;
    write: boolean;
}

function describe(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : 'cause inconnue';
}

function normalizePrefix(prefix: string): string {
    return typeof prefix === 'string' ? prefix.replace(/^\/+|\/+$/g, '') : '';
}

/** Relit l'index média d'un manifeste ; absence de part ⇒ index vide valide. */
export async function loadMediaIndexFromManifest(
    deps: MediaIndexReader,
    manifest: BackupManifest,
): Promise<MediaIndexLoad> {
    const part = manifest.parts.find((candidate) => candidate.kind === 'media-index');
    if (part === undefined) return { ok: true, entries: [], reason: null };

    const fetched = await deps.storage.get(part.objectKey);
    if (!fetched.ok) {
        return { ok: false, entries: [], reason: `index média illisible [${fetched.error.code}] — ${fetched.error.message}` };
    }
    try {
        const plain = deps.decompress(deps.decrypt(fetched.value));
        const parsed: unknown = JSON.parse(plain.toString('utf8'));
        if (!Array.isArray(parsed)) return { ok: false, entries: [], reason: 'index média non tabulaire' };
        return { ok: true, entries: buildMediaIndex(parsed as MediaObjectDescriptor[]), reason: null };
    } catch (error) {
        return { ok: false, entries: [], reason: describe(error) };
    }
}

/** Relit l'index média du dernier instantané conservé (hors runs interrompus). */
export async function loadPreviousMediaIndex(deps: PreviousIndexDependencies): Promise<MediaIndexLoad> {
    const index = await readBackupIndex(deps.storage, deps.indexObjectKey, () => deps.now().toISOString());
    if (!index.ok) return { ok: false, entries: [], reason: `catalogue illisible [${index.error.code}]` };

    const sorted = index.value.entries
        .filter((entry) => entry.status !== 'incomplete')
        .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1));
    const entry = sorted[0];
    if (entry === undefined) return { ok: true, entries: [], reason: null };

    const manifestObject = await deps.storage.get(`${entry.prefix}/manifest.json`);
    if (!manifestObject.ok) return { ok: false, entries: [], reason: `manifeste « ${entry.id} » illisible` };
    const parsed = parseManifest(manifestObject.value.toString('utf8'));
    if (!parsed.ok) return { ok: false, entries: [], reason: `manifeste « ${entry.id} » refusé — ${parsed.error}` };
    return loadMediaIndexFromManifest(deps, parsed.manifest);
}

/** Compte les blobs déjà présents dans le miroir (sous `<prefix>/media/`). */
async function countMirrorBlobs(storage: BackupStorage, prefix: string): Promise<number> {
    const listed = await storage.list(`${normalizePrefix(prefix)}/media/`);
    if (!listed.ok) return -1;
    return listed.value.length;
}

function emptyReport(degraded: boolean, failures: string[]): MediaMirrorReport {
    return {
        buckets: [], sourceObjects: 0, uniqueBlobs: 0, deduplicatedPaths: 0, storedBlobs: 0,
        uploaded: 0, reusedBlobs: 0, unchanged: 0, added: 0, changed: 0, removedFromSource: 0,
        degraded, indexReliable: false, failures,
    };
}

/**
 * Exécute le miroir incrémental. Sans identifiants Supabase, le run média est
 * **dégradé** et laisse la sauvegarde de données se poursuivre ; un échec de
 * listage rend l'index non fiable (donc interdit le ramasse-miettes) et un
 * échec de téléversement est **tracé**, jamais silencieux.
 */
export async function runMediaMirror(
    deps: MediaMirrorDependencies,
    options: MediaMirrorOptions,
): Promise<MediaMirrorOutcome> {
    const failures: string[] = [];
    let degraded = false;
    let indexReliable = true;
    const prefix = normalizePrefix(deps.prefix);

    if (deps.client === null) {
        failures.push('Identifiants Supabase absents — sauvegarde des médias ignorée (run de données seul).');
        return { media: null, degraded: true, failures, report: emptyReport(true, failures) };
    }
    const client = deps.client;

    const descriptors: MediaObjectDescriptor[] = [];
    const buckets: MediaBucketReport[] = [];
    for (const plan of MEDIA_BUCKET_PLAN) {
        const read = await readBucketObjects({ client, bucket: plan.name });
        if (!read.ok) {
            degraded = true;
            indexReliable = false; // index incomplet : aucun ramasse-miettes sur cette base
            failures.push(`Listage refusé pour « ${plan.name} » [${read.error?.code}] — ${read.error?.message}`);
            continue;
        }
        if (read.failures.length > 0) {
            degraded = true;
            failures.push(...read.failures.map((failure) => `${plan.name}/${failure}`));
        }
        descriptors.push(...read.objects);
        buckets.push({
            name: plan.name,
            regime: plan.regime,
            objects: read.objects.length,
            bytes: read.objects.reduce((sum, object) => sum + object.size, 0),
        });
    }

    let current: MediaIndexEntry[];
    try {
        current = buildMediaIndex(descriptors);
    } catch (error) {
        failures.push(`Index média refusé — ${describe(error)}`);
        return { media: null, degraded: true, failures, report: emptyReport(true, failures) };
    }

    const previous = await deps.loadPreviousIndex();
    if (!previous.ok) {
        degraded = true;
        failures.push(`Index précédent indisponible — ${previous.reason}`); // repli sûr : tout est revu
    }
    const diff = diffMediaIndex(previous.entries, current);
    const toStore = hashesToStore(diff);

    const byHash = new Map<string, MediaObjectDescriptor>();
    for (const entry of current) if (!byHash.has(entry.sha256)) byHash.set(entry.sha256, entry);

    let uploaded = 0;
    let reusedBlobs = 0;
    if (options.write) {
        for (const hash of toStore) {
            const objectKey = mediaKeyFor(hash, prefix);
            const present = await deps.storage.exists(objectKey);
            if (present.ok && present.value) {
                reusedBlobs += 1; // contenu déjà stocké : jamais renvoyé
                continue;
            }
            const source = byHash.get(hash);
            if (source === undefined) {
                degraded = true;
                failures.push(`Blob ${hash} sans source connue — non téléversé.`);
                continue;
            }
            const fetched = await downloadObject({ client, bucket: source.bucket, path: source.path });
            if (!fetched.ok) {
                degraded = true;
                failures.push(`${source.path} [${fetched.error.code}] — blob non téléversé.`);
                continue;
            }
            const written = await deps.storage.put(objectKey, deps.encrypt(new Uint8Array(fetched.bytes)), {
                contentType: 'application/octet-stream',
            });
            if (!written.ok) {
                degraded = true;
                failures.push(`${objectKey} [${written.error.code}] — blob média non écrit.`);
                continue;
            }
            uploaded += 1;
        }
    }

    const storedBlobs = await countMirrorBlobs(deps.storage, prefix);
    const report: MediaMirrorReport = {
        buckets,
        sourceObjects: current.length,
        uniqueBlobs: byHash.size,
        deduplicatedPaths: current.length - byHash.size,
        storedBlobs: storedBlobs < 0 ? 0 : storedBlobs,
        uploaded,
        reusedBlobs,
        unchanged: diff.unchanged.length,
        added: diff.added.length,
        changed: diff.changed.length,
        removedFromSource: diff.removedFromSource.length,
        degraded,
        indexReliable,
        failures,
    };

    const payload = Buffer.from(JSON.stringify(current), 'utf8');
    return { media: { rows: current.length, payload }, degraded, failures, report };
}

