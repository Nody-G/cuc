import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: pages } = await supabase.from('site_pages').select('slug, title, hero, sections, layout_sections, sections_data');
  for (const p of pages || []) {
    console.log(`--- Page: ${p.slug} (${p.title}) ---`);
    console.log('Hero title:', p.hero?.title);
    console.log('Layout sections count:', p.layout_sections?.length || 0);
    console.log('Sections count:', p.sections?.length || 0);
    console.log('Sections data keys:', Object.keys(p.sections_data || {}));
  }
}
main();
