import { createClient } from '@supabase/supabase-js';

// Ce client admin utilise la clé secrète côté serveur uniquement.
// Il ne doit JAMAIS être exposé côté client/navigateur.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans les variables d\'environnement.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
