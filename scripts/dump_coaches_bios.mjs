import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('site_team')
    .select('id, name, role, title, bio, specialties, notable_credits, order_index')
    .order('order_index', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Trouvé ${data.length} coachs dans site_team :`);
  for (const [idx, c] of data.entries()) {
    console.log(`\n========================================`);
    console.log(`[${idx + 1}/${data.length}] ${c.name} (${c.id})`);
    console.log(`Role: ${c.role}`);
    console.log(`Titre: ${c.title}`);
    console.log(`Spécialités: ${(c.specialties || []).join(', ')}`);
    console.log(`Bio actuelle:\n"${c.bio}"`);
    console.log(`Crédits: ${(c.notable_credits || []).slice(0, 4).join(' | ')}`);
  }
}

run();
