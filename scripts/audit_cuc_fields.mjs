#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit de couverture des champs éditables (Mode Studio)
 * ==============================================================================
 * Un champ qui *paraît* éditable sans l'être détruit la confiance dans l'outil :
 * la couverture est donc **mesurée**, jamais supposée.
 *
 * Ce script :
 *   1. lit les 15 pages déclarées dans `SITE_PAGES_OPTIONS` du Cockpit ;
 *   2. suit le graphe d'imports de chaque route publique et collecte les
 *      attributs littéraux `data-cuc-field` (et `data-cuc-kind`) ;
 *   3. croise la page d'accueil avec les champs attendus par son éditeur
 *      (`fieldAttr('bloc', 'clé')` de `HomePageEditor`) ;
 *   4. valide les natures de champs contre `CUC_FIELD_KINDS` du protocole
 *      (source unique — aucun doublon de liste ici) ;
 *   5. écrit `plans/revue-couverture-champs-visuels.md`.
 *
 * Code de sortie : 0 si toutes les pages ont au moins un champ annoté et
 * qu'aucune nature inconnue n'est utilisée ; 2 sinon (régression).
 */

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const ADMIN = join(SRC, 'app', '(admin)', 'admin', 'components');
/** Source de vérité des 15 pages : le sélecteur de l'éditeur de pages. */
const PAGES_OPTIONS = join(ADMIN, 'pages-editor', 'pages-options.ts');
/** Forme héritée : le sélecteur a vécu dans la façade `PagesEditorView`. */
const PAGES_EDITOR_LEGACY = join(ADMIN, 'PagesEditorView.tsx');
/**
 * Champs attendus de l'accueil : description déclarative des blocs
 * (`liveEdit: true` = promesse d'édition en place).
 */
const HOME_BLOCKS = join(ADMIN, 'pages-editor', 'home-page', 'home-blocks.ts');
const PROTOCOL = join(SRC, 'lib', 'preview', 'preview-protocol.ts');
const REPORT = join(ROOT, 'plans', 'revue-couverture-champs-visuels.md');

/** Profondeur maximale du graphe d'imports suivi depuis la route. */
const MAX_DEPTH = 4;

/**
 * Suit les imports **et** les ré-exports (`export … from`) : les sections sont
 * très souvent re-exportées par un `index.ts` de dossier, et un graphe qui
 * ignorerait `export` conclurait à tort que l'accueil n'a aucun champ.
 */
