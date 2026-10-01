/**
 * Sauvegarde automatique du site CUC — accès **lecture seule** au Storage Supabase.
 *
 * Couche « I/O » (`AGENTS.md` § 1). Responsabilité unique : énumérer et
 * télécharger les objets média. Ce module **n’écrit rien** dans Supabase :
 * l'interface client n'expose que `list` et `download`. Aucun `remove`, aucun
 * `upload` : le miroir est strictement descendant. Un test le vérifie sur les
 * appels du double.
 *
 * Périmètre des buckets (plan § 1.1), à respecter strictement :
 *  - `cuc-vitrine-assets` : sauvegarde **complète** (état éditorial visuel) ;
 *  - `avatars` : sauvegarde **en lecture seule**, jamais purgé, jamais modifié
 *    (objets probablement liés aux profils du produit « CUC Sign ») ;
 *  - `reports` : **hors périmètre**, exclu explicitement — artefacts de
 *    reporting régénérables par `npm run report:*` (`AGENTS.md` § 2).
 *
 * Le client est **injecté** (fabrique, comme [`db-read.ts`](./db-read.ts:33))
 * afin de rester testable sans réseau. La fabrique par défaut est chargée
 * dynamiquement : aucun SDK Supabase n'est évalué si l'on ne sauvegarde pas
 * les médias.
 */

import { createHash } from 'node:crypto';

import type { MediaObjectDescriptor } from '../media-index';
import type { MediaCredentials } from './config';

/** Bucket sauvegardé intégralement. */
export const MEDIA_FULL_BUCKET = 'cuc-vitrine-assets';
/** Bucket lu, jamais modifié (produit « CUC Sign »). */
export const MEDIA_READONLY_BUCKET = 'avatars';
/** Buckets explicitement exclus du périmètre de sauvegarde. */
export const MEDIA_EXCLUDED_BUCKETS: readonly string[] = ['reports'];

/** Régime de sauvegarde d'un bucket. */
export type MediaBucketRegime = 'full' | 'read-only';

/** Plan de périmètre : la seule source des buckets traités. */
export interface MediaBucketPlan {
    name: string;
    regime: MediaBucketRegime;
}

export const MEDIA_BUCKET_PLAN: readonly MediaBucketPlan[] = [
    { name: MEDIA_FULL_BUCKET, regime: 'full' },
    { name: MEDIA_READONLY_BUCKET, regime: 'read-only' },
];

/** Taille de page du listing (le Storage renvoie par pages). */
export const DEFAULT_MEDIA_PAGE_SIZE = 100;

/**
 * Erreur de périmètre média : fail-fast, nommée. `reports` et tout bucket hors
 * plan sont refusés **avant** toute requête.
 */
export class MediaScopeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MediaScopeError';
    }
}

/** Contrôle de périmètre d'un bucket, exécuté avant tout accès. */
export function assertBucketInScope(bucket: string): void {
    if (typeof bucket !== 'string' || bucket.trim().length === 0) {
        throw new MediaScopeError('Périmètre média refusé — nom de bucket vide.');
    }
    if (MEDIA_EXCLUDED_BUCKETS.includes(bucket)) {
        throw new MediaScopeError(`Bucket « ${bucket} » hors périmètre — artefacts régénérables, exclus explicitement.`);
    }
    if (!MEDIA_BUCKET_PLAN.some((entry) => entry.name === bucket)) {
        throw new MediaScopeError(`Bucket « ${bucket} » hors périmètre — non déclaré dans le plan média.`);
    }
}

/** Entrée brute d'une page de listing. `id === null` désigne un dossier. */
export interface MediaBucketEntry {
    name: string;
    id: string | null;
    updatedAt: string | null;
    size: number | null;
}

/** Réponse d'une page de listing. */
export interface MediaListPage {
    data: MediaBucketEntry[] | null;
    error: { message: string } | null;
}

/** Contenu binaire toléré d'un téléchargement (Blob, ArrayBuffer, Uint8Array). */
export type MediaDownloadPayload = ArrayBuffer | Uint8Array | { arrayBuffer(): Promise<ArrayBuffer> };

/** Poignée d'un bucket : lecture seule par construction (list, download). */
export interface MediaBucketHandle {
    list(path?: string, options?: { limit?: number; offset?: number }): Promise<MediaListPage>;
    download(path: string): Promise<{ data: MediaDownloadPayload | null; error: { message: string } | null }>;
}

/** API Storage minimale : seuls le listage et le téléchargement existent. */
export interface MediaStorageApi {
    from(bucket: string): MediaBucketHandle;
}

/** Client injecté : jamais un client construit ici. */
export interface MediaClient {
    storage: MediaStorageApi;
}

/** Fabrique de client (par défaut : `@supabase/supabase-js`, chargé à la demande). */
export type MediaClientFactory = (credentials: MediaCredentials) => Promise<MediaClient>;

/** Motifs d'échec typés d'une opération média. */
export type MediaIoErrorCode = 'invalid-input' | 'list-failed' | 'download-failed' | 'unsupported-payload';

/** Échec explicite : jamais un `throw` nu, jamais un silence. */
export interface MediaIoError {
    code: MediaIoErrorCode;
    bucket: string | null;
    path: string | null;
    message: string;
}

/** Objet listé (empreinte calculée seulement au téléchargement). */
export interface ListedMediaObject {
    bucket: string;
    path: string;
    size: number;
    lastModified: string | null;
}

export type MediaListResult = { ok: true; objects: ListedMediaObject[] } | { ok: false; error: MediaIoError };
export type MediaDownloadResult =
    | { ok: true; descriptor: MediaObjectDescriptor; bytes: Buffer }
    | { ok: false; error: MediaIoError };

