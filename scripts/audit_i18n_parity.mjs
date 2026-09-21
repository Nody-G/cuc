#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit de parité i18n FR ↔ EN
 * ==============================================================================
 * Vérifie, pour chaque page de `site_pages`, la présence d'une traduction EN
 * dans `site_translations` et la couverture des champs clés (titre, meta, hero).
 *
 * Produit `plans/revue-i18n-parite.md`. Sort en code 2 si une page FR n'a AUCUNE
 * traduction EN (couverture incomplète).
 *
 * Usage :
 *   node scripts/audit_i18n_parity.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const HERO_KEYS = ['badge', 'title', 'subtitle', 'cta_primary_text', 'cta_secondary_text'];

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

const pages = await rest('site_pages?select=slug,title,meta_title,meta_description,hero&order=slug.asc');
const translations = await rest("site_translations?select=entity,entity_id,locale,payload&entity=eq.page&locale=eq.en");

const bySlug = new Map(translations.map((t) => [t.entity_id, t.payload || {}]));

const rows = [];
let missing = 0;
for (const p of pages) {
    const en = bySlug.get(p.slug);
    const hero = en?.hero || {};
    const heroCovered = HERO_KEYS.filter((k) => hero[k]);
    const metaCovered = !!(en?.meta_title && en?.meta_description);
    const titleCovered = !!en?.title;
    if (!en) missing += 1;
    rows.push({
        slug: p.slug,
        frTitle: p.title,
        enTitle: en?.title || '—',
        status: en ? 'ok' : 'MANQUANT',
        hero: `${heroCovered.length}/${HERO_KEYS.length}`,
        meta: metaCovered ? '✅' : (en ? 'partiel' : '—'),
        title: titleCovered ? '✅' : (en ? 'partiel' : '—'),
    });
}

const lines = [];
lines.push('# Revue — Parité i18n FR ↔ EN');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par [\`audit_i18n_parity.mjs\`](scripts/audit_i18n_parity.mjs:1).`);
lines.push('');
lines.push(`- Pages FR : **${pages.length}**`);
lines.push(`- Traductions EN présentes : **${translations.length}**`);
lines.push(`- Pages sans traduction EN : **${missing}**`);
lines.push('');
lines.push('| Slug | Titre FR | Titre EN | Statut | Hero (clés) | Meta |');
lines.push('|---|---|---|---|---|---|');
for (const r of rows) {
    lines.push(`| \`${r.slug}\` | ${r.frTitle} | ${r.enTitle} | ${r.status} | ${r.hero} | ${r.meta} |`);
}
lines.push('');
lines.push('## Rappel de méthode');
lines.push('');
lines.push('- La lecture fusionne la base FR avec l’overlay `site_translations` (repli FR automatique).');
lines.push('- Une page « partielle » reste fonctionnelle : les champs non traduits s’affichent en FR.');
lines.push('- Cible : chaque page publique disposant a minima de `title`, `meta_title`, `meta_description` et du `hero`.');
lines.push('');

fs.writeFileSync(path.join(process.cwd(), 'plans', 'revue-i18n-parite.md'), lines.join('\n'), 'utf8');

console.log(`\nParité i18n — ${pages.length} pages FR, ${translations.length} traductions EN, ${missing} page(s) sans EN.\n`);
for (const r of rows.filter((r) => r.status !== 'ok')) console.log(`  ⚠️ ${r.slug} — sans traduction EN`);
console.log('\nRapport : plans/revue-i18n-parite.md\n');

if (missing > 0) process.exitCode = 2;
