'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CUC_DISCIPLINES } from '@/data/disciplines';
import { Discipline } from '@/types';
import { StuntBadge } from '../ui/StuntBadge';
import { TacticalButton } from '../ui/TacticalButton';
import { TiltCard } from '../ui/TiltCard';
import {
  Swords,
  TrendingDown,
  Flame,
  Cable,
  Crosshair,
  Activity,
  ShieldAlert,
  Sparkles,
  AlignVerticalJustifyEnd,
  RotateCcw,
  X,
  Clapperboard,
  Shield,
  Layers,
} from 'lucide-react';

interface DisciplineGridProps {
  onOpenApplication: () => void;
}

export const DisciplineGrid: React.FC<DisciplineGridProps> = ({ onOpenApplication }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  const getIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-[#FFE500]' };
    switch (iconName) {
      case 'Swords':
        return <Swords {...props} />;
      case 'TrendingDown':
        return <TrendingDown {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Cable':
        return <Cable {...props} />;
      case 'Crosshair':
        return <Crosshair {...props} />;
      case 'Activity':
        return <Activity {...props} />;
      case 'ShieldAlert':
        return <ShieldAlert {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'AlignVerticalJustifyEnd':
        return <AlignVerticalJustifyEnd {...props} />;
      case 'RotateCcw':
        return <RotateCcw {...props} />;
      default:
        return <Shield {...props} />;
    }
  };

  return (
    <section id="disciplines" className="py-20 bg-[#060608] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <StuntBadge variant="yellow">MÉTHODOLOGIE D'ENTRAÎNEMENT</StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-500">10 MODULES PHYSIQUES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
            LES 10 DISCIPLINES DE LA CASCADE PHYSIQUE
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-tech mt-3">
            Au cinéma, la polyvalence est la condition absolue de survie d'un cascadeur. Chaque
            module CUC couvre une compétence spécifique requise sur les plateaux de tournage mondiaux.
          </p>
        </div>

        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CUC_DISCIPLINES.map((discipline) => (
            <TiltCard
              key={discipline.id}
              maxTilt={6}
              scale={1.02}
              className="h-full"
            >
              <div
                onClick={() => setSelectedDiscipline(discipline)}
                className="group relative h-full bg-[#0e0e12] border border-zinc-800 hover:border-[#FFE500]/60 transition-colors duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Image Preview with Dark Gradient */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={discipline.heroImage}
                    alt={discipline.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center brightness-75 group-hover:brightness-95 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-[#0e0e12]/30 to-transparent" />

                  {/* Module Code Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-black/80 backdrop-blur-xs border border-white/20 text-[11px] font-mono-tech text-[#FFE500] px-2 py-0.5 font-bold">
                      {discipline.number}
                    </span>
                    <span
                      className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 border ${
                        discipline.level === 'Extrême'
                          ? 'bg-red-950/70 text-red-300 border-red-800'
                          : discipline.level === 'Tactique'
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                          : discipline.level === 'Avancé'
                          ? 'bg-amber-950/70 text-[#FFE500] border-amber-800'
                          : 'bg-zinc-900/80 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {discipline.level}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#16161f] border border-zinc-700 group-hover:border-[#FFE500]/40 transition-colors">
                        {getIcon(discipline.iconName)}
                      </div>
                      <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                        {discipline.name}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-400 font-tech line-clamp-3 leading-relaxed mb-4">
                      {discipline.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono-tech">
                    <span className="text-zinc-500 uppercase flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-[#FFE500]" />
                      <span>Focus Cinéma</span>
                    </span>
                    <span className="text-[#FFE500] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Fiche technique &rarr;
                    </span>
                  </div>
                </div>

                {/* Bottom Subtle Hazard Accent */}
                <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Discipline Detail Modal */}
      {selectedDiscipline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0e0e12] border-2 border-[#FFE500] p-6 sm:p-8 my-8 shadow-[0_0_60px_rgba(255,229,0,0.15)]">

            <div className="h-1.5 w-full hazard-stripes mb-6" />

            {/* Close button */}
            <button
              onClick={() => setSelectedDiscipline(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#FFE500] text-black font-mono-tech text-xs font-bold px-2.5 py-0.5">
                {selectedDiscipline.number}
              </span>
              <span className="text-xs font-mono-tech text-zinc-400">
                NIVEAU EXIGÉ :{' '}
                <strong className="text-white uppercase">{selectedDiscipline.level}</strong>
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white mb-4">
              {selectedDiscipline.name}
            </h3>

            {/* Photo preview in modal */}
            <div className="relative h-64 sm:h-72 w-full mb-6 border border-zinc-800 overflow-hidden">
              <Image
                src={selectedDiscipline.heroImage}
                alt={selectedDiscipline.name}
                fill
                sizes="(max-width: 800px) 100vw, 800px"
                className="object-cover object-center brightness-85"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500]">
                  <Clapperboard className="w-4 h-4" />
                  <span>APPLICATIONS CINÉMATOGRAPHIQUES :</span>
                </div>
                <p className="text-xs text-zinc-200 font-tech mt-0.5">
                  {selectedDiscipline.cinemaContext}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs font-mono-tech uppercase text-zinc-400 block mb-1">
                  Enseignement & Doctrine Pédagogique :
                </span>
                <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                  {selectedDiscipline.fullDesc}
                </p>
              </div>

              <div>
                <span className="text-xs font-mono-tech uppercase text-zinc-400 block mb-2">
                  Équipements de Sécurité & Dispositifs Techniques :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDiscipline.equipment.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-tech bg-[#16161c] border border-zinc-800 p-2 text-zinc-300"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDiscipline(null)}
                className="text-xs font-mono-tech uppercase text-zinc-400 hover:text-white"
              >
                Fermer
              </button>
              <TacticalButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedDiscipline(null);
                  onOpenApplication();
                }}
              >
                Intégrer ce Module au CUC
              </TacticalButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
