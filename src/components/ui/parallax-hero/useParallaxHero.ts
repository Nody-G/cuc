'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { isPreviewFrame } from '@/lib/preview/preview-context';
import { HERO_SLIDES, type HeroSlide } from './parallaxHero.data';

export const SLIDE_DURATION_SEC = 6.5;

/** Copie localisée d'un visuel de hero (`home.hero.slides.<key>`). */
export interface SlideCopy {
    caption: string;
    sub: string;
    badge: string;
    tag: string;
}

export type SlideCopyMap = Record<HeroSlide['key'], SlideCopy>;

/** Métrique éditable du hero (`home.hero.metrics`). */
export interface HeroMetric {
    val: string;
    label: string;
}

/**
 * Orchestration du hero : mode calme, ressorts de scroll / pointeur,
 * avancement automatique des visuels et handlers associés.
 *
 * La ref de la section est créée par le composant appelant et passée en
 * paramètre (jamais retournée par le hook).
 */
export function useParallaxHero(heroRef: RefObject<HTMLElement | null>) {
    const [currentSlide, setCurrentSlide] = useState(0);

    /**
     * Mode calme — tactile (pointer grossier) ou `prefers-reduced-motion`.
     *
     * Cause racine des bugs mobiles signalés : le tilt 3D était piloté par
     * `pointermove`, or le scroll au doigt émet ces événements — le fond se
     * penchait puis restait incliné (`pointerleave` ne se déclenche pas au
     * toucher). S'ajoutaient un Ken-Burns en boucle, un fondu de 1 s et quatre
     * visuels plein écran empilés : de quoi produire déformation, scintillement
     * et cadrage instable sur mobile.
     */
    const [isCalmMode, setIsCalmMode] = useState(false);

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

    // 1. Saccade-absorbing hydraulic spring for scroll (absorbs wheel notches & finger flicks)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 45,
        damping: 25,
        mass: 0.8,
        restDelta: 0.0001,
    });

    // 2. Fluid gimbal inertia for pointer / touch movement
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);

    const smoothMouseX = useSpring(rawMouseX, {
        stiffness: 35,
        damping: 22,
        mass: 0.7,
    });

    const smoothMouseY = useSpring(rawMouseY, {
        stiffness: 35,
        damping: 22,
        mass: 0.7,
    });

    // 3. 3D Perspective Tilt on Background Environment (Not on text!)
    const bgRotateX = useTransform(smoothMouseY, [-20, 20], [2, -2]);
    const bgRotateY = useTransform(smoothMouseX, [-20, 20], [-2, 2]);
    const bgShiftX = useTransform(smoothMouseX, [-20, 20], [-8, 8]);
    const bgScrollY = useTransform(smoothScroll, [0, 1], ['0%', '14%']);

    // 4. Focal Text Layer: 100% STABLE (No movement parallax on text!)
    // Only smooth opacity fade on scroll driven by the damped spring
    const focalTextOpacity = useTransform(smoothScroll, [0, 0.65], [1, 0]);

    // Pointer event listeners with smooth coordinate mapping
    const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
        // Souris uniquement (et jamais en mode calme) : le doigt ne doit pas
        // incliner l'environnement pendant le scroll.
        if (isCalmMode || e.pointerType !== 'mouse') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        rawMouseX.set(normX * 24);
        rawMouseY.set(normY * 24);
    };

    const handlePointerLeave = () => {
        rawMouseX.set(0);
        rawMouseY.set(0);
    };

    // Auto advance slide with clean reset
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, SLIDE_DURATION_SEC * 1000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleSelectSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    return {
        currentSlide,
        isCalmMode,
        smoothScroll,
        smoothMouseX,
        smoothMouseY,
        bgRotateX,
        bgRotateY,
        bgShiftX,
        bgScrollY,
        focalTextOpacity,
        handlePointerMove,
        handlePointerLeave,
        handleSelectSlide,
    };
}
