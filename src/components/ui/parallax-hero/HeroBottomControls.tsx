'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundFX } from '@/lib/soundFx';
import { HeroSlide } from './parallaxHero.data';

interface HeroBottomControlsProps {
  slides: HeroSlide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  tickerX: MotionValue<string>;
}

export const HeroBottomControls: React.FC<HeroBottomControlsProps> = ({
  slides,
  currentSlide,
  onSelectSlide,
  tickerX,
}) => {
  const handlePrev = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide + 1) % slides.length);
  };

  return (
    <div className="relative z-30 pb-4 flex flex-col items-center gap-3">
      {/* Slider Pagination Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrev}
          className="p-1.5 text-zinc-400 hover:text-[#FFE500] border border-zinc-800 bg-black/70 hover:bg-black transition-colors cursor-pointer"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFX.playTacticalClick();
                onSelectSlide(idx);
              }}
              className={`relative px-3 py-1 text-[11px] font-mono-tech uppercase border transition-all cursor-pointer overflow-hidden ${
                idx === currentSlide
                  ? 'bg-[#181822] text-[#FFE500] border-[#FFE500] font-bold shadow-[0_0_15px_rgba(255,229,0,0.25)]'
                  : 'bg-black/60 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
              aria-label={`Aller au slide ${idx + 1}`}
            >
              <span className="relative z-10">0{idx + 1}</span>
              {idx === currentSlide && (
                <motion.div
                  layoutId="slideIndicator"
                  className="absolute inset-0 bg-[#FFE500]/15"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-1.5 text-zinc-400 hover:text-[#FFE500] border border-zinc-800 bg-black/70 hover:bg-black transition-colors cursor-pointer"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Parallax Film Strip Ribbon Ticker at the base */}
      <div className="w-full border-t border-zinc-800/80 bg-black/90 backdrop-blur-xs py-2 overflow-hidden">
        <motion.div
          style={{ x: tickerX }}
          className="flex items-center gap-8 whitespace-nowrap text-[11px] font-mono-tech text-zinc-400 uppercase tracking-wider"
        >
          <span>★ CAMPUS UNIVERS CASCADES</span>
          <span className="text-[#FFE500]">FORMATION PROFESSIONNELLE DE CASCADEUR</span>
          <span>TOUR DE SAUT 21 MÈTRES</span>
          <span className="text-[#FFE500]">SALLE D&apos;ACTION ZOÉ BELL</span>
          <span>ATELIERS CÂBLAGE &amp; COMBAT SCÉNIQUE</span>
          <span className="text-[#FFE500]">TORCHE HUMAINE &amp; PYROTECHNIE</span>
          <span>MANÈGE ÉQUESTRE</span>
          <span className="text-[#FFE500]">CERTIFIÉ QUALIOPI • AFDAS 100%</span>
          <span>★ DOMAINE PRIVÉ DE 6 HECTARES</span>
          <span className="text-[#FFE500]">HÉBERGEMENT SUR PLACE</span>
        </motion.div>
      </div>
    </div>
  );
};
