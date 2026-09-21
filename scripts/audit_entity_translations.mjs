#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — LOT 0.3 : GARDE-FOU de couverture EN des ENTITÉS de données
 * ==============================================================================
 * Pour chaque entité du registre `src/lib/i18n/entities.json`, compare les champs
 * éditoriaux FR présents en base avec l'overlay EN de `site_translations`, et
 * calcule la couverture.
 *
 * Le seuil est paramétrable : le garde-fou devient bloquant au fur et à mesure
 * des lots (`--min=100` à la fin du LOT 3).
 *
 * Usage :
 *   node scripts/audit_entity_translations.mjs
 *   node scripts/audit_entity_translations.mjs --min=100
 *   node scripts/audit_entity_translations.mjs --entity=team
 * ==============================================================================
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const REGISTRY = JSON.parse(readFileSync('src/lib/i18n/entities.json', 'utf8'));

const minArg = process.argv.find((a) => a.startsWith('--min='));
const MIN = minArg ? Number(minArg.split('=')[1]) : 0;
const onlyEntity = process.argv.find((a) => a.startsWith('--entity='))?.split('=')[1];

const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
const FR_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|du|au|aux|par|plus|tout|tous|depuis|entre|ce|cette|ces|qui|que)\b/i;
const isFrench = (s) => typeof s === 'string' && s.trim().length > 3 && (ACCENTS.test(s) || FR_HINT.test(s));

/**
 * Aplatit une valeur en feuilles textuelles : { chemin: texte }.
 *
 * `onlyFrench` doit valoir true pour la SOURCE (on ne mesure que le texte
 * français à traduire) et false pour l'OVERLAY EN — sinon les traductions
 * anglaises, qui ne « ressemblent » pas à du français, seraient ignorées et la
 * couverture serait faussement nulle.
 */
function flatten(value, prefix, out, onlyFrench) {
    if (typeof value === 'string') {
        if (!onlyFrench || isFrench(value)) out[prefix] = value;
        return out;
    }
    if (Array.isArray(value)) {
        value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out, onlyFrench));
        return out;
    }
    if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
            flatten(v, prefix ? `${prefix}.${k}` : k, out, onlyFrench);
        }
    }
    return out;
}

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (res.status === 404) return null; // table absente du schéma : signalée, non bloquante
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

const overlays = await rest('site_translations?select=entity,entity_id,locale,payload&locale=eq.en');
const overlayIndex = new Map();
for (const row of overlays) overlayIndex.set(`${row.entity}|${row.entity_id}`, row.payload || {});

const results = [];
let grandTotal = 0;
let grandCovered = 0;

