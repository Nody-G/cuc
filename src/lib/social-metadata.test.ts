import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Garde-fou — métadonnées sociales (Twitter/X) jamais figées en français.
 *
 * Incident réel (2026-09-23) : le layout `[locale]` déclarait son propre bloc
 * `twitter` (titre, description, image). Conséquences sur les pages `/en/…` :
 *  - la carte X/Twitter affichait une copie **française** en dur ;
 *  - elle affichait l'image générique Supabase au lieu de la carte Open Graph
 *    de la route, pourtant bilingue depuis le même jour.
 *
 * Mécanisme vérifié dans le code de Next (`lib/metadata/resolve-metadata.js`,
 * `postProcessMetadata`) : quand `twitter.title`/`description`/`images` ne sont
 * pas déclarés, Next les **recopie depuis `openGraph`**. Il suffit donc de ne
 * rien déclarer ici : la copie localisée de la route fait le travail.
 *
 * Le test échoue si le bloc `twitter` du layout redéclare autre chose que le
 * format de carte — et si `openGraph` perd son image de repli site.
 */

const LAYOUT = join(process.cwd(), 'src', 'app', '(site)', '[locale]', 'layout.tsx');

/** Contenu entre les accolades ouvrantes de `twitter: {` et sa fermeture. */
function extractBlock(source: string, key: string): string | null {
    const start = source.indexOf(`${key}: {`);
    if (start === -1) return null;

    let depth = 0;
    for (let i = source.indexOf('{', start); i < source.length; i += 1) {
        if (source[i] === '{') depth += 1;
        else if (source[i] === '}') {
            depth -= 1;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }
    return null;
}

/** Noms de propriétés de premier niveau d'un bloc d'objet JS. */
function topLevelKeys(block: string): string[] {
    const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
    const keys: string[] = [];

    for (const line of body.split('\n')) {
        const match = line.match(/^\s{4,8}([A-Za-z_$][\w$]*):/);
        if (match && !line.trimStart().startsWith('//')) keys.push(match[1]);
    }
    return keys;
}

describe('Métadonnées sociales — jamais figées en français', () => {
    it('le détecteur fonctionne (contrôle négatif)', () => {
        const bad = 'const x = {\n    twitter: {\n        card: "summary_large_image",\n        title: "CAMPUS",\n    },\n};';
        const block = extractBlock(bad, 'twitter');
        expect(block).not.toBeNull();
        expect(topLevelKeys(block as string)).toEqual(['card', 'title']);

        const good = 'const x = {\n    twitter: {\n        card: "summary_large_image",\n    },\n};';
        expect(topLevelKeys(extractBlock(good, 'twitter') as string)).toEqual(['card']);
    });

    it('le layout [locale] ne redéclare que le format de carte', () => {
        const layout = readFileSync(LAYOUT, 'utf8');
        const twitter = extractBlock(layout, 'twitter');

        expect(twitter, 'bloc `twitter` introuvable dans le layout [locale]').not.toBeNull();
        expect(
            topLevelKeys(twitter as string),
            'titre, description ou image figés dans le layout : les pages /en/… hériteraient d’une copie française et d’une image générique'
        ).toEqual(['card']);
    });

    it('openGraph conserve une image de repli site (routes sans carte dédiée)', () => {
        const layout = readFileSync(LAYOUT, 'utf8');
        const openGraph = extractBlock(layout, 'openGraph');

        expect(openGraph, 'bloc `openGraph` introuvable dans le layout [locale]').not.toBeNull();
        expect(topLevelKeys(openGraph as string)).toContain('images');
    });
});
