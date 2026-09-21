/**
 * Sonde : le défaut d'import a-t-il supprimé TOUTES les apostrophes ?
 * Si oui, le signal fiable est « texte long, sans aucune apostrophe, contenant
 * des élisions » — bien plus sûr qu'une détection mot à mot.
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    return res.ok ? res.json() : [];
}

const check = (label, list, pick) => {
    let withApos = 0;
    let withoutApos = 0;
    let withoutAposAndLong = 0;
    const samples = [];
    for (const row of list) {
        const text = pick(row);
        if (typeof text !== 'string' || text.length < 40) continue;
        if (text.includes("'")) {
            withApos += 1;
        } else {
            withoutApos += 1;
            if (/[a-zà-ÿ]{4,}/i.test(text) && /\b\w*(dune|dun|quil|cest|senivre|laidera|dinitiation|davoir|lattirent|lhomme|dun|lautre|letait)\b/i.test(text)) {
                withoutAposAndLong += 1;
                if (samples.length < 5) samples.push(`${row.id ?? row.slug}: ${text.slice(0, 110)}…`);
            }
        }
    }
    console.log(`\n${label}`);
    console.log(`  avec apostrophe(s) : ${withApos}`);
    console.log(`  sans apostrophe    : ${withoutApos}`);
    console.log(`  sans apostrophe ET élisions cassées : ${withoutAposAndLong}`);
    for (const sample of samples) console.log(`   ${sample}`);
};

const films = await rows('site_films?select=id,description');
check('Films (description)', films, (row) => row.description);

const team = await rows('site_team?select=id,bio');
check('Coachs (bio)', team, (row) => row.bio);

const partners = await rows('site_partners?select=id,description');
check('Partenaires (description)', partners, (row) => row.description);

const events = await rows('site_events?select=id,description');
check('Événements (description)', events, (row) => row.description);
