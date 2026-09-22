'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity } from '@/types';
import { X, Clapperboard, ExternalLink } from 'lucide-react';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface CelebrityDetailsModalProps {
  celebrity: DoubledCelebrity | null;
  onClose: () => void;
}

export const CelebrityDetailsModal: React.FC<CelebrityDetailsModalProps> = ({
  celebrity,
  onClose,
}) => {
  const t = useTranslations('teamProduction');

  if (!celebrity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors w-full max-w-xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#141419] border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-zinc-300 font-bold uppercase tracking-wider">
              <span {...cucMicro('teamProduction.celebrityModal.title')}>
                {t('celebrityModal.title')}
              </span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer"
            aria-label={t('celebrityModal.closeAria')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Photo */}
            <div className="sm:col-span-5 relative h-64 w-full border border-zinc-800 bg-black overflow-hidden">
              <Image
                src={celebrity.photo}
                alt={celebrity.name}
                fill
                sizes="(max-width: 640px) 100vw, 250px"
                className="object-cover object-top"
              />
            </div>

            {/* Info */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-white">
                  {celebrity.name}
                </h3>
              </div>

              {/* Doublure cascades - Uniquement si une doublure dédiée est renseignée */}
              {celebrity.stuntDoubles ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold block">
                    <span {...cucMicro('teamProduction.celebrityModal.doublesLabel')}>
                      {t('celebrityModal.doublesLabel')}
                    </span>
                  </span>
                  <span className="text-xs text-white font-mono-tech font-bold">
                    {celebrity.stuntDoubles}
                  </span>
                </div>
              ) : null}

              {/* Scènes d'action */}
              {celebrity.stuntSpecialty ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono-tech text-zinc-400 uppercase font-bold block">
                    <span {...cucMicro('teamProduction.celebrityModal.scenesLabel')}>
                      {t('celebrityModal.scenesLabel')}
                    </span>
                  </span>
                  <p className="text-xs text-zinc-300 font-tech leading-relaxed">
                    {celebrity.stuntSpecialty}
                  </p>
                </div>
              ) : null}

              {/* Films */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                  <span {...cucMicro('teamProduction.celebrityModal.filmsLabel')}>
                    {t('celebrityModal.filmsLabel')}
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {celebrity.productions.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#141419] border border-zinc-800 text-xs font-mono-tech text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* IMDb Button */}
              {celebrity.imdbUrl && (
                <div className="pt-2">
                  <a
                    href={celebrity.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#f5c518] hover:bg-[#ffe500] text-black font-bold font-mono-tech text-xs transition-colors"
                  >
                    <ImdbLogo className="h-3.5 w-auto" />
                    <span {...cucMicro('teamProduction.celebrityModal.imdbCta')}>
                      {t('celebrityModal.imdbCta')}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-5 py-2.5 flex items-center justify-end text-xs font-mono-tech">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white uppercase font-bold cursor-pointer transition-colors"
          >
            <span {...cucMicro('teamProduction.celebrityModal.close')}>
              {t('celebrityModal.close')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
