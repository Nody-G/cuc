/**
 * Purge des libellés `doubled_actors` douteux / auto-référentiels dans site_films.
 *
 * Doctrine « Zéro Invention » : on ne conserve QUE des noms de comédiens réels
 * (éventuellement avec la précision « doublé par <cascadeur> » quand elle est
 * vérifiée). On retire :
 *   - les auto-références au campus (« Équipe cascades CUC », « Cascadeurs CUC »,
 *     « Doublures cascades CUC », « Co-fondateur CUC »…) ;
 *   - les libellés marketing inventés (« Performers », « Enforcers »,
 *     « Stunt Support », « Stunt Doubling Support », « Spécialistes Rigging »…) ;
 *   - les parenthèses fabriquées accolées à un vrai nom d'acteur.
 *
 * Idempotent : relançable sans effet de bord. Vérification de non-régression
 * intégrée (aucun libellé douteux ne doit subsister après application).
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

/**
 * Corrections explicites : id du film → nouvelle valeur de doubled_actors.
 * Chaque entrée a été revue manuellement.
 *   - [] = suppression totale (aucun comédien doublé identifiable de façon fiable)
 *   - [noms] = on ne garde que les noms réels, sans parenthèse inventée
 */
const CORRECTIONS = {
    // Auto-références CUC → suppression
    'athena': [],
    'the-killer': [],
    'sous-la-seine': [],
    'the-substance': [],
    'john-wick-4': [],
    'lucy': [],
    'valerian': [],
    'dunkirk': [],
    'fast-furious-6': [],
    'james-bond-spectre': [],

    // Noms réels conservés, parenthèses fabriquées retirées
    'monte-cristo': ['Pierre Niney'],
    'largo-winch-3': ['Tomer Sisley'],
    'yamakasi': ['Malik Diouf'],
};

const SUSPECT = /CUC|campus|équipe|equipe|performers?|enforcers?|stunt\s*(support|doubling)?|team|spécialistes|specialistes|coordinateur|coordination|co-fondateur|fondateur/i;

async function main() {
    const { data: films, error } = await supabase
        .from('site_films')
        .select('id,title,doubled_actors')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('ERREUR lecture:', error.message);
        process.exit(1);
    }

    let updated = 0;
    for (const [id, next] of Object.entries(CORRECTIONS)) {
        const film = films.find((f) => f.id === id);
        if (!film) {
            console.log(`⚠️  [${id}] absent de site_films — ignoré`);
            continue;
        }
        const before = Array.isArray(film.doubled_actors) ? film.doubled_actors : [];
        const beforeStr = JSON.stringify(before);
        const afterStr = JSON.stringify(next);
        if (beforeStr === afterStr) {
            console.log(`= [${id}] "${film.title}" déjà conforme`);
            continue;
        }

        const { error: upErr } = await supabase
            .from('site_films')
            .update({ doubled_actors: next })
            .eq('id', id);

        if (upErr) {
            console.error(`✗ [${id}] échec: ${upErr.message}`);
            process.exit(1);
        }
        updated++;
        console.log(`✓ [${id}] "${film.title}"`);
        console.log(`    avant : ${beforeStr}`);
        console.log(`    après : ${afterStr}`);
    }

    console.log(`\n${updated} film(s) mis à jour.`);

    // --- Vérification de non-régression ---
    const { data: after, error: reErr } = await supabase
        .from('site_films')
        .select('id,title,doubled_actors');

    if (reErr) {
        console.error('ERREUR relecture:', reErr.message);
        process.exit(1);
    }

    const remaining = [];
    for (const f of after) {
        const arr = Array.isArray(f.doubled_actors) ? f.doubled_actors : [];
        for (const a of arr) {
            if (SUSPECT.test(String(a))) remaining.push(`[${f.id}] "${f.title}" → "${a}"`);
        }
    }

    console.log('\n=== Vérification de non-régression ===');
    if (remaining.length > 0) {
        console.error(`✗ ${remaining.length} libellé(s) douteux subsistent :`);
        remaining.forEach((r) => console.error(`   ${r}`));
        process.exit(2);
    }
    console.log('✅ Aucun libellé auto-référentiel / inventé restant dans doubled_actors.');
}

main();
