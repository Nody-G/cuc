import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Client Supabase public, isomorphe et sans dépendance à `next/headers`.
 *
 * Ce client est destiné aux **lectures publiques anonymes** du site vitrine
 * (contenus publiés : programmes, équipe, films, partenaires, pages, etc.).
 *
 * Pourquoi ne pas utiliser `@/lib/supabase/server` ici ?
 * ------------------------------------------------------
 * `server.ts` importe `cookies()` depuis `next/headers`, une API strictement
 * réservée aux Server Components. Or `site-service.ts` est consommé à la fois
 * par des composants clients (`'use client'`) et par des Server Components.
 * Importer `next/headers` dans un graphe client fait échouer le build Turbopack :
 *
 *   "You're importing a module that depends on next/headers."
 *
 * Ce client n'utilise ni cookies ni session : il s'authentifie avec la clé
 * anonyme (`anon`), ce qui suffit pour lire les lignes protégées par les
 * politiques RLS « lecture publique ». Il est donc sûr dans les deux contextes.
 *
 * Pour les opérations authentifiées (Cockpit, Server Actions), continuer
 * d'utiliser `@/lib/supabase/server` (cookies) ou `@/lib/supabase/admin`
 * (service role).
 */

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

let cachedClient: SupabaseClient | null = null;

/**
 * Retourne un client Supabase public (anon), mémoïsé.
 *
 * Mémoïsation : évite de recréer un client à chaque appel de lecture
 * (30 appels dans `site-service.ts`) tout en restant compatible SSR/CSR.
 */
export function createPublicClient(): SupabaseClient {
    if (cachedClient) return cachedClient;

    cachedClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });

    return cachedClient;
}
