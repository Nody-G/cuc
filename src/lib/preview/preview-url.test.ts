import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import {
    buildPreviewPath,
    buildPreviewUrl,
    normalizePreviewSlug,
    PREVIEW_LOCALES,
} from './preview-url';

/**
 * Garde-fou de non-régression — aperçu live du Cockpit.
 *
 * Incident réel : l'aperçu passait par une route factice `/admin/preview` qui ne
 * connaissait que les 7 sections de l'accueil. Pour tout autre slug, elle
 * retombait sur le rendu complet de l'accueil — d'où des « pages qui n'existent
 * pas », avec les mêmes visuels que le carrousel de la page d'accueil.
 *
 * Deuxième âge (lot « 404 des brouillons ») : l'aperçu vit sur la route dédiée
 * `/[locale]/preview` (session admin, `instant = false`) qui importe les VRAIS
 * écrans des 15 pages (`preview/screens.ts`) — la vitrine, elle, répond 404
 * pour une page non publiée. Ces tests vérifient :
 *   1. la construction d'URL de l'aperçu (préfixe de locale `as-needed` inclus) ;
 *   2. que la route factice historique ne peut pas revenir dans `src/` ;
 *   3. que **chaque** page proposée dans l'éditeur correspond à une route
 *      réellement existante (aucune page fantôme) ;
 *   4. que chaque page de l'éditeur a son écran dans le registre d'aperçu.
 */

const SRC = join(process.cwd(), 'src');
const SITE_DIR = join(SRC, 'app', '(site)', '[locale]');
// Le sélecteur de pages a été extrait du God Component : il vit dans le module
// de contrats de l'éditeur (`pages-editor/pages-options.ts`).
const PAGES_EDITOR = join(
    SRC,
    'app',
    '(admin)',
    'admin',
    'components',
    'pages-editor',
    'pages-options.ts'
);
/** Registre des écrans de la route d'aperçu dédiée. */
const PREVIEW_SCREENS_FILE = join(SITE_DIR, 'preview', 'screens.ts');
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Route factice interdite (assemblée pour ne pas s'auto-détecter). */
const FORBIDDEN_ROUTE = '/admin/' + 'preview';

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

/** Slugs `value:` du sélecteur de pages de l'éditeur (bloc `SITE_PAGES_OPTIONS`). */
function editorSlugs(): string[] {
    const source = readFileSync(PAGES_EDITOR, 'utf8');
    // Extraction limitée au bloc `SITE_PAGES_OPTIONS` : ailleurs dans le
    // fichier, des `value:` éditoriaux existent (ex. « 100% ») et ne
    // correspondent évidemment à aucune route.
    const blockStart = source.indexOf('const SITE_PAGES_OPTIONS');
    const source_block = source.slice(blockStart, source.indexOf('];', blockStart));
    return [...source_block.matchAll(/value:\s*'([^']+)'/g)].map((m) => m[1]);
}

describe('Aperçu live — URL de la route d’aperçu dédiée', () => {
    it('normalise les slugs éditoriaux', () => {
        expect(normalizePreviewSlug('')).toBe('/');
        expect(normalizePreviewSlug('/')).toBe('/');
        expect(normalizePreviewSlug('formation-de-cascadeur')).toBe('/formation-de-cascadeur');
        expect(normalizePreviewSlug('/visite-guidee/')).toBe('/visite-guidee');
    });

    it('vise la route d’aperçu dédiée, locale par défaut sans préfixe (as-needed)', () => {
        expect(buildPreviewPath('/')).toBe('/preview');
        expect(buildPreviewPath('formation-de-cascadeur')).toBe('/preview/formation-de-cascadeur');
        expect(buildPreviewPath('/equipe-cascadeurs-pro/')).toBe('/preview/equipe-cascadeurs-pro');
    });

    it('préfixe les locales secondaires', () => {
        expect(buildPreviewPath('/', 'en')).toBe('/en/preview');
        expect(buildPreviewPath('visite-guidee', 'en')).toBe('/en/preview/visite-guidee');
    });

    it('construit une URL absolue, et rien tant que l’origine est inconnue', () => {
        expect(buildPreviewUrl('https://cuc.test', '/')).toBe('https://cuc.test/preview');
        expect(buildPreviewUrl('https://cuc.test/', 'contact-cuc')).toBe(
            'https://cuc.test/preview/contact-cuc'
        );
        expect(buildPreviewUrl('', '/')).toBe('');
    });

    it('n’expose que fr et en', () => {
        expect([...PREVIEW_LOCALES]).toEqual(['fr', 'en']);
    });
});

describe('Aperçu live — aucune page fantôme', () => {
    it('la route d’aperçu factice a disparu de src/', () => {
        const offenders = walk(SRC)
            .filter((file) => ALLOWED_EXT.has(extname(file)))
            .filter((file) => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'))
            .filter((file) => readFileSync(file, 'utf8').includes(FORBIDDEN_ROUTE))
            .map((file) => relative(process.cwd(), file));

        expect(
            offenders,
            `La route d'aperçu factice (« ${FORBIDDEN_ROUTE} ») est réintroduite. Elle rejouait des sections au lieu de rendre les vrais écrans : l'aperçu dédié doit passer par preview/screens.ts (buildPreviewUrl() construit l'URL).`
        ).toEqual([]);
    });

    it('chaque page proposée dans l’éditeur correspond à une route réelle', () => {
        const slugs = editorSlugs();

        expect(slugs.length, 'Aucune page détectée dans SITE_PAGES_OPTIONS').toBeGreaterThan(10);

        const missing = slugs.filter((slug) => {
            if (slug === '/') return !existsSync(join(SITE_DIR, 'page.tsx'));
            return !existsSync(join(SITE_DIR, slug, 'page.tsx'));
        });

        expect(
            missing,
            `Pages proposées dans l'éditeur sans route correspondante dans src/app/(site)/[locale]/ : ${missing.join(', ')}`
        ).toEqual([]);
    });

    it('chaque page proposée dans l’éditeur a son écran dans la route d’aperçu', () => {
        const source = readFileSync(PREVIEW_SCREENS_FILE, 'utf8');
        const keys = new Set(
            [...source.matchAll(/'(\/[^']*)':/g)].map((m) => m[1])
        );

        const missing = editorSlugs()
            .map((slug) => normalizePreviewSlug(slug))
            .filter((slug) => !keys.has(slug));

        expect(
            missing,
            `Pages proposées dans l'éditeur sans écran dans preview/screens.ts : ${missing.join(', ')}`
        ).toEqual([]);
    });
});
