#!/usr/bin/env node
/**
 * APPLIQUE LE CONTENEUR CANONIQUE `.page-shell` SUR LA VITRINE
 * ============================================================
 *
 * Décision produit (2026-09-21) : la vitrine entière adopte la largeur de la
 * page ÉQUIPE (`max-w-[1600px]`). La classe `.page-shell` (globals.css) est la
 * SOURCE UNIQUE de cette largeur ; tout `max-w-7xl` / `max-w-[1600px]` local
 * devient cette classe, pour garantir un alignement parfait entre le chapeau
 * (Navbar), les sections, le pied de page et toutes les pages.
 *
 * Doctrine (AGENTS.md) : dry-run documenté AVANT écriture.
 *   node scripts/apply_canonical_container.mjs            # dry-run (défaut)
 *   node scripts/apply_canonical_container.mjs --apply    # écrit les fichiers
 *
 * Le rapport avant/après est écrit dans `plans/revue-conteneur-canonique.md`
 * dans les deux modes.
 *
 * HORS PÉRIMÈTRE (volontaire) :
 *   - Cockpit `(admin)` : interface outil, pas vitrine ;
 *   - `LightboxModal` : la largeur interne concerne le média affiché ;
 *   - colonnes de texte (`max-w-3xl/xl…`) : largeurs éditoriales légitimes.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');

const ZONES = [
    path.join(ROOT, 'src', 'app', '(site)'),
    path.join(ROOT, 'src', 'components', 'sections'),
    path.join(ROOT, 'src', 'components', 'layout'),
];

/** Fichiers hors zones dont le conteneur doit néanmoins être aligné. */
const EXTRA_FILES = [
    path.join(ROOT, 'src', 'components', 'ui', 'parallax', 'StudioGlobalAtmosphere.tsx'),
];

const SKIP_FILES = new Set([
    'src/components/ui/LightboxModal.tsx',
]);

const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', '.cache', '.staging']);

/**
 * Séquence exacte des conteneurs à convertir. Couvre l'ordre
 * `max-w-… mx-auto px-4 sm:px-6 lg:px-8`, la variante `[1600px]` et la
 * variante Footer `max-w-[1600px] w-full mx-auto …`.
 */
const CONTAINER_RE = /max-w-(?:7xl|\[1600px\])(?: w-full)? mx-auto px-4 sm:px-6 lg:px-8/g;

function walk(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), acc);
        } else if (/\.tsx$/.test(entry.name)) {
            acc.push(path.join(dir, entry.name));
        }
    }
    return acc;
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

const targets = [
    ...ZONES.flatMap((z) => walk(z)),
    ...EXTRA_FILES.filter((f) => fs.existsSync(f)),
];

const results = [];
let totalReplacements = 0;
let filesChanged = 0;

for (const file of targets) {
    const relFile = rel(file);
    if (SKIP_FILES.has(relFile)) continue;

    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(CONTAINER_RE);
    if (!matches || matches.length === 0) continue;

    totalReplacements += matches.length;
    filesChanged++;

    const next = content.replace(CONTAINER_RE, 'page-shell');
    results.push({ file: relFile, count: matches.length });
    if (APPLY) fs.writeFileSync(file, next, 'utf8');
}

/* ---------------------- Rapport ---------------------------- */

const md = [];
md.push('# Revue — Conteneur canonique `.page-shell` de la vitrine');
md.push('');
md.push(`**Mode :** ${APPLY ? 'APPLIQUÉ (--apply)' : 'DRY-RUN (aucune écriture)'}`);
md.push(`**Généré le :** ${new Date().toISOString()}`);
md.push('');
md.push('> Décision : toutes les pages vitrine adoptent la largeur de la page');
md.push('> équipe (1600 px). `.page-shell` remplace les conteneurs locaux');
md.push('> `max-w-7xl` / `max-w-[1600px]`. Le Cockpit est hors périmètre.');
md.push('');
md.push(`- Fichiers modifiés : **${filesChanged}**`);
md.push(`- Conteneurs convertis : **${totalReplacements}**`);
md.push('');
md.push('| Fichier | Conteneurs convertis |');
md.push('| --- | --- |');
for (const r of results.sort((a, b) => b.count - a.count)) {
    md.push(`| \`${r.file}\` | ${r.count} |`);
}
md.push('');
md.push('Vérification : `node scripts/audit_full_app.mjs` (règle n°9 — 0 écart).');
md.push('');

fs.mkdirSync(path.join(ROOT, 'plans'), { recursive: true });
fs.writeFileSync(
    path.join(ROOT, 'plans', 'revue-conteneur-canonique.md'),
    md.join('\n'),
    'utf8'
);

console.log(`=== Conteneur canonique .page-shell — ${APPLY ? 'APPLIQUÉ' : 'DRY-RUN'} ===`);
console.log(`Fichiers modifiés     : ${filesChanged}`);
console.log(`Conteneurs convertis  : ${totalReplacements}`);
console.log('Rapport               : plans/revue-conteneur-canonique.md');
if (!APPLY) {
    console.log('');
    console.log('Relancer avec --apply pour écrire les fichiers.');
}
