/**
 * SEMIS DES PARTENAIRES — DEFAULT_PARTNERS (code) → site_partners (Supabase)
 * ==========================================================================
 *
 * Contexte (doctrine « Zéro Valeur Orpheline ») :
 *   `getPartners()` renvoie les lignes de `site_partners` dès que la table
 *   n'est pas vide. Or la base ne contenait que 8 partenaires historiques
 *   (semés par `seed_pages_content.sql` avec des URLs WordPress distantes),
 *   tandis que le code en déclare 14. Résultat : 13 partenaires du code
 *   n'apparaissaient jamais dans le Cockpit ni sur la vitrine.
 *
 * Ce script :
 *   1. Extrait `DEFAULT_PARTNERS` depuis `src/lib/data/site-service.ts`.
 *   2. Téléverse chaque logo local (`public/images/partenaires/*`) vers le
 *      bucket `cuc-vitrine-assets`, sous `media/partner-logo/<fichier>`.
 *   3. Remplace `logo_url` par l'URL publique Supabase correspondante.
 *   4. Upsert idempotent dans `site_partners` (clé `id`).
 *   5. Migre également les logos des partenaires déjà en base mais absents du
 *      code (orphelins historiques : EuropaCorp, Gaumont, Pathé, etc.) afin
 *      qu'aucune ligne ne conserve un chemin local `/images/partenaires/*`.
 *
 * Idempotent : relancer le script ne crée pas de doublon et ne re-téléverse
 * pas un logo déjà présent (sauf `--force`).
 *
 * Usage :
 *   node scripts/seed_partners_from_defaults.mjs --dry-run   # simulation
 *   node scripts/seed_partners_from_defaults.mjs             # écriture
 *   node scripts/seed_partners_from_defaults.mjs --force     # re-upload logos
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'cuc-vitrine-assets';
const LOGO_PREFIX = 'media/partner-logo';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Extrait DEFAULT_PARTNERS depuis le source TypeScript (sans bundler).
 * On isole le littéral de tableau puis on l'évalue via `new Function`.
 */
function extractDefaultPartners() {
    const src = fs.readFileSync(
        path.join(process.cwd(), 'src/lib/data/site-service.ts'),
        'utf8'
    );
    const start = src.indexOf('export const DEFAULT_PARTNERS');
    if (start === -1) throw new Error('DEFAULT_PARTNERS introuvable');
    // `SitePartner[]` contient un `[` avant le littéral : on ancre sur `= [`.
    const arrStart = src.indexOf('= [', start) + 2;
    if (arrStart === 1) throw new Error('Tableau DEFAULT_PARTNERS introuvable');
    let depth = 0;
    let end = -1;
    for (let i = arrStart; i < src.length; i++) {
        if (src[i] === '[') depth++;
        else if (src[i] === ']') {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }
    if (end === -1) throw new Error('Fermeture DEFAULT_PARTNERS introuvable');
    const literal = src.slice(arrStart, end + 1);
    // eslint-disable-next-line no-new-func
    return new Function(`return ${literal};`)();
}

const CONTENT_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
};

/**
 * Téléverse un logo local vers Supabase Storage et renvoie son URL publique.
 * Si le fichier est déjà présent dans le bucket et `--force` n'est pas passé,
 * on réutilise l'URL publique existante.
 */
