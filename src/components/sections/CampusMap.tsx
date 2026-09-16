'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { StuntBadge } from '../ui/StuntBadge';
import { TacticalButton } from '../ui/TacticalButton';
import {
  MapPin,
  CheckCircle,
  Bed,
  UtensilsCrossed,
} from 'lucide-react';

interface CampusMapProps {
  onOpenApplication: () => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({ onOpenApplication }) => {
  const [activeSpotId, setActiveSpotId] = useState<string>(CAMPUS_FACILITIES[0].id);

  const activeSpot =
    CAMPUS_FACILITIES.find((s) => s.id === activeSpotId) || CAMPUS_FACILITIES[0];

  return (
    <section id="campus" className="py-20 bg-[#060608] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StuntBadge variant="yellow" icon={<MapPin className="w-3.5 h-3.5" />}>
                INFRASTRUCTURES HAUTE DENSITÉ
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-500">
                LE CATEAU-CAMBRÉSIS (59) & GENNEVILLIERS (92)
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
              UN DOMAINE UNIQUE DE 6 HECTARES
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-tech mt-2 max-w-2xl">
              Installé à 2h de Paris dans la région des Hauts-de-France, le CUC rassemble les plus vastes
              infrastructures européennes dédiées à la cascade physique avec hébergement pour 90 élèves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#121216] border border-zinc-800 px-3 py-2 text-xs font-mono-tech text-zinc-300">
              <Bed className="w-4 h-4 text-[#FFE500]" />
              <span>90 LITS</span>
            </div>
            <div className="flex items-center gap-2 bg-[#121216] border border-zinc-800 px-3 py-2 text-xs font-mono-tech text-zinc-300">
              <UtensilsCrossed className="w-4 h-4 text-[#FFE500]" />
              <span>RESTAURATION SUR SITE</span>
            </div>
          </div>
        </div>

        {/* Tactical Interactive Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List of Facilities Buttons */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-mono-tech uppercase text-zinc-500 block mb-2 px-1">
              Sélectionnez une installation d'entraînement :
            </span>

            {CAMPUS_FACILITIES.map((facility) => {
              const isSelected = activeSpotId === facility.id;

              return (
                <button
                  key={facility.id}
                  onClick={() => setActiveSpotId(facility.id)}
                  className={`w-full text-left p-3.5 border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#181822] border-[#FFE500] text-white shadow-[0_0_15px_rgba(255,229,0,0.2)]'
                      : 'bg-[#0e0e12] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono-tech px-1.5 py-0.5 font-bold ${
                        isSelected ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {facility.code}
                    </span>
                    <span className="font-display uppercase text-base sm:text-lg tracking-wide">
                      {facility.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono-tech text-zinc-500 shrink-0 ml-2">
                    {facility.size}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Facility Spotlight */}
          <div className="lg:col-span-7 bg-[#0e0e12] border-2 border-zinc-800 p-6 sm:p-8 relative">

            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFE500] text-black font-mono-tech text-xs font-bold px-2 py-0.5">
                  {activeSpot.code}
                </span>
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                  {activeSpot.size}
                </span>
              </div>
              <span className="text-xs font-mono-tech text-zinc-500">
                DOMAINE DU CUC // HAUTS-DE-FRANCE
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white mb-4">
              {activeSpot.name}
            </h3>

            {/* Main Facility Photo */}
            <div className="relative h-64 sm:h-80 w-full mb-6 border border-zinc-700 overflow-hidden bg-zinc-950">
              <Image
                src={activeSpot.image}
                alt={activeSpot.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-90 contrast-105"
              />
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono-tech text-zinc-300 border border-white/10">
                ZONE ACTIVE CUC // CAM-02
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 font-tech leading-relaxed mb-6">
              {activeSpot.description}
            </p>

            {/* Specific Features */}
            <div className="mb-6">
              <span className="text-xs font-mono-tech uppercase text-zinc-400 block mb-2">
                Caractéristiques d'équipement de pointe :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSpot.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs font-tech bg-[#14141a] p-2 border border-zinc-800/80 text-zinc-300"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-[11px] font-mono-tech text-zinc-400">
                <span className="text-[#FFE500]">Spécification :</span> {activeSpot.specifications}
              </div>
              <TacticalButton
                variant="primary"
                size="sm"
                onClick={onOpenApplication}
                className="shrink-0 w-full sm:w-auto"
              >
                S'entraîner sur ce Site
              </TacticalButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
