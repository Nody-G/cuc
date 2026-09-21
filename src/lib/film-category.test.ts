import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import {
    FILM_CATEGORIES,
    isFilmCategory,
    isLegacyFilmCategory,
    normalizeFilmCategory,
} from './film-category';

/**
 * Garde-fou de non-régression — vocabulaire des catégories de films.
 *
 * Décision éditoriale permanente : une seule distinction factuelle subsiste,
 * `Film` · `Série` · `Court métrage`. L'ancien vocabulaire marketing
 * (`Blockbuster`, `Cinéma International`, `Cinéma Français`, `Film Culte`,
 * `Streaming Global`, `Série / Plateforme`, `Show & Événement`) est banni de
 * l'interface, des données locales et de la base.
 *
 * Ces tests échouent si :
 *   1. le vocabulaire autorisé est élargi sans décision explicite ;
 *   2. la conversion des valeurs héritées régresse ;
 *   3. un fichier de `src/` réintroduit une étiquette marketing ;
 *   4. un crédit de `src/data/filmography.ts` porte une catégorie hors vocabulaire.
 */

const SRC = join(process.cwd(), 'src');
const ALLOWED_EXT = new Set(['.ts', '.tsx']);

/**
 * Le fichier de référence décrit la correspondance héritée : il contient
 * forcément les libellés bannis. Les fichiers de test sont exclus pour ne pas
 * s'auto-détecter.
 */
const EXCLUDED_FROM_SCAN = ['film-category.ts', 'film-category.test.ts'];

const BANNED_LABELS = [
    'Blockbuster',
    'Cinéma Français',
    'Cinéma International',
    'Film Culte',
    'Streaming Global',
    'Série / Plateforme',
    'Show & Événement',
];

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

describe('Catégories de films — vocabulaire autorisé', () => {
    it('se limite à Film, Série et Court métrage', () => {
        expect([...FILM_CATEGORIES]).toEqual(['Film', 'Série', 'Court métrage']);
    });

    it('reconnaît les valeurs autorisées', () => {
        for (const category of FILM_CATEGORIES) {
            expect(isFilmCategory(category)).toBe(true);
            expect(normalizeFilmCategory(category)).toBe(category);
        }
    });
});

describe('Catégories de films — conversion des valeurs héritées', () => {
    it('convertit tout l’ancien vocabulaire marketing', () => {
        expect(normalizeFilmCategory('Blockbuster')).toBe('Film');
        expect(normalizeFilmCategory('Blockbuster US')).toBe('Film');
        expect(normalizeFilmCategory('Cinéma Français')).toBe('Film');
        expect(normalizeFilmCategory('Cinéma International')).toBe('Film');
        expect(normalizeFilmCategory('Film Culte')).toBe('Film');
        expect(normalizeFilmCategory('Streaming Global')).toBe('Film');
        expect(normalizeFilmCategory('Show & Événement')).toBe('Film');
        expect(normalizeFilmCategory('Cinéma')).toBe('Film');
        expect(normalizeFilmCategory('Série / Plateforme')).toBe('Série');
        expect(normalizeFilmCategory('Court-métrage')).toBe('Court métrage');
    });

    it('tolère la casse et les accents', () => {
        expect(normalizeFilmCategory('cineMa francais')).toBe('Film');
        expect(normalizeFilmCategory('  série / plateforme  ')).toBe('Série');
    });

    it('rend une catégorie vide plutôt qu’une catégorie fausse', () => {
        // Types IMDb sans équivalent honnête dans la distinction autorisée.
        expect(normalizeFilmCategory('musicVideo')).toBe('');
        expect(normalizeFilmCategory('videoGame')).toBe('');
        expect(normalizeFilmCategory('podcastSeries')).toBe('');
        expect(normalizeFilmCategory('')).toBe('');
        expect(normalizeFilmCategory(null)).toBe('');
        expect(normalizeFilmCategory(undefined)).toBe('');
        expect(normalizeFilmCategory(42)).toBe('');
    });

    it('distingue une valeur héritée d’une valeur inconnue', () => {
        expect(isLegacyFilmCategory('Blockbuster')).toBe(true);
        expect(isLegacyFilmCategory('Série / Plateforme')).toBe(true);
        expect(isLegacyFilmCategory('Film')).toBe(false);
        expect(isLegacyFilmCategory('Documentaire')).toBe(false);
    });
});

describe('Catégories de films — aucune réintroduction du marketing', () => {
    it('aucun fichier de src/ ne contient d’étiquette marketing', () => {
        const offenders: string[] = [];

        for (const file of walk(SRC)) {
            if (!ALLOWED_EXT.has(extname(file))) continue;
            if (EXCLUDED_FROM_SCAN.some((name) => file.endsWith(name))) continue;
            const content = readFileSync(file, 'utf8');
            for (const label of BANNED_LABELS) {
                if (content.includes(label)) {
                    offenders.push(`${file.replace(process.cwd(), '')} → « ${label} »`);
                }
            }
        }

        expect(
            offenders,
            `Étiquettes marketing réintroduites (seule distinction autorisée : Film · Série · Court métrage) :\n${offenders.join('\n')}`
        ).toEqual([]);
    });

    it('les données filmographiques n’utilisent que le vocabulaire autorisé', () => {
        const source = readFileSync(join(SRC, 'data', 'filmography.ts'), 'utf8');
        const categories = [...source.matchAll(/"category":\s*"([^"]*)"/g)].map((m) => m[1]);

        expect(categories.length, 'Aucune catégorie trouvée dans filmography.ts').toBeGreaterThan(
            50
        );
        const invalid = categories.filter(
            (category) => !(FILM_CATEGORIES as readonly string[]).includes(category)
        );
        expect(invalid, `Catégories hors vocabulaire : ${invalid.join(', ')}`).toEqual([]);
    });

    it('les données des comédiens doublés ne portent plus de segmentation marketing', () => {
        const source = readFileSync(join(SRC, 'data', 'celebrities.ts'), 'utf8');
        // On cible l'AFFECTATION des champs (`roleType:`) et non une simple
        // mention documentaire, afin que l'en-tête du fichier puisse expliquer
        // pourquoi ces champs ont été retirés.
        expect(source).not.toMatch(/\broleType\s*:/);
        expect(source).not.toMatch(/\bhighlightTag\s*:/);
    });
});
