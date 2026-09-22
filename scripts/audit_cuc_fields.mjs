#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit de couverture des champs éditables (Mode Studio)
 * ==============================================================================
 * Un champ qui *paraît* éditable sans l'être détruit la confiance dans l'outil :
 * la couverture est donc **mesurée**, jamais supposée. Trois garanties :
 *
 *   1. chaque page expose au moins un champ annoté (`data-cuc-field`) ;
 *   2. chaque champ **promis** par un éditeur du Cockpit est réellement annoté
 *      côté vitrine : `liveEdit` de l'accueil, formulaires
 *      `sections_data?.<bloc>?.<clé>` (Team Building, Formation, Contact) et
 *      items d'ateliers / formules / stages — y compris via un gabarit
 *      (`sections_data.…items.${index}.titre`, normalisé en `*`) ;
 *   3. toute nature `data-cuc-kind` appartient à `CUC_FIELD_KINDS`.
 *
 * Les champs de lien (`*_link`, `*_url`) sont hors promesse : ils se règlent
 * avec le sélecteur du formulaire, pas en saisie de texte dans la page.
 *
 * Sortie : `plans/revue-couverture-champs-visuels.md`, code 2 en cas de
 * régression (page sans champ, promesse non tenue, nature inconnue).
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
/** Promesses d'édition en place de l'accueil (description déclarative). */
const HOME_BLOCKS = join(ADMIN, 'pages-editor', 'home-page', 'home-blocks.ts');
const PROTOCOL = join(SRC, 'lib', 'preview', 'preview-protocol.ts');
const REPORT = join(ROOT, 'plans', 'revue-couverture-champs-visuels.md');

