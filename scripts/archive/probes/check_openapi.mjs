import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function testEndpoint() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    const data = await res.json();
    console.log('Available definitions in OpenAPI schema:', Object.keys(data.definitions || {}));
  } catch (e) {
    console.log('Error fetching OpenAPI schema:', e.message);
  }
}

testEndpoint();
