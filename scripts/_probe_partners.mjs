/** Sonde ponctuelle : partenaires en base (nom, catégorie, description). */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const res = await fetch(
    `${URL_BASE}/rest/v1/site_partners?select=*&order=order_index.asc`,
    { headers: HEADERS }
);
if (!res.ok) {
    console.error(`HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
    process.exit(1);
}
const rows = await res.json();
console.log(`${rows.length} partenaire(s) en base :`);
for (const row of rows) {
    console.log(`- [${row.category}] ${row.name} (${row.id})`);
    console.log(`    role: ${row.role ?? '—'}`);
    console.log(`    desc: ${(row.description ?? '—').slice(0, 160)}`);
}
