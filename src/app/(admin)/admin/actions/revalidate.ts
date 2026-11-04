'use server';

/**
 * Revalidation vitrine — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { revalidatePath, revalidateTag, updateTag, refresh } from 'next/cache';

/**
 * Tags de cache des lectures publiques (cf. `src/lib/i18n/server.ts`) :
 * les pages sont générées avec `'use cache'` + `cacheTag(...)`, donc une
 * revalidation de chemin seule peut laisser une page figée.
 */
const SITE_CACHE_TAGS = [
  'site_pages',
  'site_translations',
  'site_navigation',
  'site_footer',
  'site_social_links',
] as const;

/**
 * Revalide toutes les pages du site vitrine suite à une modification de contenu.
 *
 * Triple filet pour garantir la fraîcheur immédiate sans rechargement forcé :
 *  - **chemins localisés** : la racine `/`, les voies localisées (`/fr/...`, `/en/...`)
 *    et le segment dynamique `/[locale]/...` ;
 *  - **arbre de layout** : `revalidatePath('/', 'layout')` invalide l'arborescence complète ;
 *  - **tags de cache** : `updateTag` + `revalidateTag(tag, { expire: 0 })` invalident
 *    immédiatement les fonctions serveur étiquetées (`site_pages`, `site_translations`, `page:<slug>`) ;
 *  - **rafraîchissement client** : `refresh()` force la synchronisation de l'état client Next.js.
 */
export async function revalidateSite(paths: string[] = ['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/equipe-cascadeurs-pro', '/cuc-team-cascadeur']) {
  try {
    for (const rawPath of paths) {
      const clean = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      try {
        revalidatePath(clean);
        revalidatePath(clean === '/' ? '/fr' : `/fr${clean}`);
        revalidatePath(clean === '/' ? '/en' : `/en${clean}`);
        revalidatePath(clean === '/' ? '/[locale]' : `/[locale]${clean}`);

        const slug = clean.replace(/^\//, '') || '/';
        revalidateTag(`page:${slug}`, { expire: 0 });
        updateTag(`page:${slug}`);
      } catch {
        /* ignore path revalidation error on edge */
      }
    }

    try {
      revalidatePath('/', 'layout');
    } catch {
      /* ignore */
    }

    for (const tag of SITE_CACHE_TAGS) {
      try {
        revalidateTag(tag, { expire: 0 });
        updateTag(tag);
      } catch {
        /* tag inconnu : sans conséquence, les chemins sont déjà revalidés */
      }
    }

    try {
      refresh();
    } catch {
      /* ignore */
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
