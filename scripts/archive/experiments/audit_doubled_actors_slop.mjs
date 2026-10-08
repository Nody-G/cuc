/**
 * Audit complet du champ `doubled_actors` de site_films.
 * Objectif : lister TOUTES les entrées et repérer celles qui sont
 * auto-référentielles / inventées (CUC, équipe, campus, performers...).
 * Lecture seule — aucun écrit.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => {
    const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};

const url = get('NEXT_PUBLIC_SUPABASE_URL') || get('SUPABASE_URL');
const key = get('SUPABASE_SECRET_KEY') || get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: films, error } = await supabase
    .from('site_films')
    .select('id,title,year,doubled_actors')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

const withDoubled = films.filter(
    (f) => Array.isArray(f.doubled_actors) && f.doubled_actors.length > 0
);

console.log(`Films avec doubled_actors : ${withDoubled.length} / ${films.length}\n`);

// Motifs auto-référentiels / inventés
const SELF_REF = /CUC|campus|équipe|equipe|performers?|stunt\s*(support|doubling)?|team|spécialistes|specialistes|coordinateur|coordination/i;

console.log('=== Entrées auto-référentielles / inventées ===\n');
let n = 0;
for (const f of withDoubled) {
    const bad = f.doubled_actors.filter((a) => SELF_REF.test(String(a)));
    if (bad.length > 0) {
        n += bad.length;
        console.log(`[${f.id}] "${f.title}" (${f.year || '????'})`);
        for (const b of bad) console.log(`   ✗ "${b}"`);
        console.log('');
    }
}
console.log(`Total entrées douteuses : ${n}\n`);

console.log('=== TOUTES les entrées doubled_actors (pour revue) ===\n');
for (const f of withDoubled) {
    console.log(`[${f.id}] "${f.title}" → ${f.doubled_actors.map((a) => `"${a}"`).join(' | ')}`);
}
