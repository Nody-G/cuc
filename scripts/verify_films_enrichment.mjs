/**
 * Vérification live de l'enrichissement des fiches films.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

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

const { data: films, error } = await supabase
    .from('site_films')
    .select('id, title, year, description, metadata')
    .order('order_index', { ascending: true });

if (error) {
    console.error('ERREUR:', error.message);
    process.exit(1);
}

const withDesc = films.filter((f) => f.description && f.description.trim());
const withRoles = films.filter(
    (f) => f.metadata?.cuc_team_roles && Object.keys(f.metadata.cuc_team_roles).length > 0
);

console.log(`Total films          : ${films.length}`);
console.log(`Avec description     : ${withDesc.length}`);
console.log(`Avec rôles normalisés: ${withRoles.length}\n`);

// Distribution des libellés canoniques
const dist = new Map();
for (const f of films) {
    for (const r of Object.values(f.metadata?.cuc_team_roles || {})) {
        dist.set(r, (dist.get(r) || 0) + 1);
    }
}
console.log('--- Libellés canoniques en base ---');
[...dist.entries()].sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log(`${String(n).padStart(3)} × ${r}`));

// Contrôle doctrine : aucun terme banni
const banned = /gun-?fu|Art du Déplacement|\bADD\b/i;
const violations = films.filter((f) => banned.test(f.description || ''));
console.log(`\nViolations doctrine (gun-fu / ADD) : ${violations.length}`);
violations.forEach((f) => console.log(`  ✗ ${f.title} : ${f.description}`));

// Exemples
console.log('\n--- Exemples ---');
for (const f of films.slice(0, 3)) {
    console.log(`• ${f.title} (${f.year})`);
    console.log(`  ${f.description}`);
    console.log(`  rôles: ${JSON.stringify(f.metadata?.cuc_team_roles || {})}`);
}
