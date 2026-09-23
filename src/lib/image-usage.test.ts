import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

/**
 * Garde-fou statique — hygiène des images (feuille de route, Priorité 3.2).
 *
 * Pourquoi un test statique et pas seulement une revue : le sur-téléchargement
 * d'images est invisible en développement (le navigateur reçoit une grande image
 * et la réduit), il ne casse aucun build et n'est signalé par aucun lint. Le
 * seul moment où il se paie est en production, sur le réseau du visiteur.
 *
 * Le test échoue si :
 *   1. une balise `<img>` brute est écrite dans `src/` (hors tests) — elle
 *      contourne `next/image` (aucun `srcset`, aucun format moderne) ;
 *   2. une `<Image fill>` de `next/image` ne déclare pas ses `sizes` — sans
 *      `sizes`, Next sert la largeur maximale à tous les écrans ;
 *   3. une `<Image>` sans `fill` ne déclare ni `width`+`height` ni `sizes` —
 *      Next ne peut alors pas réserver la place (décalage de mise en page).
 *
 * Limite assumée : une image dont les tailles arrivent par spread (`{...props}`)
 * n'est pas vérifiable statiquement ; la règle est donc désactivée pour ces
 * balises, jamais contournée silencieusement (le spread est détecté à part).
 */

const SRC = join(process.cwd(), 'src');
const SCANNED_EXT = new Set(['.ts', '.tsx']);

/**
 * Exceptions justifiées : aucune à ce jour. Toute entrée doit nommer le fichier
 * (chemin relatif à la racine) et la raison — jamais « pour faire passer ».
 */
const ALLOWLIST = new Map<string, string>();

type Rule = 'raw-img' | 'fill-sizes' | 'intrinsic-size';

interface Issue {
    file: string;
    line: number;
    rule: Rule;
    message: string;
}

/** Avance jusqu'au `>` de fin de tag, en ignorant commentaires et chaînes. */
function findTagEnd(source: string, from: number): number | null {
    let depth = 0;
    let quote: string | null = null;

    for (let i = from; i < source.length; i += 1) {
        const char = source[i];

        if (quote) {
            if (char === '\\') i += 1;
            else if (char === quote) quote = null;
            continue;
        }
        if (char === '/' && source[i + 1] === '/') {
            const newline = source.indexOf('\n', i);
            if (newline === -1) return null;
            i = newline;
            continue;
        }
        if (char === '/' && source[i + 1] === '*') {
            const close = source.indexOf('*/', i + 2);
            if (close === -1) return null;
            i = close + 1;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            continue;
        }
        if (char === '{') {
            depth += 1;
            continue;
        }
        if (char === '}') {
            depth = Math.max(0, depth - 1);
            continue;
        }
        if (char === '>' && depth === 0) return i;
    }
    return null;
}

/** Index du `}` fermant une expression `{…}`, ou fin de chaîne. */
function skipExpression(source: string, from: number): number {
    let depth = 0;
    let quote: string | null = null;

    for (let i = from; i < source.length; i += 1) {
        const char = source[i];
        if (quote) {
            if (char === '\\') i += 1;
            else if (char === quote) quote = null;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            continue;
        }
        if (char === '{') depth += 1;
        else if (char === '}') {
            depth -= 1;
            if (depth === 0) return i;
        }
    }
    return source.length;
}

