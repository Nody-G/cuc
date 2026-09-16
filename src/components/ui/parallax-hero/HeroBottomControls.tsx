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

/**
 * Contenu du bandeau défilant noir / jaune alterné.
 * Chaque entrée porte son propre style pour garantir l'alternance des couleurs.
 */
const TICKER_ITEMS: { text: string; accent: boolean }[] = [
  { text: '★ CAMPUS UNIVERS CASCADES', accent: false },
  { text: 'FORMATION PROFESSIONNELLE DE CASCADEUR', accent: true },
  { text: 'DEPUIS 2008 • LE CATEAU-CAMBRÉSIS (59)', accent: false },
  { text: 'DOMAINE PRIVÉ DE 6 HECTARES', accent: true },
  { text: 'ATELIERS CÂBLAGE & COMBAT SCÉNIQUE', accent: false },
  { text: 'TORCHE HUMAINE & PYROTECHNIE', accent: true },
  { text: 'PARKOUR & ARTS MARTIAUX', accent: false },
  { text: 'CASCADES MÉCANIQUES & RIGGING 3D', accent: true },
  { text: 'MANÈGE ÉQUESTRE & COMBAT À CHEVAL', accent: false },
  { text: 'FOSSE OLYMPIQUE DE RÉCEPTION', accent: true },
  { text: 'HÉBERGEMENT SUR PLACE • 90 LITS', accent: false },
  { text: 'CERTIFIÉ QUALIOPI • PRISE EN CHARGE AFDAS 100%', accent: true },
  { text: 'STUNT TEAM INTERNATIONALE', accent: false },
  { text: 'LONGS-MÉTRAGES, SÉRIES & SPECTACLES VIVANTS', accent: true },
  { text: 'INSERTION DIRECTE DANS LE RÉSEAU CUC', accent: false },
  { text: '★ REJOIGNEZ LA PLUS GRANDE ÉCOLE DE CASCADEURS', accent: true },
];

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
              className={`relative px-3 py-1 text-[11px] font-mono-tech uppercase border transition-all cursor-pointer overflow-hidden ${idx === currentSlide
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
        <motion.div style={{ x: tickerX }} className="w-full">
          {/* Défilement continu CSS : la séquence est dupliquée pour un raccord sans vide */}
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap text-[11px] font-mono-tech uppercase tracking-wider">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <React.Fragment key={idx}>
                <span className={item.accent ? 'text-[#FFE500]' : 'text-zinc-400'}>
                  {item.text}
                </span>
                <span className="text-zinc-700" aria-hidden="true">
                  /
                </span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
