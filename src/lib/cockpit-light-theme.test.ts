import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Garde-fou du thème clair du Cockpit.
 *
 * Deux invariants sont verrouillés ici :
 *
 *  1. **Complétude** — toute classe de couleur codée en dur dans le Cockpit est
 *     soit remappée par `globals-cockpit-light.css`, soit volontairement exclue
 *     (liste ci-dessous, chaque exclusion étant motivée). Sans ce test, le
 *     thème redevient « mal fait » dès qu'un composant ajoute une couleur.
 *  2. **Étanchéité** — aucune règle de la feuille ne peut toucher la vitrine :
 *     chaque sélecteur est scopé à `[data-cockpit-root][data-cockpit-theme='light']`.
 *     La vitrine reste sombre en permanence.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt (cf. `src/lib/global-styles.test.ts`).
 */

const ADMIN_DIR = join(process.cwd(), 'src', 'app', '(admin)');
/** La page de connexion vit hors du `[data-cockpit-root]` : hors périmètre. */
const OUT_OF_SCOPE_DIRS = [join(ADMIN_DIR, 'login')];
/**
 * Le thème clair est réparti en deux feuilles pour rester sous le plafond de
 * 300 lignes par fichier (`AGENTS.md` § 2) : la base (jetons, surfaces, textes,
 * accent) et les états (statuts, interrupteurs, dégradés, exclusions). Le garde
 * lit **les deux** — sinon une contrepartie déplacée échapperait au contrôle,
 * ce qui viderait l'invariant de sa substance.
 */
const CSS_STYLES_DIR = join(process.cwd(), 'src', 'app', 'styles');
const CSS_FILES = ['globals-cockpit-light.css', 'globals-cockpit-light-states.css'];
const CSS_PATHS = CSS_FILES.map((name) => join(CSS_STYLES_DIR, name));

