'use server';

/**
 * Médiathèque (lecture, upload, références) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  FOLDER_PLACEHOLDER,
  MEDIA_BUCKET,
  MEDIA_MAX_DEPTH,
  MEDIA_PAGE_SIZE,
  StorageEntry,
  isFolderEntry,
  joinPath,
  toMediaObject,
} from './media-internals';
import { MediaFolderStat } from '../media-shared';

/**
 * Téléverse un fichier média vers Supabase Storage (`cuc-vitrine-assets`).
 * Le dossier de destination est optionnel (`folder` dans le FormData), il
 * vaut `uploads` par défaut — contrat historique conservé.
 */
export async function uploadMediaFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Aucun fichier fourni');

    const rawFolder = String(formData.get('folder') || 'uploads').trim();
    const folder = rawFolder.replace(/^\/+|\/+$/g, '').replace(/\.\./g, '');

    const adminClient = createAdminClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');
    const filePath = joinPath(folder, `${timestamp}_${cleanName}`);

    const { data, error } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = adminClient.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      name: file.name,
      size: file.size,
      folder,
    };
  } catch (err: unknown) {
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

    const folders = entries
      .filter(isFolderEntry)
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
    const references: Record<string, string[]> = {};

    for (const table of TABLES) {
      const { data, error } = await adminClient.from(table).select('*');
      if (error || !data) continue;
      const blob = JSON.stringify(data);

      // Extraction par balayage : évite une regex dynamique (et un ReDoS).
      let cursor = 0;
      for (; ;) {
        const hit = blob.indexOf(marker, cursor);
        if (hit === -1) break;
        let end = hit + marker.length;
        while (end < blob.length && !/["'\\\s)]/.test(blob[end])) end += 1;
        const raw = blob.slice(hit + marker.length, end);
        cursor = end;
        if (!raw) continue;
        let path = raw;
        try {
          path = decodeURIComponent(raw);
        } catch {
          /* chemin déjà décodé */
        }
        references[path] = references[path] ?? [];
        if (!references[path].includes(table)) references[path].push(table);
      }
    }

    return { success: true, references, total: Object.keys(references).length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de lecture des références';
    return { success: false, error: message, references: {} as Record<string, string[]>, total: 0 };
  }
}
