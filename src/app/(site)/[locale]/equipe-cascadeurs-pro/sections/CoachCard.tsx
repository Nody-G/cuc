'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink, ArrowRight, Globe, Film } from 'lucide-react';
import type { Instructor, FilmCredit } from '@/types';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { selectCoachFilms } from '@/lib/coach-films';

interface CoachCardProps {
    member: Instructor;
    /** Catalogue localisé conservé pour rétro-compatibilité de signature. */
    films?: FilmCredit[];
    onSelectFilm?: (film: FilmCredit) => void;
}

/**
 * Carte coach : portrait pleine hauteur, rôle, bio, spécialités et 3 premières jaquettes de films.
 * L'ancre `#{member.id}` alimente les liens de la navbar.
 */
export const CoachCard: React.FC<CoachCardProps> = ({ member, films = FILMOGRAPHY_CREDITS, onSelectFilm }) => {
    const t = useTranslations('team');

    const coachFilms = React.useMemo(() => {
        const list = films && films.length > 0 ? films : FILMOGRAPHY_CREDITS;
        return selectCoachFilms(list, member).slice(0, 3);
    }, [films, member]);

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

                        {/* 3 premières jaquettes de films */}
                        {coachFilms.length > 0 && (
                            <div className="pt-3 border-t border-zinc-800/80">
                                <div className="flex items-center justify-between mb-2">
                                    <strong className="text-[11px] font-mono-tech text-[#FFE500] uppercase flex items-center gap-1.5">
                                        <Film className="w-3.5 h-3.5 text-[#FFE500]" />
                                        <span>{t('projectsLabel')} :</span>
                                    </strong>
                                    <span className="text-[10px] font-mono-tech text-zinc-500">
                                        {coachFilms.length > 1
                                            ? t('listedMany', { count: coachFilms.length })
                                            : t('listedOne', { count: coachFilms.length })}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {coachFilms.map((film) => (
                                        <button
                                            key={film.id}
                                            type="button"
                                            onClick={() => onSelectFilm?.(film)}
                                            className="group/poster relative aspect-[2/3] w-full bg-zinc-900 border border-zinc-800 hover:border-[#FFE500] overflow-hidden transition-all duration-300 shadow-md hover:shadow-[0_4px_16px_rgba(255,229,0,0.15)] text-left cursor-pointer"
                                            title={t('filmCardTitle', { title: film.title, year: film.year || '' })}
                                        >
                                            {film.image ? (
                                                <Image
                                                    src={film.image}
                                                    alt={film.title}
                                                    fill
                                                    sizes="(max-width: 768px) 30vw, 120px"
                                                    className="object-cover object-center group-hover/poster:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center bg-zinc-900">
                                                    <Film className="w-4 h-4 text-zinc-600 mb-1" />
                                                    <span className="text-[9px] font-mono-tech uppercase text-zinc-400 line-clamp-2 leading-tight">
                                                        {film.title}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-end p-1.5 pointer-events-none">
                                                <span className="text-[9px] font-tech text-white truncate w-full">
                                                    {film.title}
                                                </span>
                                            </div>
                                            {film.year && (
                                                <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/80 border border-zinc-700 text-[8px] font-mono-tech text-[#FFE500] leading-none">
                                                    {film.year}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
