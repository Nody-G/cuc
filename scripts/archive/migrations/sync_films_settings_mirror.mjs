/**
 * Synchronise le miroir `site_settings.films` avec les `doubled_actors`
 * nettoyés de `site_films` (doctrine « Zéro Texte Orphelin »).
 *
 * Le miroir est reconstruit à partir de la table source : aucune invention,
 * on recopie simplement l'état assaini.
 *
 * NOTE STRUCTURELLE : `site_settings.films.value` est un TABLEAU de premier
 * niveau (clés "0".."N"), et NON un objet `{ list: [...] }`. Toute logique
 * qui suppose `value.list` échoue silencieusement (0 entrée lue).
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

const SUSPECT = /Équipe cascades CUC|Cascadeurs CUC|Doublures cascades CUC|CUC Performers|CUC Team|Performers de Combat|Spécialistes Rigging|Co-fondateur CUC|Stunt Support|Stunt Doubling|Enforcers/i;

// 1. Lire le miroir actuel
const { data: row, error } = await supabase
    .from('site_settings')
    .select('key,value')
    .eq('key', 'films')
    .maybeSingle();

if (error) {
    console.error('ERREUR lecture site_settings.films:', error.message);
    process.exit(1);
}
if (!row) {
    console.log('ℹ️  Aucune clé site_settings.films — rien à synchroniser.');
    process.exit(0);
}

const value = row.value;

// 2. Résoudre la liste quel que soit le conteneur (tableau racine OU { list })
let list = null;
let container = null; // 'array' | 'list'
if (Array.isArray(value)) {
    list = value;
    container = 'array';
} else if (value && Array.isArray(value.list)) {
    list = value.list;
    container = 'list';
} else {
    console.log('ℹ️  Structure inattendue (ni tableau racine ni { list }) — rien à synchroniser.');
    console.log('   Clés racine:', value ? Object.keys(value).join(', ') : '(vide)');
    process.exit(0);
}

console.log(`Miroir site_settings.films : ${list.length} entrée(s) [conteneur: ${container}].`);

// 3. Nettoyer chaque entrée dont doubledActors/doubled_actors contient un libellé douteux
let cleaned = 0;
for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const arr = item.doubledActors || item.doubled_actors;
    if (!Array.isArray(arr)) continue;
    const filtered = arr.filter((a) => !SUSPECT.test(String(a)));
    if (filtered.length !== arr.length) {
        cleaned++;
        console.log(`  ✓ [${item.id || item.title}] ${JSON.stringify(arr)} → ${JSON.stringify(filtered)}`);
        if (Array.isArray(item.doubledActors)) item.doubledActors = filtered;
        if (Array.isArray(item.doubled_actors)) item.doubled_actors = filtered;
    }
}

if (cleaned === 0) {
    console.log('✅ Miroir déjà conforme (aucune modification).');
    process.exit(0);
}

// 4. Écrire le miroir assaini en préservant le conteneur d'origine
const nextValue = container === 'array' ? list : { ...value, list };
const { error: upErr } = await supabase
    .from('site_settings')
    .update({ value: nextValue, updated_at: new Date().toISOString() })
    .eq('key', 'films');

if (upErr) {
    console.error('ERREUR écriture:', upErr.message);
    process.exit(1);
}

console.log(`\n✅ Miroir site_settings.films synchronisé (${cleaned} entrée(s) nettoyée(s)).`);

// 5. Non-régression
const { data: after } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'films')
    .maybeSingle();

const flat = JSON.stringify(after?.value || {});
if (SUSPECT.test(flat)) {
    console.error('✗ Des libellés douteux subsistent dans le miroir.');
    process.exit(2);
}
console.log('✅ Vérification : plus aucun libellé douteux dans site_settings.films.');
