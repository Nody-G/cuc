'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ChevronRight, X } from 'lucide-react';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { EditableFacilityItem } from '../types/campus3d.types';

interface FacilitySpotlightCardProps {
  activeFacility: EditableFacilityItem | null;
  isVisible: boolean;
  onClose: () => void;
  enableDirectTourJump?: boolean;
}

export const FacilitySpotlightCard: React.FC<FacilitySpotlightCardProps> = ({
  activeFacility,
  isVisible,
  onClose,
  enableDirectTourJump = true,
}) => {
  if (!activeFacility || !isVisible) return null;

  const facData = CAMPUS_FACILITIES.find((f) => f.id === activeFacility.id);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-[#0e0e14]/95 backdrop-blur-md border-2 border-[#FFE500] p-4 sm:p-5 z-20 shadow-2xl">

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#FFE500] text-black font-mono-tech text-xs font-bold px-2 py-0.5">
            {activeFacility.code}
          </span>
          <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
            {facData?.size || 'Campus CUC'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          title="Fermer la fiche"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-display uppercase text-xl sm:text-2xl text-white tracking-wide mb-2">
        {activeFacility.name}
      </h3>

      <div className="relative h-28 w-full mb-3 border border-zinc-800 overflow-hidden bg-black">
        <Image
          src={facData?.image || '/images/campus/campus_aerien.jpg'}
          alt={activeFacility.name}
          fill
          sizes="400px"
          className="object-cover object-center brightness-90"
        />
        <div className="absolute bottom-1.5 right-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono-tech text-[#FFE500]">
          {activeFacility.id === 'cuc-tower' ? 'INAUGURÉE LE 25 OCTOBRE 2024' : 'INSTALLATION VÉRIFIÉE CUC'}
        </div>
      </div>

      <p className="text-xs font-tech text-zinc-300 leading-relaxed line-clamp-2 mb-3">
        {facData?.description || ''}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
        {enableDirectTourJump && (
          <Link
            href="/visite-virtuelle"
            className="px-3 py-1.5 bg-[#FFE500] hover:bg-white text-black font-mono-tech text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vue 360° VR</span>
          </Link>
        )}

        <Link
          href="/visite-guidee"
          className="px-3 py-1.5 bg-[#14141c] hover:bg-[#1a1a24] text-zinc-200 border border-zinc-700 font-mono-tech text-xs transition-colors flex items-center gap-1"
        >
          <span>Fiche Détail</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
