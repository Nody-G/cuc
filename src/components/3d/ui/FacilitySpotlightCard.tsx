'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ChevronRight, X } from 'lucide-react';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { EditableFacilityItem } from '../types/campus3d.types';

interface FacilitySpotlightCardProps {
  activeFacility: EditableFacilityItem | null;
  isVisible: boolean;
  onClose: () => void;
}

export const FacilitySpotlightCard: React.FC<FacilitySpotlightCardProps> = ({
  activeFacility,
  isVisible,
  onClose,
}) => {
  const t = useTranslations('campus3dViewer');

  if (!activeFacility || !isVisible) return null;

  const facData = CAMPUS_FACILITIES.find((f) => f.id === activeFacility.id);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-[#0e0e14]/95 backdrop-blur-md border-2 border-[#FFE500] p-4 sm:p-5 z-20 shadow-2xl">

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
            {facData?.size || t('facilityFallbackName')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          title={t('closeCard')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-display uppercase text-xl sm:text-2xl text-white tracking-wide mb-2">
        {activeFacility.name}
      </h3>

      <div className="relative h-28 w-full mb-3 border border-zinc-800 overflow-hidden bg-black">
        <Image
          src={facData?.image || '/images/cuc_campus_aerial_real.jpg'}
          alt={activeFacility.name}
          fill
          sizes="400px"
          className="object-cover object-center brightness-90"
        />
        <div className="absolute bottom-1.5 right-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono-tech text-[#FFE500]">
          {activeFacility.id === 'cuc-tower' ? t('badgeInaugurated') : t('badgeVerified')}
        </div>
      </div>

      <p className="text-xs font-tech text-zinc-300 leading-relaxed line-clamp-2 mb-3">
        {facData?.description || ''}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
        <Link
          href={`/visite-guidee?installation=${encodeURIComponent(activeFacility.id)}#installations-detail`}
          className="px-3 py-1.5 bg-[#FFE500] hover:bg-white text-black font-mono-tech text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
        >
          <span>{t('cardCta')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
