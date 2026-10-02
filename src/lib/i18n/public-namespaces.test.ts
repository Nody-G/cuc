/**
 * ==============================================================================
 * Garde-fou WS-F / F1 — la portée du payload i18n NE PEUT PAS perdre un namespace
 * ==============================================================================
 * Le risque réel de F1 : qu'une route n'ait plus, côté client, un namespace lu
 * par un de ses composants → `useTranslations()` échoue. Ce test **recalcule le
 * graphe d'imports** de chaque route publique, collecte les namespaces
 * réellement atteignables (sur-approximé : tous imports suivis), et exige que
 * chacun soit couvert par `SHELL_NAMESPACES ∪ ROUTE_NAMESPACES[slug]`.
 *
 * C'est la plus forte vérification automatisable sans exécuter le rendu : si un
 * composant ajoute `useTranslations('x')` dans l'arbre d'une route sans mettre à
 * jour la carte, ce test échoue.
 *
 * Il vérifie aussi :
 *   - la parité du contrat `PUBLIC_NAMESPACES` avec `messages/{fr,en}.json` ;
 *   - l'absence d'appel `useTranslations()` SANS namespace dans une route
 *     (un tel appel exigerait le catalogue entier → scoping impossible) ;
 *   - les invariants de sûreté (`team` et `common` restent dans la coquille).
 */
/* Globals `describe` / `it` / `expect` fournis par `vitest.config.mts` (globals: true). */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
    PUBLIC_NAMESPACES,
    PUBLIC_ROUTE_SLUGS,
    ROUTE_NAMESPACES,
    ROUTE_OVERLAYS,
    SHELL_NAMESPACES,
    type PublicRouteSlug,
} from './public-namespaces';
import {
    pickMessages,
    pickOverlays,
    pickRouteMessages,
    resolveRouteNamespaces,
    resolveRouteOverlays,
} from './scoped-payload';

/* Racine projet fiable : `npm run test` s'exécute depuis la racine. */
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const SITE = join(SRC, 'app', '(site)', '[locale]');
const MESSAGES = join(ROOT, 'messages');

/* ------------------------------------------------------------------ */
/* Scan de graphe d'imports (fs pur, aucun bundler)                    */
/* ------------------------------------------------------------------ */

const allSrcFiles = new Set<string>();
function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(full)) allSrcFiles.add(full);
    }
}
walk(SRC);

function resolveImport(fromFile: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith('@/')) base = join(SRC, spec.slice(2));
    else if (spec.startsWith('.')) base = resolve(dirname(fromFile), spec);
    else return null;
    const candidates = [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        `${base}.js`,
        join(base, 'index.ts'),
        join(base, 'index.tsx'),
    ];
    for (const candidate of candidates) if (allSrcFiles.has(candidate)) return candidate;
    return null;
}

const IMPORT_RE = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g;
const NS_RE = /(?:useTranslations|getTranslations)\(\s*['"]([^'"]+)['"]/g;
const NOARG_RE = /(?:useTranslations|getTranslations)\(\s*\)/;

/**
 * Retire les commentaires AVANT toute recherche : un exemple de documentation
 * (`useTranslations()` dans un JSDoc) ne doit pas être pris pour un vrai appel.
 */
function stripComments(source: string): string {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((line) => {
            const idx = line.indexOf('//');
            if (idx === -1) return line;
            const before = line.slice(0, idx);
            return before.includes(':') ? line : before;
        })
        .join('\n');
}

const cache = new Map<string, { deps: string[]; ns: string[]; noarg: boolean }>();
function scanFile(file: string) {
    const cached = cache.get(file);
    if (cached) return cached;
    const text = stripComments(readFileSync(file, 'utf8'));

    const deps: string[] = [];
    IMPORT_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = IMPORT_RE.exec(text)) !== null) {
        const resolved = resolveImport(file, match[1]);
        if (resolved) deps.push(resolved);
    }

    const ns: string[] = [];
    NS_RE.lastIndex = 0;
    while ((match = NS_RE.exec(text)) !== null) ns.push(match[1].split('.')[0]);

    const rec = { deps, ns, noarg: NOARG_RE.test(text) };
    cache.set(file, rec);
    return rec;
}

function reachable(entries: string[]): { namespaces: Set<string>; noarg: boolean } {
    const seen = new Set<string>();
    const namespaces = new Set<string>();
    let noarg = false;
    const stack = [...entries];
    while (stack.length > 0) {
        const file = stack.pop()!;
        if (seen.has(file)) continue;
        seen.add(file);
        const rec = scanFile(file);
        for (const n of rec.ns) namespaces.add(n);
        if (rec.noarg) noarg = true;
        for (const dep of rec.deps) stack.push(dep);
    }
    return { namespaces, noarg };
}

