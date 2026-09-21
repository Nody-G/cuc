'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Sparkles, Layers, Crosshair } from 'lucide-react';
import { POI } from './campusMap.data';

interface CampusRadarViewProps {
  pois: POI[];
  selectedPoi: POI;
  onSelectPoi: (poi: POI) => void;
}

export const CampusRadarView: React.FC<CampusRadarViewProps> = ({
  pois,
  selectedPoi,
  onSelectPoi,
}) => {
  const t = useTranslations('contact.map');
  const [showAerialPhoto, setShowAerialPhoto] = useState(true);

  return (
    <div className="w-full h-full relative bg-[#07070b] p-4 sm:p-6 flex flex-col justify-between overflow-hidden select-none">
      {/* Real Aerial Orthophoto HD Zoom 19 (IGN/ESRI) */}
      {showAerialPhoto && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cuc_campus_aerial_real_z19.jpg"
            alt={t('orthophotoAlt')}
            fill
            className="object-cover opacity-60 contrast-125 brightness-90 filter"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
          {/* Dark vignetting gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/40 to-[#07070b]/60 pointer-events-none" />
        </div>
      )}

      {/* Grid Lines Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none z-1"
        style={{
          backgroundImage:
            'linear-gradient(to right, #FFE500 1px, transparent 1px), linear-gradient(to bottom, #FFE500 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radar Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-1">
        <div className="w-[90%] h-[90%] rounded-full border border-[#FFE500]" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-dashed border-[#FFE500]" />
        <div className="absolute w-[30%] h-[30%] rounded-full border border-[#FFE500]" />

        {/* Radar Crosshairs */}
        <div className="absolute w-full h-[1px] bg-[#FFE500]/30" />
        <div className="absolute h-full w-[1px] bg-[#FFE500]/30" />
      </div>

      {/* Top HUD Telemetry & Mode Switch */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-zinc-800 text-[10px] font-mono-tech text-zinc-300">
          <Crosshair className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>{t('cartography')}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAerialPhoto(!showAerialPhoto)}
          className={`px-2.5 py-1 rounded text-[10px] font-mono-tech flex items-center gap-1.5 transition border cursor-pointer ${showAerialPhoto
            ? 'bg-[#FFE500]/20 text-[#FFE500] border-[#FFE500]/40 font-bold'
            : 'bg-black/80 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          title={t('toggleLayer')}
        >
          <Layers className="w-3 h-3" />
          <span>{showAerialPhoto ? t('aerial') : t('grid')}</span>
        </button>
      </div>

      {/* Radar Hotspot Markers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {pois.map((poi) => {
          const isSelected = selectedPoi.id === poi.id;
          return (
            <button
              key={poi.id}
              type="button"
              onClick={() => onSelectPoi(poi)}
              style={{ left: `${poi.xPercent}%`, top: `${poi.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/marker focus:outline-hidden pointer-events-auto cursor-pointer"
            >
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform ${isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
              >
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSelected ? 'bg-[#FFE500]' : 'bg-zinc-600'
                    }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center text-[10px] font-mono-tech font-bold border ${isSelected
                    ? 'bg-[#FFE500] text-black border-[#FFE500] shadow-[0_0_16px_#FFE500]'
                    : 'bg-black/90 text-white border-zinc-600 group-hover/marker:border-[#FFE500]'
                    }`}
                >
                  {poi.id === 'tower-21m' ? '21m' : poi.name.charAt(0)}
                </span>
              </span>

              {/* Marker Tooltip */}
              <span
                className={`absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-mono-tech whitespace-nowrap uppercase tracking-wider transition-all pointer-events-none rounded ${isSelected
                  ? 'bg-[#FFE500] text-black font-bold shadow-lg block'
                  : 'bg-black/90 text-zinc-300 border border-zinc-800 opacity-0 group-hover/marker:opacity-100'
                  }`}
              >
                {poi.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected POI Details Panel */}
      <div className="relative z-10 mt-auto bg-black/90 border border-zinc-800 p-3 sm:p-4 backdrop-blur-md space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 bg-[#FFE500] text-black font-bold rounded">
              {selectedPoi.badge}
            </span>
            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 bg-white/10 text-zinc-300 border border-white/10 rounded">
              {selectedPoi.category}
            </span>
            <h4 className="text-sm sm:text-base font-display uppercase text-white font-bold">
              {selectedPoi.name}
            </h4>
          </div>
          <span className="text-[10px] font-mono-tech text-zinc-500">
            {selectedPoi.coordinates}
          </span>
        </div>

        <p className="text-xs font-tech text-zinc-300 leading-snug">
          {selectedPoi.description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/80 text-[11px] font-mono-tech">
          <div className="text-[#FFE500] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{selectedPoi.specs}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
