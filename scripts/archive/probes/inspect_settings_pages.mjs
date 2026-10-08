import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: settings } = await supabase.from('site_settings').select('*');
  console.log('site_settings rows:', settings);

  const { data: pages } = await supabase.from('site_pages').select('slug, title, is_published, hero, updated_at');
  console.log('site_pages count:', pages?.length);
  console.log('site_pages slugs:', pages?.map(p => p.slug));
  if (pages && pages[0]) {
    console.log('Sample page columns:', Object.keys(pages[0]));
  }
}
main();
