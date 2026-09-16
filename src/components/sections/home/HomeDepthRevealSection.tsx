'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { GraduationCap, Compass, Users, CalendarDays, ArrowUpRight } from 'lucide-react';

/**
 * CINEMATIC DEPTH REVEAL — Parallaxe multi-plans « maligne ».
 *
 * Trois couches de profondeur défilent à des vitesses différentes :
 *   1. Photographie de fond (lente) + traitement duotone jaune/noir
 *   2. Grille tactique en perspective (médiane)
 *   3. Contenu éditorial + tuiles d'accès rapide (rapide)
 *
 * En plus de l'effet esthétique, la bande est *pratique* : elle sert de
 * hub de navigation vers les 4 parcours clés du campus, et affiche un rail
 * de progression de lecture synchronisé au scroll.
 */

interface DepthTile {
    href: string;
    label: string;
    detail: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const DEPTH_TILES: DepthTile[] = [
    {
        href: '/formation-de-cascadeur',
        label: 'Formation Pro',
        detail: '2 ans · 720 h',
        icon: GraduationCap,
    },
    {
        href: '/visite-guidee',
        label: 'Visite Guidée',
        detail: '9 installations',
        icon: Compass,
    },
    {
        href: '/equipe-cascadeurs-pro',
        label: 'Équipe & Formateurs',
        detail: 'Coordinateurs d’élite',
        icon: Users,
    },
    {
        href: '/stages-cascades-parkour-2',
        label: 'Stages Immersion',
        detail: 'Week-end · 250 €',
        icon: CalendarDays,
    },
];

export const HomeDepthRevealSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    // Ressort pour lisser les micro-saccades du scroll (rendu fluide).
    const smooth = useSpring(scrollYProgress, {
        stiffness: 90,
        damping: 26,
        restDelta: 0.001,
    });

    // Couche 1 — photographie : dérive lente + léger zoom cinématique.
    const bgY = useTransform(smooth, [0, 1], ['-12%', '12%']);
    const bgScale = useTransform(smooth, [0, 0.5, 1], [1.18, 1.06, 1.18]);

    // Couche 2 — grille tactique : dérive médiane en sens inverse.
    const gridY = useTransform(smooth, [0, 1], ['8%', '-8%']);
    const gridOpacity = useTransform(smooth, [0, 0.5, 1], [0.25, 0.6, 0.25]);

    // Couche 3 — contenu : dérive rapide + apparition/disparition douce.
    const contentY = useTransform(smooth, [0, 1], ['14%', '-14%']);
    const contentOpacity = useTransform(smooth, [0, 0.22, 0.78, 1], [0, 1, 1, 0]);

    // Barres letterbox cinéma : s'ouvrent à l'entrée dans le viewport.
    const barScale = useTransform(smooth, [0, 0.35], [1, 0.18]);

