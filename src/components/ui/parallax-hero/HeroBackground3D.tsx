'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { HERO_SLIDES } from './parallaxHero.data';
import { SLIDE_DURATION_SEC } from './useParallaxHero';
import type { SlideCopyMap } from './useParallaxHero';

interface HeroBackground3DProps {
    isCalmMode: boolean;
    currentSlide: number;
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
    slideCopy,
    bgScrollY,
    bgShiftX,
    bgRotateX,
    bgRotateY,
}) => {
    const activeCopy = slideCopy[HERO_SLIDES[currentSlide].key];

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
                            key={currentSlide}
                            src={HERO_SLIDES[currentSlide].url}
                            alt={activeCopy?.caption ?? ''}
                            fill
                            priority={currentSlide === 0}
                            sizes="100vw"
                            /* Cadrage portrait : `object-center` coupait les sujets sur un
                               écran étroit — un point focal légèrement au-dessus du centre
                               garde l'action et le domaine dans le cadre. */
                            className="object-cover object-[50%_38%] brightness-[0.50] contrast-[1.08]"
                        />
                    </div>
                    <div className="invisible absolute inset-0" aria-hidden="true">
                        <Image
                            src={HERO_SLIDES[(currentSlide + 1) % HERO_SLIDES.length].url}
                            alt=""
                            fill
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </div>
                </>
            ) : (
                HERO_SLIDES.map((slide, idx) => {
                    const isActive = idx === currentSlide;
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
                                    alt={slideCopy[slide.key]?.caption ?? ''}
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
