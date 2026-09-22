'use server';

/**
 * Revalidation vitrine — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { revalidatePath, updateTag } from 'next/cache';

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
 * Double filet, parce que les deux moitiés du cache sont indépendantes :
 *  - **chemins** : la voie française **et** la voie anglaise (`/en/...`) — sans
 *    quoi une modification n'apparaissait jamais en anglais ;
 *  - **tags** : `updateTag` invalide les lectures mises en cache par tag
 *    (`site_pages`, `site_translations`, …), ce que la revalidation de chemin
 *    ne couvre pas.
 */
export async function revalidateSite(paths: string[] = ['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/equipe-cascadeurs-pro', '/cuc-team-cascadeur']) {
  try {
    for (const path of paths) {
      revalidatePath(path);
      // Miroir anglais : la même page existe sous `/en/...`.
      revalidatePath(path === '/' ? '/en' : `/en${path}`);
    }

    for (const tag of SITE_CACHE_TAGS) {
      try {
        updateTag(tag);
      } catch {
        /* tag inconnu : sans conséquence, les chemins sont déjà revalidés */
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
