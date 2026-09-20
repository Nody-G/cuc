/**
 * Amorce la mise en avant de Michel Bouis avec des crédits réellement présents
 * au catalogue, puis vérifie que la résolution public (featuredOrder) fonctionne.
 *
 * Objectif : prouver que l'étoilage du Cockpit se persiste dans
 * `site_team.featured_credits` et que la fiche publique le reconnaît malgré le
 * suffixe d'année « (2021) » porté par les crédits IMDb.
 *
 * Usage : node scripts/seed_michel_bouis_featured.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

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
        /* environnement déjà fourni */
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

const COACH_ID = 'michel-bouis';

const { data: team, error: teamErr } = await supabase
    .from('site_team')
    .select('id,name,notable_credits,featured_credits')
    .eq('id', COACH_ID)
    .maybeSingle();
if (teamErr || !team) {
    console.error('Coach introuvable :', teamErr?.message);
    process.exit(1);
}

const { data: films } = await supabase.from('site_films').select('id,title,year');
const catalogue = new Map();
for (const f of films || []) catalogue.set(creditTitleKey(f.title), f);

const credits = team.notable_credits || [];

// Sélectionne les 4 premiers crédits réellement présents au catalogue.
const matched = credits.filter((c) => catalogue.has(creditTitleKey(parseTitle(c))));
const selection = matched.slice(0, 4);

if (selection.length === 0) {
    console.error('Aucun crédit apparié au catalogue : impossible de tester la mise en avant.');
    process.exit(2);
}

console.log('Crédits appariés au catalogue :', matched.length, '/', credits.length);
console.log('Sélection mise en avant :');
selection.forEach((c) => console.log('  ★', c));

const { error: updErr } = await supabase
    .from('site_team')
    .update({ featured_credits: selection })
    .eq('id', COACH_ID);
if (updErr) {
    console.error('Échec écriture featured_credits :', updErr.message);
    process.exit(1);
}

// Relecture + résolution « côté public ».
const { data: after } = await supabase
    .from('site_team')
    .select('featured_credits')
    .eq('id', COACH_ID)
    .maybeSingle();

const featured = after?.featured_credits || [];
const featuredOrder = new Map();
featured.forEach((raw, idx) => featuredOrder.set(creditTitleKey(parseTitle(raw)), idx));

const resolved = (films || []).filter((f) => featuredOrder.has(creditTitleKey(f.title)));

console.log('\nfeatured_credits persistés :', featured.length);
console.log('Films résolus côté public  :', resolved.length);
resolved.forEach((f) => console.log(`  → ${f.title} (${f.year ?? 'n/a'})`));

if (resolved.length !== featured.length) {
    console.log('\n⚠️  Désynchronisation : certaines entrées mises en avant ne résolvent pas.');
    process.exit(3);
}
console.log('\n✅ Mise en avant fonctionnelle de bout en bout.');
