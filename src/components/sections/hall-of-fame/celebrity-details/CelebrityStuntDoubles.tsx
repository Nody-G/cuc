'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ChevronRight, ShieldCheck, Clapperboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { DoubledByParts } from '@/lib/celebrity-double';
import type { FilmCredit } from '@/types';

export interface CelebrityFilmItem {
  key: string;
  title: string;
  year?: string | number;
  cucFilm?: FilmCredit;
}

interface CelebrityStuntDoublesProps {
  doubledBy: DoubledByParts;
  stuntDoublesRaw?: string;
  films: CelebrityFilmItem[];
  onSelectFilm?: (film: FilmCredit) => void;
  onClose: () => void;
}

/**
 * Bloc présentant les cascadeurs CUC ayant doublé le comédien (avec photo avatar sans tronquage)
 * et les productions cinéma/séries dédoublonnées.
 */
export const CelebrityStuntDoubles: React.FC<CelebrityStuntDoublesProps> = ({
  doubledBy,
  stuntDoublesRaw,
  films,
  onSelectFilm,
  onClose,
}) => {
  const t = useTranslations('teamProduction');

  return (
    <div className="p-4 bg-[#141419] border border-zinc-800/80 rounded-xs space-y-3.5">
      {/* 1. Header Doublure */}
      <span
        className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block"
        {...cucMicro('teamProduction.celebrityModal.doublesLabel')}
      >
        {t('celebrityModal.doublesLabel')}
      </span>

      {/* 2. Cascadeurs CUC : pleine largeur pour éviter tout tronquage du nom */}
      {doubledBy.allMembers.length > 0 ? (
        <div className="flex flex-col gap-2">
          {doubledBy.allMembers.map((member) => (
            <Link
              key={member.id}
              href={`/equipe-cascadeurs-pro/${member.id}`}
              onClick={onClose}
              className="flex items-center gap-3 p-2.5 bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all rounded-xs group"
              title={member.name}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 group-hover:border-[#FFE500] transition-colors">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-mono-tech text-white group-hover:text-[#FFE500] transition-colors font-bold tracking-wide">
                  {member.name}
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-400 leading-tight mt-0.5 line-clamp-1">
                  {member.role || 'Cascadeur CUC'}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#FFE500] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-2.5 bg-[#0e0e14] border border-zinc-800 rounded-xs">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center text-[#FFE500] border border-zinc-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs font-mono-tech text-zinc-200 font-bold">
            {stuntDoublesRaw || doubledBy.name}
          </div>
        </div>
      )}

      {/* 3. Films & Tournages (liste unifiée et dédoublonnée) */}
      {films.length > 0 && (
        <div className="pt-2.5 border-t border-zinc-800/80 space-y-2">
          <span
            className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block"
            {...cucMicro('teamProduction.celebrityModal.filmsLabel')}
          >
            {t('celebrityModal.filmsLabel')}
          </span>

          <div className="flex flex-wrap gap-2">
            {films.map((item) =>
              item.cucFilm ? (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectFilm?.(item.cucFilm!);
                  }}
                  className="px-3 py-1.5 bg-[#FFE500]/15 border border-[#FFE500]/60 text-xs font-mono-tech text-[#FFE500] font-bold hover:bg-[#FFE500] hover:text-black transition-all cursor-pointer flex items-center gap-1.5 rounded-xs group"
                  title={t('celebrityModal.openCucFilmTitle', { title: item.title })}
                >
                  <Clapperboard className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.title}</span>
                  {item.year && (
                    <span className="text-[10px] opacity-80 font-normal">({item.year})</span>
                  )}
                  <span className="text-[9px] bg-[#FFE500] text-black group-hover:bg-black group-hover:text-[#FFE500] px-1.5 py-0.5 rounded-2xs font-bold font-mono-tech ml-0.5 transition-colors">
                    CUC
                  </span>
                </button>
              ) : (
                <span
                  key={item.key}
                  className="px-2.5 py-1.5 bg-[#0e0e14] border border-zinc-800 text-xs font-mono-tech text-zinc-300 flex items-center gap-1.5 rounded-xs"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{item.title}</span>
                </span>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
