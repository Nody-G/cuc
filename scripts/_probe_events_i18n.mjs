/** Sonde ponctuelle : contenu complet des événements en base + piliers du catalogue. */
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const res = await fetch(`${URL_BASE}/rest/v1/site_events?select=*&order=order_index.asc`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const rows = await res.json();
console.log(`=== EVENT ROWS (${rows.length}) ===`);
for (const row of rows) {
    console.log(`\nid: ${row.id}`);
    for (const [key, value] of Object.entries(row)) {
        if (key === 'created_at' || key === 'updated_at' || key === 'image_url') continue;
        console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
}

const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));
const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
console.log('\n=== PILIERS CATALOGUE (eventsAgence.pillars) ===');
(fr.eventsAgence?.pillars ?? []).forEach((pillar, idx) => {
    console.log(`\n[${idx}] FR keys: ${Object.keys(pillar).join(', ')}`);
    console.log(`    FR title: ${pillar.title}`);
    console.log(`    EN title: ${en.eventsAgence?.pillars?.[idx]?.title}`);
    console.log(`    FR desc: ${(pillar.description ?? '').slice(0, 200)}`);
    console.log(`    EN desc: ${(en.eventsAgence?.pillars?.[idx]?.description ?? '').slice(0, 220)}`);
});