function routeEntries(slug: PublicRouteSlug): string[] {
    if (slug === '/') {
        return [join(SITE, 'page.tsx'), join(SITE, 'HomeView.tsx')].filter(existsSync);
    }
    const dir = join(SITE, slug);
    const out: string[] = [];
    const rec = (d: string) => {
        for (const entry of readdirSync(d)) {
            const full = join(d, entry);
            if (statSync(full).isDirectory()) rec(full);
            else if (/\.(ts|tsx)$/.test(full)) out.push(full);
        }
    };
    rec(dir);
    return out;
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('contrat des namespaces publics', () => {
    const frKeys = Object.keys(JSON.parse(readFileSync(join(MESSAGES, 'fr.json'), 'utf8')));
    const enKeys = Object.keys(JSON.parse(readFileSync(join(MESSAGES, 'en.json'), 'utf8')));

    it('PUBLIC_NAMESPACES = exactement les namespaces des catalogues fr et en', () => {
        expect([...PUBLIC_NAMESPACES].sort()).toEqual([...frKeys].sort());
        expect([...PUBLIC_NAMESPACES].sort()).toEqual([...enKeys].sort());
    });

    it('la coquille et les routes ne référencent que des namespaces connus', () => {
        for (const ns of SHELL_NAMESPACES) expect(PUBLIC_NAMESPACES).toContain(ns);
        for (const slug of PUBLIC_ROUTE_SLUGS) {
            for (const ns of ROUTE_NAMESPACES[slug]) expect(PUBLIC_NAMESPACES).toContain(ns);
        }
    });

    it('sûreté (anti-flash) : la coquille porte `common` et `team`', () => {
        expect(SHELL_NAMESPACES).toContain('common');
        expect(SHELL_NAMESPACES).toContain('team');
        for (const slug of PUBLIC_ROUTE_SLUGS) {
            expect(resolveRouteNamespaces(slug)).toContain('team');
            expect(resolveRouteNamespaces(slug)).toContain('common');
        }
    });

    it('toute route déclarée existe et est couverte (graphe d’imports réel)', () => {
        const failures: string[] = [];
        for (const slug of PUBLIC_ROUTE_SLUGS) {
            const entries = routeEntries(slug);
            expect(entries.length, `route ${slug} introuvable`).toBeGreaterThan(0);

            const { namespaces, noarg } = reachable(entries);
            if (noarg) {
                failures.push(
                    `${slug} : appel useTranslations()/getTranslations() SANS namespace → catalogue entier requis`
                );
            }
            const covered = new Set<string>(resolveRouteNamespaces(slug));
            for (const ns of namespaces) {
                if (!covered.has(ns)) {
                    failures.push(`${slug} : namespace « ${ns} » atteignable mais absent de la carte`);
                }
            }
        }
        expect(failures, failures.join('\n')).toEqual([]);
    });

    it('les overlays déclarés sont connus et n’excluent jamais `team` (global)', () => {
        for (const slug of PUBLIC_ROUTE_SLUGS) {
            resolveRouteOverlays(slug).forEach((entity) =>
                expect(['campus_poi', 'campus_facility', 'discipline']).toContain(entity)
            );
        }
        expect(ROUTE_OVERLAYS['visite-guidee']).toContain('campus_facility');
        expect(ROUTE_OVERLAYS['formation-de-cascadeur']).toContain('discipline');
    });
});

describe('sélection pure du payload (scoped-payload)', () => {
    it('pickMessages ne copie que les namespaces demandés et existants', () => {
        const all = { a: { x: 1 }, b: { y: 2 }, c: { z: 3 } };
        expect(pickMessages(all, ['a', 'c', 'absent'])).toEqual({ a: { x: 1 }, c: { z: 3 } });
    });

    it('pickRouteMessages ne retient que les namespaces de la route présents dans la source', () => {
        // `/` déclare `home` + `teamProduction` ; la source ne contient que `home`/`videos`.
        const route = pickRouteMessages({ home: {}, videos: {}, formation: {} }, '/');
        expect(Object.keys(route)).toEqual(['home']);
    });

    it('pickOverlays ignore les entités absentes (jamais de clé vide)', () => {
        expect(pickOverlays({ team: { a: 1 } }, ['team', 'discipline'])).toEqual({ team: { a: 1 } });
        expect(pickOverlays(null, ['team'])).toEqual({});
    });
});
