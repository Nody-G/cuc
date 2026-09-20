/**
 * Vérification de l'appariement crédits ↔ catalogue pour la mise en avant.
 *
 * Objectif : confirmer que le normaliseur canonique `creditTitleKey` (retrait du
 * suffixe d'année « (2021) ») permet bien aux crédits sourcés IMDb de retrouver
 * leur film dans `site_films`. Sans ce retrait, Michel Bouis affichait
 * 0 correspondance sur 44 crédits — la mise en avant était inopérante.
 *
 * Usage : node scripts/verify_featured_matching.mjs [coachId]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Chargement minimal de .env.local (pas de dépendance dotenv).
function loadEnv() {
    try {
        const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* .env.local absent : on s'appuie sur l'environnement. */
    }
}
loadEnv();

/** Réplique exacte de `creditTitleKey` (src/lib/credit-title.ts). */
function creditTitleKey(title) {
    if (!title) return '';
    return title
        .trim()
        .replace(/\s*\(\s*\d{4}\s*(?:[-\u2013\u2014]\s*\d{4}\s*)?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Réplique de `parseCredit` (src/types/index.ts) pour le titre seul. */
function parseTitle(credit) {
    const raw = (credit || '').trim();
    if (raw.includes(' \u2014 ')) return raw.split(' \u2014 ')[0].trim();
    const m = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (m && !/^\d{4}$/.test(m[2].trim())) return m[1].trim();
    return raw;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const coachId = process.argv[2] || 'michel-bouis';

const { data: team, error: teamErr } = await supabase
    .from('site_team')
    .select('id,name,notable_credits,featured_credits,credits_display_limit')
    .eq('id', coachId)
    .maybeSingle();

if (teamErr) {
    console.error('Erreur site_team :', teamErr.message);
    process.exit(1);
}
if (!team) {
    console.error(`Coach « ${coachId} » introuvable.`);
    process.exit(1);
}

const { data: films, error: filmsErr } = await supabase
    .from('site_films')
    .select('id,title');
if (filmsErr) {
    console.error('Erreur site_films :', filmsErr.message);
    process.exit(1);
}

const catalogue = new Map();
for (const f of films || []) catalogue.set(creditTitleKey(f.title), f);

const credits = team.notable_credits || [];
const featured = team.featured_credits || [];

let matched = 0;
const hors = [];
for (const c of credits) {
    const title = parseTitle(c);
    if (catalogue.has(creditTitleKey(title))) matched++;
    else hors.push(title);
}

console.log('==================================================');
console.log(`Coach          : ${team.name} (${team.id})`);
console.log(`notable_credits: ${credits.length}`);
console.log(`featured       : ${featured.length} ${JSON.stringify(featured)}`);
console.log(`limite affichée: ${team.credits_display_limit}`);
console.log(`catalogue      : ${(films || []).length} films`);
console.log('--------------------------------------------------');
console.log(`MATCH catalogue: ${matched} / ${credits.length}`);
console.log(`HORS catalogue : ${hors.length}`);
console.log('==================================================');

if (hors.length) {
    console.log('\nCrédits hors catalogue (les 20 premiers) :');
    hors.slice(0, 20).forEach((h) => console.log(`  - ${h}`));
}

// Contrôle de cohérence de la mise en avant : chaque entrée étoilée doit
// correspondre à un crédit réel du formateur.
if (featured.length) {
    const creditKeys = new Set(credits.map((c) => creditTitleKey(parseTitle(c))));
    const orphelins = featured.filter(
        (f) => !creditKeys.has(creditTitleKey(parseTitle(f)))
    );
    console.log(
        `\nMise en avant orpheline (étoilée mais absente des crédits) : ${orphelins.length}`
    );
    orphelins.forEach((o) => console.log(`  ! ${o}`));
}

if (matched === 0 && credits.length > 0) {
    console.log(
        '\n⚠️  AUCUNE correspondance : régression de normalisation (le suffixe d’année n’est pas retiré).'
    );
    process.exit(2);
}
