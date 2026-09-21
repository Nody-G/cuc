import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase navigateur, MÉMOÏSÉ (singleton par contexte navigateur).
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
 *
 * Pourquoi `globalThis` plutôt qu'une variable de module :
 * -------------------------------------------------------
 * L'application possède désormais DEUX layouts racines — `(site)/[locale]/layout.tsx`
 * et `(admin)/layout.tsx`. Turbopack peut alors dupliquer un module dans
 * plusieurs bundles (un par grappe de routes) : une variable de module serait
 * instanciée deux fois et créerait un second `GoTrueClient` sur la même
 * `storageKey`. `globalThis` est unique par contexte navigateur : il survit à la
 * duplication de modules, au code splitting et au HMR.
 *
 * Note SSR : la mémoïsation est strictement limitée au navigateur. Côté serveur,
 * un client neuf est créé à chaque appel pour ne jamais partager d'état
 * d'authentification entre requêtes.
 *
 * Note : le client anonyme de `@/lib/supabase/public` utilise volontairement une
 * `storageKey` DISTINCTE (registre statique `GoTrueClient.nextInstanceID`) — voir
 * l'en-tête de ce fichier pour le détail.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

/**
 * Forme de `globalThis` portant le singleton navigateur.
 * La propriété est écrite littéralement pour rester vérifiable par TypeScript.
 */
interface SupabaseBrowserGlobal {
  __cuc_supabase_browser_client__?: SupabaseClient;
}

/**
 * Retourne le client Supabase navigateur (singleton).
 *
 * Côté serveur, un client neuf est créé à chaque appel (pas de fuite d'état
 * entre requêtes) ; côté navigateur, l'instance est réutilisée, y compris si ce
 * module est dupliqué dans plusieurs bundles.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const globalCache = globalThis as unknown as SupabaseBrowserGlobal;

  if (!globalCache.__cuc_supabase_browser_client__) {
    globalCache.__cuc_supabase_browser_client__ = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }

  return globalCache.__cuc_supabase_browser_client__;
}
