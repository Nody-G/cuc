import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

/**
 * Garde-fou de non-régression — feuille de style globale.
 *
 * Incident réel constaté en ligne : lors du passage de `src/app/layout.tsx` à
 * `src/app/(site)/[locale]/layout.tsx` + `src/app/(admin)/layout.tsx`, l'import
 * `import "./globals.css"` a été perdu. Plus aucun CSS n'était émis (hors
 * polices `next/font`), d'où :
 *   - logos rendus en taille intrinsèque (SVG sans classes utilitaires) ;
 *   - page blanche, `body { background-color: #060608 }` n'étant plus chargé.
 *
 * Ni `tsc`, ni `eslint`, ni `next build` ne détectaient cette perte : le build
 * réussissait et le site s'affichait... sans styles. D'où ce garde-fou.
 *
 * Le test échoue si :
 *   1. `src/app/globals.css` disparaît ;
 *   2. la feuille n'importe plus Tailwind ;
 *   3. la règle de fond sombre du site disparaît ;
 *   4. plus AUCUN module de `src/` n'importe `globals.css`.
 */

const SRC = join(process.cwd(), 'src');
const GLOBAL_CSS = join(SRC, 'app', 'globals.css');
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IMPORT_PATTERN = /(?:import|from)\s+['"][^'"]*globals\.css['"]/;

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

describe('Feuille de style globale — chargement CSS garanti', () => {
    it('src/app/globals.css existe et importe Tailwind', () => {
        expect(
            existsSync(GLOBAL_CSS),
            `Feuille globale absente : ${relative(process.cwd(), GLOBAL_CSS)}`
        ).toBe(true);

        expect(readFileSync(GLOBAL_CSS, 'utf8')).toMatch(/@import\s+['"]tailwindcss['"]/);
    });

    it('la feuille globale définit le fond sombre du site', () => {
        expect(readFileSync(GLOBAL_CSS, 'utf8')).toMatch(/background-color:\s*#060608/i);
    });

    it("au moins un module de src/ importe globals.css (sinon aucun CSS n'est chargé)", () => {
        const importers = walk(SRC)
            .filter((file) => ALLOWED_EXT.has(extname(file)))
            .filter((file) => !file.includes('global-styles'))
            .filter((file) => IMPORT_PATTERN.test(readFileSync(file, 'utf8')))
            .map((file) => relative(process.cwd(), file));

        expect(
            importers,
            "Aucun module n'importe `globals.css` : Tailwind et le thème CUC ne seraient plus servis au navigateur (site non stylé, logos en taille intrinsèque, page blanche)."
        ).not.toEqual([]);
    });
});
