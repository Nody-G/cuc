'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import type { FilmCredit } from '@/types';

interface CoordinatedFilmsCarouselProps {
    films: FilmCredit[];
    directorFor: (film?: FilmCredit) => string | undefined;
    onOpenFilm: (film: FilmCredit) => void;
}

/**
 * Carrousel infini bidirectionnel (gauche ↔ droite) des films coordonnés
 * en cascade par Lucas Dollfus.
 *
 * - Hauteur réduite de moitié par rapport aux anciennes jaquettes (~200–216 px).
 * - Triple tampon circulaire ([...films, ...films, ...films]) avec repositionnement
 *   torique invisible permettant de scroller à l'infini à gauche comme à droite
 *   (boutons, molette/trackpad, swipe tactile, glisser-déposer souris et glissement continu).
 */
export const CoordinatedFilmsCarousel: React.FC<CoordinatedFilmsCarouselProps> = ({
    films,
    directorFor,
    onOpenFilm,
}) => {
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const isPausedRef = React.useRef(false);
    const isDraggingRef = React.useRef(false);
    const dragMovedRef = React.useRef(false);
    const dragStartXRef = React.useRef(0);
    const dragStartScrollRef = React.useRef(0);
    const manualVelocityRef = React.useRef(0);

    const baseFilms = React.useMemo(() => (films && films.length > 0 ? films : []), [films]);
    const tripledFilms = React.useMemo(
        () => [...baseFilms, ...baseFilms, ...baseFilms],
        [baseFilms]
    );

    /** Maintient scrollLeft dans le tiers central pour un défilement infini gauche et droite. */
    const normalizeInfinitePosition = React.useCallback((el: HTMLDivElement) => {
        const singleSetWidth = el.scrollWidth / 3;
        if (singleSetWidth <= 0) return;
        if (el.scrollLeft <= singleSetWidth * 0.35) {
            el.scrollLeft += singleSetWidth;
        } else if (el.scrollLeft >= singleSetWidth * 1.65) {
            el.scrollLeft -= singleSetWidth;
        }
    }, []);

    // Positionnement initial sur le segment central + boucle d'animation fluide
    React.useEffect(() => {
        const el = trackRef.current;
        if (!el || baseFilms.length === 0) return;

        const initCenter = () => {
            const singleSetWidth = el.scrollWidth / 3;
            if (singleSetWidth > 0 && (el.scrollLeft < singleSetWidth * 0.4 || el.scrollLeft > singleSetWidth * 1.6)) {
                el.scrollLeft = singleSetWidth;
            }
        };

        initCenter();
        const rafInit = requestAnimationFrame(initCenter);

        let animId = 0;
        let subPixelAccumulator = 0;

        const tick = () => {
            const node = trackRef.current;
            if (node) {
                // Impulsion fluide déclenchée par les boutons Gauche / Droite
                if (Math.abs(manualVelocityRef.current) > 0.25) {
                    node.scrollLeft += manualVelocityRef.current;
                    manualVelocityRef.current *= 0.88;
                    normalizeInfinitePosition(node);
                } else {
                    manualVelocityRef.current = 0;
                    // Défilement continu subtil lorsqu'il n'y a pas d'interaction en cours
                    if (!isPausedRef.current && !isDraggingRef.current) {
                        subPixelAccumulator += 0.42;
                        if (subPixelAccumulator >= 1) {
                            const step = Math.trunc(subPixelAccumulator);
                            node.scrollLeft += step;
                            subPixelAccumulator -= step;
                            normalizeInfinitePosition(node);
                        }
                    }
                }
            }
            animId = requestAnimationFrame(tick);
        };

        animId = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(rafInit);
            cancelAnimationFrame(animId);
        };
    }, [baseFilms.length, normalizeInfinitePosition]);

    const handleScroll = React.useCallback(() => {
        const el = trackRef.current;
        if (el) normalizeInfinitePosition(el);
    }, [normalizeInfinitePosition]);

    /** Défilement manuel par impulsion fluide (vers la gauche : -1, vers la droite : +1). */
    const nudgeScroll = React.useCallback((direction: -1 | 1) => {
        manualVelocityRef.current += direction * 28;
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const el = trackRef.current;
        if (!el) return;
        isDraggingRef.current = true;
        dragMovedRef.current = false;
        dragStartXRef.current = e.clientX;
        dragStartScrollRef.current = el.scrollLeft;
        manualVelocityRef.current = 0;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        const el = trackRef.current;
        if (!el) return;
        const deltaX = e.clientX - dragStartXRef.current;
        if (Math.abs(deltaX) > 6) {
            dragMovedRef.current = true;
        }
        el.scrollLeft = dragStartScrollRef.current - deltaX;
        normalizeInfinitePosition(el);
    };

    const stopDragging = () => {
        isDraggingRef.current = false;
    };

    if (baseFilms.length === 0) return null;

    return (
        <div
            className="relative group/carousel select-none"
            onMouseEnter={() => {
                isPausedRef.current = true;
            }}
            onMouseLeave={() => {
                isPausedRef.current = false;
                isDraggingRef.current = false;
            }}
            onFocusCapture={() => {
                isPausedRef.current = true;
            }}
            onBlurCapture={() => {
                isPausedRef.current = false;
            }}
        >
            {/* Conteneur du rail avec masques latéraux fondus et boutons Gauche / Droite */}
            <div className="relative overflow-hidden py-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14 bg-gradient-to-r from-[#0e0e14] via-[#0e0e14]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-14 bg-gradient-to-l from-[#0e0e14] via-[#0e0e14]/70 to-transparent z-10" />

                <button
                    type="button"
                    onClick={() => nudgeScroll(-1)}
                    aria-label="Previous"
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-[#0e0e14]/90 hover:bg-[#181824] border border-zinc-800/90 hover:border-[#FFE500] text-zinc-300 hover:text-[#FFE500] backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-lg"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => nudgeScroll(1)}
                    aria-label="Next"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-[#0e0e14]/90 hover:bg-[#181824] border border-zinc-800/90 hover:border-[#FFE500] text-zinc-300 hover:text-[#FFE500] backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-lg"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <div
                    ref={trackRef}
                    onScroll={handleScroll}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={stopDragging}
                    onPointerCancel={stopDragging}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    className="flex items-center gap-3.5 overflow-x-auto [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                >
                    {tripledFilms.map((film, idx) => {
                        const footerText = directorFor(film);
                        return (
                            <button
                                key={`${film.id}-${idx}`}
                                type="button"
                                onClick={() => {
                                    if (dragMovedRef.current) return;
                                    onOpenFilm(film);
                                }}
                                title={`${film.title}${film.year ? ` (${film.year})` : ''}`}
                                className="group/card relative shrink-0 w-[126px] sm:w-[140px] aspect-[2/3] bg-[#12121a] border border-zinc-800/80 hover:border-[#FFE500]/80 overflow-hidden transition-all duration-300 text-left cursor-pointer focus:outline-none focus:border-[#FFE500]"
                            >
                                {film.image ? (
                                    <Image
                                        src={film.image}
                                        alt={film.title}
                                        fill
                                        draggable={false}
                                        sizes="144px"
                                        className="object-cover object-center group-hover/card:scale-105 transition-transform duration-500 ease-out"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#161622] to-[#0e0e14]">
                                        <Film className="w-5 h-5 text-zinc-600 mb-1.5" />
                                        <span className="text-[10px] font-mono-tech uppercase text-zinc-300 line-clamp-3 leading-snug">
                                            {film.title}
                                        </span>
                                    </div>
                                )}

                                {/* Badge d'année minimaliste */}
                                {film.year && (
                                    <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/80 backdrop-blur-xs border border-zinc-700/80 text-[9px] font-mono-tech text-[#FFE500] leading-none">
                                        {film.year}
                                    </span>
                                )}

                                {/* Voile inférieur sobre au survol */}
                                <div className="absolute inset-x-0 bottom-0 p-2.5 pt-7 bg-gradient-to-t from-black/95 via-black/75 to-transparent opacity-90 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end">
                                    <span className="text-[11px] font-display uppercase tracking-wide text-white group-hover/card:text-[#FFE500] transition-colors line-clamp-1 leading-tight">
                                        {film.title}
                                    </span>
                                    {footerText && (
                                        <span className="text-[9px] font-mono-tech text-zinc-400 truncate mt-0.5">
                                            {footerText}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
