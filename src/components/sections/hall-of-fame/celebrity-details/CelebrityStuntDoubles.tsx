'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { DoubledByParts } from '@/lib/celebrity-double';
import type { FilmCredit } from '@/types';

interface CelebrityStuntDoublesProps {
  doubledBy: DoubledByParts;
  stuntDoublesRaw?: string;
  productions: string[];
  findMatchingLucasFilm: (prodName: string) => FilmCredit | undefined;
  onSelectFilm?: (film: FilmCredit) => void;
  onClose: () => void;
}

/**
 * Bloc présentant les cascadeurs CUC ayant doublé le comédien (avec photo avatar)
 * et les productions cinéma/séries associées.
 */
export const CelebrityStuntDoubles: React.FC<CelebrityStuntDoublesProps> = ({
  doubledBy,
  stuntDoublesRaw,
  productions,
  findMatchingLucasFilm,
  onSelectFilm,
  onClose,
}) => {
  const t = useTranslations('teamProduction');

  return (
    <div className="p-3.5 bg-[#141419] border border-zinc-800/80 rounded-xs space-y-3">
      {/* Header */}
      <span
        className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block"
        {...cucMicro('teamProduction.celebrityModal.doublesAndShootsLabel')}
      >
        {t('celebrityModal.doublesAndShootsLabel')}
      </span>

      {/* Stunt Performers (Tête en petit avec nom, rôle et lien fiche coach) */}
      {doubledBy.allMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {doubledBy.allMembers.map((member) => (
            <Link
              key={member.id}
              href={`/equipe-cascadeurs-pro/${member.id}`}
              onClick={onClose}
              className="flex items-center gap-2.5 p-2 bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 transition-colors group"
              title={member.name}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700 group-hover:border-[#FFE500] transition-colors">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono-tech text-white group-hover:text-[#FFE500] transition-colors truncate font-bold">
                  {member.name}
                </div>
                <div className="text-[10px] font-mono-tech text-zinc-400 truncate">
                  {member.role || 'Cascadeur CUC'}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#FFE500] shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-2 bg-[#0e0e14] border border-zinc-800">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 flex items-center justify-center text-[#FFE500]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-xs font-mono-tech text-zinc-200">
            {stuntDoublesRaw || doubledBy.name}
          </div>
        </div>
      )}

      {/* Productions associées */}
      {productions.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
          <span className="text-[10px] font-mono-tech text-zinc-400 uppercase font-bold tracking-wider block">
            <span {...cucMicro('teamProduction.celebrityModal.inConnector')}>
              {t('celebrityModal.inConnector')}
            </span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {productions.map((p, pIdx) => {
              const matchingFilm = findMatchingLucasFilm(p);
              return matchingFilm ? (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectFilm?.(matchingFilm);
                  }}
                  className="px-2.5 py-1 bg-[#0e0e14] border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech text-[#FFE500] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                  title={t('celebrityModal.openLucasFilmTitle', {
                    title: matchingFilm.title,
                  })}
                >
                  <span>{p}</span>
                  <span className="text-[9px] bg-[#FFE500] text-black px-1 py-0.2 rounded-xs font-bold font-mono-tech group-hover:bg-white">
                    CUC
                  </span>
                </button>
              ) : (
                <span
                  key={pIdx}
                  className="px-2.5 py-1 bg-[#0e0e14] border border-zinc-800 text-xs font-mono-tech text-zinc-300"
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
