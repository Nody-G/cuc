/** Sonde ponctuelle : textes FR intégraux des 5 fiches films restantes. */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const IDS = [
    '6-x-confine-e-s',
    'commissaire-moulin',
    'mon-frere-yves',
    'panique-au-grand-magasin',
    'sauveur-giordano',
];

const res = await fetch(
    `${URL_BASE}/rest/v1/site_films?select=id,title,year,description&id=in.(${IDS.join(',')})`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
);
if (!res.ok) {
    console.error(`HTTP ${res.status}`);
    process.exit(1);
}
const rows = await res.json();
for (const id of IDS) {
    const row = rows.find((entry) => entry.id === id);
    console.log(`\n### ${id} — ${row?.title ?? '?'} (${row?.year ?? '—'})`);
    console.log(row?.description ?? '(vide)');
}