    // Rail de progression de lecture (0 → 100 %).
    const railScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    // Indicateur de progression numérique (mis à jour sans re-render React).
    const progressRef = useRef<HTMLSpanElement>(null);
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        if (progressRef.current) {
            progressRef.current.textContent = String(Math.round(v * 100)).padStart(2, '0');
        }
    });

    return (
        <section
            ref={sectionRef}
            aria-labelledby="depth-reveal-title"
            className="relative isolate overflow-hidden bg-[#060608] border-b border-zinc-800 py-28 sm:py-36"
        >
            {/* ---------- COUCHE 1 : Photographie de fond (parallaxe lente) ---------- */}
            <motion.div
                style={{ y: bgY, scale: bgScale }}
                className="absolute inset-0 z-0 will-change-transform"
                aria-hidden="true"
            >
                <Image
                    src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center duotone-cuc"
                />
                {/* Vignettes cinématographiques */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#060608] via-[#060608]/55 to-[#060608]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-transparent to-[#060608]" />
            </motion.div>

            {/* ---------- COUCHE 2 : Grille tactique en perspective ---------- */}
            <motion.div
                style={{ y: gridY, opacity: gridOpacity }}
                className="absolute inset-0 z-10 depth-grid will-change-transform"
                aria-hidden="true"
            />

            {/* Grain argentique + ligne de balayage dorée */}
            <div className="absolute inset-0 z-10 film-grain pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 left-0 right-0 z-20 h-px overflow-hidden" aria-hidden="true">
                <div className="h-full w-1/2 scanline-gold animate-scanline" />
            </div>

            {/* Barres letterbox cinéma (haut + bas) */}
            <motion.div
                style={{ scaleY: barScale }}
                className="absolute top-0 left-0 right-0 z-20 h-16 sm:h-24 origin-top bg-black/85 backdrop-blur-[2px] pointer-events-none"
                aria-hidden="true"
            />
            <motion.div
                style={{ scaleY: barScale }}
                className="absolute bottom-0 left-0 right-0 z-20 h-16 sm:h-24 origin-bottom bg-black/85 backdrop-blur-[2px] pointer-events-none"
                aria-hidden="true"
            />

            {/* ---------- COUCHE 3 : Contenu éditorial (parallaxe rapide) ---------- */}
            <motion.div
                style={{ y: contentY, opacity: contentOpacity }}
                className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform"
            >
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse-slow" />
                        <span className="text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-[0.22em]">
                            Immersion · Profondeur de champ
                        </span>
                    </div>

                    <h2
                        id="depth-reveal-title"
                        className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.95] text-white uppercase"
                    >
                        Six hectares
                        <span className="block text-[#FFE500]">taillés pour l’action</span>
                    </h2>

                    <p className="mt-6 text-sm sm:text-base text-zinc-300 font-tech leading-relaxed max-w-2xl">
                        Du Zoé Bell Hall à la CUC Tower de 21 mètres, chaque installation est pensée pour
                        repousser la limite du réel. Choisissez votre porte d’entrée dans le campus.
                    </p>
                </div>

                {/* Tuiles d'accès rapide — la dimension « pratique » de la parallaxe */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DEPTH_TILES.map((tile, idx) => {
                        const Icon = tile.icon;
                        return (
                            <motion.div
                                key={tile.href}
                                initial={{ opacity: 0, y: 26 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Link
                                    href={tile.href}
                                    className="group relative flex flex-col justify-between h-full min-h-[132px] p-5 bg-[#0a0a0e]/80 backdrop-blur-md border border-zinc-800 hover:border-[#FFE500] transition-colors duration-300 overflow-hidden"
                                >
                                    {/* Halo doré au survol */}
                                    <span className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#FFE500]/0 group-hover:bg-[#FFE500]/10 blur-2xl transition-colors duration-500" />

                                    <div className="relative flex items-start justify-between">
                                        <Icon className="w-6 h-6 text-[#FFE500]" strokeWidth={1.6} />
                                        <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#FFE500] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                    </div>

                                    <div className="relative mt-6">
                                        <div className="font-display text-lg tracking-wide text-white uppercase leading-none">
                                            {tile.label}
                                        </div>
                                        <div className="mt-1 text-[11px] font-mono-tech text-zinc-400 uppercase tracking-wider">
                                            {tile.detail}
                                        </div>
                                    </div>

                                    {/* Soulignement doré animé */}
                                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#FFE500] group-hover:w-full transition-all duration-400" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ---------- Rail de progression de lecture ---------- */}
            <div className="absolute bottom-0 left-0 right-0 z-40 h-0.5 bg-zinc-900" aria-hidden="true">
                <motion.div
                    style={{ scaleX: railScaleX }}
                    className="h-full w-full origin-left bg-[#FFE500]"
                />
            </div>

            {/* Compteur de progression (repère tactique discret) */}
            <div
                className="absolute bottom-6 right-4 sm:right-8 z-40 hidden sm:flex items-center gap-2 font-mono-tech text-[10px] text-zinc-500 uppercase tracking-widest"
                aria-hidden="true"
            >
                <span>Progression</span>
                <span ref={progressRef} className="text-[#FFE500] font-bold tabular-nums">
                    00
                </span>
                <span>%</span>
            </div>
        </section>
    );
};
