/**
 * ⚠️ OBSOLÈTE — sonde intermédiaire, remplacée par `scripts/audit_text_integrity.mjs`.
 * Son détecteur (lettre d'élision + voyelle) matchait des mots légitimes
 * (« tranquille », « formation ») : 501 films signalés pour 1 réellement touché.
 *
 * Sonde : mesure les apostrophes perdues à l'import dans les textes FR éditoriaux.
 * Motif typique : « dune », « dun », « laidera », « dinitiation », « quil », « cest ».
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const SUSPICIOUS =
    /\b(l|d|qu|n|j|m|t|s|c|jusqu|lorsqu|puisqu|presqu)(?=[a-zà-ÿ]{2,})/g;

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.warn(`  ${path} → HTTP ${res.status}`);
        return [];
    }
    return res.json();
}

function scan(label, list, pick) {
    let affected = 0;
    const samples = [];
    for (const row of list) {
        const texts = pick(row).filter((value) => typeof value === 'string');
        let hits = 0;
        for (const text of texts) {
            const matches = text.match(SUSPICIOUS) ?? [];
            hits += matches.length;
            if (matches.length && samples.length < 6) {
                const index = text.search(SUSPICIOUS);
                samples.push(`${row.id ?? row.slug}: …${text.slice(Math.max(0, index - 30), index + 40)}…`);
            }
        }
        if (hits > 0) affected += 1;
    }
    console.log(`\n${label} : ${affected}/${list.length} ligne(s) suspecte(s)`);
    for (const sample of samples) console.log(`   ${sample}`);
    return affected;
}

const films = await rows('site_films?select=id,description');
scan('Films (description)', films, (row) => [row.description]);

const team = await rows('site_team?select=id,bio,title,role');
scan('Coachs (bio/title/role)', team, (row) => [row.bio, row.title, row.role]);

const partners = await rows('site_partners?select=id,description');
scan('Partenaires (description)', partners, (row) => [row.description]);

const events = await rows('site_events?select=id,description,subtitle');
scan('Événements (description/subtitle)', events, (row) => [row.description, row.subtitle]);

const pages = await rows('site_pages?select=slug,sections_data');
scan('Pages (sections_data)', pages, (row) => [JSON.stringify(row.sections_data ?? '')]);
