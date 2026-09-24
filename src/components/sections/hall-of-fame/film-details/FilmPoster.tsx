'use client';

import React from 'react';
import Image from 'next/image';
import { Film } from 'lucide-react';
import type { FilmBindingProps } from './film-details.types';

/** Affiche du film (ou repli typographique) + badge d'année éditable. */
export const FilmPoster: React.FC<FilmBindingProps> = ({ movie, filmAttr, filmValue }) => (
    <div className="sm:col-span-5 relative h-64 sm:h-72 w-full border border-zinc-800 bg-zinc-900 overflow-hidden">
        {movie.image ? (
            <Image
                src={movie.image}
                alt={movie.title}
                fill
                sizes="(max-width: 640px) 100vw, 250px"
                className="object-cover object-center"
            />
        ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
                <Film className="w-10 h-10 text-zinc-700" />
                <span className="text-[10px] font-mono-tech uppercase tracking-wider text-zinc-600 px-4 text-center">
                    {movie.title}
                </span>
            </div>
        )}
        <div className="absolute top-2 right-2">
            <span
                className="bg-[#FFE500] text-black text-[10px] font-mono-tech font-bold px-2 py-0.5"
                {...filmAttr('year')}
            >
                {filmValue('year', movie.year ?? '')}
            </span>
        </div>
    </div>
);
