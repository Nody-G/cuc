'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Film } from 'lucide-react';

/**
 * Forme structurelle minimale d'une jaquette.
 * `FilmCredit` (catalogue `site_films`) la satisfait naturellement : la carte
 * reste ainsi utilisable par les sélections éditoriales qui n'ont pas encore
 * de fiche complète.
 */
export interface FilmPosterLike {
    id: string;
    title: string;
    year?: string;
    image?: string;
}

export interface FilmPosterCardProps {
    film: FilmPosterLike;
    /**
     * Ouvre la fiche du film (modale `FilmDetailsModal`) — navigation
     * canonique des jaquettes. Absent si la fiche n'est pas au catalogue.
     */
    onOpen?: () => void;
    /** Navigation de repli lorsque la fiche n'existe pas encore au catalogue. */
    href?: string;
    /** Tailles `next/image` adaptées à la grille d'accueil de la carte. */
    sizes?: string;
    /** Ligne factuelle optionnelle (ex. rôle du coach) sous le titre. */
    caption?: string;
}

/**
 * Jaquette de film canonique de la vitrine — SOURCE UNIQUE d'affichage.
 *
 * Décision produit (2026-09-21) : toutes les jaquettes publiques (showcase
 * « LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC », accueil, fiche coach…)
 * partagent EXACTEMENT cette présentation et cette navigation :
 *   - affiche au ratio 2/3, badge d'année en haut à gauche ;
 *   - titre tronqué sous l'affiche ;
 *   - clic → fiche détaillée (modale), jamais une navigation arbitraire ;
 *   - repli visuel explicite si l'affiche est absente (aucune image cassée).
 */
export const FilmPosterCard: React.FC<FilmPosterCardProps> = ({
    film,
    onOpen,
    href,
    sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw',
    caption,
}) => {
    const titleAttr = film.year ? `${film.title} — ${film.year}` : film.title;

    const inner = (
        <>
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black mb-2">
                {film.image ? (
                    <Image
                        src={film.image}
                        alt={film.title}
                        fill
                        sizes={sizes}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-black">
                        <Film className="w-8 h-8 text-zinc-700" />
                        <span className="text-[9px] font-mono-tech uppercase tracking-wider text-zinc-600 px-2 text-center">
                            {film.title}
                        </span>
                    </div>
                )}
                {film.year && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/80 text-[#FFE500] font-mono-tech text-[9px] font-bold">
                        {film.year}
                    </span>
                )}
            </div>
            <p className="text-[11px] font-mono-tech uppercase text-zinc-300 group-hover:text-[#FFE500] truncate text-center">
                {film.title}
            </p>
            {caption ? (
                <p className="text-[10px] font-tech text-zinc-500 truncate text-center">{caption}</p>
            ) : null}
        </>
    );

    const cardClass =
        'bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 transition-all p-2 group flex flex-col justify-between cursor-pointer text-left';

    if (onOpen) {
        return (
            <button type="button" onClick={onOpen} className={cardClass} title={titleAttr}>
                {inner}
            </button>
        );
    }

    if (href) {
        return (
            <Link href={href} className={cardClass} title={titleAttr}>
                {inner}
            </Link>
        );
    }

    return (
        <div className={cardClass} title={titleAttr}>
            {inner}
        </div>
    );
};

export default FilmPosterCard;
