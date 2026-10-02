'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { resolveHeroSlideAlt, type HeroSlideView } from './parallaxHero.data';
import { SLIDE_DURATION_SEC } from './useParallaxHero';
import type { SlideCopyMap } from './useParallaxHero';

interface HeroBackground3DProps {
    isCalmMode: boolean;
    currentSlide: number;
    /** Visuels effectifs (défauts fusionnés avec la surcharge éditée). */
    slides: readonly HeroSlideView[];
    slideCopy: SlideCopyMap;
    /** Dérive verticale au scroll (Ken-Burns inertiel). */
    bgScrollY: MotionValue<string>;
    /** Décalage horizontal piloté par le pointeur. */
    bgShiftX: MotionValue<number>;
    /** Tilt 3D piloté par le pointeur. */
    bgRotateX: MotionValue<number>;
    bgRotateY: MotionValue<number>;
}

/**
 * Couche 1 : fond photographique 3D (Ken-Burns + tilt inertiel) et vignettes
 * cinématiques. En mode calme : une seule image peinte, coupe franche entre
 * les visuels, sans transform animé.
 */
export const HeroBackground3D: React.FC<HeroBackground3DProps> = ({
    isCalmMode,
    currentSlide,
    slides,
    slideCopy,
    bgScrollY,
    bgShiftX,
    bgRotateX,
    bgRotateY,
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
        <motion.div
            style={
                isCalmMode
                    ? undefined
                    : {
                        y: bgScrollY,
                        x: bgShiftX,
                        rotateX: bgRotateX,
                        rotateY: bgRotateY,
                        transformStyle: 'preserve-3d',
                    }
            }
            className={`absolute z-0 overflow-hidden origin-center pointer-events-none ${isCalmMode ? 'inset-0' : '-inset-8 will-change-transform'
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
                            /* Cadrage portrait : `object-center` coupait les sujets sur un
                               écran étroit — un point focal légèrement au-dessus du centre
                               garde l'action et le domaine dans le cadre. */
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
                        /* Empilement stable (plus de bascule z-10/z-0) : le changement de
                           z-index sur des calques plein écran provoquait un scintillement
                           dû au recalcul de composition. */
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                        >
                            {/* Ken-Burns slow breathing scale */}
                            <motion.div
                                animate={isActive ? { scale: [1, 1.05] } : { scale: 1 }}
                                transition={{ duration: SLIDE_DURATION_SEC, ease: 'easeOut' }}
                                className="relative w-full h-full scale-105"
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
                            </motion.div>
                        </div>
                    );
                })
            )}

            {/* Cinematic Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/75 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(6,6,8,0.72)_100%)]" />
        </motion.div>
    );
};