/** Résultat d'une lecture complète de bucket : objets + objets en échec. */
export interface ReadBucketResult {
    /** Faux uniquement si le listage a échoué (l'objet n'est alors pas fiable). */
    ok: boolean;
    objects: MediaObjectDescriptor[];
    failures: string[];
    error: MediaIoError | null;
}

function failure(code: MediaIoErrorCode, message: string, bucket: string | null, path: string | null): { ok: false; error: MediaIoError } {
    return { ok: false, error: { code, message, bucket, path } };
}

/** Empreinte SHA-256 hexadécimale d'un contenu déjà matérialisé. */
export function sha256OfBytes(bytes: Uint8Array): string {
    return createHash('sha256').update(bytes).digest('hex');
}

/** Convertit un contenu de téléchargement en tampon, sans `instanceof`. */
async function toBytes(payload: MediaDownloadPayload | null): Promise<Buffer | null> {
    if (payload === null || typeof payload !== 'object') return null;
    const candidate = payload as { arrayBuffer?: unknown; byteLength?: unknown };
    if (typeof candidate.arrayBuffer === 'function') {
        const buffer = await (payload as { arrayBuffer(): Promise<ArrayBuffer> }).arrayBuffer();
        return Buffer.from(buffer);
    }
    if (typeof candidate.byteLength === 'number') return Buffer.from(payload as Uint8Array);
    return null;
}

/** Liste une arborescence de bucket, page par page (le Storage pagine). */
export async function listBucket(input: {
    client: MediaClient;
    bucket: string;
    prefix?: string;
    pageSize?: number;
}): Promise<MediaListResult> {
    assertBucketInScope(input?.bucket);
    const pageSize = Number.isInteger(input?.pageSize) && (input.pageSize as number) > 0 ? (input.pageSize as number) : DEFAULT_MEDIA_PAGE_SIZE;
    const handle = input.client.storage.from(input.bucket);

    const walk = async (prefix: string): Promise<MediaListResult> => {
        const objects: ListedMediaObject[] = [];
        let offset = 0;
        for (; ;) {
            const page = await handle.list(prefix, { limit: pageSize, offset });
            if (page.error !== null) {
                return failure('list-failed', `Listage refusé — ${page.error.message}`, input.bucket, prefix);
            }
            const entries = page.data ?? [];
            for (const entry of entries) {
                const childPath = prefix.length === 0 ? entry.name : `${prefix}/${entry.name}`;
                if (entry.id === null) {
                    const nested = await walk(childPath);
                    if (!nested.ok) return nested;
                    objects.push(...nested.objects);
                } else {
                    objects.push({
                        bucket: input.bucket,
                        path: childPath,
                        size: typeof entry.size === 'number' && entry.size >= 0 ? entry.size : 0,
                        lastModified: entry.updatedAt ?? null,
                    });
                }
            }
            if (entries.length < pageSize) break;
            offset += pageSize;
        }
        return { ok: true, objects };
    };

    return walk(typeof input.prefix === 'string' ? input.prefix.replace(/^\/+|\/+$/g, '') : '');
}

/** Télécharge un objet et calcule son empreinte de contenu. */
export async function downloadObject(input: {
    client: MediaClient;
    bucket: string;
    path: string;
}): Promise<MediaDownloadResult> {
    assertBucketInScope(input?.bucket);
    const path = typeof input?.path === 'string' ? input.path : '';
    if (path.trim().length === 0) {
        return failure('invalid-input', 'Chemin d’objet média absent — téléchargement refusé.', input?.bucket ?? null, null);
    }
    const response = await input.client.storage.from(input.bucket).download(path);
    if (response.error !== null) {
        return failure('download-failed', `Téléchargement refusé — ${response.error.message}`, input.bucket, path);
    }
    const bytes = await toBytes(response.data);
    if (bytes === null) {
        return failure('unsupported-payload', 'Contenu de téléchargement non binaire — refusé.', input.bucket, path);
    }
    return {
        ok: true,
        bytes,
        descriptor: {
            bucket: input.bucket,
            path,
            size: bytes.byteLength,
            sha256: sha256OfBytes(bytes),
            lastModified: null,
        },
    };
}

/**
 * Lit un bucket entier : listage paginé puis téléchargement de chaque objet.
 * Un téléchargement en échec n'interrompt pas le reste : il est **tracé** et
 * l'appelant en déduit une dégradation (jamais un succès silencieux).
 */
export async function readBucketObjects(input: {
    client: MediaClient;
    bucket: string;
    pageSize?: number;
}): Promise<ReadBucketResult> {
    const listed = await listBucket(input);
    if (!listed.ok) return { ok: false, objects: [], failures: [], error: listed.error };

    const objects: MediaObjectDescriptor[] = [];
    const failures: string[] = [];
    for (const item of listed.objects) {
        const downloaded = await downloadObject({ client: input.client, bucket: input.bucket, path: item.path });
        if (!downloaded.ok) {
            failures.push(`${item.path} [${downloaded.error.code}]`);
            continue;
        }
        objects.push({ ...downloaded.descriptor, lastModified: item.lastModified });
    }
    return { ok: true, objects, failures, error: null };
}

/**
 * Fabrique par défaut : client Supabase chargé **dynamiquement** (aucun SDK
 * évalué lorsqu'on ne sauvegarde pas les médias). Lecture seule garantie par
 * la forme de `MediaClient`.
 */
export async function createDefaultMediaClient(credentials: MediaCredentials): Promise<MediaClient> {
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(credentials.url, credentials.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return client as unknown as MediaClient;
}
