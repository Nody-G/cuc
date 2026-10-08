/**
 * Consigne, dans la revue des fiches films, l'épuisement des sources anglaises
 * pour les dernières fiches sans synopsis EN. Idempotent : la section n'est
 * écrite qu'une fois.
 *
 * Sources interrogées, dans cet ordre :
 *   1. TMDB  `/movie/{id}?language=en-US` (résolu par `metadata.imdb_id`) ;
 *   2. IMDb  `title(id:) { plot { plotText { plainText } } plots(first: 10) }`
 *      avec `x-imdb-user-language: en-US` ;
 *   3. Wikipédia anglophone (`list=search` + `prop=extracts&exintro`).
 *
 * Usage : node scripts/note_films_untranslatable.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dry = process.argv.includes('--dry');
const FILE = 'plans/revue-traductions-films-imdb-en.md';
const MARKER = '## Sources anglaises épuisées';

/** Fiches dont aucune source anglaise ne fournit de synopsis. */
const PENDING_IDS = [
    '6-x-confine-e-s',
    'commissaire-moulin',
    'mon-frere-yves',
    'panique-au-grand-magasin',
    'sauveur-giordano',
];

/**
 * Identifiants IMDb lus EN BASE (jamais devinés) : `metadata.imdb_id`, sinon
 * l'URL IMDb de la fiche.
 */
async function loadPending() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
        console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
        process.exit(1);
    }
    const res = await fetch(
        `${url}/rest/v1/site_films?select=id,title,imdb_url,metadata&id=in.(${PENDING_IDS.join(',')})`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) {
        console.error(`❌ site_films → ${res.status}`);
        process.exit(1);
    }
    const rows = await res.json();
    return PENDING_IDS.map((id) => {
        const row = rows.find((entry) => entry.id === id);
        const fromMeta = row?.metadata?.imdb_id;
        const fromUrl = String(row?.imdb_url || '').match(/tt\d{6,}/);
        const imdb = (typeof fromMeta === 'string' && fromMeta) || (fromUrl ? fromUrl[0] : '—');
        return {
            id,
            title: row?.title ?? id,
            imdb,
            detail:
                id === 'mon-frere-yves'
                    ? 'intrigue IMDb en français uniquement ; Wikipédia EN ne décrit que le roman de Pierre Loti'
                    : 'aucune intrigue IMDb ; aucune entrée Wikipédia anglophone',
        };
    });
}

if (!existsSync(FILE)) {
    console.error(`❌ ${FILE} introuvable — lancez d'abord scripts/seed_films_translations_en_imdb.mjs.`);
    process.exit(1);
}

const current = readFileSync(FILE, 'utf8');
if (current.includes(MARKER)) {
    console.log('Section déjà présente — rien à faire.');
    process.exit(0);
}

const PENDING = await loadPending();
const lines = [];
lines.push('');
lines.push(MARKER);
lines.push('');
lines.push(
    `Constat établi le ${new Date().toISOString()} : **aucune** des fiches ci-dessous ne possède de synopsis anglais sur les trois sources interrogeables (TMDB, IMDb, Wikipédia anglophone).`
);
lines.push('');
lines.push('| id | titre | IMDb | Constat |');
lines.push('|---|---|---|---|');
for (const item of PENDING) {
    lines.push(`| \`${item.id}\` | ${item.title} | ${item.imdb} | ${item.detail} |`);
}
lines.push('');
lines.push('**Décision** : repli français conservé, conformément à la doctrine — une phrase inventée serait plus grave qu’un texte resté en français.');
lines.push(
    'Une traduction humaine reste possible à tout moment : il suffit d’ajouter `{ description: "…" }` dans `site_translations` (entité `film`) pour que la fiche passe en anglais, sans toucher au code.'
);
lines.push('');

if (dry) {
    console.log(lines.join('\n'));
    process.exit(0);
}

writeFileSync(FILE, current.trimEnd() + '\n' + lines.join('\n'), 'utf8');
console.log(`Section ajoutée à ${FILE} (${PENDING.length} fiche(s) documentée(s)).`);
