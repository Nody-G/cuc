#!/usr/bin/env node
/**
 * Synchronisation du catalogue des comédiens doublés (56 entrées)
 * dans Supabase (site_settings key='celebrities').
 *
 * Conserve la structure canonique attendue par l'application ({ list: [...] }).
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { DOUBLED_CELEBRITIES } = await import('../src/data/celebrities.ts');
  console.log(`Synchronisation de ${DOUBLED_CELEBRITIES.length} comédiens dans site_settings...`);

  const { error } = await supabase.from('site_settings').upsert({
    key: 'celebrities',
    value: { list: DOUBLED_CELEBRITIES },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' });

  if (error) {
    console.error('Erreur Supabase:', error.message);
    process.exit(1);
  }

  console.log('✓ Synchronisation Supabase réussie avec succès !');
}

run().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
