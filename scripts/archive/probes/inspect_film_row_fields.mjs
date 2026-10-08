/**
 * Dump de la structure complète d'une ligne site_films + recherche
 * du motif « équipe cascadeur CUC » dans TOUS les champs texte.
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
    .select('*')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

console.log('COLONNES:', Object.keys(films[0]).join(', '));
console.log('\n--- Exemple de ligne ---');
console.log(JSON.stringify(films[0], null, 2));

// Recherche du motif dans tous les champs texte de toutes les lignes
const NEEDLE = /(équipe|equipe)\s*(de\s*)?cascadeur\s*cuc|cascadeur\s*cuc|cuc\s*stunt\s*team/i;

console.log('\n=== Occurrences du motif « équipe cascadeur CUC » ===');
let hits = 0;
for (const f of films) {
    for (const [k, v] of Object.entries(f)) {
        if (typeof v === 'string' && NEEDLE.test(v)) {
            hits++;
            console.log(`[${f.id}] champ "${k}" : ${v}`);
        }
    }
}
console.log(`Total occurrences : ${hits}`);

// Recherche large : toute description contenant « CUC » ou « campus »
console.log('\n=== Descriptions contenant CUC / campus / notre équipe ===');
for (const f of films) {
    const d = String(f.description || '');
    if (/CUC|campus|notre\s*équipe|nos\s*cascadeurs/i.test(d)) {
        console.log(`[${f.id}] "${f.title}" → ${d}`);
    }
}
