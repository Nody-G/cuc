'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Zap, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { CUC_DISCIPLINES } from '@/data/disciplines';

export const FormationDisciplinesExplorer: React.FC = () => {
  const [activeDisciplineIndex, setActiveDisciplineIndex] = useState(0);
  const activeDiscipline = CUC_DISCIPLINES[activeDisciplineIndex];

  return (
    <section className="py-16 bg-[#09090d] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <StuntBadge variant="yellow" icon={<Zap className="w-3.5 h-3.5" />}>
              RÉPERTOIRE TECHNIQUE
            </StuntBadge>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3">
              LES 10 DISCIPLINES DE LA CASCADE PHYSIQUE
            </h2>
          </div>
        </div>

        {/* Interactive Discipline Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation List on Left */}
          <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {CUC_DISCIPLINES.map((d, index) => {
              const isSelected = index === activeDisciplineIndex;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDisciplineIndex(index)}
                  className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#14141c] border-[#FFE500] text-white shadow-lg'
                      : 'bg-[#0b0b0f] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`font-mono-tech text-xs font-bold ${
                        isSelected ? 'text-[#FFE500]' : 'text-zinc-500'
                      }`}
                    >
                      {d.number}
                    </span>
                    <span className="font-display uppercase text-sm tracking-wide truncate">
                      {d.name}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-[#FFE500] translate-x-1'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Discipline Detail Card on Right with Real Image */}
          <div className="lg:col-span-7 bg-[#0f0f16] border-2 border-zinc-800 p-6 relative">

            {/* Real Image of Discipline */}
            <div className="relative h-72 sm:h-80 w-full mb-6 overflow-hidden border border-zinc-800">
              <Image
                src={activeDiscipline.heroImage}
                alt={activeDiscipline.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center brightness-90 contrast-110"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white">
                {activeDiscipline.name}
              </h3>
            </div>

            <p className="text-xs font-tech text-zinc-300 leading-relaxed mb-6">
              {activeDiscipline.fullDesc}
            </p>

            <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs font-tech">
              <div>
                <strong className="text-[#FFE500] font-mono-tech block mb-1 uppercase">
                  Contexte Cinéma &amp; Tournage :
                </strong>
                <p className="text-zinc-400">{activeDiscipline.cinemaContext}</p>
              </div>

              <div>
                <strong className="text-[#FFE500] font-mono-tech block mb-1 uppercase">
                  Équipements &amp; Installations :
                </strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeDiscipline.equipment.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
