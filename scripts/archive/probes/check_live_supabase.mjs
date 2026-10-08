import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Testing Supabase Connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (error) {
      return { table: tableName, exists: false, error: error.message };
    }
    return { table: tableName, exists: true, count, sample: data?.length };
  } catch (err) {
    return { table: tableName, exists: false, error: err.message };
  }
}

async function main() {
  const tablesToCheck = [
    // CUC Vitrine / Cockpit tables
    'site_programs',
    'site_sessions',
    'site_team',
    'site_films',
    'site_pages',
    'site_partners',
    'site_events',
    'site_announcements',
    'site_settings',
    'site_inquiries',
    'site_disciplines',
    'site_campus_pois',
    // CUC Sign tables
    'profiles',
    'students',
    'formations',
    'groups',
    'group_memberships',
    'locations',
    'slots',
    'signatures',
    'evaluation_disciplines'
  ];

  console.log('Checking tables in Supabase...');
  for (const t of tablesToCheck) {
    const res = await checkTable(t);
    console.log(JSON.stringify(res));
  }
}

main();
