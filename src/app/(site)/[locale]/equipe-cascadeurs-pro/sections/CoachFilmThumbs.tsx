'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Film } from 'lucide-react';
import type { FilmCredit } from '@/types';

interface CoachFilmThumbsProps {
    /** Films du coach (les 3 premiers sont affichés). */
    films: FilmCredit[];
    onSelect: (film: FilmCredit) => void;
}

/** Projets & tournages cinéma du coach : miniatures cliquables (modale). */
export const CoachFilmThumbs: React.FC<CoachFilmThumbsProps> = ({ films, onSelect }) => {
    const t = useTranslations('team');

    return (
        <div className="pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#FFE500]" />
                    {t('projectsLabel')} ({films.length})
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {films.slice(0, 3).map((f) => (
                    <div key={f.id} className="space-y-1">
                        <button
                            type="button"
                            onClick={() => onSelect(f)}
                            className="group/thumb relative aspect-[2/3] w-full bg-black border border-zinc-800 hover:border-[#FFE500] overflow-hidden rounded-xs cursor-pointer transition-all text-left"
                            title={t('filmCardTitle', { title: f.title, year: f.year })}
                        >
                            {f.image ? (
                                <Image
                                    src={f.image}
                                    alt={f.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover group-hover/thumb:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                    <Film className="w-5 h-5 text-zinc-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90" />
                            <span className="absolute bottom-1 left-1 right-1 text-[8px] font-mono-tech uppercase text-zinc-200 group-hover/thumb:text-[#FFE500] truncate text-center font-bold block">
                                {f.title}
                            </span>
                        </button>
                        {f.director ? (
                            <p className="text-[9px] font-mono-tech text-zinc-500 truncate text-center">
                                {t('directorShort', { name: f.director })}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};
