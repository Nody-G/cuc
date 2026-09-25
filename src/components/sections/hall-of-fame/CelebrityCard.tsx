'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { UserCheck, Maximize2 } from 'lucide-react';
import { resolveDoubledBy, type TeamNameRef } from '@/lib/celebrity-double';

interface CelebrityCardProps {
    actor: DoubledCelebrity;
    /** Référentiel de l'équipe CUC, pour transformer un nom de doubleur en lien. */
    teamMembers: TeamNameRef[];
    /** Ouvre la fiche détaillée du comédien. */
    onSelect: () => void;
}

/**
 * Vignette d'un comédien doublé.
 *
 * Toute la carte ouvre la fiche au clic (et au clavier) ; le badge IMDb et le
 * nom du doubleur CUC sont des liens qui neutralisent ce clic. Quand le
 * doubleur appartient à l'équipe du campus, son nom mène à sa fiche coach —
 * la même interconnexion que sur les jaquettes de films.
 *
 * La mention « voir la fiche » a été retirée : l'affordance est désormais
 * visuelle (icône au survol, curseur, bordure jaune), pas textuelle.
 */
export const CelebrityCard: React.FC<CelebrityCardProps> = ({ actor, teamMembers, onSelect }) => {
    const t = useTranslations('teamProduction');

    const doubledBy = useMemo(
        () => resolveDoubledBy(actor.stuntDoubles, teamMembers),
        [actor.stuntDoubles, teamMembers]
    );
    const hasDoubles = doubledBy.name.trim().length > 0;

    const openFromKeyboard = (event: React.KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
    };

    return (
        <article
            role="button"
            tabIndex={0}
            aria-label={actor.name}
            onClick={onSelect}
            onKeyDown={openFromKeyboard}
            className="group bg-[#121218] border border-zinc-800 hover:border-[#FFE500] focus-visible:border-[#FFE500] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative hover:shadow-[0_12px_35px_rgba(255,229,0,0.18)] luxury-metric-card"
        >
            {/* Portrait — ratio 3/4 harmonisé avec la grille 6 colonnes */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <Image
                    src={actor.photo}
                    alt={t('hallOfFame.photoAlt', { name: actor.name })}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover object-top brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/25 to-transparent" />

                {/* IMDb — lien direct, hors clic de carte */}
                <a
                    href={actor.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 bg-[#f5c518] hover:bg-[#ffe500] text-black font-black text-[9px] font-mono-tech rounded-xs shadow-md flex items-center transition-colors"
                    title={t('hallOfFame.imdbTitle', { name: actor.name })}
                >
                    <ImdbLogo className="h-2.5 w-auto" />
                </a>

                {/* Affordance d'ouverture (icône, sans texte) */}
                <span
                    aria-hidden="true"
                    className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-6 h-6 bg-[#FFE500] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <Maximize2 className="w-3 h-3" />
                </span>
            </div>

            {/* Contenu */}
            <div className="p-3.5 flex-1 flex flex-col gap-2">
                <h4 className="text-base sm:text-lg font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                    {actor.name}
                </h4>

                {hasDoubles ? (
                    <div className="inline-flex items-start gap-1 self-start px-2 py-0.5 bg-[#FFE500]/10 border border-[#FFE500]/40 text-[9px] font-mono-tech text-[#FFE500] font-bold">
                        <UserCheck className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">
                            {doubledBy.segments.length > 0 ? (
                                doubledBy.segments.map((seg, sIdx) => {
                                    if (seg.type === 'member' && seg.member) {
                                        return (
                                            <Link
                                                key={sIdx}
                                                href={`/equipe-cascadeurs-pro/${seg.member.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                title={seg.member.name}
                                                className="underline decoration-dotted underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FFE500] transition-colors"
                                            >
                                                {seg.text}
                                            </Link>
                                        );
                                    }
                                    return <React.Fragment key={sIdx}>{seg.text}</React.Fragment>;
                                })
                            ) : (
                                <>
                                    {doubledBy.prefix}
                                    {doubledBy.name}
                                    {doubledBy.suffix}
                                </>
                            )}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
        </article>
    );
};
