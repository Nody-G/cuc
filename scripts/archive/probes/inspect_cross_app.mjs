import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name, first_name, last_name, role');
  console.log('=== PROFILES in Supabase ===');
  console.log(profiles);

  const { data: formations } = await supabase.from('formations').select('id, name, start_date, end_date, type, is_active');
  console.log('=== FORMATIONS in Supabase ===');
  console.log(formations);

  const { data: locations } = await supabase.from('locations').select('id, name, type');
  console.log('=== LOCATIONS in Supabase ===');
  console.log(locations);

  const { data: sessions } = await supabase.from('site_sessions').select('id, program_id, date_display, cuc_sign_formation_id');
  console.log('=== SITE_SESSIONS in Supabase ===');
  console.log(sessions);
}

main();
