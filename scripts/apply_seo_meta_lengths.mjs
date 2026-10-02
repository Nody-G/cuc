/**
 * ==============================================================================
 * CUC — Application ciblée : mise au gabarit SEO de 3 métadonnées (site_pages)
 * ==============================================================================
 * Le Diagnostic de Santé signale 3 métadonnées SEO trop longues (sévérité `info`).
 * Ce script écrit EXACTEMENT les 3 valeurs validées, ciblées par la clé primaire
 * réelle de `site_pages` — `slug` (TEXT PRIMARY KEY) — et rien d'autre :
 *
 *   - slug `/`                     → `meta_title`
 *   - slug `equipe-cascadeurs-pro` → `meta_title`
 *   - slug `/`                     → `meta_description`
 *
 * Garanties :
 *   - garde-fou : si une valeur actuelle diffère de la valeur « avant » attendue,
 *     le script s'arrête AVANT toute écriture et rapporte l'écart ;
 *   - idempotent : si la valeur « après » est déjà là, la cible est ignorée ;
 *   - aucune autre colonne, aucune autre ligne, aucune autre table modifiée ;
 *   - ne touche pas les overlays EN (`site_translations`) : il se contente de
 *     mesurer et d'imprimer la parité bilingue à titre informatif.
 *
 * Usage :
 *   node scripts/apply_seo_meta_lengths.mjs            (lecture seule / dry-run)
 *   node scripts/apply_seo_meta_lengths.mjs --apply     (écrit les 3 valeurs)
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const APPLY = process.argv.includes('--apply');

/**
 * Les 3 cibles validées. `before` est l'« ancienne valeur » attendue : toute
 * divergence déclenche l'arrêt du script (pré-vol). `after` ne doit pas dévier
 * d'un caractère.
 */
const TARGETS = [
    {
        slug: '/',
        column: 'meta_title',
        before: "Campus Univers Cascades | 1ère École de Cascadeurs Professionnels d'Europe",
        after: "Campus Univers Cascades | 1ère école de cascadeurs d'Europe",
    },
    {
        slug: 'equipe-cascadeurs-pro',
        column: 'meta_title',
        before: "L'équipe | Coachs & Professionnels du Cinéma — Campus Univers Cascades",
        after: "L'équipe | Coachs & Professionnels du Cinéma — CUC",
    },
    {
        slug: '/',
        column: 'meta_description',
        before:
            "Centre d'entraînement de cascadeurs professionnels fondé en 2008 par Lucas Dollfus. " +
            "11 000 m² d'infrastructures dédiées au cinéma d'action, parkour, combat et cascades.",
        after:
            "Centre d'entraînement de cascadeurs professionnels fondé en 2008 par Lucas Dollfus. " +
            "11 000 m² dédiés au cinéma d'action, parkour, combat et cascades.",
    },
];

const SLUGS = [...new Set(TARGETS.map((t) => t.slug))];

