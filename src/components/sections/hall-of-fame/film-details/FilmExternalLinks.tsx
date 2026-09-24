'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AllocineLogo, ImdbLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { FilmCredit } from '@/types';

interface FilmExternalLinksProps {
    movie: FilmCredit;
}

/** Liens externes de la fiche (IMDb, AlloCiné, bande-annonce). */
export const FilmExternalLinks: React.FC<FilmExternalLinksProps> = ({ movie }) => {
    const t = useTranslations('teamProduction');

    return (
        <div className="pt-2 flex flex-wrap gap-2">
            {movie.imdbUrl && (
                <a
                    href={movie.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5c518] hover:bg-[#ffe500] text-black font-bold font-mono-tech text-xs transition-colors"
                >
                    <ImdbLogo className="h-3.5 w-auto" />
                    <span>IMDb</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
            )}
            {movie.allocineUrl && (
                <a
                    href={movie.allocineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141419] hover:bg-zinc-800 text-[#fecc00] border border-zinc-700 font-mono-tech text-xs transition-colors"
                >
                    <AllocineLogo className="h-3.5 w-auto" />
                    <span>AlloCiné</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
            )}
            {movie.trailerUrl && (
                <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141419] hover:bg-zinc-800 text-red-400 border border-zinc-700 font-mono-tech text-xs transition-colors"
                >
                    <YouTubeLogo className="w-3.5 h-3.5" variant="color" />
                    <span {...cucMicro('teamProduction.filmModal.trailer')}>
                        {t('filmModal.trailer')}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
            )}
        </div>
    );
};
