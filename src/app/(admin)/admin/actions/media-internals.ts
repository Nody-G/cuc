/**
 * Internes serveur de la médiathèque — extrait de `actions.ts`.
 *
 * Module **pur** (aucun `'use server'`) : il exporte des constantes, un type et
 * des helpers — ce qu'un fichier `'use server'` interdit. Réservé au serveur
 * (`createAdminClient`), jamais importé par un composant client.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ORIGINALS_ROOT, TRASH_ROOT, isReservedPrefix } from '@/lib/media-library/media-policy';
import { mediaKind, MediaObject } from '../media-shared';

/* ------------------------------------------------------------------ *
 * MÉDIATHÈQUE — Supabase Storage
 *
 * Supabase Storage ne connaît pas les dossiers : un « dossier » est un
 * préfixe d'objet. On le matérialise par un objet sentinelle
 * (`FOLDER_PLACEHOLDER`) créé à la demande, jamais affiché. L'ancien
 * explorateur ne listait que `uploads/` (100 objets, non récursif) : le
 * catalogue réel vit sous `media/**`, d'où la refonte ci-dessous.
 * ------------------------------------------------------------------ */

/** Bucket public unique du site vitrine. */
export const MEDIA_BUCKET = 'cuc-vitrine-assets';
/** Objet sentinelle qui matérialise un dossier (vide aux yeux de l'UI). */
export const FOLDER_PLACEHOLDER = '.emptyFolderPlaceholder';
/**
 * Racines réservées, ré-exportées depuis `media-policy` — une seule source par
 * sujet : `_trash` (corbeille réversible) et `_originals` (négatifs haute
 * résolution, jamais référencés par la vitrine).
 */
export { ORIGINALS_ROOT, TRASH_ROOT, isReservedPrefix };

/**
 * Un dossier technique apparaît-il dans la navigation du catalogue ?
 *
 * Seuls les négatifs sont masqués côté serveur : `_trash` reste atteignable
 * (restauration d'un fichier supprimé) et l'arborescence continue de compter
 * les deux préfixes — un poids masqué serait un quota menti.
 */
export function isHiddenCatalogEntry(prefix: string, name: string): boolean {
    return prefix === '' && name === ORIGINALS_ROOT;
}
/** Taille de page du parcours récursif. */
export const MEDIA_PAGE_SIZE = 100;
/** Profondeur maximale explorée (garde-fou anti-boucle). */
export const MEDIA_MAX_DEPTH = 6;

export interface StorageEntry {
    id: string | null;
    name: string;
    metadata: { size?: number; mimetype?: string } | null;
    created_at?: string | null;
}

/** Supabase renvoie `id: null` ET `metadata: null` pour un dossier. */
export function isFolderEntry(entry: StorageEntry): boolean {
    return entry.id === null && entry.metadata === null;
}

export function joinPath(prefix: string, name: string): string {
    return prefix ? `${prefix}/${name}` : name;
}

export function publicUrlFor(path: string): string {
    const adminClient = createAdminClient();
    return adminClient.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function toMediaObject(prefix: string, entry: StorageEntry): MediaObject {
    const path = joinPath(prefix, entry.name);
    return {
        name: entry.name,
        path,
        folder: prefix,
        url: publicUrlFor(path),
        size: entry.metadata?.size ?? 0,
        mimetype: entry.metadata?.mimetype ?? '',
        createdAt: entry.created_at ?? null,
        kind: mediaKind(entry.name),
    };
}
