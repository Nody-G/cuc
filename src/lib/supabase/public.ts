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
 *
 * Pourquoi une `storageKey` DÉDIÉE (et non la valeur par défaut) ?
 * ---------------------------------------------------------------
 * `GoTrueClient` tient un registre **statique** indexé par `storageKey` :
 *
 *   this.instanceID = GoTrueClient.nextInstanceID[this.storageKey] ?? 0
 *   GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1
 *   if (this.instanceID > 0 && isBrowser()) console.warn('Multiple GoTrueClient instances…')
 *
 * Côté navigateur, ce client anonyme coexistait avec le client d'authentification
 * de `@/lib/supabase/client` (même `sb-<ref>-auth-token` par défaut) : le second
 * créé recevait `instanceID = 1`, d'où l'avertissement au démarrage du site —
 * émis depuis un unique composant, [`CucFilmsShowcase`](src/components/sections/films/CucFilmsShowcase.tsx),
 * qui consomme `getFilms()` et `createClient()` dans le même effet.
 *
 * Une `storageKey` distincte acte la vérité : ce client est un **lecteur anonyme
 * sans session**, il n'appartient pas à l'espace de stockage d'authentification.
 * Comme `persistSession` et `autoRefreshToken` sont désactivés, il n'écrit jamais
 * dans `localStorage` et n'ouvre aucun `BroadcastChannel` : la collision disparaît
 * à la racine, sans jamais partager l'état de session d'un visiteur connecté.
 */

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

/**
 * Espace de stockage réservé au client anonyme du site vitrine.
 * Volontairement distinct de `sb-<ref>-auth-token` (client d'authentification)
 * pour ne jamais entrer en collision dans `GoTrueClient.nextInstanceID`.
 */
const PUBLIC_STORAGE_KEY = 'cuc-site-public-anon';

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
            storageKey: PUBLIC_STORAGE_KEY,
        },
    });

    return cachedClient;
}
