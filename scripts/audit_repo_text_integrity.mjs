#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit d'INTÉGRITÉ DES TEXTES DU DÉPÔT (catalogues `messages/*.json`)
 * ==============================================================================
 * Les catalogues de messages portent TOUTE la copie d'interface du site : ce
 * sont eux qui s'affichent sur chaque page. Ils formaient la dernière surface de
 * texte jamais inspectée (l'audit `audit_text_integrity.mjs` ne lit que la base).
 *
 * Les règles sont **exactement** celles de la base, importées du module partagé
 * `scripts/lib/text-integrity-rules.mjs` : une divergence produirait un site
 * « propre » en base et sale dans l'interface.
 *
 * Aucune écriture : la revue (`plans/revue-integrite-catalogues.md`) sert de
 * base à une correction relue.
 *
 * Usage : node scripts/audit_repo_text_integrity.mjs
 * ==============================================================================
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { inspectText } from './lib/text-integrity-rules.mjs';

const MESSAGES_DIR = 'messages';

/** Parcourt un JSON et renvoie chaque chaîne avec son chemin de clé. */
function walk(value, path, out) {
    if (typeof value === 'string') {
        out.push({ path, text: value });
        return out;
    }
    if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${path}[${index}]`, out));
        return out;
    }
    if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
            walk(item, path ? `${path}.${key}` : key, out);
        }
    }
    return out;
}

const FAMILIES = ['mojibake', 'apostrophes', 'entities', 'doubleSpace', 'punctuation', 'frenchQuotes'];

/**
 * Dérogations DOCUMENTÉES : clé de catalogue → familles tolérées.
 *
 * Sans dérogation explicite, un signal légitime reviendrait à chaque exécution et
 * l'audit perdrait sa valeur d'alerte. Toute entrée ici est une décision relue,
 * jamais un contournement : retirer l'entrée si la décision change.
 *
 * `home.about.founderQuote` — la citation du fondateur est encadrée de
 * guillemets français (« … ») **dans les deux locales**. Ce n'est pas une fuite
 * de traduction : la paire est équilibrée et identique en FR et en EN, c'est une
 * marque typographique assumée du campus.
 */
const ALLOWED = new Map([['home.about.founderQuote', new Set(['frenchQuotes'])]]);
const TITLES = {
    mojibake: 'textes double-encodés',
    apostrophes: 'textes français sans aucune apostrophe',
    entities: 'entités HTML résiduelles',
    doubleSpace: 'doubles espaces',
    punctuation: 'espace avant ponctuation',
    frenchQuotes: 'textes anglais contenant des guillemets français',
};

const files = readdirSync(MESSAGES_DIR).filter((file) => file.endsWith('.json'));
const review = [];
review.push('# Revue — Intégrité des textes des catalogues (`messages/*.json`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_repo_text_integrity.mjs\`.`);
review.push('');

const totals = Object.fromEntries(FAMILIES.map((family) => [family, 0]));
let totalStrings = 0;

for (const file of files.sort()) {
    const locale = file.replace(/\.json$/, '');
    const raw = readFileSync(join(MESSAGES_DIR, file), 'utf8');

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        console.error(`❌ ${file} : JSON invalide — ${error.message}`);
        process.exit(1);
    }

    const entries = walk(parsed, '', []);
    totalStrings += entries.length;

    const byFamily = Object.fromEntries(FAMILIES.map((family) => [family, []]));

    for (const entry of entries) {
        const found = inspectText(entry.text, locale);
        const tolerated = ALLOWED.get(entry.path);
        for (const family of FAMILIES) {
            if (tolerated?.has(family)) continue;
            for (const defect of found[family]) {
                byFamily[family].push({ key: entry.path, ...defect });
            }
        }
    }

    const parts = FAMILIES.map((family) => `${family} : ${String(byFamily[family].length).padStart(3)}`).join(' · ');
    console.log(`${file.padEnd(12)} chaînes : ${String(entries.length).padStart(5)} · ${parts}`);

    for (const family of FAMILIES) {
        totals[family] += byFamily[family].length;
        if (!byFamily[family].length) continue;
        review.push(`## ${file} — ${byFamily[family].length} ${TITLES[family]}`);
        review.push('');
        review.push('| Clé | Détail | Extrait |');
        review.push('|---|---|---|');
        for (const item of byFamily[family].slice(0, 60)) {
            review.push(
                `| \`${item.key}\` | ${item.detail} | …${String(item.sample).replace(/\|/g, '\\|')}… |`
            );
        }
        review.push('');
    }
}

review.unshift('');
review.splice(
    4,
    0,
    `- Chaînes inspectées : **${totalStrings}** sur ${files.length} catalogue(s)`,
    `- Double-encodage UTF-8 : **${totals.mojibake}**`,
    `- Textes français sans aucune apostrophe : **${totals.apostrophes}**`,
    `- Entités HTML résiduelles : **${totals.entities}**`,
    `- Doubles espaces : **${totals.doubleSpace}**`,
    `- Espace avant ponctuation : **${totals.punctuation}**`,
    `- Guillemets français dans un texte anglais : **${totals.frenchQuotes}**`
);

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-integrite-catalogues.md', review.join('\n'), 'utf8');

console.log('');
console.log(
    `Total — mojibake : ${totals.mojibake} · apostrophes : ${totals.apostrophes} · entités : ${totals.entities} · doubles espaces : ${totals.doubleSpace} · ponctuation : ${totals.punctuation} · guillemets FR : ${totals.frenchQuotes}`
);
console.log('Revue : plans/revue-integrite-catalogues.md\n');
