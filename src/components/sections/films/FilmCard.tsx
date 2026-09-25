'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Award, Film, ShieldCheck, Users } from 'lucide-react';
import { type CucMicroAttributes } from '@/lib/preview/cuc-micro';

/**
 * Forme structurelle minimale d'une jaquette.
 * `FilmCredit` (catalogue `site_films`) la satisfait naturellement : la carte
 * reste utilisable par les sélections éditoriales sans fiche complète.
 */
export interface FilmCardFilm {
    id: string;
    title: string;
    year?: string;
    image?: string;
}

/** Rôle d'un membre du CUC sur une production (fiche coach). */
export interface FilmCardRole {
    /** Libellé du bloc (« Rôle sur cette production : »). */
    label: string;
    /** Rôle traduit (« Coordinateur des cascades », « Doublure »…). */
    value: string;
    /** Variante visuelle du badge. */
    variant: 'coord' | 'doublure' | 'other';
    /** Annotation d'édition en place éventuelle (`cucMicro`). */
    micro?: CucMicroAttributes;
}

export interface FilmCardProps {
    film: FilmCardFilm;
    /** Ouvre la fiche du film (modale) — navigation canonique des jaquettes. */
    onOpen?: () => void;
    /** Navigation de repli si la fiche n'est pas encore au catalogue. */
    href?: string;
    /** Tailles `next/image` adaptées à la grille appelante. */
    sizes?: string;
    /** Badge « Mis en avant » (ordre piloté depuis le Cockpit). */
    featured?: { label: string; micro?: CucMicroAttributes } | null;
    /** Rôle du membre sur cette production. */
    role?: FilmCardRole | null;
    /** Ligne factuelle sous le titre (repli contextuel). */
    caption?: string | null;
    /** Ligne de pied factuelle (réalisateur). */
    footer?: string | null;
}

/**
 * Jaquette de film canonique de la vitrine — SOURCE UNIQUE d'affichage.
 *
 * Décision produit (2026-09-24) : toutes les jaquettes publiques (showcase
 * « LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC », accueil, fiche coach…)
 * partagent EXACTEMENT cette présentation et cette navigation :
 *   - affiche au ratio 2/3, badge d'année en haut à gauche ;
 *   - badge « Mis en avant » en haut à droite (si piloté) ;
 *   - bloc de rôle optionnel, puis titre ;
 *   - ligne de pied factuelle (réalisateur) ;
 *   - clic → fiche détaillée (modale), jamais une navigation arbitraire.
 *
 * Aucun libellé d'appel (« Fiche film », « Détails ») : l'affordance est
 * visuelle (bordure jaune, curseur, icône d'agrandissement au survol).
 * Le composant est purement présentationnel : il ne traduit rien lui-même,
 * les libellés lui sont fournis par l'appelant (source i18n unique).
 */
export const FilmCard: React.FC<FilmCardProps> = ({
    film,
    onOpen,
    href,
    sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw',
    featured,
    role,
    caption,
    footer,
}) => {
    const titleAttr = film.year ? `${film.title} — ${film.year}` : film.title;

    const roleIcon =
        role?.variant === 'coord' ? (
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        ) : role?.variant === 'doublure' ? (
            <Users className="w-3.5 h-3.5 shrink-0" />
        ) : (
            <Award className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        );

    const roleClass =
        role?.variant === 'coord'
            ? 'px-2.5 py-1 bg-[#FFE500]/15 border border-[#FFE500]/50 text-[#FFE500] text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs'
            : role?.variant === 'doublure'
                ? 'px-2.5 py-1 bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs'
                : 'px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tech font-semibold uppercase flex items-center gap-1.5 rounded-xs';

    const inner = (
        <>
            <div>
                {/* Affiche */}
                <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                    {film.image ? (
                        <Image
                            src={film.image}
                            alt={film.title}
                            fill
                            sizes={sizes}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
                            <Film className="w-10 h-10 text-zinc-700" />
                            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-zinc-600 px-4 text-center">
                                {film.title}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent opacity-90" />

                    {/* Badge d'année — position canonique : en haut à gauche */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 backdrop-blur-xs text-[10px] font-mono-tech text-[#FFE500] border border-zinc-800 font-bold shadow-md">
                        {film.year}
                    </span>

                    {/* Mise en avant (définie dans le Cockpit) */}
                    {featured ? (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase tracking-wider shadow-md">
                            <span {...featured.micro}>{featured.label}</span>
                        </span>
                    ) : null}
                </div>

                {/* Rôle & titre */}
                <div className="p-4 space-y-3">
                    {role ? (
                        <div>
                            <span className="text-[9px] font-mono-tech text-zinc-500 uppercase block mb-1">
                                <span {...role.micro}>{role.label}</span>
                            </span>
                            <div className={roleClass}>
                                {roleIcon}
                                <span className="truncate">{role.value}</span>
                            </div>
                        </div>
                    ) : null}

                    <h3 className="text-lg font-display uppercase text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                        {film.title}
                    </h3>

                    {caption ? (
                        <p className="text-[10px] font-tech text-zinc-500">{caption}</p>
                    ) : null}
                </div>
            </div>

            {footer ? (
                <div className="px-4 py-2.5 border-t border-zinc-800/80 text-[11px] font-mono-tech text-zinc-400">
                    <span>{footer}</span>
                </div>
            ) : null}
        </>
    );

    const cardClass = `bg-[#0e0e14] border-2 transition-all flex flex-col justify-between group overflow-hidden cursor-pointer text-left shadow-lg hover:shadow-[0_10px_30px_rgba(255,229,0,0.1)] ${featured ? 'border-[#FFE500]/60 hover:border-[#FFE500]' : 'border-zinc-800 hover:border-[#FFE500]'
        }`;

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

export default FilmCard;
