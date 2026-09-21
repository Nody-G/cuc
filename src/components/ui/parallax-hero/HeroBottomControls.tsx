'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { soundFX } from '@/lib/soundFx';
import { HeroSlide } from './parallaxHero.data';

interface HeroBottomControlsProps {
  slides: HeroSlide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  /** Conservé pour compatibilité d'API (l'auto-avance est pilotée en amont). */
  slideDuration?: number;
}

/**
 * Contrôles de navigation du hero d'accueil.
 *
 * Épuré : uniquement les flèches précédent / suivant. Les sélecteurs de slides
 * (4 boutons segmentés) et la relance « Explorer le campus » ont été retirés :
 * l'auto-avance et le défilement naturel suffisent.
 */
export const HeroBottomControls: React.FC<HeroBottomControlsProps> = ({
  slides,
  currentSlide,
  onSelectSlide,
}) => {
  const t = useTranslations('home.hero');

  const handlePrev = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    soundFX.playTacticalClick();
    onSelectSlide((currentSlide + 1) % slides.length);
  };

  return (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-6 pt-2 flex items-center justify-center gap-3">
      <button
        onClick={handlePrev}
        aria-label={t('prevSlide')}
        className="shrink-0 p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-[#FFE500]/50 text-zinc-300 hover:text-[#FFE500] transition-all backdrop-blur-md cursor-pointer group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={handleNext}
        aria-label={t('nextSlide')}
        className="shrink-0 p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-[#FFE500]/50 text-zinc-300 hover:text-[#FFE500] transition-all backdrop-blur-md cursor-pointer group"
      >
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};