const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const FIELD_ATTR_RE = /data-cuc-field=(["'])((?:(?!\1).)+)\1/g;
const FIELD_DYNAMIC_RE = /data-cuc-field=\{(?!["'])/g;
const KIND_ATTR_RE = /data-cuc-kind=(["'])((?:(?!\1).)+)\1/g;
/**
 * Champs posés via les helpers partagés (`cucField('chemin')`,
 * `itemPath('bloc', index, 'clé')`) : ce sont des champs réels, l'audit doit les
 * compter. Sans cela, adopter le helper ferait chuter la couverture mesurée.
 */
const FIELD_HELPER_RE = /cucField\(\s*'([^']+)'/g;
const ITEM_HELPER_RE = /itemPath\(\s*'([^']+)'\s*,\s*[^,)]+\s*,\s*'([^']+)'\s*\)/g;

function read(file) {
    return readFileSync(file, 'utf8');
}

/**
 * Les 15 slugs de pages déclarés par le Cockpit (source de vérité unique).
 * Lit `pages-options.ts` et retombe sur l'ancien emplacement si besoin : un
 * audit qui ne trouve plus sa source doit le dire, pas mesurer zéro page.
 */
function extractPages() {
    const source = existsSync(PAGES_OPTIONS)
        ? read(PAGES_OPTIONS)
        : existsSync(PAGES_EDITOR_LEGACY)
            ? read(PAGES_EDITOR_LEGACY)
            : null;
    if (!source) return [];
    const start = source.indexOf('const SITE_PAGES_OPTIONS');
    if (start < 0) return [];
    const block = source.slice(start, source.indexOf('];', start));
    return [...block.matchAll(/value:\s*'([^']+)'/g)].map((match) => match[1]);
}

/** Natures autorisées, lues dans le protocole (aucune liste dupliquée). */
function extractFieldKinds() {
    const source = read(PROTOCOL);
    const match = source.match(/CUC_FIELD_KINDS[^=]*=\s*\[([\s\S]*?)\]/);
    if (!match) return [];
    return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

/**
 * Champs attendus pour l'accueil : tout champ marqué `liveEdit: true` dans la
 * description déclarative des blocs est promis à l'édition en place — l'audit
 * exige donc son annotation côté vitrine.
 */
function extractExpectedHomeFields() {
    if (!existsSync(HOME_BLOCKS)) return [];
    const source = read(HOME_BLOCKS);

    const blocks = [...source.matchAll(/id:\s*'([^']+)'/g)].map((match) => ({
        id: match[1],
        start: match.index ?? 0,
    }));

    const fields = [];
    blocks.forEach((block, index) => {
        const end = blocks[index + 1]?.start ?? source.length;
        const body = source.slice(block.start, end);
        for (const field of body.matchAll(/\{\s*key:\s*'([^']+)'[^{}]*\}/g)) {
            if (/liveEdit:\s*true/.test(field[0])) {
                fields.push(`sections_data.${block.id}.${field[1]}`);
            }
        }
    });
    return fields;
}

function routeFileFor(slug) {
    const base = join(SRC, 'app', '(site)', '[locale]');
    return slug === '/' ? join(base, 'page.tsx') : join(base, slug, 'page.tsx');
}

/** Résout un spécifieur d'import en fichier du dépôt (ou null). */
function resolveSpecifier(specifier, fromFile) {
    let base;
    if (specifier.startsWith('@/')) base = join(SRC, specifier.slice(2));
    else if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
    else return null;

    const candidates = [
        base,
        `${base}.tsx`,
        `${base}.ts`,
        join(base, 'index.tsx'),
        join(base, 'index.ts'),
    ];
    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
}

/** Graphe d'imports transitif depuis une route (borné, sans tests). */
function collectFiles(entry, depth = 0, visited = new Set()) {
    if (depth > MAX_DEPTH || !entry || visited.has(entry) || !existsSync(entry)) {
        return visited;
    }
    visited.add(entry);
    const source = read(entry);
    for (const match of source.matchAll(IMPORT_RE)) {
        const resolved = resolveSpecifier(match[1], entry);
        if (!resolved || resolved.includes('.test.')) continue;
        collectFiles(resolved, depth + 1, visited);
    }
    return visited;
}

function analyzePage(slug) {
    const route = routeFileFor(slug);
    const result = {
        slug,
        route: relative(ROOT, route),
        routeExists: existsSync(route),
        fields: new Set(),
        listFields: new Set(),
        kinds: new Set(),
        dynamic: [],
        files: new Set(),
    };

    if (!result.routeExists) return result;

    for (const file of collectFiles(route)) {
        const source = read(file);
        const rel = relative(ROOT, file);

        for (const match of source.matchAll(FIELD_ATTR_RE)) {
            result.fields.add(match[2]);
            result.files.add(rel);
        }
        for (const match of source.matchAll(FIELD_HELPER_RE)) {
            result.fields.add(match[1]);
            result.files.add(rel);
        }
        for (const match of source.matchAll(ITEM_HELPER_RE)) {
            result.listFields.add(`sections_data.${match[1]}.items[].${match[2]}`);
            result.files.add(rel);
        }
        for (const match of source.matchAll(KIND_ATTR_RE)) {
            result.kinds.add(match[2]);
        }
        const dynamicCount = [...source.matchAll(FIELD_DYNAMIC_RE)].length;
        if (dynamicCount > 0) {
            result.dynamic.push(`${rel} (${dynamicCount})`);
        }
    }

    return result;
}

function main() {
    const pages = extractPages();
    if (pages.length === 0) {
        console.error(
            '[audit:cuc-fields] ÉCHEC — aucune page extraite : vérifier `pages-options.ts` (source du sélecteur).'
        );
        process.exitCode = 2;
        return;
    }
    const fieldKinds = extractFieldKinds();
    const expectedHome = extractExpectedHomeFields();
    const results = pages.map(analyzePage);

    const unknownKinds = new Set();
    for (const result of results) {
        for (const kind of result.kinds) {
            if (!fieldKinds.includes(kind)) unknownKinds.add(kind);
        }
    }

    const home = results.find((result) => result.slug === '/');
    const missingHomeFields = expectedHome.filter(
        (field) => home && !home.fields.has(field)
    );

    const emptyPages = results.filter(
        (result) => result.fields.size + result.listFields.size === 0
    );
    const missingRoutes = results.filter((result) => !result.routeExists);
    const failures = emptyPages.length + missingRoutes.length + unknownKinds.size;

    const lines = [];
    lines.push('# Revue — Couverture des champs éditables (Mode Studio)');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_cuc_fields.mjs\`.`);
    lines.push('');
    lines.push('## 1. Couverture par page');
    lines.push('');
    lines.push('| Page | Champs | Dont listes | Fichiers porteurs | Statut |');
    lines.push('| --- | ---: | ---: | --- | --- |');
    for (const result of results) {
        const total = result.fields.size + result.listFields.size;
        const status = !result.routeExists
            ? '❌ route absente'
            : total === 0
                ? '❌ 0 champ'
                : '✅';
        lines.push(
            `| \`${result.slug}\` | ${total} | ${result.listFields.size} | ${[...result.files].map((file) => `\`${file}\``).join(', ') || '—'} | ${status} |`
        );
    }
    lines.push('');
    lines.push('## 2. Croisement avec l’éditeur d’accueil');
    lines.push('');
    if (expectedHome.length === 0) {
        lines.push('Aucun champ `liveEdit: true` détecté dans `home-blocks.ts` (vérifier la description déclarative).');
    } else if (missingHomeFields.length === 0) {
        lines.push(`✅ Les ${expectedHome.length} champs promis par l’éditeur d’accueil (\`liveEdit\`) sont annotés côté vitrine.`);
    } else {
        lines.push(
            `❌ ${missingHomeFields.length}/${expectedHome.length} champs promis sans annotation côté vitrine :`
        );
        lines.push('');
        for (const field of missingHomeFields) lines.push(`- \`${field}\``);
    }
    lines.push('');
    lines.push('## 3. Natures de champs (`data-cuc-kind`)');
    lines.push('');
    lines.push(`Natures autorisées : ${fieldKinds.map((kind) => `\`${kind}\``).join(', ')}.`);
    lines.push('');
    if (unknownKinds.size === 0) {
        lines.push('✅ Aucune nature inconnue.');
    } else {
        lines.push(`❌ Natures inconnues : ${[...unknownKinds].map((kind) => `\`${kind}\``).join(', ')}.`);
    }
    lines.push('');
    lines.push('## 4. Attributs dynamiques (non auditables par littéral)');
    lines.push('');
    const dynamicEntries = results.flatMap((result) => result.dynamic);
    if (dynamicEntries.length === 0) {
        lines.push('Aucun : tous les champs sont déclarés en littéral.');
    } else {
        for (const entry of dynamicEntries) lines.push(`- \`${entry}\``);
    }
    lines.push('');
    lines.push('## 5. Synthèse');
    lines.push('');
    lines.push(`- Pages auditées : ${results.length}`);
    lines.push(`- Pages sans aucun champ : ${emptyPages.length}`);
    lines.push(`- Routes absentes : ${missingRoutes.length}`);
    lines.push(`- Natures inconnues : ${unknownKinds.size}`);
    lines.push(
        `- Champs de liste (\`itemPath\`) : ${results.reduce((sum, result) => sum + result.listFields.size, 0)}`
    );
    lines.push('');
    lines.push(
        failures === 0
            ? '✅ Couverture conforme : chaque page expose au moins un champ éditable.'
            : '❌ Régression de couverture : les pages sans champ ne sont pas éditables en place.'
    );
    lines.push('');

    writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

    console.log(`[audit:cuc-fields] ${results.length} pages auditées.`);
    console.log(`[audit:cuc-fields] Rapport : ${relative(ROOT, REPORT)}`);
    if (emptyPages.length > 0) {
        console.log(
            `[audit:cuc-fields] Pages sans champ : ${emptyPages.map((page) => page.slug).join(', ')}`
        );
    }
    if (missingRoutes.length > 0) {
        console.log(
            `[audit:cuc-fields] Routes absentes : ${missingRoutes.map((page) => page.route).join(', ')}`
        );
    }
    if (unknownKinds.size > 0) {
        console.log(`[audit:cuc-fields] Natures inconnues : ${[...unknownKinds].join(', ')}`);
    }

    if (failures > 0) {
        console.error('[audit:cuc-fields] ÉCHEC — couverture incomplète (code 2).');
        process.exitCode = 2;
    } else {
        console.log('[audit:cuc-fields] OK — couverture complète.');
    }
}

main();
