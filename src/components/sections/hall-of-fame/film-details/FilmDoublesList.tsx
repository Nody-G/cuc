'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { FilmCredit } from '@/types';

interface FilmDoublesListProps {
    movie: FilmCredit;
}

/** Comédiens doublés par le CUC sur ce film (liste vide = bloc masqué). */
export const FilmDoublesList: React.FC<FilmDoublesListProps> = ({ movie }) => {
    const t = useTranslations('teamProduction');

    if (!movie.doubledActors || movie.doubledActors.length === 0) return null;

    return (
        <div className="space-y-1">
            <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                <span {...cucMicro('teamProduction.filmModal.doublesLabel')}>
                    {t('filmModal.doublesLabel')}
                </span>
            </span>
            <div className="flex flex-wrap gap-1.5">
                {movie.doubledActors.map((actor, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#141419] border border-zinc-800 text-xs font-mono-tech text-zinc-300"
                    >
                        {actor}
                    </span>
                ))}
            </div>
        </div>
    );
};
