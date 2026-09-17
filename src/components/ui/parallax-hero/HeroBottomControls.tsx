'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { soundFX } from '@/lib/soundFx';
import { HeroSlide } from './parallaxHero.data';

interface HeroBottomControlsProps {
  slides: HeroSlide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  slideDuration?: number; // in seconds, default 6.5
}

export const HeroBottomControls: React.FC<HeroBottomControlsProps> = ({
  slides,
  currentSlide,
  onSelectSlide,
  slideDuration = 6.5,
}) => {
  const handlePrev = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide + 1) % slides.length);
  };

  const handleScrollDown = () => {
    soundFX.playTacticalClick();
    const nextSection = document.getElementById('contenu-principal');
    if (nextSection) {
      const offsetTop = nextSection.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-6 pt-2 flex flex-col items-center gap-5">
      {/* Modern Segmented Slide Timeline */}
      <div className="w-full flex items-center gap-3 sm:gap-4">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Slide précédent"
          className="shrink-0 p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-[#FFE500]/50 text-zinc-300 hover:text-[#FFE500] transition-all backdrop-blur-md cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* 4 Segmented Progress Bars */}
        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundFX.playTacticalClick();
                  onSelectSlide(idx);
                }}
                className={`group flex flex-col gap-1.5 p-2 sm:p-2.5 rounded-lg border transition-all text-left cursor-pointer backdrop-blur-md ${
                  isActive
                    ? 'bg-white/[0.08] border-[#FFE500]/40 shadow-[0_0_20px_rgba(255,229,0,0.12)]'
                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
                aria-label={`Aller au slide ${idx + 1} : ${slide.tag}`}
              >
                {/* Segment Header: Number + Tag */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono-tech tracking-wider uppercase">
                  <span
                    className={`font-semibold transition-colors ${
                      isActive ? 'text-[#FFE500]' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className={`truncate transition-colors ${
                      isActive ? 'text-zinc-200 font-medium' : 'text-zinc-500 group-hover:text-zinc-400'
                    }`}
                  >
                    {slide.tag}
                  </span>
                </div>

                {/* Segment Animated Progress Track */}
                <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                  {isActive ? (
                    <motion.div
                      key={`progress-${currentSlide}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: slideDuration, ease: 'linear' }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FFE500] to-[#FFF04D] rounded-full shadow-[0_0_8px_rgba(255,229,0,0.6)]"
                    />
                  ) : (
                    <div
                      className={`h-full transition-all duration-300 ${
                        idx < currentSlide ? 'w-full bg-white/25' : 'w-0'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          aria-label="Slide suivant"
          className="shrink-0 p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-[#FFE500]/50 text-zinc-300 hover:text-[#FFE500] transition-all backdrop-blur-md cursor-pointer group"
        >
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Smooth Minimalist Scroll Cue */}
      <button
        onClick={handleScrollDown}
        className="group inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono-tech tracking-widest uppercase text-zinc-400 hover:text-[#FFE500] transition-colors cursor-pointer pt-1"
        aria-label="Faire défiler vers le contenu"
      >
        <span>Explorer le campus</span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex"
        >
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FFE500] transition-colors" />
        </motion.span>
      </button>
    </div>
  );
};
