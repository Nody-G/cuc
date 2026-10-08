import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function testSqlApi() {
  const endpoints = [
    '/pg/query',
    '/database/query',
    '/rest/v1/rpc/exec',
    '/rest/v1/rpc/execute',
    '/rest/v1/rpc/run_sql'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${supabaseUrl}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'SELECT 1;', sql: 'SELECT 1;' })
      });
      console.log(`${ep}: status ${res.status}`);
      if (res.status !== 404) {
        const text = await res.text();
        console.log(`${ep} body:`, text);
      }
    } catch (e) {
      console.log(`${ep} error:`, e.message);
    }
  }
}

testSqlApi();
