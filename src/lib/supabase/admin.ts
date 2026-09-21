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
