'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
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
  return (
    <div className="w-full h-full relative bg-[#07070b] p-6 flex flex-col justify-between overflow-hidden">
      {/* Grid Lines Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #FFE500 1px, transparent 1px), linear-gradient(to bottom, #FFE500 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radar Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[85%] h-[85%] rounded-full border border-[#FFE500]" />
        <div className="absolute w-[55%] h-[55%] rounded-full border border-dashed border-[#FFE500]" />
        <div className="absolute w-[25%] h-[25%] rounded-full border border-[#FFE500]" />
      </div>

      {/* Radar Hotspot Markers */}
      {pois.map((poi) => {
        const isSelected = selectedPoi.id === poi.id;
        return (
          <button
            key={poi.id}
            type="button"
            onClick={() => onSelectPoi(poi)}
            style={{ left: `${poi.xPercent}%`, top: `${poi.yPercent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/marker focus:outline-hidden"
          >
            <span
              className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                isSelected ? 'scale-125' : 'hover:scale-115'
              }`}
            >
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSelected ? 'bg-[#FFE500]' : 'bg-zinc-600'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[10px] font-mono-tech font-bold ${
                  isSelected
                    ? 'bg-[#FFE500] text-black shadow-[0_0_12px_#FFE500]'
                    : 'bg-[#1e1e28] text-white border border-zinc-700'
                }`}
              >
                {poi.id === 'tower-21m' ? '21' : poi.name.charAt(0)}
              </span>
            </span>
            <span
              className={`absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-mono-tech whitespace-nowrap uppercase tracking-wider transition-all pointer-events-none ${
                isSelected
                  ? 'bg-[#FFE500] text-black font-bold block'
                  : 'bg-black/90 text-zinc-400 border border-zinc-800 opacity-0 group-hover/marker:opacity-100'
              }`}
            >
              {poi.name}
            </span>
          </button>
        );
      })}

      {/* Selected POI Details Panel */}
      <div className="relative z-10 mt-auto bg-black/90 border border-zinc-800 p-3 sm:p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 bg-[#FFE500] text-black font-bold">
              {selectedPoi.badge}
            </span>
            <h4 className="text-base font-display uppercase text-white">
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
        <div className="mt-2 text-[11px] font-mono-tech text-[#FFE500] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{selectedPoi.specs}</span>
        </div>
      </div>
    </div>
  );
};
