/**
 * Inspection des champs `doubled_actors` et `metadata` de site_films.
 * Recherche de libellés douteux / auto-référentiels (CUC, équipe, campus).
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
    .select('id,title,year,doubled_actors,metadata,cuc_team_involved')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

const SUSPECT = /CUC|campus|équipe|equipe|cascadeur\s*cuc|stunt\s*team/i;

console.log('=== doubled_actors suspects ===');
let n1 = 0;
for (const f of films) {
    const arr = Array.isArray(f.doubled_actors) ? f.doubled_actors : [];
    for (const a of arr) {
        if (SUSPECT.test(String(a))) {
            n1++;
            console.log(`[${f.id}] "${f.title}" → "${a}"`);
        }
    }
}
console.log(`Total : ${n1}\n`);

console.log('=== metadata suspects (toutes clés) ===');
let n2 = 0;
for (const f of films) {
    const meta = f.metadata || {};
    const flat = JSON.stringify(meta);
    if (SUSPECT.test(flat)) {
        n2++;
        console.log(`[${f.id}] "${f.title}" → ${flat}`);
    }
}
console.log(`Total : ${n2}\n`);

console.log('=== Valeurs distinctes de metadata.cuc_team_roles ===');
const roleVals = new Map();
for (const f of films) {
    const roles = f.metadata?.cuc_team_roles || {};
    for (const v of Object.values(roles)) {
        roleVals.set(v, (roleVals.get(v) || 0) + 1);
    }
}
[...roleVals.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([v, n]) => console.log(`${String(n).padStart(4)} × "${v}"`));

console.log('\n=== Exemples de doubled_actors (10 premiers non vides) ===');
let shown = 0;
for (const f of films) {
    const arr = Array.isArray(f.doubled_actors) ? f.doubled_actors : [];
    if (arr.length > 0 && shown < 10) {
        shown++;
        console.log(`[${f.id}] "${f.title}" → ${arr.join(' | ')}`);
    }
}
