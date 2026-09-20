import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('--- Syncing clean DOUBLED_CELEBRITIES to Supabase site_settings ---');
  
  const content = fs.readFileSync('src/data/celebrities.ts', 'utf8');
  const match = content.match(/export const DOUBLED_CELEBRITIES: DoubledCelebrity\[\] = (\[[\s\S]*?\]);\s*$/);
  if (!match) {
    throw new Error('Could not parse DOUBLED_CELEBRITIES from src/data/celebrities.ts');
  }
  
  const DOUBLED_CELEBRITIES = eval(match[1]);
  console.log(`Loaded ${DOUBLED_CELEBRITIES.length} clean celebrities.`);
  
  const { error } = await supabase
    .from('site_settings')
    .upsert({
      key: 'celebrities',
      value: { list: DOUBLED_CELEBRITIES },
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    
  if (error) {
    console.error('❌ Error updating site_settings (celebrities):', error.message);
    process.exit(1);
  } else {
    console.log('✅ Successfully updated Supabase site_settings key="celebrities" with clean factual data!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
