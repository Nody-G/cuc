'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { isPreviewFrame } from '@/lib/preview/preview-context';
import type { HeroSlideKey } from './parallaxHero.data';

export const SLIDE_DURATION_SEC = 6.5;

/** Copie localisée d'un visuel de hero (`home.hero.slides.<key>`). */
export interface SlideCopy {
    caption: string;
    sub: string;
    badge: string;
    tag: string;
}

export type SlideCopyMap = Record<HeroSlideKey, SlideCopy>;

/** Métrique éditable du hero (`home.hero.metrics`). */
export interface HeroMetric {
    val: string;
    label: string;
}

/**
 * Orchestration du hero : mode calme, parallaxe CSS (scroll / pointeur),
 * avancement automatique des visuels et handlers associés.
 *
 * Pilotage par propriétés personnalisées CSS (`--cuc-hero-scroll`,
 * `--cuc-hero-opacity`, `--cuc-hero-mx`, `--cuc-hero-my`) écrites en
 * `requestAnimationFrame` sur l'élément racine : aucun re-render React au
 * scroll/pointeur et zéro dépendance `framer-motion` dans le graphe public
 * (`.agents/rules/client_bundle_budget.md` § 3).
 */
export function useParallaxHero(heroRef: RefObject<HTMLElement | null>, slideCount: number) {
    const safeCount = Number.isFinite(slideCount) && slideCount > 0 ? Math.floor(slideCount) : 1;
    const [currentSlide, setCurrentSlide] = useState(0);

    /**
     * Mode calme — tactile (pointer grossier) ou `prefers-reduced-motion`.
     */
    const [isCalmMode, setIsCalmMode] = useState(false);
    const pointerFrameRef = useRef<number>(0);
    const pointerTargetRef = useRef<{ mx: number; my: number }>({ mx: 0, my: 0 });

    useEffect(() => {
        const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        // Aperçu du Cockpit : effets continus mis en veille (iframe réactive).
        const sync = () => setIsCalmMode(isPreviewFrame() || coarse.matches || reduced.matches);
        sync();
        coarse.addEventListener('change', sync);
        reduced.addEventListener('change', sync);
        return () => {
            coarse.removeEventListener('change', sync);
            reduced.removeEventListener('change', sync);
        };
    }, []);

    // Synchronisation du scroll vers `--cuc-hero-scroll` et `--cuc-hero-opacity`
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;

        if (isCalmMode) {
            el.style.setProperty('--cuc-hero-scroll', '0');
            el.style.setProperty('--cuc-hero-opacity', '1');
            el.style.setProperty('--cuc-hero-mx', '0');
            el.style.setProperty('--cuc-hero-my', '0');
            return;
        }

        let scrollFrame = 0;
        const updateScroll = () => {
            scrollFrame = 0;
            const rect = el.getBoundingClientRect();
            const height = Math.max(1, rect.height);
            const raw = -rect.top / height;
            const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
            const opacity = Math.max(0, Math.min(1, 1 - progress / 0.65));
            el.style.setProperty('--cuc-hero-scroll', progress.toFixed(4));
            el.style.setProperty('--cuc-hero-opacity', opacity.toFixed(4));
        };

        const scheduleScroll = () => {
            if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
        };

        updateScroll();
        window.addEventListener('scroll', scheduleScroll, { passive: true });
        window.addEventListener('resize', scheduleScroll);
        return () => {
            window.removeEventListener('scroll', scheduleScroll);
            window.removeEventListener('resize', scheduleScroll);
            if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
        };
    }, [heroRef, isCalmMode]);

    // Nettoyage du frame pointeur au démontage
    useEffect(() => {
        return () => {
            if (pointerFrameRef.current) {
                window.cancelAnimationFrame(pointerFrameRef.current);
            }
        };
    }, []);

    const flushPointer = useCallback(() => {
        pointerFrameRef.current = 0;
        const el = heroRef.current;
        if (!el) return;
        const { mx, my } = pointerTargetRef.current;
        el.style.setProperty('--cuc-hero-mx', mx.toFixed(4));
        el.style.setProperty('--cuc-hero-my', my.toFixed(4));
    }, [heroRef]);

    const handlePointerMove = useCallback(
        (e: ReactPointerEvent<HTMLElement>) => {
            if (isCalmMode || e.pointerType !== 'mouse') return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
            const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
            pointerTargetRef.current = { mx: normX, my: normY };
            if (!pointerFrameRef.current) {
                pointerFrameRef.current = window.requestAnimationFrame(flushPointer);
            }
        },
        [isCalmMode, flushPointer]
    );

    const handlePointerLeave = useCallback(() => {
        pointerTargetRef.current = { mx: 0, my: 0 };
        if (!pointerFrameRef.current) {
            pointerFrameRef.current = window.requestAnimationFrame(flushPointer);
        }
    }, [flushPointer]);

    // Auto advance slide with clean reset
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % safeCount);
        }, SLIDE_DURATION_SEC * 1000);
        return () => clearInterval(timer);
    }, [currentSlide, safeCount]);

    const handleSelectSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    return {
        currentSlide: currentSlide < safeCount ? currentSlide : 0,
        isCalmMode,
        handlePointerMove,
        handlePointerLeave,
        handleSelectSlide,
    };
}
