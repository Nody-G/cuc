'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink, ArrowRight, Globe } from 'lucide-react';
import type { Instructor, FilmCredit } from '@/types';
import { selectCoachFilms } from '@/lib/coach-films';
import { CoachCreditsList } from './CoachCreditsList';
import { CoachFilmThumbs } from './CoachFilmThumbs';

interface CoachCardProps {
    member: Instructor;
    /** Catalogue localisé (FR + overlays EN) pour filtrer les films du coach. */
    films: FilmCredit[];
    onSelectFilm: (film: FilmCredit) => void;
}

/**
 * Carte coach : portrait pleine hauteur, rôle, bio, spécialités, crédits et
 * tournages. L'ancre `#{member.id}` alimente les liens de la navbar.
 */
export const CoachCard: React.FC<CoachCardProps> = ({ member, films, onSelectFilm }) => {
    const t = useTranslations('team');

    /**
     * Même sélecteur que la fiche du coach : mise en avant du Cockpit d'abord,
     * puis tri par défaut. Auparavant la carte filtrait à sa façon, **sans tri**,
     * et affichait donc trois films qui n'étaient pas les trois premiers de la
     * fiche — l'incohérence que voyait le visiteur.
     */
    const coachFilms = selectCoachFilms(films, member);

    return (
        <div
            id={member.id}
            className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/70 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden shadow-xl hover:shadow-[0_15px_40px_rgba(255,229,0,0.1)] scroll-mt-32"
        >
            {/* Portrait Showcase Stage */}
            <Link
                href={`/equipe-cascadeurs-pro/${member.id}`}
                className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-[#181824] via-[#101016] to-[#0e0e14] overflow-hidden flex items-end justify-center border-b border-zinc-800/80 block cursor-pointer group/img"
                title={`Voir la fiche détaillée de ${member.name}`}
            >
                {/* Ambient Glow on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/15 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Tactical cinematic grid overlay */}
                <div className="absolute inset-0 cinematic-grid opacity-30 pointer-events-none" />

                {/* Role Badge - Top Left */}
                <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-[10px] sm:text-[11px] uppercase font-bold tracking-wider shadow-md">
                        {member.role}
                    </span>
                </div>

                {/* High-Resolution Full-Stature Portrait */}
                {member.avatarUrl ? (
                    <div className="relative w-full h-full max-h-[96%] flex items-end justify-center">
                        <Image
                            src={member.avatarUrl}
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] group-hover/img:scale-105 transition-transform duration-500 ease-out"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-7xl text-zinc-800">
                        {member.name.charAt(0)}
                    </div>
                )}

                {/* Subtle bottom shadow gradient to blend with card content */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none" />
            </Link>

            {/* Card Content Section */}
            <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
                <div>
                    {/* Name & Title */}
                    <div className="mb-3">
                        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                            <Link href={`/equipe-cascadeurs-pro/${member.id}`} className="hover:text-[#FFE500] transition-colors">
                                {member.name}
                            </Link>
                        </h2>
                        <h3 className="text-xs font-mono-tech text-[#FFE500] uppercase tracking-wider mt-1">
                            {member.title}
                        </h3>
                    </div>

                    {/* Bio */}
                    <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
                        {member.bio}
                    </p>

                    {/* Specialties */}
                    <div className="space-y-3 mb-6 pt-4 border-t border-zinc-800/80">
                        <div>
                            <strong className="text-[11px] font-mono-tech text-zinc-400 uppercase block mb-2">
                                Domaines d'expertise :
                            </strong>
                            <div className="flex flex-wrap gap-1.5">
                                {member.specialties.map((spec, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono-tech text-zinc-300 group-hover:border-zinc-700 transition-colors"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Références & Tournages Qualifiés */}
                        {member.notableCredits && member.notableCredits.length > 0 && (
                            <CoachCreditsList credits={member.notableCredits} />
                        )}

                        {/* Projets & Tournages Cinéma */}
                        {coachFilms.length > 0 && (
                            <CoachFilmThumbs films={coachFilms} onSelect={onSelectFilm} />
                        )}
                    </div>
                </div>

                {/* Action Button & Links Footer */}
                <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Link
                        href={`/equipe-cascadeurs-pro/${member.id}`}
                        className="w-full sm:w-auto flex-grow py-2 px-3 bg-[#14141e] hover:bg-[#FFE500] hover:text-black border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase font-bold text-center transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                        <span>{t('ctaDetail')}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {member.externalUrl && (
                            <a
                                href={member.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                                title={t('externalLinkAria')}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}

                        {member.instagram && (
                            <a
                                href={member.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                                title="Instagram"
                            >
                                <Globe className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