/** Classes de couleur : utilitaires Tailwind et valeurs arbitraires `[#hex]`. */
const COLOR_UTIL =
    /(?:[a-z-]+:)*(?:bg|text|border|divide|from|to|via|placeholder|ring|outline|caret|accent|fill|stroke)-(?:white|black|zinc|gray|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d{1,3})?|(?:[a-z-]+:)*(?:bg|text|border|divide|from|to|via)-\[#[0-9A-Fa-f]{3,8}\](?:\/\d{1,3})?/g;

/**
 * Exclusions volontaires : ces classes restent sombres en thème clair.
 * Chaque entrée porte sa justification — c'est la contrepartie de la
 * complétude exigée par le premier invariant.
 */
const ALLOWED_TOKENS: Array<{ pattern: RegExp; reason: string }> = [
    {
        pattern: /^bg-black\/(70|80|85|90)$/,
        reason: 'Voile de modale (scrim) : un voile clair ne détacherait plus la boîte de dialogue.',
    },
    {
        pattern: /^bg-\[\#050608\]$/,
        reason: 'Viewport du plan 3D (rendu WebGL) — surface de rendu, pas de travail.',
    },
    {
        pattern: /^(text-black|text-black\/\d+|hover:text-black|border-black|border-black\/\d+|fill-black)$/,
        reason: 'Libellés et contours posés sur l’aplat jaune CUC (et leurs survols).',
    },
    {
        pattern: /^(bg-white|bg-white\/\d+|border-white)$/,
        reason: 'Déjà clair : rien à remapper.',
    },
    {
        pattern: /(#FFE500|#ffe600e6|#FFF04D|#FFB800|#f5c518|#fecc00)/,
        reason: 'Palette d’accent CUC et marques IMDb / AlloCiné : identité conservée.',
    },
    {
        pattern: /^(selection|focus|peer-checked|after|marker):/,
        reason: 'États natifs (sélection, focus, interrupteur) — lisibles tels quels sur clair.',
    },
    {
        pattern:
            /^(hover|focus|group-hover|disabled):(bg|text|border|from|to)-(red|rose|emerald|amber|cyan|sky|blue|purple|fuchsia|yellow|pink)-(300|400|500|600)(\/\d+)?$/,
        reason: 'Survols d’état colorés : teintes déjà visibles sur fond clair.',
    },
    {
        pattern:
            /^(bg|from|to|via|border|text)-(red|rose|emerald|amber|cyan|sky|blue|purple|fuchsia|yellow|pink)-\d{3}(\/\d+)?$/,
        reason: 'Pastilles et fonds de statut : lisibles sur blanc, et porteurs de sens.',
    },
    {
        pattern: /^divide-zinc-850$/,
        reason: 'Classe inexistante dans Tailwind (code mort) — conservée pour ne rien casser.',
    },
];

/** Thème clair : règles autorisées uniquement sous cet ancrage. */
const REQUIRED_SCOPE = "[data-cockpit-root][data-cockpit-theme='light']";

function walk(dir: string, out: string[] = []): string[] {
    if (OUT_OF_SCOPE_DIRS.some((skip) => dir.startsWith(skip))) return out;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else if (/\.(tsx|ts)$/.test(full) && !full.endsWith('.test.ts')) out.push(full);
    }
    return out;
}

/** Toutes les classes de couleur distinctes utilisées dans le Cockpit. */
function collectColourTokens(): string[] {
    const tokens = new Set<string>();
    for (const file of walk(ADMIN_DIR)) {
        const source = readFileSync(file, 'utf8');
        for (const match of source.match(COLOR_UTIL) ?? []) tokens.add(match);
    }
    return [...tokens];
}

/** La feuille déclare-t-elle ce sélecteur ? (comparaison sur le CSS dé-échappé) */
function isDeclaredInSheet(cssWithoutEscapes: string, token: string): boolean {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // La classe doit ouvrir un sélecteur (précédée de `.`, d'une virgule ou d'un
    // espace) : on évite ainsi de considérer `hover:bg-white/5` comme déclaration
    // de `bg-white/5`.
    return new RegExp(`(?:^|[.\\s,>+~])${escaped}(?=[\\s,:{>+~]|$)`).test(cssWithoutEscapes);
}

describe('Thème clair du Cockpit', () => {
    const sheet = CSS_PATHS.map((file) => readFileSync(file, 'utf8')).join('\n');
    const sheetWithoutEscapes = sheet.replace(/\\/g, '');

    it('remappe toutes les classes sombres du Cockpit', () => {
        const missing = collectColourTokens()
            .filter((token) => !isDeclaredInSheet(sheetWithoutEscapes, token))
            .filter((token) => !ALLOWED_TOKENS.some(({ pattern }) => pattern.test(token)))
            .sort();

        expect(
            missing,
            `Classes sombres sans contrepartie claire : ${missing.join(', ')}\n` +
            'Ajoutez la règle correspondante dans src/app/styles/globals-cockpit-light.css, ' +
            'ou documentez une exclusion dans ALLOWED_TOKENS.'
        ).toEqual([]);
    });

    it('reste strictement scopé : la vitrine n’est jamais affectée', () => {
        const leaked = [...sheet.matchAll(/(^|\n)([^\s@/][^{}]*)\{/g)]
            .map((match) => match[2].trim())
            .filter((selector) => !selector.includes(REQUIRED_SCOPE));

        expect(
            leaked,
            `Sélecteurs hors périmètre (ils affecteraient la vitrine) : ${leaked.join(' | ')}`
        ).toEqual([]);
    });

    it('est chargé par la feuille globale', () => {
        const globals = readFileSync(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8');
        // Toutes les feuilles du thème clair doivent être importées : une feuille
        // créée mais non chargée ne produirait aucun remap, silencieusement.
        for (const name of CSS_FILES) expect(globals).toContain(name);
    });
});

/** Garde-fou interne : le scan couvre bien le Cockpit. */
describe('Inventaire du thème clair', () => {
    it('analyse un périmètre non vide', () => {
        expect(collectColourTokens().length).toBeGreaterThan(50);
    });

    it('exclut la page de connexion (hors [data-cockpit-root])', () => {
        const scanned = walk(ADMIN_DIR).map((file) => relative(ADMIN_DIR, file));
        expect(scanned.some((file) => file.startsWith('login'))).toBe(false);
    });
});
