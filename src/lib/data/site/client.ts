/**
 * Client Supabase public partagé (fabrique isomorphe) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fabrique Supabase isomorphe pour les lectures publiques du site vitrine.
 *
 * `site-service.ts` est consommé à la fois par des composants clients
 * (`'use client'`) et par des Server Components. Un `createBrowserClient`
 * échoue côté serveur (accès à `document`/`window`) et un client basé sur
 * `next/headers` échoue côté client (build Turbopack).
 *
 * `createPublicClient()` (voir `@/lib/supabase/public`) n'utilise ni cookies
 * ni session : il s'authentifie avec la clé anonyme et lit les contenus
 * publiés via RLS. Il est donc sûr dans les deux contextes.
 */
/**
 * Promesse mémoïsée du client public. `import()` n'est exécuté qu'au premier
 * appel, ce qui sort `@supabase/supabase-js` du graphe de premier chargement
 * des routes publiques (règle `.agents/rules/client_bundle_budget.md` § 3).
 */
let publicClientPromise: Promise<SupabaseClient> | null = null;

/**
 * Retourne (en le chargeant au premier appel) le client Supabase public.
 *
 * Le chargement est **paresseux** : les modules de données ci-dessous sont
 * isomorphes et appelés depuis des composants clients de la vitrine ; le
 * `import()` dynamique garantit que la librairie n'est téléchargée qu'au moment
 * d'une lecture réelle. En cas d'échec, la promesse est réinitialisée pour
 * autoriser une nouvelle tentative.
 */
export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!publicClientPromise) {
    publicClientPromise = import('@/lib/supabase/public').then(
      (mod) => mod.createPublicClient(),
      (error: unknown) => {
        publicClientPromise = null;
        throw error;
      }
    );
  }
  return publicClientPromise;
}
