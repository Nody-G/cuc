/** Sonde ponctuelle : source réelle des installations + overlays EN semés. */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function probe(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) return `HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`;
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [rows];
}

const tableProbe = await probe('site_campus_facilities?select=id&limit=3');
console.log('1) table site_campus_facilities :', JSON.stringify(tableProbe).slice(0, 300));

const keys = await probe('site_settings?select=key&order=key.asc');
console.log('2) site_settings — clés :', Array.isArray(keys) ? keys.map((r) => r.key).join(', ') : keys);

const settings = await probe('site_settings?select=value&key=eq.campus_facilities');
const list = settings?.[0]?.value?.list ?? [];
console.log('2b) site_settings.campus_facilities :', list.length, 'entrée(s) —', list.map((f) => f.id).join(', '));

const overlays = await probe('site_translations?select=entity_id,is_published&entity=eq.campus_facility&locale=eq.en');
console.log('3) overlays campus_facility :', JSON.stringify(overlays).slice(0, 400));
