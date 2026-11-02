'use client';

import React from 'react';
import { Clapperboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { FilmCredit } from '@/types';

export interface CelebrityFilmItem {
  key: string;
  title: string;
  year?: string | number;
  cucFilm?: FilmCredit;
}

interface CelebrityStuntDoublesProps {
  films: CelebrityFilmItem[];
  onSelectFilm?: (film: FilmCredit) => void;
  onClose: () => void;
  // Props conservées pour rétrocompatibilité
  doubledBy?: unknown;
  stuntDoublesRaw?: string;
}

/**
 * Bloc présentant les collaborations audiovisuelles avec le CUC
 * (notamment les films et séries coordonnés par Lucas Dollfus).
 */
export const CelebrityStuntDoubles: React.FC<CelebrityStuntDoublesProps> = ({
  films,
  onSelectFilm,
  onClose,
}) => {
  const t = useTranslations('teamProduction');

  if (!films || films.length === 0) return null;

  return (
    <div className="p-4 bg-[#141419] border border-zinc-800/80 rounded-xs space-y-3">
      {/* Films & Tournages CUC (liste unifiée et dédoublonnée) */}
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
  );
};
