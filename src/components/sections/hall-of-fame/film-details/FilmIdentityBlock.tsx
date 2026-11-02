'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ImdbLogo, LogoLink } from '@/components/ui/BrandLogos';
import type { FilmBindingProps } from './film-details.types';

/** Année, réalisateur, titre éditable et bouton IMDb grand format en haut à droite. */
export const FilmIdentityBlock: React.FC<FilmBindingProps> = ({ movie, filmAttr, filmValue }) => {
    const t = useTranslations('teamProduction');

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="text-[11px] font-mono-tech text-zinc-500 uppercase">{movie.year}</div>
                {/* Réalisateur — ligne dédiée, visible à l'ouverture du descriptif */}
                {movie.director ? (
                    <div className="text-[11px] font-mono-tech text-zinc-400 mt-0.5">
                        {t('filmModal.directedBy', { name: movie.director })}
                    </div>
                ) : null}
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-white mt-0.5">
                    <span {...filmAttr('title')}>{filmValue('title', movie.title)}</span>
                </h3>
            </div>
            {movie.imdbUrl ? (
                <div className="shrink-0 pt-0.5">
                    <LogoLink
                        href={movie.imdbUrl}
                        label="IMDb"
                        title={`${movie.title} — IMDb`}
                        className="inline-flex items-center hover:opacity-95 hover:scale-105 transition-all cursor-pointer shadow-md rounded-xs overflow-hidden"
                    >
                        <ImdbLogo className="h-8 sm:h-9 w-auto" />
                    </LogoLink>
                </div>
            ) : null}
        </div>
    );
};

/** Description factuelle de la fiche film (absente = rien n'est rendu). */
export const FilmDescription: React.FC<{ movie: FilmBindingProps['movie'] }> = ({ movie }) => {
    if (!movie.description) return null;

    return (
        <p className="text-xs text-zinc-300 font-tech leading-relaxed">{movie.description}</p>
    );
};
