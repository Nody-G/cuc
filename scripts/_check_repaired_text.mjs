/** Vérification ponctuelle : texte FR de `mon-frere-yves` après réparation. */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const res = await fetch(
    `${URL_BASE}/rest/v1/site_films?select=description&id=eq.mon-frere-yves`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
);
const [row] = await res.json();
const text = row?.description ?? '';
console.log(text);
console.log('\n--- Contrôles ---');
console.log(`apostrophes : ${(text.match(/'/g) ?? []).length}`);
console.log(`formes cassées restantes : ${(text.match(/\b(dune|dun|quil|cest|laidera|senivre|dinitiation|lautre|lextravagance)\b/gi) ?? []).join(', ') || 'aucune'}`);
