/**
 * [Domain] — Accès paresseux au client Supabase navigateur.
 *
 * Le client (`@/lib/supabase/client`) embarque `@supabase/supabase-js`, une
 * librairie pesant plus de 150 Ko gzip. Sur la vitrine publique et dans la
 * coquille (navigation, pied de page, réseaux sociaux), elle n'est utile
 * qu'au moment où une donnée n'a pas déjà été fournie par le serveur.
 *
 * Ce module est l'**unique point d'accès** qui décide quand la charger : le
 * `import()` dynamique la sort du graphe de premier chargement. Règle
 * canonique : `.agents/rules/client_bundle_budget.md` § 3.
 *
 * SRP : aucun hook, aucune dépendance React, aucun état d'UI. Service pur,
 * typé, testable hors du cycle de vie d'un composant.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Promesse mémoïsée du client navigateur. `import()` n'est exécuté qu'au
 * premier appel ; les appels suivants réutilisent la même promesse. Le client
 * lui-même reste mémoïsé côté `globalThis` par `@/lib/supabase/client`.
 */
let browserClientPromise: Promise<SupabaseClient> | null = null;

/**
 * Charge (au premier appel) puis retourne le client Supabase navigateur.
 *
 * La librairie `@supabase/supabase-js` n'est téléchargée qu'à cet instant :
 * les routes publiques dont la donnée vient du serveur ne la paient jamais.
 * En cas d'échec du `import()`, la promesse est réinitialisée pour autoriser
 * une nouvelle tentative.
 */
export function loadSupabaseBrowserClient(): Promise<SupabaseClient> {
    if (!browserClientPromise) {
        browserClientPromise = import('./client').then(
            (mod) => mod.createClient(),
            (error: unknown) => {
                browserClientPromise = null;
                throw error;
            }
        );
    }
    return browserClientPromise;
}
