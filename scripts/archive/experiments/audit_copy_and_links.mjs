/**
 * Inventaire du texte visible et des liens — vitrine et cockpit.
 *
 *   node scripts/audit_copy_and_links.mjs
 *
 * Objectif : remplacer le jugement à l'impression par une mesure. Le script
 * répond à deux questions :
 *
 *  1. **Texte** — quels textes visibles sont longs ? Un texte long n'est pas
 *     fautif en soi, mais c'est là que se logent les descriptions creuses :
 *     reste à trancher, contenu par contenu, entre information réelle et
 *     remplissage. Les méta-descriptions SEO sont signalées à part : elles ne
 *     s'affichent pas et ne doivent pas être coupées pour des raisons de style.
 *
 *  2. **Liens** — quels liens et boutons ne mènent nulle part, sortent sans
 *     `rel="noopener noreferrer"`, ou pointent vers une route inexistante ?
 *
 * Le script est en lecture seule : il ne modifie aucun fichier.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

/** `--top=25` n'affiche que les 25 textes les plus longs par zone. */
const topArg = process.argv.find((arg) => arg.startsWith('--top='));
const TOP = topArg ? Number.parseInt(topArg.split('=')[1], 10) : null;
const onlyZone = (process.argv.find((arg) => arg.startsWith('--zone=')) ?? '').split('=')[1] ?? null;

/** Longueur à partir de laquelle un texte affiché mérite un examen. */
const LONG_TEXT = 110;

const report = {
    longTexts: [],
    metaDescriptions: [],
    links: [],
    buttons: [],
    brokenInternal: [],
};

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
            walk(full, out);
        } else if (/\.(tsx?|mjs)$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

/** Routes réellement servies par l'application (App Router). */
function collectRoutes(dir, out = new Set()) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectRoutes(full, out);
        } else if (entry.name === 'page.tsx') {
            const rel = path.relative(path.join(SRC, 'app'), path.dirname(full));
            const route = '/' + rel.split(path.sep).filter(Boolean).join('/');
            out.add(route === '/' ? '/' : route.replace(/\/$/, ''));
        }
    }
    return out;
}

const files = walk(SRC);
const routes = collectRoutes(path.join(SRC, 'app'));

/**
 * Retire les commentaires avant d'analyser les balises.
 *
 * Sans cela, un commentaire qui *mentionne* `<button>` ou `<a href="…">` est
 * pris pour du code réel : le rapport signalait un bouton inerte qui n'existe
 * pas, uniquement parce qu'un commentaire l'expliquait.
 */
