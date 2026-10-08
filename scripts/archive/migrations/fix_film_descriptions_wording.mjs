/**
 * Correction ciblée du libellé des descriptions de films déjà écrites.
 * Corrige uniquement les tournures fautives issues de la substitution :
 *  - « combats rapprochés cartoonesque » → « combats rapprochés cartoonesques »
 *  - « parkour et de Parkour » / « parkour et Parkour » → « Parkour »
 *
 * Usage : node scripts/fix_film_descriptions_wording.mjs [--write]
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const WRITE = process.argv.includes('--write');

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};

const supabase = createClient(
    get('NEXT_PUBLIC_SUPABASE_URL') || get('SUPABASE_URL'),
    get('SUPABASE_SECRET_KEY') || get('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } }
);

const FIXES = [
    [/combats rapprochés cartoonesque/gi, 'combats rapprochés cartoonesques'],
    [/parkour\s+et\s+(?:de\s+)?Parkour/gi, 'Parkour'],
    [/Parkour\s+et\s+(?:de\s+)?parkour/gi, 'Parkour'],
    [/Pionniers mondiaux du parkour et de Parkour/gi, 'Pionniers mondiaux du Parkour'],
];

const { data: films, error } = await supabase
    .from('site_films')
    .select('id, title, description');

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

let fixed = 0;
for (const f of films) {
    const before = String(f.description || '');
    if (!before) continue;
    let after = before;
    for (const [re, rep] of FIXES) after = after.replace(re, rep);
    if (after === before) continue;

    console.log(`• ${f.title}`);
    console.log(`    avant : ${before}`);
    console.log(`    après : ${after}`);

    if (WRITE) {
        const { error: e } = await supabase
            .from('site_films')
            .update({ description: after })
            .eq('id', f.id);
        if (e) {
            console.error(`    ✗ ${e.message}`);
            continue;
        }
    }
    fixed++;
}

console.log(`\n${WRITE ? 'Corrigées' : 'À corriger'} : ${fixed} fiches`);
if (!WRITE) console.log('Relancer avec --write pour appliquer.');
