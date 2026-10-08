/** Sonde ponctuelle : contenu FR restant à traduire par entité. */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function get(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${path} → ${res.status} ${(await res.text()).slice(0, 200)}`);
    return res.json();
}

const programs = await get('site_programs?select=*');
console.log(`\n=== PROGRAMMES (${programs.length}) ===`);
for (const row of programs) {
    console.log(`- ${row.id} | ${row.title}`);
    console.log(`    duration: ${row.duration ?? '—'}`);
    console.log(`    desc: ${(row.description ?? '—').slice(0, 140)}`);
    console.log(`    highlights: ${JSON.stringify(row.highlights ?? []).slice(0, 200)}`);
    console.log(`    modules: ${JSON.stringify(row.modules ?? []).slice(0, 200)}`);
}

const events = await get('site_events?select=*');
console.log(`\n=== ÉVÉNEMENTS (${events.length}) — colonnes : ${Object.keys(events[0] ?? {}).join(', ')} ===`);
for (const row of events) {
    console.log(`- ${row.id} | ${row.title} | ${row.location ?? '—'}`);
    console.log(`    desc: ${(row.description ?? '—').slice(0, 160)}`);
}

const partners = await get('site_partners?select=id,name,description');
console.log(`\n=== PARTENAIRES avec description (${partners.length}) ===`);
for (const row of partners.filter((r) => r.description)) {
    console.log(`- ${row.id} | ${row.name} | ${row.description}`);
}

const films = await get('site_films?select=id,title,description,stunt_roles');
const withDesc = films.filter((f) => f.description);
const withRoles = films.filter((f) => f.stunt_roles);
const distinctDesc = [...new Set(withDesc.map((f) => f.description))];
const distinctRoles = [...new Set(withRoles.map((f) => f.stunt_roles))];
console.log(`\n=== FILMS (${films.length}) ===`);
console.log(`descriptions non nulles : ${withDesc.length} (distinctes : ${distinctDesc.length})`);
console.log(`stunt_roles non nuls : ${withRoles.length} (distincts : ${distinctRoles.length})`);
console.log('\n--- descriptions distinctes (échantillon 25) ---');
for (const value of distinctDesc.slice(0, 25)) console.log(`SAMPLE: ${value}`);
console.log('\n--- stunt_roles distincts (échantillon 25) ---');
for (const value of distinctRoles.slice(0, 25)) console.log(`ROLE: ${value}`);
