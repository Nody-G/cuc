/**
 * Inspection des descriptions de films (site_films.description).
 * Lecture seule — aucun écrit.
 *
 * Objectif : repérer les descriptions douteuses / inventées / hors-sujet
 * (ex. « Équipe cascadeur CUC ») qui polluent les jaquettes de films.
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
    .select('id,title,year,description')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

console.log(`Total films: ${films.length}\n`);

const withDesc = films.filter((f) => f.description && String(f.description).trim());
console.log(`Avec description : ${withDesc.length}`);
console.log(`Sans description : ${films.length - withDesc.length}\n`);

// Motifs suspects : auto-référence au campus / à l'équipe CUC, slop marketing.
const SUSPECT = /(équipe|equipe)\s*(de\s*)?cascadeur|CUC\b|campus\s*univers|notre\s*équipe|nos\s*cascadeurs|worldwide|hollywood|élite|elite|légendaire|legendaire|gun-?fu|référence\s*suprême|reference\s*supreme|dossier\s*pro|pro\s*staff/i;

const suspects = withDesc.filter((f) => SUSPECT.test(String(f.description)));

console.log(`=== Descriptions suspectes : ${suspects.length} ===\n`);
for (const f of suspects) {
    console.log(`[${f.id}] "${f.title}" (${f.year || '????'})`);
    console.log(`   → ${f.description}\n`);
}

// Distribution : longueur des descriptions (repérer les blocs générés)
console.log('=== Longueurs (top 15 les plus longues) ===');
withDesc
    .slice()
    .sort((a, b) => String(b.description).length - String(a.description).length)
    .slice(0, 15)
    .forEach((f) => {
        console.log(`${String(f.description).length} car. — "${f.title}"`);
    });
