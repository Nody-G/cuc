import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data: locs, error: errLocs } = await supabase.from('locations').select('id, name, type');
  console.log('--- LOCATIONS ---');
  console.log(JSON.stringify(locs, null, 2));

  const { data: profs, error: errProfs } = await supabase.from('profiles').select('id, full_name, email, role');
  console.log('--- PROFILES ---');
  console.log(JSON.stringify(profs, null, 2));

  const { data: forms, error: errForms } = await supabase.from('formations').select('id, title, status, start_date, end_date');
  console.log('--- FORMATIONS ---');
  console.log(JSON.stringify(forms, null, 2));
}

inspect();