for (const def of REGISTRY.entities) {
    if (onlyEntity && def.entity !== onlyEntity) continue;

    // Entité « overlay seul » (aucune table source : miroir JSON `site_settings`).
    // Aucun lien de table n'est inventé : elle est signalée et ignorée ici, sa
    // résolution EN passant par `site_translations` uniquement.
    if (!def.table) {
        results.push({
            entity: def.entity,
            label: def.label,
            total: 0,
            covered: 0,
            missing: [],
            overlayOnly: true,
        });
        continue;
    }

    const rows = await rest(`${def.table}?select=*`);
    if (!rows) {
        console.warn(`  ⚠️  ${def.label} : table « ${def.table} » absente du schéma — entité ignorée.`);
        results.push({ entity: def.entity, label: def.label, total: 0, covered: 0, missing: [], unavailable: true });
        continue;
    }
    let total = 0;
    let covered = 0;
    const missing = [];

    /**
     * Vrai si la valeur est RÉDIGÉE EN FRANÇAIS. Le test combine accents et
     * mots-outils, et se méfie des faux positifs : une phrase anglaise citant
     * « Amélie », « André Malraux » ou « Charles de Gaulle » reste anglaise.
     */
    const FR_ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
    const FR_WORDS =
        /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|est|sont|du|au|aux|par|qui|que|ne|pas|plus|tout|tous|elle|ils|elles|chez|nous|vous|notre|nos|vos|ses|son|sa|ce|cette|ces)\b/gi;
    const EN_WORDS =
        /\b(the|of|and|to|in|a|an|is|are|was|were|with|for|his|her|their|who|that|when|after|from|by|on|at|as|it|he|she|they|while|into|between)\b/gi;
    const isFrenchText = (value) => {
        if (typeof value !== 'string' || !/[a-z]/i.test(value)) return false;
        const en = (value.match(EN_WORDS) ?? []).length;
        const fr = (value.match(FR_WORDS) ?? []).length;
        if (en >= 2 && en >= fr) return false;
        return FR_ACCENTS.test(value) || fr >= 2 || (fr >= 1 && en === 0);
    };

    for (const row of rows) {
        const id = row[def.idField];
        const payload = overlayIndex.get(`${def.entity}|${id}`) || {};
        for (const field of def.fields) {
            const frLeaves = flatten(row[field.name], field.name, {}, true);
            const enLeaves = flatten(payload[field.name], field.name, {}, false);
            for (const [path, frText] of Object.entries(frLeaves)) {
                // Un champ DÉJÀ en anglais (données importées d'IMDb/TMDB, titres de
                // séries étrangères…) n'a pas besoin d'overlay : l'exiger gonflait
                // le déficit d'une couverture qui n'apportait rien au visiteur.
                if (!isFrenchText(frText)) continue;
                total += 1;
                const enText = enLeaves[path];
                if (enText && enText !== frText) covered += 1;
                else missing.push({ id, path, frText });
            }
        }
    }

    grandTotal += total;
    grandCovered += covered;
    results.push({ entity: def.entity, label: def.label, total, covered, missing });
}

const pct = (covered, total) => (total ? Math.round((covered / total) * 1000) / 10 : 100);

console.log('');
console.log('Couverture EN par entité :');
console.log('');
for (const r of results.sort((a, b) => a.covered / (a.total || 1) - b.covered / (b.total || 1))) {
    const p = pct(r.covered, r.total);
    const bar = r.total ? `${r.covered}/${r.total}` : r.unavailable ? 'table absente' : 'aucun champ éditorial';
    console.log(`  ${String(p).padStart(5)} %  ${r.label.padEnd(24)} ${bar}`);
}
const globalPct = pct(grandCovered, grandTotal);
console.log('');
console.log(`  COUVERTURE GLOBALE : ${globalPct} % (${grandCovered}/${grandTotal})`);
console.log('');

const lines = [];
lines.push('# Revue — Couverture EN des entités de données');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} — seuil exigé : **${MIN} %**.`);
lines.push('');
lines.push(`**Couverture globale : ${globalPct} %** (${grandCovered}/${grandTotal} champs éditoriaux).`);
lines.push('');
lines.push('| Entité | Champs FR | Couverts EN | Couverture |');
lines.push('|---|---|---|---|');
for (const r of results) lines.push(`| ${r.label} | ${r.total} | ${r.covered} | ${pct(r.covered, r.total)} % |`);
lines.push('');
for (const r of results.filter((x) => x.missing.length)) {
    lines.push(`## ${r.label} — ${r.missing.length} champ(s) à traduire`);
    lines.push('');
    lines.push('| Fiche | Champ | Texte FR |');
    lines.push('|---|---|---|');
    for (const m of r.missing.slice(0, 400)) {
        const shown = m.frText.length > 180 ? `${m.frText.slice(0, 180)}…` : m.frText;
        lines.push(`| \`${m.id}\` | \`${m.path}\` | ${shown.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
}

mkdirSync('plans', { recursive: true });
mkdirSync('.cache', { recursive: true });
writeFileSync('plans/revue-couverture-entites-en.md', lines.join('\n'), 'utf8');
writeFileSync(
    '.cache/entity-coverage.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), globalPct, results }, null, 2),
    'utf8'
);
console.log('Rapports : plans/revue-couverture-entites-en.md et .cache/entity-coverage.json\n');

if (globalPct < MIN) {
    console.error(`❌ Couverture ${globalPct} % < seuil ${MIN} %\n`);
    process.exit(2);
}
