'use server';

/**
 * Médiathèque (dossiers, déplacements, suppressions) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  FOLDER_PLACEHOLDER,
  MEDIA_BUCKET,
  MEDIA_MAX_DEPTH,
  MEDIA_PAGE_SIZE,
  TRASH_ROOT,
} from './media-internals';
import { MediaObject } from '../media-shared';
import { logAuditEvent } from './audit';
import { listMediaFolder } from './media';

/** Crée un dossier en déposant l'objet sentinelle associé. */
export async function createMediaFolder(path: string) {
  try {
    const clean = path.trim().replace(/^\/+|\/+$/g, '');
    if (!clean) throw new Error('Chemin de dossier invalide');

    const adminClient = createAdminClient();
    const { error } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .upload(`${clean}/${FOLDER_PLACEHOLDER}`, Buffer.alloc(0), {
        contentType: 'application/octet-stream',
        upsert: true,
      });
    if (error) throw error;

    await logAuditEvent('media.folder.create', clean);
    return { success: true, path: clean };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de création du dossier';
    return { success: false, error: message };
  }
}

/**
 * Déplace un ou plusieurs objets (renommage, rangement, corbeille).
 * Les collisions sont évitées par un suffixe d'horodatage.
 */
export async function moveMediaObjects(paths: string[], targetFolder: string) {
  try {
    const folder = targetFolder.replace(/^\/+|\/+$/g, '');
    if (!folder) throw new Error('Dossier de destination invalide');
    if (paths.length === 0) return { success: true, moved: 0 };

    const adminClient = createAdminClient();
    let moved = 0;

    for (const from of paths) {
      const basename = from.split('/').pop() || from;
      let to = `${folder}/${basename}`;

      const { error } = await adminClient.storage.from(MEDIA_BUCKET).move(from, to);
      if (error) {
        // Cible déjà occupée : on horodate pour ne rien écraser.
        to = `${folder}/${Date.now()}_${basename}`;
        const retry = await adminClient.storage.from(MEDIA_BUCKET).move(from, to);
        if (retry.error) throw retry.error;
      }
      moved += 1;
    }

    await logAuditEvent('media.move', folder, `${moved} fichier(s)`);
    return { success: true, moved };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de déplacement';
    return { success: false, error: message };
  }
}

/**
 * Supprime des objets. Par défaut ils partent dans `_trash/<date>/`
 * (réversible) ; `permanent: true` efface réellement.
 */
export async function deleteMediaObjects(
  paths: string[],
  options: { permanent?: boolean } = {}
) {
  try {
    if (paths.length === 0) return { success: true, deleted: 0, trashed: 0 };

    const adminClient = createAdminClient();

    if (options.permanent) {
      const { error } = await adminClient.storage.from(MEDIA_BUCKET).remove(paths);
      if (error) throw error;
      await logAuditEvent('media.delete', paths[0], `${paths.length} fichier(s) supprimé(s) définitivement`);
      return { success: true, deleted: paths.length, trashed: 0 };
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const result = await moveMediaObjects(paths, `${TRASH_ROOT}/${stamp}`);
    if (!result.success) throw new Error(result.error);
    await logAuditEvent('media.trash', `${TRASH_ROOT}/${stamp}`, `${paths.length} fichier(s)`);
    return { success: true, deleted: 0, trashed: result.moved ?? 0, trashFolder: `${TRASH_ROOT}/${stamp}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de suppression';
    return { success: false, error: message };
  }
}

/**
 * Compatibilité — ancien contrat « liste plate » consommé par les sélecteurs
 * d'image (`MediaPickerModal`) : renvoie désormais TOUT le catalogue du
 * bucket (et non plus le seul dossier `uploads/`), plafonné pour rester léger.
 */
export async function listMediaFiles() {
  try {
    const flat: MediaObject[] = [];

    async function walk(prefix: string, depth: number): Promise<void> {
      if (depth > MEDIA_MAX_DEPTH || flat.length >= 400) return;
      const { folders, files, hasMore } = await listMediaFolder({ prefix, limit: MEDIA_PAGE_SIZE });
      flat.push(...files);
      for (const folder of folders) await walk(folder.path, depth + 1);
      if (hasMore && flat.length < 400) {
        const next = await listMediaFolder({ prefix, limit: MEDIA_PAGE_SIZE, offset: flat.length });
        flat.push(...next.files);
      }
    }

    await walk('', 0);

    return {
      success: true,
      files: flat
        .sort((a, b) => (a.path < b.path ? -1 : 1))
        .map((file) => ({
          name: file.name,
          path: file.path,
          size: file.size,
          createdAt: file.createdAt,
          url: file.url,
          kind: file.kind,
        })),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur liste médias';
    return { success: false, error: message, files: [] };
  }
}

/**
 * Compatibilité — suppression d'un fichier du dossier historique `uploads/`
 * (les nouveaux écrans passent par `deleteMediaObjects`).
 */
export async function deleteMediaFile(filename: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.storage
      .from(MEDIA_BUCKET)
      .remove([`uploads/${filename}`]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression média';
    return { success: false, error: message };
  }
}
