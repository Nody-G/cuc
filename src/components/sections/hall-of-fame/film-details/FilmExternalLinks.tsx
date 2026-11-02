'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AllocineLogo, LogoLink, YouTubeLogo } from '@/components/ui/BrandLogos';
import type { FilmCredit } from '@/types';

interface FilmExternalLinksProps {
    movie: FilmCredit;
}

/**
 * Liens complémentaires de la fiche (AlloCiné, bande-annonce).
 * Le lien principal IMDb est valorisé en haut à droite dans FilmIdentityBlock.
 */
export const FilmExternalLinks: React.FC<FilmExternalLinksProps> = ({ movie }) => {
    const t = useTranslations('teamProduction');
    const trailerLabel = t('filmModal.trailer');

    if (!movie.allocineUrl && !movie.trailerUrl) return null;

    return (
        <div className="pt-2 flex flex-wrap items-center gap-4">
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