/** Noms d'attributs d'un tag, hors expressions JSX et hors littéraux. */
function parseAttributes(attributeText: string): { attrs: Set<string>; hasSpread: boolean } {
    const attrs = new Set<string>();
    const hasSpread = /\{\s*\.\.\./.test(attributeText);

    for (let i = 0; i < attributeText.length; i += 1) {
        const char = attributeText[i];

        if (char === '/' && (attributeText[i + 1] === '/' || attributeText[i + 1] === '*')) {
            const close = attributeText[i + 1] === '/'
                ? attributeText.indexOf('\n', i)
                : attributeText.indexOf('*/', i + 2);
            if (close === -1) break;
            i = close + 1;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            const quote = char;
            i += 1;
            while (i < attributeText.length && attributeText[i] !== quote) {
                if (attributeText[i] === '\\') i += 1;
                i += 1;
            }
            continue;
        }
        if (char === '{') {
            i = skipExpression(attributeText, i);
            continue;
        }
        if (/[A-Za-z_$]/.test(char)) {
            let end = i;
            while (end < attributeText.length && /[\w$.-]/.test(attributeText[end])) end += 1;
            attrs.add(attributeText.slice(i, end));
            i = end - 1;
        }
    }

    return { attrs, hasSpread };
}

interface JsxTag {
    attrs: Set<string>;
    hasSpread: boolean;
    line: number;
}

/** Toutes les balises `<Name …>` d'une source, avec leurs attributs. */
function findJsxTags(source: string, name: string): JsxTag[] {
    const tags: JsxTag[] = [];
    const pattern = new RegExp(`<${name}(?=[\\s/>])`, 'g');

    for (const match of source.matchAll(pattern)) {
        const start = match.index;
        const end = findTagEnd(source, start + match[0].length);
        if (end === null) continue;

        const attributeText = source.slice(start + match[0].length, end);
        const { attrs, hasSpread } = parseAttributes(attributeText);
        const line = source.slice(0, start).split('\n').length;
        tags.push({ attrs, hasSpread, line });
    }

    return tags;
}

/** Violations d'hygiène d'une source, quelle que soit son origine. */
function collectIssues(file: string, source: string): Issue[] {
    const issues: Issue[] = [];

    for (const match of source.matchAll(/<img(?=[\s/>])/g)) {
        issues.push({
            file,
            line: source.slice(0, match.index).split('\n').length,
            rule: 'raw-img',
            message: 'balise <img> brute — passer par next/image (srcset + formats modernes)',
        });
    }

    for (const tag of findJsxTags(source, 'Image')) {
        if (tag.attrs.has('fill')) {
            if (!tag.attrs.has('sizes') && !tag.hasSpread) {
                issues.push({
                    file,
                    line: tag.line,
                    rule: 'fill-sizes',
                    message: '<Image fill> sans sizes — Next sert la largeur maximale à tous les écrans',
                });
            }
        } else if (!tag.hasSpread && !(tag.attrs.has('width') && tag.attrs.has('height'))) {
            issues.push({
                file,
                line: tag.line,
                rule: 'intrinsic-size',
                message: '<Image> sans width/height ni fill — place non réservée (décalage de mise en page)',
            });
        }
    }

    return issues;
}

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

function scannedFiles(): string[] {
    return walk(SRC)
        .filter((file) => SCANNED_EXT.has(extname(file)))
        .filter((file) => !/\.(test|spec)\./.test(file));
}

let cachedIssues: Issue[] | null = null;
function repoIssues(): Issue[] {
    if (!cachedIssues) {
        cachedIssues = scannedFiles().flatMap((file) =>
            collectIssues(relative(process.cwd(), file), readFileSync(file, 'utf8'))
        );
    }
    return cachedIssues.filter((issue) => !ALLOWLIST.has(issue.file));
}

function formatIssues(issues: Issue[]): string {
    return issues.map((issue) => `${issue.file}:${issue.line} — ${issue.message}`).join('\n');
}

describe('Hygiène des images — next/image avec tailles explicites', () => {
    it('le détecteur fonctionne (contrôle négatif sur sources synthétiques)', () => {
        const bad = collectIssues('synth.tsx', [
            '<img src="/a.jpg" alt="brut" />',
            '<Image fill src="/b.jpg" alt="" />',
            '<Image src="/c.jpg" alt="" />',
        ].join('\n'));

        expect(bad.map((issue) => issue.rule)).toEqual(['raw-img', 'fill-sizes', 'intrinsic-size']);

        const good = collectIssues('synth.tsx', [
            '<Image fill sizes="100vw" src="/a.jpg" alt="" />',
            '<Image width={64} height={64} src="/b.jpg" alt="" />',
            '<Image {...props} alt="" />',
            '<svg><path fill="currentColor" d="M0 0" /></svg>',
        ].join('\n'));

        expect(good).toEqual([]);
    });

    it('aucune balise <img> brute dans src/ (hors tests)', () => {
        const issues = repoIssues().filter((issue) => issue.rule === 'raw-img');
        expect(issues, formatIssues(issues)).toEqual([]);
    });

    it('toute <Image fill> de src/ déclare ses sizes', () => {
        const issues = repoIssues().filter((issue) => issue.rule === 'fill-sizes');
        expect(issues, formatIssues(issues)).toEqual([]);
    });

    it('toute <Image> de src/ réserve sa place (width+height, fill, ou spread vérifié ailleurs)', () => {
        const issues = repoIssues().filter((issue) => issue.rule === 'intrinsic-size');
        expect(issues, formatIssues(issues)).toEqual([]);
    });
});
