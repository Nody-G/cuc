'use client';

import React, { useState } from 'react';
import { STUNT_PROGRAMS } from '@/data/programs';
import { TacticalButton } from '../ui/TacticalButton';
import { StuntBadge } from '../ui/StuntBadge';
import {
  Calendar,
  CheckCircle,
  FileText,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface ProgramSelectorProps {
  onSelectProgram: (programId: string) => void;
}

export const ProgramSelector: React.FC<ProgramSelectorProps> = ({ onSelectProgram }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  const filterTabs = [
    { id: 'all', label: 'Toutes les Formations' },
    { id: 'pro', label: 'Professionnel (Long)' },
    { id: 'discovery', label: 'Stage Découverte' },
    { id: 'weekend', label: 'Week-end Immersion' },
    { id: 'afdas', label: 'AFDAS & Intermittents' },
    { id: 'summer', label: 'Summer Camp' },
  ];

  const filteredPrograms =
    activeTab === 'all'
      ? STUNT_PROGRAMS
      : STUNT_PROGRAMS.filter((p) => p.category === activeTab);

  return (
    <section id="formations" className="py-20 bg-[#08080a] relative border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StuntBadge variant="yellow">OFFRE PÉDAGOGIQUE OFFICIELLE</StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-500">CUC-CATALOG // V26.4</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
              CURSUS & STAGES DE CASCADE
            </h2>
            <p className="text-zinc-400 font-tech mt-2 max-w-2xl text-sm sm:text-base">
              Du stage découverte pour tester vos limites au cursus professionnel d'élite de 2 ans
              (720h), en passant par les formations financées à 100% par l'AFDAS.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#121216] border border-zinc-800 px-4 py-2 text-xs font-mono-tech text-zinc-300">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>LISTE D'ATTENTE OUVERTE POUR 2026/2027</span>
          </div>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-zinc-800">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-display tracking-wider uppercase border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                  : 'bg-[#121216] text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPrograms.map((program) => {
            const isExpanded = expandedProgramId === program.id;

            return (
              <div
                key={program.id}
                className={`relative bg-[#0e0e12] border transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between ${
                  program.highlight
                    ? 'border-[#FFE500]/60 shadow-[0_0_30px_rgba(255,229,0,0.08)]'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {/* Visual Corner Markers */}

                <div>
                  {/* Top Bar with Badge & Price */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <StuntBadge variant={program.highlight ? 'yellow' : 'dark'}>
                      {program.badge}
                    </StuntBadge>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-display text-[#FFE500] tracking-wider">
                        {program.price}
                      </div>
                      {program.priceNote && (
                        <div className="text-[10px] font-mono-tech text-zinc-400">
                          {program.priceNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white mb-2">
                    {program.title}
                  </h3>
                  <p className="text-sm font-tech text-zinc-300 mb-6 leading-relaxed">
                    {program.tagline}
                  </p>

                  {/* Key Metadata Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-[#141419] p-3 border border-zinc-800 text-xs font-mono-tech">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">DURÉE</span>
                      <span className="text-zinc-200 font-semibold">{program.duration}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">VOLUME HORAIRE</span>
                      <span className="text-[#FFE500] font-semibold">{program.hours}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-zinc-500 block text-[10px]">CONDITIONS</span>
                      <span className="text-zinc-200 font-semibold">{program.ageRequirement}</span>
                    </div>
                  </div>

                  {/* Next Calendar Sessions */}
                  <div className="mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-mono-tech text-zinc-400 mb-2 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-[#FFE500]" />
                      <span>Prochaines Sessions Annuelles :</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {program.nextSessions.map((session, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-xs font-mono-tech bg-[#18181f] border border-zinc-800 px-2.5 py-1"
                        >
                          <span className="text-zinc-300">{session.date}</span>
                          <span
                            className={`text-[10px] uppercase font-bold px-1 py-0.2 ${
                              session.status === 'complet'
                                ? 'bg-red-950 text-red-400'
                                : session.status === 'dernières places'
                                ? 'bg-amber-950 text-[#FFE500]'
                                : 'bg-emerald-950 text-emerald-400'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description or Accordion Details */}
                  <p className="text-xs text-zinc-400 font-tech mb-6 line-clamp-3">
                    {program.description}
                  </p>

                  {/* Expandable Module Details */}
                  {isExpanded && (
                    <div className="mb-6 pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-200">
                      <div>
                        <span className="text-xs font-mono-tech uppercase text-[#FFE500] block mb-2">
                          Modules Clés Enseignés :
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech text-zinc-300">
                          {program.keyModules.map((module, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                              <span>{module}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-xs font-mono-tech uppercase text-zinc-400 block mb-1">
                          Prérequis & Éligibilité :
                        </span>
                        <ul className="text-xs font-tech text-zinc-400 space-y-1">
                          {program.eligibility.map((el, i) => (
                            <li key={i}>• {el}</li>
                          ))}
                        </ul>
                      </div>

                      {program.certification && (
                        <div className="p-2.5 bg-[#1a1a24] border border-[#FFE500]/30 text-xs font-mono-tech text-[#FFE500] flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>{program.certification}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedProgramId(isExpanded ? null : program.id)}
                    className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] uppercase underline cursor-pointer py-1"
                  >
                    {isExpanded ? 'Réduire le programme' : 'Voir le programme complet & prérequis'}
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {program.brochureUrl && (
                      <a
                        href={program.brochureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 text-xs font-mono-tech border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center gap-1.5"
                        title="Télécharger la plaquette PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span className="hidden sm:inline">Plaquette</span>
                      </a>
                    )}
                    <TacticalButton
                      variant={program.highlight ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => onSelectProgram(program.id)}
                      icon={<ArrowUpRight className="w-4 h-4" />}
                    >
                      {program.ctaText}
                    </TacticalButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
