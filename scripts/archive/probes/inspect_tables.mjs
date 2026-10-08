import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(2);
  console.log(`=== Table: ${tableName} ===`);
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample Row 1:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('Empty table');
  }
}

async function main() {
  await inspectTable('site_settings');
  await inspectTable('site_pages');
  await inspectTable('site_programs');
  await inspectTable('site_sessions');
  await inspectTable('site_team');
  await inspectTable('site_films');
  await inspectTable('site_partners');
  await inspectTable('site_events');
  await inspectTable('site_announcements');
  await inspectTable('locations');
  await inspectTable('formations');
}

main();
