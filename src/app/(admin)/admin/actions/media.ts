'use server';

/**
 * Médiathèque (lecture, upload, références) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { reportMediaFailure } from './media-failures';
import { finalizeMediaUpload } from './media-upload-ticket';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  FOLDER_PLACEHOLDER,
  MEDIA_BUCKET,
  MEDIA_MAX_DEPTH,
  MEDIA_PAGE_SIZE,
  StorageEntry,
  isFolderEntry,
  isHiddenCatalogEntry,
  isReservedPrefix,
  joinPath,
  toMediaObject,
} from './media-internals';
import { MediaFolderStat } from '../media-shared';
import { describeCeilingRefusal, mediaNature, profileForPath, uploadCeilingBytes } from '@/lib/media-library/media-policy';
import { sanitizeFileName, stampedPath } from '@/lib/media-library/image-compression.plan';
import {
  buildMediaUsageIndex,
  extractMediaOccurrencesFromRow,
  type MediaUsageLocation,
} from '@/lib/media-library/media-usage';

/**
 * Repli de téléversement sous 1 Mo — le parcours normal est le dépôt direct
 * autorisé par `createMediaUploadTicket` (`.agents/rules/media_compression.md` § 2).
 * Mêmes plafonds, même nommage et même journalisation que ce parcours, sinon la
 * politique média dépendrait du chemin emprunté. `folder` reste optionnel.
 */
export async function uploadMediaFile(formData: FormData) {
  const rawFolder = String(formData.get('folder') || 'uploads').trim();
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Aucun fichier fourni');

    const folder = rawFolder.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');
    if (isReservedPrefix(folder)) {
      return { success: false, error: 'Ce dossier est réservé à la médiathèque interne.' };
    }

    const contentType = (file.type || 'image/jpeg').toLowerCase();
    const nature = mediaNature(contentType, file.name);
    if (!nature) {
      return { success: false, error: 'Type de fichier non pris en charge par la médiathèque.' };
    }

    const ceiling = uploadCeilingBytes(nature, false);
    if (file.size > ceiling) {
      return { success: false, error: describeCeilingRefusal(file.size, ceiling, false) };
    }

    const adminClient = createAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const filePath = stampedPath(folder, sanitizeFileName(file.name), timestamp);

    const { data, error } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = adminClient.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);

    const path = data.path ?? filePath;
    // Journalisation partagée avec le dépôt direct : une seule source des gains.
    void finalizeMediaUpload({
      path,
      folder,
      fileName: file.name,
      contentType,
      profileId: profileForPath(folder).id,
      bytesBefore: file.size,
      bytesAfter: file.size,
      compressed: false,
      keptOriginal: false,
      originalPath: null,
    });

    return { success: true, url: publicUrlData.publicUrl, path, name: file.name, size: file.size, folder };
  } catch (err: unknown) {
    // Un refus (bucket absent, fichier trop lourd, réseau) restait invisible pour
    // l'exploitant : le motif est journalisé, jamais étouffé.
    reportMediaFailure(
      'media.upload.failed',
      String(formData.get('folder') || 'uploads'),
      err,
      'uploadMediaFile',
    );
    const message = err instanceof Error ? err.message : 'Erreur upload';
    return { success: false, error: message };
  }
}

/**
 * Liste UN dossier (non récursif) : sous-dossiers + fichiers, avec tri et
 * recherche côté serveur. C'est la brique de navigation de l'explorateur.
 */
export async function listMediaFolder(options: {
  prefix?: string;
  search?: string;
  sortBy?: 'name' | 'created_at' | 'size';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} = {}) {
  const prefix = (options.prefix || '').replace(/^\/+|\/+$/g, '');
  const limit = options.limit ?? 60;
  const offset = options.offset ?? 0;

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage.from(MEDIA_BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: options.sortBy ?? 'name', order: options.order ?? 'asc' },
      ...(options.search ? { search: options.search } : {}),
    });
    if (error) throw error;

    const entries = ((data || []) as unknown as StorageEntry[]).filter(
      (entry) => entry.name !== FOLDER_PLACEHOLDER
    );

    // `_originals/` n'est pas du contenu éditorial : jamais proposé à la navigation.
    const folders = entries
      .filter(isFolderEntry)
      .filter((entry) => !isHiddenCatalogEntry(prefix, entry.name))
      .map((entry) => ({ name: entry.name, path: joinPath(prefix, entry.name) }));

    const files = entries.filter((entry) => !isFolderEntry(entry)).map((entry) => toMediaObject(prefix, entry));

    return {
      success: true,
      prefix,
      folders,
      files,
      hasMore: entries.length >= limit,
      nextOffset: offset + entries.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de listage';
    return { success: false, error: message, prefix, folders: [], files: [], hasMore: false, nextOffset: offset };
  }
}

