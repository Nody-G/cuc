/**
 * Audit de l'écart entre DEFAULT_PARTNERS (code) et site_partners (Supabase).
 *
 * Objectif (doctrine « Zéro Valeur Orpheline ») :
 *  1. Lister les partenaires présents dans le code mais absents en base.
 *  2. Lister les partenaires présents en base mais absents du code.
 *  3. Vérifier que chaque logo_url est joignable (HTTP 200) — détecte les
 *     chemins locaux `/images/partenaires/*.png` restés orphelins après le
 *     rapatriement des médias vers Supabase Storage.
 *
 * Usage : node scripts/audit_partners_gap.mjs
 * Sortie : rapport console + plans/audit-partenaires.md
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Extrait DEFAULT_PARTNERS depuis le source TypeScript (sans bundler).
 *
 * On isole le littéral de tableau puis on retire l'annotation de type
 * (`: SitePartner[]`) avant évaluation, car `new Function` ne comprend
 * pas la syntaxe TypeScript.
 */
function extractDefaultPartners() {
    const src = fs.readFileSync(
        path.join(process.cwd(), 'src/lib/data/site-service.ts'),
        'utf8'
    );
    const start = src.indexOf('export const DEFAULT_PARTNERS');
    if (start === -1) throw new Error('DEFAULT_PARTNERS introuvable');
    // Attention : `SitePartner[]` contient un `[` avant le littéral de tableau.
    // On ancre donc sur `= [` pour trouver le vrai début du tableau.
    const arrStart = src.indexOf('= [', start) + 2;
    if (arrStart === 1) throw new Error('Tableau DEFAULT_PARTNERS introuvable');
    // Recherche de la fermeture `];` au niveau racine
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

/**
 * Vérifie la joignabilité d'une URL de logo.
 *
 * Nuance importante : un chemin local (`/images/partenaires/*.png`) est un
 * repli légitime côté code (servi par Next.js depuis `public/`). Il n'est
 * problématique QUE s'il subsiste en base : la doctrine « Zéro Valeur
 * Orpheline » exige que `site_partners.logo_url` pointe vers Supabase Storage.
 * On distingue donc les deux cas via `source`.
 */
async function checkUrl(url, source = 'db') {
    if (!url) return { ok: false, status: 0, reason: 'vide' };
    if (url.startsWith('/')) {
        if (source === 'code') {
            return { ok: true, status: 0, reason: 'repli local (code)' };
        }
        return { ok: false, status: 0, reason: 'chemin local en base' };
    }
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        return { ok: res.ok, status: res.status, reason: res.ok ? '' : `HTTP ${res.status}` };
    } catch (err) {
        return { ok: false, status: 0, reason: err.message };
    }
}

async function main() {
    const defaults = extractDefaultPartners();
    console.log(`\n=== Audit partenaires ===\n`);
    console.log(`DEFAULT_PARTNERS (code) : ${defaults.length}`);

    const { data: rows, error } = await supabase
        .from('site_partners')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('❌ Lecture site_partners :', error.message);
        process.exit(1);
    }

    const dbPartners = rows || [];
    console.log(`site_partners (base)    : ${dbPartners.length}\n`);

    const dbIds = new Set(dbPartners.map((p) => p.id));
    const defaultIds = new Set(defaults.map((p) => p.id));

    const missingInDb = defaults.filter((p) => !dbIds.has(p.id));
    const orphanInDb = dbPartners.filter((p) => !defaultIds.has(p.id));

    console.log(`--- Manquants en base (${missingInDb.length}) ---`);
    for (const p of missingInDb) console.log(`  • ${p.id} — ${p.name}`);

    console.log(`\n--- Présents en base mais absents du code (${orphanInDb.length}) ---`);
    for (const p of orphanInDb) console.log(`  • ${p.id} — ${p.name}`);

    // Vérification des logos.
    // On contrôle en priorité les lignes EN BASE (doctrine : logo_url doit
    // pointer vers Supabase Storage). Les replis locaux du code sont signalés
    // mais ne sont pas comptés comme des anomalies bloquantes.
    console.log(`\n--- Vérification des logos ---`);
    const logoReport = [];
    const seen = new Set();
    for (const p of dbPartners) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        const check = await checkUrl(p.logo_url, 'db');
        logoReport.push({ id: p.id, name: p.name, url: p.logo_url, source: 'db', ...check });
        const flag = check.ok ? 'OK ' : 'KO ';
        console.log(`  [${flag}] ${p.id.padEnd(20)} ${p.logo_url || '(vide)'} ${check.reason}`);
    }
    for (const p of defaults) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        const check = await checkUrl(p.logo_url, 'code');
        logoReport.push({ id: p.id, name: p.name, url: p.logo_url, source: 'code', ...check });
        const flag = check.ok ? 'OK ' : 'KO ';
        console.log(`  [${flag}] ${p.id.padEnd(20)} ${p.logo_url || '(vide)'} ${check.reason}`);
    }

    const brokenLogos = logoReport.filter((l) => !l.ok);

    // Rapport markdown
    const lines = [];
    lines.push('# Audit des partenaires — écart code ↔ base');
    lines.push('');
    lines.push(`- DEFAULT_PARTNERS (code) : **${defaults.length}**`);
    lines.push(`- site_partners (base) : **${dbPartners.length}**`);
    lines.push(`- Manquants en base : **${missingInDb.length}**`);
    lines.push(`- Orphelins en base : **${orphanInDb.length}**`);
    lines.push(`- Logos injoignables : **${brokenLogos.length}**`);
    lines.push('');
    lines.push('## Manquants en base');
    lines.push('');
    if (missingInDb.length === 0) lines.push('_Aucun._');
    else for (const p of missingInDb) lines.push(`- \`${p.id}\` — ${p.name} (${p.category})`);
    lines.push('');
    lines.push('## Orphelins en base');
    lines.push('');
    if (orphanInDb.length === 0) lines.push('_Aucun._');
    else for (const p of orphanInDb) lines.push(`- \`${p.id}\` — ${p.name} (${p.category})`);
    lines.push('');
    lines.push('## Logos injoignables');
    lines.push('');
    lines.push('> Seuls les logos **en base** sont bloquants (doctrine : `logo_url` doit');
    lines.push('> pointer vers Supabase Storage). Les replis locaux du code sont servis');
    lines.push('> par Next.js depuis `public/` et ne sont pas des anomalies.');
    lines.push('');
    if (brokenLogos.length === 0) lines.push('_Aucun._');
    else {
        lines.push('| id | nom | source | url | raison |');
        lines.push('|----|-----|--------|-----|--------|');
        for (const l of brokenLogos)
            lines.push(`| \`${l.id}\` | ${l.name} | ${l.source} | \`${l.url || ''}\` | ${l.reason} |`);
    }
    lines.push('');

    const outDir = path.join(process.cwd(), 'plans');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'audit-partenaires.md'), lines.join('\n'), 'utf8');
    console.log(`\n📄 Rapport écrit : plans/audit-partenaires.md`);

    if (brokenLogos.length > 0 || missingInDb.length > 0) {
        console.log(`\n⚠️  ${missingInDb.length} manquant(s) en base, ${brokenLogos.length} logo(s) injoignable(s).`);
        process.exit(2);
    }
    console.log('\n✅ Partenaires cohérents et logos joignables.');
}

main().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