/** Profondeur maximale du graphe d'imports suivi depuis la route. */
const MAX_DEPTH = 4;

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const FIELD_ATTR_RE = /data-cuc-field=(["'])((?:(?!\1).)+)\1/g;
/** Gabarits : `data-cuc-field={`sections_data.x.items.${i}.t`}` — normalisés en `*`. */
const FIELD_ATTR_TEMPLATE_RE = /data-cuc-field=\{`([^`]+)`\}/g;
const FIELD_DYNAMIC_RE = /data-cuc-field=\{(?!["'`])/g;
const KIND_ATTR_RE = /data-cuc-kind=(["'])((?:(?!\1).)+)\1/g;
const FIELD_HELPER_RE = /cucField\(\s*'([^']+)'/g;
const FIELD_HELPER_TEMPLATE_RE = /cucField\(\s*`([^`]+)`/g;
const ITEM_HELPER_RE = /itemPath\(\s*'([^']+)'\s*,\s*[^,)]+\s*,\s*'([^']+)'\s*\)/g;

/**
 * Sources des promesses d'édition en place, éditeur par éditeur.
 * `items` décrit la variable d'itération et le chemin canonique du tableau.
 */
const EDITOR_PROMISE_SOURCES = [
    {
        slug: '/',
        file: HOME_BLOCKS,
        homeLiveEdit: true,
        items: [],
    },
    {
        slug: 'team-building-cascades',
        file: join(ADMIN, 'pages-editor', 'TeamBuildingPageEditor.tsx'),
        items: [{ varName: 'ws', path: 'sections_data.workshops' }],
    },
    {
        slug: 'formation-de-cascadeur',
        file: join(ADMIN, 'pages-editor', 'FormationPageEditor.tsx'),
        items: [{ varName: 'formule', path: 'sections_data.formules.items' }],
    },
    {
        slug: 'stages-cascades-parkour-2',
        file: join(ADMIN, 'pages-editor', 'StagesPageEditor.tsx'),
        items: [{ varName: 'stg', path: 'sections_data.stages_catalogue.items' }],
    },
    { slug: 'contact-cuc', file: join(ADMIN, 'pages-editor', 'ContactPageEditor.tsx'), items: [] },
];

function read(file) {
    return readFileSync(file, 'utf8');
}

/** Les 15 slugs de pages déclarés par le Cockpit (source de vérité unique). */
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

/** Champs `liveEdit: true` de l'accueil — promesse d'édition en place. */
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

/** Clés techniques ou non éditables en saisie de texte : hors promesse. */
function isTechnicalKey(key) {
    return (
        key === 'id' ||
        key === 'items' ||
        key === 'length' ||
        key === 'src' ||
        key === 'alt' ||
        key === 'href' ||
        key === 'link' ||
        key.startsWith('is_') ||
        key.endsWith('_link') ||
        key.endsWith('_url')
    );
}

/** Chemin normalisé : les index de gabarit deviennent `*`. */
function normalizeTemplate(template) {
    return template.replace(/\$\{[^}]*\}/g, '*');
}

/** Un chemin est-il « prouvé » par l'ensemble des annotations d'une page ? */
function isAnnotated(annotated, path) {
    if (annotated.has(path)) return true;
    // Un item annoté par gabarit (`items.*`) couvre un item promis au même
    // niveau, mais jamais l'inverse : on exige la correspondance exacte.
    return false;
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
        templates: new Set(),
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
        for (const match of source.matchAll(FIELD_ATTR_TEMPLATE_RE)) {
            result.templates.add(normalizeTemplate(match[1]));
            result.files.add(rel);
        }
        for (const match of source.matchAll(FIELD_HELPER_TEMPLATE_RE)) {
            result.templates.add(normalizeTemplate(match[1]));
            result.files.add(rel);
        }
        for (const match of source.matchAll(ITEM_HELPER_RE)) {
            result.listFields.add(`sections_data.${match[1]}.items.*.${match[2]}`);
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

/** Promesses d'édition par page : chemins normalisés exigés côté vitrine. */
function extractEditorPromises() {
    const promises = new Map();

    for (const source of EDITOR_PROMISE_SOURCES) {
        if (!existsSync(source.file)) continue;
        const text = read(source.file);
        const set = promises.get(source.slug) ?? new Set();

        if (source.homeLiveEdit) {
            for (const field of extractExpectedHomeFields()) set.add(field);
        }

        for (const match of text.matchAll(/sections_data\?\.(\w+)\?\.(\w+)/g)) {
            const [, block, key] = match;
            if (isTechnicalKey(key)) continue;
            set.add(`sections_data.${block}.${key}`);
        }

        for (const item of source.items) {
            const itemRe = new RegExp(`\\b${item.varName}\\.(\\w+)`, 'g');
            for (const match of text.matchAll(itemRe)) {
                const key = match[1];
                if (isTechnicalKey(key) || key === 'id') continue;
                set.add(`${item.path}.*.${key}`);
            }
        }

        if (set.size > 0) promises.set(source.slug, set);
    }

    return promises;
}

/** Violations : promesses non tenues, page par page. */
function analyzePromises(pages, promises) {
    const violations = [];
    for (const [slug, expected] of promises) {
        const page = pages.find((result) => result.slug === slug);
        if (!page || !page.routeExists) {
            violations.push({ slug, missing: [...expected] });
            continue;
        }
        const annotated = new Set([...page.fields, ...page.listFields, ...page.templates]);
        const missing = [...expected].filter((path) => !isAnnotated(annotated, path));
        if (missing.length > 0) violations.push({ slug, missing });
    }
    return violations;
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
    const results = pages.map(analyzePage);
    const promises = extractEditorPromises();
    const violations = analyzePromises(results, promises);

    const unknownKinds = new Set();
    for (const result of results) {
        for (const kind of result.kinds) {
            if (!fieldKinds.includes(kind)) unknownKinds.add(kind);
        }
    }

    const emptyPages = results.filter(
        (result) => result.fields.size + result.listFields.size + result.templates.size === 0
    );
    const missingRoutes = results.filter((result) => !result.routeExists);
    const promisedCount = [...promises.values()].reduce((sum, set) => sum + set.size, 0);
    const missingPromiseCount = violations.reduce((sum, v) => sum + v.missing.length, 0);
    const failures =
        emptyPages.length +
        missingRoutes.length +
        unknownKinds.size +
        violations.length;

    const lines = [];
    lines.push('# Revue — Couverture des champs éditables (Mode Studio)');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_cuc_fields.mjs\`.`);
    lines.push('');
    lines.push('## 1. Couverture par page');
    lines.push('');
    lines.push('| Page | Champs | Dont listes | Dont gabarits | Fichiers porteurs | Statut |');
    lines.push('| --- | ---: | ---: | ---: | --- | --- |');
    for (const result of results) {
        const total = result.fields.size + result.listFields.size + result.templates.size;
        const status = !result.routeExists
            ? '❌ route absente'
            : total === 0
                ? '❌ 0 champ'
                : '✅';
        lines.push(
            `| \`${result.slug}\` | ${total} | ${result.listFields.size} | ${result.templates.size} | ${[...result.files].map((file) => `\`${file}\``).join(', ') || '—'} | ${status} |`
        );
    }
    lines.push('');
    lines.push('## 2. Promesses des éditeurs (édition en place)');
    lines.push('');
    lines.push(
        'Chaque champ promis par un éditeur du Cockpit (`liveEdit`, formulaires, items d’ateliers, de formules et de stages) doit porter une annotation côté vitrine. Les champs de lien (`*_link`, `*_url`) en sont exclus : ils se règlent avec le sélecteur du formulaire.'
    );
    lines.push('');
    if (promises.size === 0) {
        lines.push('Aucune promesse détectée (vérifier les chemins des éditeurs).');
    } else {
        lines.push('| Page | Champs promis | Manquants | Statut |');
        lines.push('| --- | ---: | ---: | --- |');
        for (const [slug, set] of promises) {
            const violation = violations.find((entry) => entry.slug === slug);
            const missing = violation ? violation.missing.length : 0;
            lines.push(
                `| \`${slug}\` | ${set.size} | ${missing} | ${missing === 0 ? '✅' : '❌'} |`
            );
        }
        lines.push('');
        if (violations.length === 0) {
            lines.push(`✅ Les ${promisedCount} champs promis sont annotés côté vitrine.`);
        } else {
            lines.push(
                `❌ ${missingPromiseCount} champ(s) promis sans annotation — ils ne seront pas cliquables dans l’aperçu :`
            );
            lines.push('');
            for (const violation of violations) {
                lines.push(`- \`${violation.slug}\` : ${violation.missing.map((path) => `\`${path}\``).join(', ')}`);
            }
        }
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
        lines.push('Aucun : tous les champs sont déclarés en littéral ou en gabarit.');
    } else {
        for (const entry of dynamicEntries) lines.push(`- \`${entry}\``);
    }
    lines.push('');
    lines.push('## 5. Synthèse');
    lines.push('');
    lines.push(`- Pages auditées : ${results.length}`);
    lines.push(`- Pages sans aucun champ : ${emptyPages.length}`);
    lines.push(`- Routes absentes : ${missingRoutes.length}`);
    lines.push(`- Promesses d'éditeurs : ${promisedCount} champ(s), ${missingPromiseCount} manquant(s)`);
    lines.push(`- Natures inconnues : ${unknownKinds.size}`);
    lines.push(
        `- Champs de liste (\`itemPath\`) : ${results.reduce((sum, result) => sum + result.listFields.size, 0)}`
    );
    lines.push('');
    lines.push(
        failures === 0
            ? '✅ Couverture conforme : chaque page éditable, chaque promesse tenue.'
            : '❌ Régression de couverture : une page ou une promesse n’est pas tenue.'
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
    if (violations.length > 0) {
        for (const violation of violations) {
            console.log(
                `[audit:cuc-fields] Promesses non tenues (${violation.slug}) : ${violation.missing.join(', ')}`
            );
        }
    }
    if (unknownKinds.size > 0) {
        console.log(`[audit:cuc-fields] Natures inconnues : ${[...unknownKinds].join(', ')}`);
    }

    if (failures > 0) {
        console.error('[audit:cuc-fields] ÉCHEC — couverture incomplète (code 2).');
        process.exitCode = 2;
    } else {
        console.log('[audit:cuc-fields] OK — couverture et promesses complètes.');
    }
}

main();
