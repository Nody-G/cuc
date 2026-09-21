import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

/**
 * Indique si la clé de service est réellement configurée.
 *
 * Sans elle, `createAdminClient()` retombe sur la clé publique : les lectures
 * passent (politiques RLS publiques) mais **toutes les écritures sont
 * refusées** par RLS. Le repli évite de casser le Cockpit, au prix d'un échec
 * silencieux côté écriture — d'où cette fonction, qui permet de le diagnostiquer
 * au lieu de le subir.
 */
export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Famille d'une clé Supabase, déduite sans jamais exposer le jeton.
 *
 * Supabase sert deux générations de clés, et les confondre mène à un faux
 * diagnostic :
 *  - **JWT historiques** (`eyJ…`) : le rôle est dans la revendication `role`
 *    (`service_role` ou `anon`) ;
 *  - **clés récentes** : `sb_secret_…` (équivalent service) et
 *    `sb_publishable_…` (équivalent public), qui ne sont pas des JWT et dont
 *    le rôle n'est lisible nulle part.
 */
export type SupabaseKeyFamily =
  | 'jwt-service-role'
  | 'jwt-anon'
  | 'secret'
  | 'publishable'
  | 'unknown';

function readKeyFamily(token: string): SupabaseKeyFamily {
  if (token.startsWith('sb_secret_')) return 'secret';
  if (token.startsWith('sb_publishable_')) return 'publishable';

  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
        role?: unknown;
      };
      if (payload.role === 'service_role') return 'jwt-service-role';
      if (payload.role === 'anon') return 'jwt-anon';
    } catch {
      return 'unknown';
    }
  }
  return 'unknown';
}

/** Familles autorisées à écrire en contournant les politiques RLS. */
export function isServiceKeyFamily(family: SupabaseKeyFamily): boolean {
  return family === 'jwt-service-role' || family === 'secret';
}

/**
 * Décrit la clé de service configurée **sans la divulguer**.
 *
 * Deux erreurs de configuration produisent exactement le même échec RLS que
 * l'absence de clé, et sont indiscernables sans cette lecture :
 *  - la variable contient la **clé publique** (rôle `anon`) collée par erreur ;
 *  - une valeur entourée d'espaces ou de guillemets, fréquente lors d'un
 *    copier-coller dans un tableau de bord d'hébergeur.
 *
 * Seul le rôle est retourné : jamais la clé, jamais un préfixe de la clé.
 */
export function describeServiceRoleKey(): {
  configured: boolean;
  family: SupabaseKeyFamily;
  hasSurroundingWhitespace: boolean;
} {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!raw) return { configured: false, family: 'unknown', hasSurroundingWhitespace: false };

  return {
    configured: true,
    family: readKeyFamily(raw.trim().replace(/^["']|["']$/g, '')),
    hasSurroundingWhitespace: raw !== raw.trim(),
  };
}

export function createAdminClient() {
  if (!hasServiceRoleKey()) {
    // Trace serveur explicite : sans clé de service, les écritures sont
    // refusées par RLS (code 42501). Le repli sur la clé publique maintient
    // les lectures, mais il ne doit pas passer inaperçu dans les logs.
    console.warn(
      '[supabase/admin] SUPABASE_SERVICE_ROLE_KEY absente : repli sur la clé publique. ' +
      'Les lectures passeront, les écritures seront refusées par les politiques RLS.'
    );
  }

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
