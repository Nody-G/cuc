/** Sonde ponctuelle : colonnes de site_films + présence de la clé TMDB. */
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const res = await fetch(`${URL_BASE}/rest/v1/site_films?select=*&limit=2`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const rows = await res.json();
console.log('colonnes site_films :', Object.keys(rows[0] ?? {}).join(', '));
console.log('exemple :', JSON.stringify(rows[0], null, 1).slice(0, 900));

const env = readFileSync('.env.local', 'utf8');
const tmdbKeys = [...env.matchAll(/^([A-Z0-9_]*TMDB[A-Z0-9_]*)=/gm)].map((m) => m[1]);
console.log('\nclés TMDB dans .env.local :', tmdbKeys.length ? tmdbKeys.join(', ') : 'aucune');