function stripComments(source) {
    return source
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/**
 * Motif des utilitaires Tailwind. Une chaîne qui en contient n'est pas du
 * texte affiché : sans ce filtre, l'inventaire remonte surtout des `className`
 * et devient inexploitable.
 */
const TAILWIND_TOKEN =
    /(^|[\s:])(px|py|pt|pb|pl|pr|mx|my|mt|mb|w|h|min|max|text|bg|border|rounded|flex|grid|gap|items|justify|font|leading|tracking|shadow|hover|focus|active|disabled|transition|duration|opacity|scale|translate|absolute|relative|fixed|sticky|overflow|z|inset|top|left|right|bottom|sm|md|lg|xl|sr|group|peer|cursor|select|pointer|whitespace|truncate|line|space|divide|ring|outline|blur|backdrop|from|to|via)-/;

/** Un littéral ressemble-t-il à du texte affiché plutôt qu'à du code ? */
function looksLikeCopy(text) {
    if (text.length < LONG_TEXT) return false;
    if (/^(https?:|\/|\.\/|@\/)/.test(text)) return false;
    if (TAILWIND_TOKEN.test(text)) return false;
    // Un texte affiché est une phrase : il contient plusieurs mots alphabétiques
    // et une ponctuation de phrase.
    const words = text.split(/\s+/).filter((word) => /^[a-zà-ÿ'’-]{2,}$/i.test(word));
    if (words.length < 8) return false;
    return /[.!?]/.test(text);
}

function extractLiterals(line) {
    const literals = [];
    const patterns = [/'([^'\\]*(?:\\.[^'\\]*)*)'/g, /"([^"\\]*(?:\\.[^"\\]*)*)"/g, /`([^`\\]*(?:\\.[^`\\]*)*)`/g];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
            literals.push(match[1]);
        }
    }
    return literals;
}

for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const isCockpit = rel.includes('/admin/');
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

        for (const literal of extractLiterals(line)) {
            if (!looksLikeCopy(literal)) continue;

            const entry = {
                file: rel,
                line: index + 1,
                zone: isCockpit ? 'cockpit' : 'vitrine',
                length: literal.length,
                text: literal.length > 220 ? `${literal.slice(0, 220)}…` : literal,
            };

            // Les méta-descriptions SEO ne s'affichent pas : à ne pas confondre avec
            // un texte de page à raccourcir.
            if (/meta_description|metaDescription|description:\s*['"]/.test(line) && /seo|meta/i.test(line)) {
                report.metaDescriptions.push(entry);
            } else {
                report.longTexts.push(entry);
            }
        }

    });
}

// --- Liens ---
//
// Analyse sur le fichier entier : une balise `<a>` s'étale presque toujours sur
// plusieurs lignes. Chercher `target` et `rel` sur la seule ligne du `href`
// produisait des faux positifs en masse, et aurait conduit à « corriger » des
// liens déjà corrects.
for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!rel.endsWith('.tsx')) continue;
    const content = stripComments(fs.readFileSync(file, 'utf8'));
    const isCockpit = rel.includes('/admin/');

    const anchorStart = /<a\b/g;
    let match;
    while ((match = anchorStart.exec(content)) !== null) {
        const window = content.slice(match.index, match.index + 700);
        const elementEnd = window.indexOf('>');
        if (elementEnd === -1) continue;
        const opening = window.slice(0, elementEnd);

        const href = /href=\{?["'`]([^"'`]+)["'`]/.exec(opening)?.[1];
        if (!href) continue;

        report.links.push({
            file: rel,
            line: content.slice(0, match.index).split(/\r?\n/).length,
            zone: isCockpit ? 'cockpit' : 'vitrine',
            href,
            external: /^https?:/.test(href),
            newTab: /target=["']_blank["']/.test(opening),
            rel: /rel=["'][^"']*noopener/.test(opening),
        });
    }
}

// --- Boutons sans action ---
//
// Analyse sur le fichier entier et non ligne à ligne : un `<button>` s'étale
// souvent sur plusieurs lignes, ce qui produisait des faux positifs en masse.
for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (!rel.endsWith('.tsx')) continue;
    const content = stripComments(fs.readFileSync(file, 'utf8'));
    const isCockpit = rel.includes('/admin/');

    const buttonStart = /<button\b/g;
    let match;
    while ((match = buttonStart.exec(content)) !== null) {
        const window = content.slice(match.index, match.index + 600);
        const elementEnd = window.indexOf('>');
        const opening = elementEnd === -1 ? window : window.slice(0, elementEnd);
        // Un composant primitif reçoit son gestionnaire par étalement de props
        // (`{...rest}`) : ne pas le compter comme un bouton inerte.
        if (/onClick|type=["'{]|\{\.\.\./.test(opening)) continue;

        const line = content.slice(0, match.index).split(/\r?\n/).length;
        report.buttons.push({
            file: rel,
            line,
            zone: isCockpit ? 'cockpit' : 'vitrine',
            snippet: opening.replace(/\s+/g, ' ').slice(0, 140),
        });
    }
}

// --- Liens internes vers des routes inexistantes ---
const dynamicPrefixes = ['/equipe-cascadeurs-pro/', '/admin/'];
for (const link of report.links) {
    if (link.external || link.href.startsWith('#') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
        continue;
    }
    const clean = link.href.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') continue;
    if (routes.has(clean)) continue;
    if (dynamicPrefixes.some((prefix) => clean.startsWith(prefix))) continue;
    report.brokenInternal.push({ ...link, reason: 'route inexistante' });
}

// --- Sorties ---
console.log('=== AUDIT TEXTE VISIBLE & LIENS ===\n');
console.log(`Fichiers scannés : ${files.length}   Routes connues : ${routes.size}\n`);

const byZone = (zone, list) => list.filter((item) => item.zone === zone);

console.log(`--- Textes visibles longs (≥ ${LONG_TEXT} caractères) : ${report.longTexts.length} ---`);
for (const zone of ['vitrine', 'cockpit']) {
    if (onlyZone && onlyZone !== zone) continue;
    const items = byZone(zone, report.longTexts).sort((a, b) => b.length - a.length);
    const shown = TOP ? items.slice(0, TOP) : items;
    console.log(
        `\n[${zone}] ${items.length}${TOP && items.length > TOP ? ` — ${TOP} plus longs affichés` : ''}`
    );
    shown.forEach((item) => {
        console.log(`  ${String(item.length).padStart(4)}  ${item.file}:${item.line}`);
        console.log(`        ${item.text.replace(/\n/g, ' ')}`);
    });
}

console.log(`\n--- Méta-descriptions SEO (invisibles, à conserver) : ${report.metaDescriptions.length} ---`);

console.log(`\n--- Liens sortants (http) : ${report.links.filter((l) => l.external).length} ---`);
report.links
    .filter((l) => l.external)
    .forEach((l) => {
        const flags = [l.newTab ? 'nouvel onglet' : 'MÊME ONGLET', l.rel ? 'rel=noopener' : 'SANS rel=noopener'];
        console.log(`  ${l.file}:${l.line}  [${flags.join(', ')}]  ${l.href}`);
    });

console.log(`\n--- Liens internes cassés : ${report.brokenInternal.length} ---`);
report.brokenInternal.forEach((l) => console.log(`  ${l.file}:${l.line}  ${l.href}  (${l.reason})`));

console.log(`\n--- Boutons sans onClick ni submit : ${report.buttons.length} ---`);
report.buttons.forEach((b) => console.log(`  ${b.file}:${b.line}  ${b.snippet}`));

fs.writeFileSync(
    path.join(ROOT, 'scripts', 'audit_copy_links_report.json'),
    JSON.stringify(report, null, 2)
);
console.log('\nRapport JSON : scripts/audit_copy_links_report.json');
