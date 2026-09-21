'use client';
import { Link } from '@/i18n/navigation';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { TacticalButton } from './TacticalButton';
import {
  ChevronRight,
  Compass,
  Building,
} from 'lucide-react';
import {
  HERO_SLIDES,
  HERO_QUICK_METRICS,
  HeroHudOverlay,
  HeroBottomControls,
  HeroTechDepth,
} from './parallax-hero';

import { SitePageHero } from '@/lib/data/site-service';

const SLIDE_DURATION_SEC = 6.5;

interface ParallaxHeroProps {
  onOpenSearch?: () => void;
  heroData?: Partial<SitePageHero>;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ heroData }) => {
  const heroRef = useRef<HTMLElement>(null);
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
    const sync = () => setIsCalmMode(coarse.matches || reduced.matches);
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
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
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

  return (
    <section
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[90svh] sm:min-h-[94svh] flex flex-col justify-between overflow-hidden bg-[#060608] border-b border-zinc-900 select-none [perspective:1200px]"
    >
      {/* 1. Deep 3D Background Layer: Photography + Ken-Burns + Organic Inertial Tilt */}
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
                alt={HERO_SLIDES[currentSlide].caption}
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
                    alt={slide.caption}
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

      {/* 2. Tech / Mech & Organic 3D Depth Layer (absorbs wheel & finger saccades) */}
      <HeroTechDepth
        smoothMouseX={smoothMouseX}
        smoothMouseY={smoothMouseY}
        smoothScroll={smoothScroll}
        simplified={isCalmMode}
      />

      {/* 3. Subtle Location & Campus Header Overlay */}
      <HeroHudOverlay />

      {/* 4. Central Text Content: Rock-Solid Focal Plane (NO text displacement!) */}
      <div className="relative z-20 flex-grow flex items-center justify-center pt-24 pb-8 sm:pt-28 pointer-events-auto">
        <motion.div
          style={{ opacity: focalTextOpacity }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center will-change-transform"
        >
          {/* Refined Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md text-[11px] font-mono-tech tracking-widest text-zinc-300 uppercase shadow-xs mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
            <span>{heroData?.badge || 'Centre International de Formation de Cascadeurs'}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#FFE500] font-semibold">Depuis 2008</span>
          </motion.div>

          {/* Clean Editorial Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase tracking-tight text-white leading-[0.92] max-w-5xl"
          >
            {heroData?.title ? (
              <span>{heroData.title}</span>
            ) : (
              <>
                Campus Univers <br />
                <span className="text-[#FFE500] drop-shadow-[0_0_35px_rgba(255,229,0,0.32)]">
                  Cascades
                </span>
              </>
            )}
          </motion.h1>

          {/* Dynamic Subtitle with smooth crossfade */}
          <div className="h-16 sm:h-12 flex items-center justify-center my-3">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSlide}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed text-balance"
              >
                {heroData?.subtitle || HERO_SLIDES[currentSlide].sub}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="my-4 flex flex-wrap items-center justify-center gap-3"
          >
            {HERO_QUICK_METRICS.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 pl-3 pr-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/[0.08] border-l-2 border-l-[#FFE500]"
              >
                <div className="text-left">
                  <div className="text-[#FFE500] font-display text-base sm:text-lg font-bold tracking-wide leading-none">
                    {stat.val}
                  </div>
                  <div className="text-zinc-400 font-mono-tech text-[9px] uppercase tracking-widest mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link href={heroData?.cta_primary_link || '/formation-de-cascadeur'}>
              <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                {heroData?.cta_primary_text || 'Formation Professionnelle'}
              </TacticalButton>
            </Link>

            <Link href={heroData?.cta_secondary_link || '/visite-guidee'}>
              <TacticalButton
                variant="secondary"
                size="lg"
                icon={<Building className="w-4 h-4 text-[#FFE500]" />}
              >
                {heroData?.cta_secondary_text || 'Visiter le Campus'}
              </TacticalButton>
            </Link>

            <Link href="/cuc-team-cascadeur">
              <TacticalButton
                variant="outline"
                size="lg"
                icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
              >
                Stunt Team Pro
              </TacticalButton>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* 5. Modern Segmented Slide Navigation & Smooth Scroll Cue */}
      <HeroBottomControls
        slides={HERO_SLIDES}
        currentSlide={currentSlide}
        onSelectSlide={handleSelectSlide}
        slideDuration={SLIDE_DURATION_SEC}
      />
    </section>
  );
};
