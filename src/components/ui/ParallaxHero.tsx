'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
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
} from './parallax-hero';

interface ParallaxHeroProps {
  onOpenSearch?: () => void;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Multi-plane parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const hudY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const tickerX = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);

  // Auto advance slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Subtle mouse gyroscopic perspective tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 18, y: y * 18 });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[88vh] sm:min-h-[92vh] flex flex-col justify-between overflow-hidden bg-black border-b border-zinc-800 select-none"
    >
      {/* 1. Parallax Layer: Background Photography with Depth Drift */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            <Image
              src={slide.url}
              alt={slide.caption}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center brightness-45 contrast-115"
            />
            {/* Cinematic Gradient Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/50 to-black/75" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/95 via-transparent to-[#060608]/95 pointer-events-none" />
          </div>
        ))}

        {/* Anamorphic Lens Flare Ambience */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full lens-flare-gold animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] rounded-full lens-flare-cyan animate-pulse-slow" />
      </motion.div>

      {/* Anamorphic Horizontal Optical Beam */}
      <div className="absolute top-1/2 left-0 right-0 z-10 anamorphic-streak opacity-40 pointer-events-none" />

      {/* 2. Parallax Layer: Tactical HUD Crosshair Frame */}
      <HeroHudOverlay hudY={hudY} mouseOffsetX={mouseOffset.x} />

      {/* 3. Central Hero Content with Parallax Motion & Gyroscope */}
      <div className="relative z-30 flex-grow flex items-center justify-center pt-24 pb-10">
        <motion.div
          style={{
            y: textY,
            opacity: textOpacity,
            x: mouseOffset.x * -0.6,
          }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center will-change-transform"
        >
          {/* Official CUC Crest Badge */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_25px_rgba(255,229,0,0.45)]">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Blason Officiel Campus Univers Cascades"
                fill
                sizes="64px"
                priority
                className="object-contain"
              />
            </div>
          </div>

          {/* Top Category Label */}
          <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-widest text-[#FFE500]">
            <span>CENTRE DE FORMATION DE CASCADEURS</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">DOMAINE DE 6 HECTARES</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase tracking-tight text-white leading-[0.92] max-w-5xl">
            CAMPUS UNIVERS <br />
            <span className="text-[#FFE500] drop-shadow-[0_0_40px_rgba(255,229,0,0.4)]">
              CASCADES
            </span>
          </h1>

          {/* Dynamic Subtitle */}
          <div className="h-16 sm:h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-base sm:text-lg md:text-xl text-zinc-200 max-w-3xl font-tech"
              >
                {HERO_SLIDES[currentSlide].sub}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Key Facts Strip */}
          <div className="mt-4 mb-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-3xl">
            {HERO_QUICK_METRICS.map((stat, i) => (
              <div
                key={i}
                className="bg-black/60 backdrop-blur-md border border-zinc-800/90 hover:border-[#FFE500]/50 py-2 px-3 transition-colors text-center relative group"
              >
                <div className="text-xs sm:text-sm font-display uppercase tracking-wider text-[#FFE500] group-hover:text-white transition-colors">
                  {stat.val}
                </div>
                <div className="text-[9px] font-mono-tech text-zinc-400 uppercase tracking-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/formation-de-cascadeur">
              <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                Formation Professionnelle
              </TacticalButton>
            </Link>

            <Link href="/visite-guidee">
              <TacticalButton
                variant="secondary"
                size="lg"
                icon={<Building className="w-4 h-4 text-[#FFE500]" />}
              >
                Visiter le Campus
              </TacticalButton>
            </Link>

            <Link href="/cuc-team-cascadeur">
              <TacticalButton
                variant="outline"
                size="lg"
                icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
              >
                Équipe Cascadeurs Pro
              </TacticalButton>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 4. Bottom Controls & Goldsmith Timepiece Slide Tabs */}
      <HeroBottomControls
        slides={HERO_SLIDES}
        currentSlide={currentSlide}
        onSelectSlide={setCurrentSlide}
        tickerX={tickerX}
      />
    </section>
  );
};
