import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('site_pages').select('*').limit(1);
  if (data && data[0]) {
    console.log('Columns in site_pages:', Object.keys(data[0]));
    console.log('Sample row sections:', JSON.stringify(data[0].sections)?.substring(0, 100));
    console.log('Has layout_sections?', 'layout_sections' in data[0]);
    console.log('Has sections_data?', 'sections_data' in data[0]);
  }
}
main();
