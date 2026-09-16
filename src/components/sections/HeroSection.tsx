'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ChevronDown, ShieldCheck, Flame, Award, Building } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';
import { StuntBadge } from '../ui/StuntBadge';

interface HeroSectionProps {
  onOpenApplication: () => void;
  onOpenVideoModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenApplication,
  onOpenVideoModal,
}) => {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-black">
      {/* Cinematic Action Backdrop with Gradient Masks */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg"
          alt="Campus Univers Cascades - Cascades de cinéma en action"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.4] contrast-125 scale-105 transition-transform duration-1000"
        />
        {/* Dark Overlays & Action Vibe */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 cinematic-grid opacity-30" />
      </div>



      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Flame className="w-3.5 h-3.5" />}>
            ÉCOLE DE CASCADEURS PROFESSIONNELS
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400 hidden sm:inline">
            FONDÉ EN 2008 • LE CATEAU-CAMBRÉSIS
          </span>
        </div>

        {/* Monumental Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display uppercase tracking-tight text-white leading-[0.9] max-w-5xl">
          LA PLUS GRANDE <br />
          <span className="text-[#FFE500] drop-shadow-[0_0_35px_rgba(255,229,0,0.3)]">
            ÉCOLE DE CASCADEURS
          </span>{' '}
          <br />
          AU MONDE
        </h1>

        {/* Subtitle / Core Mission */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl font-tech leading-relaxed">
          Sur un domaine exceptionnel de <strong className="text-white">6 hectares</strong> au Cateau-Cambrésis,
          le CUC forge les professionnels de l'action pour les superproductions hollywoodiennes (
          <em className="text-[#FFE500] not-italic">John Wick 4, Fast & Furious X, James Bond</em>) et le cinéma
          européen. Rigueur impitoyable, sécurité absolue et maîtrise totale du corps.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
          <TacticalButton
            variant="primary"
            size="lg"
            onClick={onOpenApplication}
            className="w-full sm:w-auto"
          >
            Candidater aux Sélections 2026/2027
          </TacticalButton>

          <TacticalButton
            variant="secondary"
            size="lg"
            onClick={onOpenVideoModal}
            icon={<Play className="w-4 h-4 fill-[#FFE500] text-[#FFE500]" />}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Lancer le Showreel CUC
          </TacticalButton>
        </div>

        {/* Key KPI Badges Bar */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl pt-8 border-t border-white/10">
          <div className="bg-[#0e0e12]/90 border border-zinc-800 p-3 sm:p-4 text-left group hover:border-[#FFE500]/50 transition-colors">
            <div className="flex items-center gap-2 text-[#FFE500] text-xs font-mono-tech mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>INFRASTRUCTURE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display text-white">6 HECTARES</div>
            <div className="text-[11px] text-zinc-400 font-tech">Domaine unique au monde (59)</div>
          </div>

          <div className="bg-[#0e0e12]/90 border border-zinc-800 p-3 sm:p-4 text-left group hover:border-[#FFE500]/50 transition-colors">
            <div className="flex items-center gap-2 text-[#FFE500] text-xs font-mono-tech mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>CUC TOWER</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display text-white">21 MÈTRES</div>
            <div className="text-[11px] text-zinc-400 font-tech">5 paliers de saut & défenestration</div>
          </div>

          <div className="bg-[#0e0e12]/90 border border-zinc-800 p-3 sm:p-4 text-left group hover:border-[#FFE500]/50 transition-colors">
            <div className="flex items-center gap-2 text-[#FFE500] text-xs font-mono-tech mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CERTIFICATION</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display text-white">QUALIOPI</div>
            <div className="text-[11px] text-zinc-400 font-tech">Prise en charge AFDAS 100%</div>
          </div>

          <div className="bg-[#0e0e12]/90 border border-zinc-800 p-3 sm:p-4 text-left group hover:border-[#FFE500]/50 transition-colors">
            <div className="flex items-center gap-2 text-[#FFE500] text-xs font-mono-tech mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>RÉPUTATION</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display text-white">15+ ANS</div>
            <div className="text-[11px] text-zinc-400 font-tech">Crédits Hollywood & Europe</div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <a
          href="#formations"
          className="mt-10 flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FFE500] transition-colors text-xs font-mono-tech uppercase"
        >
          <span>Découvrir les formations & programmes</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#FFE500]" />
        </a>
      </div>
    </section>
  );
};
