'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { FilmBindingProps } from './film-details.types';

/** Année, réalisateur, titre éditable et description factuelle de la fiche. */
export const FilmIdentityBlock: React.FC<FilmBindingProps> = ({ movie, filmAttr, filmValue }) => {
    const t = useTranslations('teamProduction');

    return (
        <div>
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
    );
};

/** Description factuelle de la fiche film (absente = rien n'est rendu). */
export const FilmDescription: React.FC<{ movie: FilmBindingProps['movie'] }> = ({ movie }) => {
    if (!movie.description) return null;

    return (
        <p className="text-xs text-zinc-300 font-tech leading-relaxed">{movie.description}</p>
    );
};
