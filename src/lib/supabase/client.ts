import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase navigateur, MÉMOÏSÉ (singleton).
 *
 * Pourquoi la mémoïsation est indispensable :
 * -------------------------------------------
 * `createBrowserClient` instancie un client GoTrue complet (stockage de session,
 * écouteur `storage`, verrou d'authentification). Appelé à chaque montage de
 * hook — `useNavigation`, `useFooter`, `useSocialLinks`, `usePageDynamicContent`
 * — il produisait l'avertissement en production :
 *
 *   "Multiple GoTrueClient instances detected in the same browser context."
 *
 * Au-delà du bruit en console, plusieurs instances se disputent le même
 * `localStorage` et peuvent provoquer des désynchronisations de session.
 * Un singleton par contexte navigateur élimine le problème à la racine.
 *
 * Note SSR : `createBrowserClient` est sûr côté serveur (il ne touche pas à
 * `document` tant qu'aucune session n'est lue), mais la mémoïsation est
 * volontairement limitée au navigateur pour ne jamais partager d'état
 * d'authentification entre requêtes serveur.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

let browserClient: SupabaseClient | null = null;

/**
 * Retourne le client Supabase navigateur (singleton).
 *
 * Côté serveur, un client neuf est créé à chaque appel (pas de fuite d'état
 * entre requêtes) ; côté navigateur, l'instance est réutilisée.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return browserClient;
}