/**
 * Parcours RÉCURSIF complet du bucket avec agrégats par dossier : ce que la
 * médiathèque affiche à l'ouverture (objets et poids réels, pas d'estimation).
 */
export async function listMediaTree() {
  try {
    const adminClient = createAdminClient();
    const stats = new Map<string, MediaFolderStat>();
    let totalFiles = 0;
    let totalBytes = 0;

    async function walk(prefix: string, depth: number): Promise<void> {
      if (depth > MEDIA_MAX_DEPTH) return;
      let offset = 0;

      for (; ;) {
        const { data, error } = await adminClient.storage.from(MEDIA_BUCKET).list(prefix, {
          limit: MEDIA_PAGE_SIZE,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        });
        if (error) throw error;

        const entries = ((data || []) as unknown as StorageEntry[]).filter(
          (entry) => entry.name !== FOLDER_PLACEHOLDER
        );
        if (entries.length === 0) break;

        for (const entry of entries) {
          if (isFolderEntry(entry)) {
            // `_originals` et `_trash` restent comptés ici : ce parcours alimente
            // le tableau de bord de stockage, où masquer un poids serait mentir
            // sur le quota réellement consommé.
            await walk(joinPath(prefix, entry.name), depth + 1);
            continue;
          }
          const size = entry.metadata?.size ?? 0;
          totalFiles += 1;
          totalBytes += size;

          // On agrège à chaque niveau pour permettre un filtre par sous-arbre.
          let acc = stats.get(prefix);
          if (!acc) {
            acc = {
              path: prefix,
              name: prefix ? prefix.split('/').pop() || prefix : 'Racine',
              files: 0,
              bytes: 0,
            };
            stats.set(prefix, acc);
          }
          acc.files += 1;
          acc.bytes += size;
        }

        if (entries.length < MEDIA_PAGE_SIZE) break;
        offset += MEDIA_PAGE_SIZE;
      }
    }

    await walk('', 0);

    return {
      success: true,
      tree: [...stats.values()].sort((a, b) => b.bytes - a.bytes),
      totalFiles,
      totalBytes,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de parcours du stockage';
    return { success: false, error: message, tree: [] as MediaFolderStat[], totalFiles: 0, totalBytes: 0 };
  }
}

/**
 * Index d'usage : quelles ressources du site référencent chaque média.
 * On lit les tables éditoriales et on cherche l'URL publique du bucket —
 * même logique que `scripts/audit_storage_usage.mjs`, côté serveur.
 */
export async function getMediaReferences() {
  const TABLES = [
    'site_pages',
    'site_translations',
    'site_films',
    'site_team',
    'site_events',
    'site_settings',
    'site_campus_pois',
    'site_partners',
    'site_sessions',
  ] as const;

  try {
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    if (!base) return { success: false, error: 'URL Supabase absente', references: {}, total: 0 };

    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const adminClient = createAdminClient();
    const occurrences: Array<{ path: string; location: MediaUsageLocation }> = [];
    const references: Record<string, string[]> = {};

    for (const table of TABLES) {
      const { data, error } = await adminClient.from(table).select('*');
      if (error || !data) continue;

      for (const row of data as Record<string, unknown>[]) {
        const rowHits = extractMediaOccurrencesFromRow(table, row, marker);
        for (const hit of rowHits) {
          occurrences.push(hit);
          references[hit.path] = references[hit.path] ?? [];
          if (!references[hit.path].includes(table)) references[hit.path].push(table);
        }
      }
    }

    const usageIndex = buildMediaUsageIndex(occurrences);
    return { success: true, references, usageIndex, total: Object.keys(usageIndex).length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de lecture des références';
    return { success: false, error: message, references: {}, usageIndex: {}, total: 0 };
  }
}