async function uploadLogo(localPath) {
    const abs = path.join(process.cwd(), 'public', localPath.replace(/^\//, ''));
    if (!fs.existsSync(abs)) {
        return { ok: false, reason: `fichier local absent : ${abs}` };
    }

    const filename = path.basename(abs);
    const objectPath = `${LOGO_PREFIX}/${filename}`;
    const ext = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;

    if (!FORCE) {
        // Vérifie l'existence via une requête HEAD sur l'URL publique.
        try {
            const res = await fetch(publicUrl, { method: 'HEAD' });
            if (res.ok) return { ok: true, publicUrl, skipped: true };
        } catch {
            /* on tente l'upload */
        }
    }

    if (DRY_RUN) return { ok: true, publicUrl, dryRun: true };

    const buffer = fs.readFileSync(abs);
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, buffer, { contentType, upsert: true });

    if (error) return { ok: false, reason: error.message };
    return { ok: true, publicUrl };
}

async function main() {
    const defaults = extractDefaultPartners();
    console.log(`\n=== Semis des partenaires ===\n`);
    console.log(`DEFAULT_PARTNERS (code) : ${defaults.length}`);
    console.log(`Mode : ${DRY_RUN ? 'DRY-RUN (aucune écriture)' : 'ÉCRITURE'}\n`);

    const rows = [];
    let uploadFailures = 0;

    for (const p of defaults) {
        let logoUrl = p.logo_url;

        if (logoUrl && logoUrl.startsWith('/')) {
            const res = await uploadLogo(logoUrl);
            if (res.ok) {
                logoUrl = res.publicUrl;
                const tag = res.dryRun ? 'DRY ' : res.skipped ? 'SKIP' : 'UP  ';
                console.log(`  [${tag}] ${p.id.padEnd(20)} → ${logoUrl}`);
            } else {
                uploadFailures++;
                console.log(`  [KO  ] ${p.id.padEnd(20)} ${res.reason}`);
                // On conserve le chemin local en repli (servi par Next.js).
            }
        } else {
            console.log(`  [--  ] ${p.id.padEnd(20)} logo déjà distant`);
        }

        rows.push({
            id: p.id,
            name: p.name,
            category: p.category || 'cinema',
            logo_url: logoUrl,
            website_url: p.website_url || null,
            description: p.description || null,
            order_index: p.order_index ?? 0,
            is_published: p.is_published !== false,
        });
    }

    // -----------------------------------------------------------------------
    // Migration des logos des partenaires orphelins (en base, absents du code).
    // Ces lignes historiques (EuropaCorp, Gaumont, Pathé…) doivent elles aussi
    // pointer vers Supabase Storage : aucun chemin local ne doit subsister.
    // -----------------------------------------------------------------------
    const defaultIds = new Set(defaults.map((p) => p.id));
    const { data: dbRows, error: readError } = await supabase
        .from('site_partners')
        .select('id, logo_url');

    if (readError) {
        console.error('\n❌ Lecture site_partners :', readError.message);
        process.exit(1);
    }

    const orphanUpdates = [];
    for (const row of dbRows || []) {
        if (defaultIds.has(row.id)) continue;
        if (!row.logo_url || !row.logo_url.startsWith('/')) continue;

        const res = await uploadLogo(row.logo_url);
        if (res.ok) {
            orphanUpdates.push({ id: row.id, logo_url: res.publicUrl });
            const tag = res.dryRun ? 'DRY ' : res.skipped ? 'SKIP' : 'UP  ';
            console.log(`  [${tag}] ${row.id.padEnd(20)} → ${res.publicUrl}`);
        } else {
            uploadFailures++;
            console.log(`  [KO  ] ${row.id.padEnd(20)} ${res.reason}`);
        }
    }

    if (DRY_RUN) {
        console.log(`\n📋 ${rows.length} partenaire(s) prêt(s) à être upsertés.`);
        console.log(`📋 ${orphanUpdates.length} logo(s) orphelin(s) prêt(s) à être migré(s).`);
        console.log('   Relancez sans --dry-run pour écrire.');
        return;
    }

    const { error } = await supabase
        .from('site_partners')
        .upsert(rows, { onConflict: 'id' });

    if (error) {
        console.error('\n❌ Upsert site_partners :', error.message);
        process.exit(1);
    }

    console.log(`\n✅ ${rows.length} partenaire(s) upserté(s) dans site_partners.`);

    // Mise à jour ciblée des logos orphelins (une requête par ligne).
    let orphanMigrated = 0;
    for (const upd of orphanUpdates) {
        const { error: updError } = await supabase
            .from('site_partners')
            .update({ logo_url: upd.logo_url })
            .eq('id', upd.id);
        if (updError) {
            console.error(`  ❌ ${upd.id} : ${updError.message}`);
        } else {
            orphanMigrated++;
        }
    }
    if (orphanMigrated > 0) {
        console.log(`✅ ${orphanMigrated} logo(s) orphelin(s) migré(s) vers Supabase Storage.`);
    }

    if (uploadFailures > 0) {
        console.log(`⚠️  ${uploadFailures} logo(s) non téléversé(s) — chemin local conservé.`);
    }
    console.log('\nProchaine étape : node scripts/audit_partners_gap.mjs');
}

main().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
