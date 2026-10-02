import {
    HERO_SLIDES,
    buildHeroSlideSeed,
    heroSlideFilename,
    mergeHeroSlides,
    resolveHeroSlideAlt,
} from './hero-slides';

/**
 * Garde-fous du domaine des visuels du hero.
 *
 * Interdits verrouillés ici :
 *  1. une liste résultante vide (le rendu lit `slides[currentSlide].url`) ;
 *  2. une URL `undefined` ou vide qui atteindrait le fond 3D ;
 *  3. perdre la clé i18n d'un visuel historique (sa copie disparaîtrait) ;
 *  4. inventer une image pour un rang sans URL exploitable.
 */
describe('mergeHeroSlides', () => {
    it('remplace chaque URL surchargée en conservant les clés i18n', () => {
        const merged = mergeHeroSlides([
            { url: 'https://cdn.test/a.webp' },
            { url: 'https://cdn.test/b.webp' },
            { url: 'https://cdn.test/c.webp' },
            { url: 'https://cdn.test/d.webp' },
        ]);

        expect(merged.map((slide) => slide.url)).toEqual([
            'https://cdn.test/a.webp',
            'https://cdn.test/b.webp',
            'https://cdn.test/c.webp',
            'https://cdn.test/d.webp',
        ]);
        expect(merged.map((slide) => slide.key)).toEqual(['campus', 'combat', 'facilities', 'team']);
    });

    it('fusionne partiellement : les rangs non surchargés gardent le visuel historique', () => {
        const merged = mergeHeroSlides([{ url: 'https://cdn.test/override.webp' }]);

        expect(merged).toHaveLength(HERO_SLIDES.length);
        expect(merged[0].url).toBe('https://cdn.test/override.webp');
        expect(merged[1].url).toBe(HERO_SLIDES[1].url);
        expect(merged[3].url).toBe(HERO_SLIDES[3].url);
    });

    it('ajoute des visuels au-delà de 4, sans clé i18n', () => {
        const overrides = [
            { url: 'https://cdn.test/1.webp' },
            { url: 'https://cdn.test/2.webp' },
            { url: 'https://cdn.test/3.webp' },
            { url: 'https://cdn.test/4.webp' },
            { url: 'https://cdn.test/5.webp', alt: 'Visuel ajouté' },
        ];
        const merged = mergeHeroSlides(overrides);

        expect(merged).toHaveLength(5);
        expect(merged[4]).toEqual({ url: 'https://cdn.test/5.webp', alt: 'Visuel ajouté' });
        expect(merged[4].key).toBeUndefined();
    });

    it('retombe intégralement sur HERO_SLIDES pour un tableau vide, absent ou invalide', () => {
        for (const input of [undefined, null, [], 'pas-un-tableau', 42, {}]) {
            const merged = mergeHeroSlides(input as never);
            expect(merged.map((slide) => slide.url)).toEqual(HERO_SLIDES.map((slide) => slide.url));
            expect(merged.length).toBeGreaterThanOrEqual(HERO_SLIDES.length);
        }
    });

    it('ignore une surcharge sans URL exploitable sans jamais créer d’URL vide', () => {
        const merged = mergeHeroSlides([
            { url: '   ' },
            null,
            { alt: 'sans url' },
            { url: 123 },
        ]);

        expect(merged).toHaveLength(HERO_SLIDES.length);
        expect(merged.every((slide) => slide.url.length > 0)).toBe(true);
        expect(merged[0].url).toBe(HERO_SLIDES[0].url);
    });

    it('n’expose jamais une longueur nulle, même si HERO_SLIDES l’était', () => {
        expect(mergeHeroSlides([]).length).toBeGreaterThan(0);
        expect(mergeHeroSlides([{}, {}, {}, {}]).length).toBe(HERO_SLIDES.length);
    });

    it('ignore un ajout sans URL au-delà du socle historique', () => {
        const merged = mergeHeroSlides([
            { url: 'https://cdn.test/1.webp' },
            { url: 'https://cdn.test/2.webp' },
            { url: 'https://cdn.test/3.webp' },
            { url: 'https://cdn.test/4.webp' },
            { alt: 'orphelin sans image' },
        ]);

        expect(merged).toHaveLength(4);
        expect(merged.every((slide) => slide.url.length > 0)).toBe(true);
    });
});

describe('resolveHeroSlideAlt', () => {
    it('privilégie la copie i18n du visuel historique', () => {
        const alt = resolveHeroSlideAlt(
            { key: 'campus', url: 'https://cdn.test/x.webp' },
            { caption: 'Campus en action' }
        );
        expect(alt).toBe('Campus en action');
    });

    it('utilise l’alt saisi pour un visuel ajouté', () => {
        const alt = resolveHeroSlideAlt({ url: 'https://cdn.test/x.webp', alt: 'Équipe CUC' });
        expect(alt).toBe('Équipe CUC');
    });

    it('retombe sur le nom de fichier, jamais sur un texte inventé', () => {
        const alt = resolveHeroSlideAlt({
            url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/a/slider-9.webp?x=1',
        });
        expect(alt).toBe('slider-9.webp');
    });
});

describe('heroSlideFilename', () => {
    it('extrait et décode le dernier segment de l’URL', () => {
        expect(heroSlideFilename('https://cdn.test/dir/mon%20image.webp')).toBe('mon image.webp');
        expect(heroSlideFilename('')).toBe('');
    });
});

describe('buildHeroSlideSeed', () => {
    it('matérialise exactement les visuels historiques (aucun contenu inventé)', () => {
        const seed = buildHeroSlideSeed();

        expect(seed.map((item) => item.url)).toEqual(HERO_SLIDES.map((slide) => slide.url));
        expect(seed.map((item) => item.id)).toEqual(['campus', 'combat', 'facilities', 'team']);
    });
});
