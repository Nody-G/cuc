/**
 * Client Supabase public partagé (fabrique isomorphe) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { createPublicClient } from '@/lib/supabase/public';

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
export function getSupabaseClient() {
  return createPublicClient();
}
