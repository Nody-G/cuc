/**
 * Distribution des valeurs du champ `tag` (badge affiché sur la jaquette)
 * + recherche de motifs douteux (auto-référence CUC, slop marketing).
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
    .select('id,title,year,tag,category,director,stunt_roles')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

const tags = new Map();
for (const f of films) {
    const t = (f.tag || '(vide)').trim();
    tags.set(t, (tags.get(t) || 0) + 1);
}

console.log('=== Distribution des tags ===');
[...tags.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([t, n]) => console.log(`${String(n).padStart(4)} × "${t}"`));

console.log('\n=== Tags suspects (CUC / campus / équipe / slop) ===');
const SUSPECT = /CUC|campus|équipe|equipe|cascadeur|worldwide|hollywood|élite|elite|légendaire|legendaire|pro\s*staff|référence/i;
for (const f of films) {
    if (SUSPECT.test(String(f.tag || ''))) {
        console.log(`[${f.id}] "${f.title}" tag="${f.tag}"`);
    }
}

console.log('\n=== stunt_roles suspects ===');
for (const f of films) {
    if (SUSPECT.test(String(f.stunt_roles || ''))) {
        console.log(`[${f.id}] "${f.title}" stunt_roles="${f.stunt_roles}"`);
    }
}
