import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('--- Inspecting Supabase site_settings for cliches ---');
  const { data: settings } = await supabase.from('site_settings').select('*');
  for (const s of settings || []) {
    const str = JSON.stringify(s.value);
    const matches = str.match(/\b(MOD-\d+|INFRA-\d+|CURSUS ÉLITE|HUB OPÉRATIONNEL|GPS ACTIF|100%|déconnexion de l'instinct|ultra-sécurisé)\b/gi);
    if (matches) {
      console.log(`Setting [${s.key}] has matches:`, [...new Set(matches)]);
    }
  }

  console.log('\n--- Inspecting Supabase site_pages for cliches ---');
  const { data: pages } = await supabase.from('site_pages').select('*');
  for (const p of pages || []) {
    const str = JSON.stringify(p);
    const matches = str.match(/\b(MOD-\d+|INFRA-\d+|CURSUS ÉLITE|HUB OPÉRATIONNEL|GPS ACTIF|100%|déconnexion de l'instinct|ultra-sécurisé|instructeurs d'élite)\b/gi);
    if (matches) {
      console.log(`Page [${p.slug}] has matches:`, [...new Set(matches)]);
    }
  }
}

check().catch(console.error);
