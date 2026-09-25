/**
 * ==============================================================================
 * CUC — Sync : Navigation & Footer depuis les constantes canoniques
 * ==============================================================================
 * Doctrine « Zéro Texte Orphelin » : la source de vérité est
 * `src/data/navigation.ts` (DEFAULT_NAVIGATION / DEFAULT_FOOTER). Ce script
 * propage EXACTEMENT ces structures vers Supabase (`site_navigation` /
 * `site_footer`, id = 'main') afin que la base ne diverge jamais du code.
 *
 * Pourquoi ce script plutôt que `seed_navigation_footer.mjs` ?
 *   - `seed_navigation_footer.mjs` embarque une COPIE figée de la structure :
 *     toute évolution du code doit y être répliquée à la main (risque de
 *     divergence silencieuse).
 *   - Ce script lit directement les constantes, donc il est impossible qu'il
 *     écrive autre chose que le rendu réel du site.
 *
 * Idempotent : `upsert` sur la clé primaire (`id`), ré-exécutable sans doublon.
 *
 * Usage : node scripts/sync_navigation_footer_from_defaults.mjs
 * ==============================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv() {
    try {
        const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* environnement déjà fourni */
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

/**
 * Extrait un objet littéral TypeScript depuis un fichier source.
 * On évite toute dépendance à un transpileur : on isole le bloc
 * `export const <NAME> ... = { ... };` puis on l'évalue en sandbox.
 */
function extractConst(source, name) {
    const marker = `export const ${name}`;
    const start = source.indexOf(marker);
    if (start === -1) throw new Error(`Constante introuvable : ${name}`);

    const braceStart = source.indexOf('{', start);
    if (braceStart === -1) throw new Error(`Accolade ouvrante introuvable : ${name}`);

    let depth = 0;
    let end = -1;
    let inString = null;
    let escaped = false;

    for (let i = braceStart; i < source.length; i++) {
        const ch = source[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (ch === '\\') {
                escaped = true;
            } else if (ch === inString) {
                inString = null;
            }
            continue;
        }

        if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch;
            continue;
        }

        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }

    if (end === -1) throw new Error(`Accolade fermante introuvable : ${name}`);

    const literal = source.slice(braceStart, end + 1);
    // eslint-disable-next-line no-new-func
    return new Function(`return (${literal});`)();
}

const navSource = readFileSync(new URL('../src/data/navigation.ts', import.meta.url), 'utf8');

const navigation = extractConst(navSource, 'DEFAULT_NAVIGATION');
const footer = extractConst(navSource, 'DEFAULT_FOOTER');

async function main() {
    console.log('— Synchronisation navigation & footer depuis les constantes canoniques —\n');

    const { error: navError } = await supabase
        .from('site_navigation')
        .upsert(
            {
                id: navigation.id,
                label: navigation.label,
                structure: navigation.structure,
                is_published: navigation.is_published,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
        );

    if (navError) {
        console.error('❌ site_navigation :', navError.message);
        process.exit(1);
    }
    console.log(`✅ site_navigation[${navigation.id}] — ${navigation.structure.items.length} onglet(s)`);

    const { error: footerError } = await supabase
        .from('site_footer')
        .upsert(
            {
                id: footer.id,
                label: footer.label,
                structure: footer.structure,
                is_published: footer.is_published,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
        );

    if (footerError) {
        console.error('❌ site_footer :', footerError.message);
        process.exit(1);
    }
    console.log(`✅ site_footer[${footer.id}] — ${footer.structure.columns.length} colonne(s)`);

    // Vérification de non-régression : relecture et comparaison des libellés clés.
    const { data: navCheck } = await supabase
        .from('site_navigation')
        .select('structure')
        .eq('id', navigation.id)
        .single();

    const items = navCheck?.structure?.items ?? [];
    const campus = items.find((i) => i.id === 'campus');
    const formations = items.find((i) => i.id === 'formations');
    const equipe = items.find((i) => i.id === 'equipe');
    const tournages = items.find((i) => i.id === 'tournages');
    const hasWorkshopChild = formations?.children?.some((c) => c.id === 'workshop');
    const hasNoRootWorkshop = !items.some((i) => i.id === 'workshop');

    console.log('\n— Contrôle de non-régression —');
    console.log(`  campus   : type=${campus?.type} href=${campus?.href} (attendu: link /visite-guidee)`);
    console.log(`  equipe   : label="${equipe?.label}" (attendu: L’ÉQUIPE)`);
    console.log(`  tournages: label="${tournages?.label}" (attendu: TOURNAGE)`);
    console.log(`  workshop : dans formations=${hasWorkshopChild}, hors racine=${hasNoRootWorkshop} (attendu: true, true)`);

    const ok =
        campus?.type === 'link' &&
        campus?.href === '/visite-guidee' &&
        equipe?.label === 'L’ÉQUIPE' &&
        tournages?.label === 'TOURNAGE' &&
        hasWorkshopChild &&
        hasNoRootWorkshop;

    if (!ok) {
        console.error('\n❌ Régression détectée : la base ne reflète pas les constantes.');
        process.exit(2);
    }

    console.log('\n✅ Navigation & footer synchronisés — base alignée sur le code.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
