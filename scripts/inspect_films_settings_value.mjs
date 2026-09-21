/**
 * Inspecte la structure exacte de site_settings.films pour localiser
 * les libellés douteux. Lecture seule.
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

const { data: row, error } = await supabase
    .from('site_settings')
    .select('key,value,updated_at')
    .eq('key', 'films')
    .maybeSingle();

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

console.log('updated_at:', row?.updated_at);
console.log('Type de value:', typeof row?.value);
console.log('Clés racine:', row?.value ? Object.keys(row.value).join(', ') : '(vide)');

const flat = JSON.stringify(row?.value || {}, null, 2);
console.log('\n--- value (tronqué à 4000 car.) ---');
console.log(flat.slice(0, 4000));

// Localiser les occurrences douteuses
const SUSPECT = /Équipe cascades CUC|Cascadeurs CUC|Doublures cascades CUC|CUC Performers|CUC Team|Performers de Combat|Spécialistes Rigging|Co-fondateur CUC|Stunt Support|Stunt Doubling|Enforcers/i;
const matches = flat.match(new RegExp(`.{0,120}${SUSPECT.source}.{0,120}`, 'gi')) || [];
console.log(`\n--- ${matches.length} occurrence(s) douteuse(s) ---`);
matches.forEach((m) => console.log('…' + m.replace(/\s+/g, ' ') + '…'));
