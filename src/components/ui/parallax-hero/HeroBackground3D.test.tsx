import { render } from '@testing-library/react';
import type { MotionValue } from 'framer-motion';
import { HeroBackground3D } from './HeroBackground3D';
import { HERO_SLIDES, mergeHeroSlides } from './parallaxHero.data';
import type { SlideCopyMap } from './useParallaxHero';

/**
 * Garde-fou de rendu : le fond 3D doit peindre le visuel **effectif** (surcharge
 * fusionnée), jamais un index non borné. `next/image` est remplacé par un `img`
 * nu pour lire l'URL réellement transmise.
 */
vi.mock('next/image', () => ({
    default: (props: { src?: string; alt?: string }) => {
        // eslint-disable-next-line @next/next/no-img-element -- mock de test : on lit l’URL brute transmise à next/image
        return <img src={props.src} alt={props.alt} />;
    },
}));

const motion = <T,>(value: T) => ({ get: () => value } as unknown as MotionValue<T>);

const renderBackground = (currentSlide: number, overrides?: unknown[]) =>
    render(
        <HeroBackground3D
            isCalmMode
            currentSlide={currentSlide}
            slides={mergeHeroSlides(overrides)}
            slideCopy={{} as SlideCopyMap}
            bgScrollY={motion('0%')}
            bgShiftX={motion(0)}
            bgRotateX={motion(0)}
            bgRotateY={motion(0)}
        />
    );

describe('HeroBackground3D — surcharge des visuels', () => {
    it('rend l’URL surchargée quand elle existe', () => {
        const url = 'https://cdn.test/override-hero.webp';
        const { container } = renderBackground(0, [{ url }]);

        expect(container.querySelector('img')?.getAttribute('src')).toBe(url);
    });

    it('retombe sur le visuel historique quand la surcharge est absente', () => {
        const { container } = renderBackground(0, undefined);

        expect(container.querySelector('img')?.getAttribute('src')).toBe(HERO_SLIDES[0].url);
    });

    it('peint le 5ᵉ visuel ajouté, sans index hors bornes', () => {
        const url = 'https://cdn.test/5e-visuel.webp';
        const overrides = [
            { url: 'https://cdn.test/1.webp' },
            { url: 'https://cdn.test/2.webp' },
            { url: 'https://cdn.test/3.webp' },
            { url: 'https://cdn.test/4.webp' },
            { url },
        ];
        const { container } = renderBackground(4, overrides);

        expect(container.querySelector('img')?.getAttribute('src')).toBe(url);
    });

    it('borne un index courant au-delà de la liste (surcharge réduite)', () => {
        const { container } = renderBackground(9, [{ url: 'https://cdn.test/seul.webp' }]);

        expect(container.querySelector('img')?.getAttribute('src')).toBe(
            'https://cdn.test/seul.webp'
        );
    });
});
