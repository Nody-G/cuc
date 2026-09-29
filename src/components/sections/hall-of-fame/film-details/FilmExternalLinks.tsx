'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AllocineLogo, ImdbLogo, LogoLink, YouTubeLogo } from '@/components/ui/BrandLogos';
import type { FilmCredit } from '@/types';

interface FilmExternalLinksProps {
    movie: FilmCredit;
}

/**
 * Liens externes de la fiche (IMDb, AlloCiné, bande-annonce).
 *
 * Rendu épuré : un logo seul par destination, sans texte ni encart rempli. Le
 * nom de la destination reste accessible (`aria-label`) et révélé au survol
 * (`title`) ; le libellé « bande-annonce » demeure éditable (Mode Studio).
 */
export const FilmExternalLinks: React.FC<FilmExternalLinksProps> = ({ movie }) => {
    const t = useTranslations('teamProduction');
    const trailerLabel = t('filmModal.trailer');

    if (!movie.imdbUrl && !movie.allocineUrl && !movie.trailerUrl) return null;

    return (
        <div className="pt-2 flex flex-wrap items-center gap-4">
            {movie.imdbUrl && (
                <LogoLink
                    href={movie.imdbUrl}
                    label="IMDb"
                    title={`${movie.title} — IMDb`}
                >
                    <ImdbLogo className="h-4 w-auto" />
                </LogoLink>
            )}
            {movie.allocineUrl && (
                <LogoLink
                    href={movie.allocineUrl}
                    label="AlloCiné"
                    title={`${movie.title} — AlloCiné`}
                >
                    <AllocineLogo className="h-4 w-auto" />
                </LogoLink>
            )}
            {movie.trailerUrl && (
                <LogoLink
                    href={movie.trailerUrl}
                    label={trailerLabel}
                    micro="teamProduction.filmModal.trailer"
                >
                    <YouTubeLogo className="h-5 w-5" variant="color" />
                </LogoLink>
            )}
        </div>
    );
};
