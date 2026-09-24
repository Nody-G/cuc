'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { UserCheck, Maximize2 } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';
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
            {/* Portrait */}
            <div className="relative h-64 w-full overflow-hidden bg-black">
                <Image
                    src={actor.photo}
                    alt={t('hallOfFame.photoAlt', { name: actor.name })}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/25 to-transparent" />

                {/* IMDb — lien direct, hors clic de carte */}
                <a
                    href={actor.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 z-10 px-2 py-1 bg-[#f5c518] hover:bg-[#ffe500] text-black font-black text-[10px] font-mono-tech rounded-xs shadow-md flex items-center transition-colors"
                    title={t('hallOfFame.imdbTitle', { name: actor.name })}
                >
                    <ImdbLogo className="h-3 w-auto" />
                </a>

                {/* Affordance d'ouverture (icône, sans texte) */}
                <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 flex items-center justify-center w-7 h-7 bg-[#FFE500] text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                </span>
            </div>

            {/* Contenu */}
            <div className="p-5 flex-1 flex flex-col gap-3">
                <h4 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                    {actor.name}
                </h4>

                {hasDoubles ? (
                    <div className="inline-flex items-start gap-1.5 self-start px-2 py-1 bg-[#FFE500]/10 border border-[#FFE500]/40 text-[10px] font-mono-tech text-[#FFE500] font-bold">
                        <UserCheck className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">
                            {doubledBy.prefix}
                            {doubledBy.member ? (
                                <Link
                                    href={`/equipe-cascadeurs-pro/${doubledBy.member.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    title={doubledBy.member.name}
                                    className="underline decoration-dotted underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#FFE500] transition-colors"
                                >
                                    {doubledBy.name}
                                </Link>
                            ) : (
                                doubledBy.name
                            )}
                            {doubledBy.suffix}
                        </span>
                    </div>
                ) : null}

                {actor.stuntSpecialty ? (
                    <p className="text-[11px] text-zinc-300 font-tech leading-relaxed line-clamp-2">
                        {actor.stuntSpecialty}
                    </p>
                ) : null}

                <div className="mt-auto">
                    <div className="text-[9px] font-mono-tech text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                        <span {...cucMicro('teamProduction.hallOfFame.filmsLabel')}>
                            {t('hallOfFame.filmsLabel')}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {actor.productions.slice(0, 3).map((production, index) => (
                            <span
                                key={index}
                                className="px-1.5 py-0.5 bg-[#1a1a24] border border-zinc-800 text-[10px] font-mono-tech text-zinc-300 truncate max-w-full"
                                title={production}
                            >
                                {production}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
        </article>
    );
};