/** Échappe une chaîne pour un littéral SQL (apostrophes doublées). */
function sqlLiteral(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

/** Lit l'état réel des lignes ciblées (clé primaire réelle : `slug`). */
async function readTargetRows() {
    const { data, error } = await supabase
        .from('site_pages')
        .select('slug, meta_title, meta_description, is_published')
        .in('slug', SLUGS);
    if (error) {
        console.error(`❌ Lecture site_pages : ${error.message}`);
        process.exit(1);
    }
    return new Map((data ?? []).map((row) => [row.slug, row]));
}

/**
 * Construit le plan d'écriture. Lève une erreur explicite si une valeur réelle
 * ne correspond ni à `before` (à corriger) ni à `after` (déjà appliquée).
 */
function buildPlan(rows) {
    const plan = [];
    const problems = [];

    for (const target of TARGETS) {
        const row = rows.get(target.slug);
        if (!row) {
            problems.push(`slug « ${target.slug} » : aucune ligne dans site_pages.`);
            continue;
        }
        const current = row[target.column] ?? null;
        if (current === target.after) {
            plan.push({ ...target, current, action: 'skip' });
        } else if (current === target.before) {
            plan.push({ ...target, current, action: 'update' });
        } else {
            problems.push(
                `slug « ${target.slug} » / ${target.column} : valeur inattendue.\n` +
                `    attendu (avant) : ${JSON.stringify(target.before)}\n` +
                `    attendu (après) : ${JSON.stringify(target.after)}\n` +
                `    réel           : ${JSON.stringify(current)}`
            );
        }
    }
    return { plan, problems };
}

/** Imprime l'état avant, avec longueurs mesurées en unités UTF-16. */
function printBefore(plan) {
    console.log('— État AVANT (site_pages, PK = slug) —');
    for (const t of plan) {
        const shown = t.current === null ? '(null)' : JSON.stringify(t.current);
        console.log(`  ${t.slug} · ${t.column}`);
        console.log(`    avant : ${shown} (avait ${t.current ? t.current.length : 0} car.)`);
        console.log(`    après : ${JSON.stringify(t.after)} (aura ${t.after.length} car.)`);
    }
    console.log('');
}

/** Imprime la commande de restauration inverse (rollback) exacte. */
function printRollback(plan) {
    console.log('— Rollback (restauration des valeurs d’origine) —');
    for (const t of plan) {
        if (t.action !== 'update') continue;
        console.log(
            `psql "$SUPABASE_DB_URL" -c "UPDATE public.site_pages SET ${t.column} = ` +
            `${sqlLiteral(t.before)} WHERE slug = ${sqlLiteral(t.slug)};"`
        );
    }
    console.log('');
}

/** Applique les mises à jour par PK `slug`, uniquement la colonne visée. */
async function applyUpdates(plan) {
    const bySlug = new Map();
    for (const t of plan) {
        if (t.action !== 'update') continue;
        if (!bySlug.has(t.slug)) bySlug.set(t.slug, {});
        bySlug.get(t.slug)[t.column] = t.after;
    }

    for (const [slug, patch] of bySlug.entries()) {
        const { error } = await supabase.from('site_pages').update(patch).eq('slug', slug);
        if (error) {
            console.error(`❌ Écriture ${slug} : ${error.message}`);
            process.exit(1);
        }
        console.log(`✅ ${slug} → ${Object.keys(patch).join(', ')}`);
    }
}

/** Contrôle de non-régression : relit et confirme les 3 valeurs. */
async function verify() {
    const rows = await readTargetRows();
    console.log('\n— Contrôle de non-régression —');
    let ok = true;
    for (const t of TARGETS) {
        const row = rows.get(t.slug);
        const value = row ? row[t.column] : null;
        const match = value === t.after;
        if (!match) ok = false;
        console.log(`  ${t.slug} · ${t.column} : ${match ? '✅' : '❌'} (${value ? value.length : 0} car.)`);
    }
    if (!ok) {
        console.error('❌ Au moins une valeur ne correspond pas à la cible.');
        process.exit(1);
    }
}

/**
 * Parité bilingue (informatif, sans écriture) : mesure les équivalents EN des
 * métadonnées dans `site_translations` (entity=page, entity_id=slug, locale=en).
 */
async function reportEnParity() {
    const { data, error } = await supabase
        .from('site_translations')
        .select('entity_id, is_published, payload')
        .eq('entity', 'page')
        .eq('locale', 'en')
        .in('entity_id', SLUGS);
    if (error) {
        console.warn(`⚠️  Parité EN non lisible : ${error.message}`);
        return;
    }
    console.log('\n— Parité bilingue : overlays EN (lecture seule, aucune écriture) —');
    if (!data || data.length === 0) {
        console.log('  Aucun overlay EN pour ces slugs (le FR sert de repli).');
        return;
    }
    for (const row of data) {
        const payload = row.payload ?? {};
        const title = typeof payload.meta_title === 'string' ? payload.meta_title : null;
        const desc = typeof payload.meta_description === 'string' ? payload.meta_description : null;
        console.log(`  ${row.entity_id} (is_published=${row.is_published})`);
        console.log(`    meta_title EN       : ${title ? `${title.length} car.` : 'absent'}${title && title.length > 65 ? ' ⚠️ > 65' : ''}`);
        console.log(`    meta_description EN : ${desc ? `${desc.length} car.` : 'absent'}${desc && desc.length > 165 ? ' ⚠️ > 165' : ''}`);
    }
    console.log('  (Le diagnostic ne contrôle que le FR ; l’EN n’est pas modifié ici.)');
}

async function main() {
    console.log(`— Metadonnées SEO (site_pages) — mode ${APPLY ? 'APPLY' : 'DRY-RUN (lecture seule)'} —\n`);

    const rows = await readTargetRows();
    const { plan, problems } = buildPlan(rows);

    if (problems.length > 0) {
        console.error('❌ Pré-vol : écart entre les valeurs réelles et les valeurs « avant » attendues.');
        console.error('   Aucune écriture effectuée. Détail :\n');
        for (const p of problems) console.error(`  - ${p}`);
        process.exit(2);
    }

    printBefore(plan);
    printRollback(plan);

    if (!APPLY) {
        await reportEnParity();
        console.log('\nDRY-RUN : aucune écriture. Relancez avec --apply pour appliquer.');
        return;
    }

    const updates = plan.filter((t) => t.action === 'update');
    if (updates.length === 0) {
        console.log('Idempotent : les 3 valeurs sont déjà conformes, aucune écriture.');
        await verify();
        await reportEnParity();
        return;
    }

    await applyUpdates(plan);
    await verify();
    await reportEnParity();
}

main().catch((error) => {
    console.error(`\n[ERREUR] ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
});
