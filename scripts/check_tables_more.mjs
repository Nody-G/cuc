import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const t1 = await supabase.from('site_audit_logs').select('*').limit(1);
  console.log('site_audit_logs:', t1.error ? t1.error.message : 'exists');
  const t2 = await supabase.from('audit_logs').select('*').limit(1);
  console.log('audit_logs:', t2.error ? t2.error.message : 'exists, rows: ' + t2.data.length);
}
main();
