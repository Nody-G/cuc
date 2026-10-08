/**
 * Inspection des fiches films live (site_films) avant enrichissement.
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

console.log(`Total films: ${films.length}\n`);

const missingDesc = films.filter((f) => !f.description || !String(f.description).trim());
const missingTeam = films.filter((f) => !f.cuc_team_involved || f.cuc_team_involved.length === 0);
const withRoles = films.filter((f) => f.metadata?.cuc_team_roles && Object.keys(f.metadata.cuc_team_roles).length > 0);

console.log(`Sans description : ${missingDesc.length}`);
console.log(`Sans équipe CUC  : ${missingTeam.length}`);
console.log(`Avec rôles coachs: ${withRoles.length}\n`);

console.log('--- Détail ---');
for (const f of films) {
    const roles = f.metadata?.cuc_team_roles || {};
    console.log(
        [
            f.id,
            `"${f.title}"`,
            f.year || '????',
            `cat=${f.category || '-'}`,
            `dir=${f.director || '-'}`,
            `stunt="${(f.stunt_roles || '').slice(0, 60)}"`,
            `team=${(f.cuc_team_involved || []).join('|') || '-'}`,
            `roles=${JSON.stringify(roles)}`,
            `desc=${f.description ? 'OUI' : 'NON'}`,
        ].join(' | ')
    );
}

// Distribution des libellés de rôles bruts
const roleLabels = new Map();
for (const f of films) {
    for (const r of Object.values(f.metadata?.cuc_team_roles || {})) {
        roleLabels.set(r, (roleLabels.get(r) || 0) + 1);
    }
}
console.log('\n--- Libellés de rôles bruts (metadata.cuc_team_roles) ---');
[...roleLabels.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([r, n]) => console.log(`${String(n).padStart(3)} × ${r}`));
