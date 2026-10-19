'use client';

import React from 'react';
import Image from 'next/image';
import { resolveHeroSlideAlt, type HeroSlideView } from './parallaxHero.data';
import { SLIDE_DURATION_SEC } from './useParallaxHero';
import type { SlideCopyMap } from './useParallaxHero';

interface HeroBackground3DProps {
    isCalmMode: boolean;
    currentSlide: number;
    /** Visuels effectifs (défauts fusionnés avec la surcharge éditée). */
    slides: readonly HeroSlideView[];
    slideCopy: SlideCopyMap;
}

/**
 * Couche 1 : fond photographique 3D (Ken-Burns + tilt inertiel CSS) et vignettes
 * cinématiques. En mode calme : une seule image peinte, coupe franche entre
 * les visuels, sans transform animé.
 */
export const HeroBackground3D: React.FC<HeroBackground3DProps> = ({
    isCalmMode,
    currentSlide,
    slides,
    slideCopy,
}) => {
    // Ceinture de sécurité : aucune image ⇒ rien à peindre, jamais de crash.
    // `mergeHeroSlides` garantit déjà une liste non vide côté appelant.
    if (slides.length === 0) return null;

    /** Index borné : retirer un visuel ne peut pas pointer hors du tableau. */
    const safeIndex = currentSlide >= 0 && currentSlide < slides.length ? currentSlide : 0;
    const activeSlide = slides[safeIndex];
    const activeCopy = activeSlide.key ? slideCopy[activeSlide.key] : undefined;
    const activeAlt = resolveHeroSlideAlt(activeSlide, activeCopy);

    return (
        <div
            style={
                isCalmMode
                    ? undefined
                    : {
                        transform:
                            'translate3d(calc(var(--cuc-hero-mx, 0) * 6.4px), calc(var(--cuc-hero-scroll, 0) * 14%), 0) rotateX(calc(var(--cuc-hero-my, 0) * -1.6deg)) rotateY(calc(var(--cuc-hero-mx, 0) * 1.6deg))',
                        transformStyle: 'preserve-3d',
                    }
            }
            className={`absolute z-0 overflow-hidden origin-center pointer-events-none ${isCalmMode
                    ? 'inset-0'
                    : '-inset-8 will-change-transform transition-transform duration-300 ease-out'
                }`}
        >
            {isCalmMode ? (
                <>
                    {/* Mode calme : une seule image peinte, coupe franche entre les
                        visuels (aucun fondu lourd), et le visuel suivant est préchargé
                        hors écran (décodé mais invisible) pour que la coupe reste
                        instantanée malgré le réseau mobile. */}
                    <div className="absolute inset-0">
                        <Image
                            key={safeIndex}
                            src={activeSlide.url}
                            alt={activeAlt}
                            fill
                            priority={safeIndex === 0}
                            sizes="100vw"
                            className="object-cover object-[50%_38%] brightness-[0.50] contrast-[1.08]"
                        />
                    </div>
                    <div className="invisible absolute inset-0" aria-hidden="true">
                        <Image
                            src={slides[(safeIndex + 1) % slides.length].url}
                            alt=""
                            fill
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </div>
                </>
            ) : (
                slides.map((slide, idx) => {
                    const isActive = idx === safeIndex;
                    return (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                        >
                            {/* Ken-Burns slow breathing scale */}
                            <div
                                style={{
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    transition: `transform ${SLIDE_DURATION_SEC}s ease-out`,
                                }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={slide.url}
                                    alt={resolveHeroSlideAlt(
                                        slide,
                                        slide.key ? slideCopy[slide.key] : undefined
                                    )}
                                    fill
                                    priority={idx === 0}
                                    sizes="100vw"
                                    className="object-cover object-center brightness-[0.50] contrast-[1.08]"
                                />
                            </div>
                        </div>
                    );
                })
            )}

            {/* Cinematic Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/75 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(6,6,8,0.72)_100%)]" />
        </div>
    );
};
