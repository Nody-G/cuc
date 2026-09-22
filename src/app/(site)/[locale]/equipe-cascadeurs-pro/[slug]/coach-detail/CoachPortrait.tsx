'use client';

import React from 'react';
import Image from 'next/image';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { Globe } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { Instructor } from '@/types';

export interface CoachPortraitProps {
    member: Instructor;
    tt: ReturnType<typeof useTranslations<'team'>>;
}

/** Colonne portrait : photo pleine hauteur immersive + liens officiels. */
export const CoachPortrait: React.FC<CoachPortraitProps> = ({ member, tt }) => (
    <div className="lg:col-span-5 w-full">
        <div className="bg-[#0e0e14] border-2 border-zinc-800 relative group overflow-hidden shadow-2xl">
            {/* Stage Portrait plein format */}
            <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[620px] bg-gradient-to-b from-[#181824] via-[#101016] to-[#0a0a0f] overflow-hidden flex items-end justify-center border-b border-zinc-800">
                {/* Ambient Lighting Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/20 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Tactical Grid */}
                <div className="absolute inset-0 cinematic-grid opacity-35 pointer-events-none" />

                {/* Badge Rôle - Top Left */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-xs uppercase font-bold tracking-wider shadow-lg">
                        {member.role}
                    </span>
                </div>

                {/* Photo Haute Définition Pleine Taille */}
                {member.avatarUrl ? (
                    <div className="relative w-full h-full flex items-end justify-center">
                        <Image
                            src={member.avatarUrl}
                            alt={`Portrait de ${member.name}`}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-contain object-bottom drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-9xl text-zinc-800">
                        {member.name.charAt(0)}
                    </div>
                )}

                {/* Dégradé de transition basse */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/70 to-transparent pointer-events-none" />
            </div>

            {/* Liens Officiels & Profils en pied de photo */}
            <div className="p-4 bg-[#0a0a0f] flex items-center gap-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                    {member.imdb && (
                        <a
                            href={member.imdb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#14141e] hover:bg-[#F5C518] border border-zinc-800 hover:border-[#F5C518] transition-colors flex items-center"
                            title="Fiche IMDb Officielle"
                        >
                            <ImdbLogo className="h-4 w-auto" />
                        </a>
                    )}

                    {member.allocine && (
                        <a
                            href={member.allocine}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#14141e] hover:bg-[#FECC00] hover:text-black border border-zinc-800 hover:border-[#FECC00] text-xs font-mono-tech font-bold uppercase transition-colors"
                            title={tt('coachAllocineTitle')}
                        >
                            Allociné
                        </a>
                    )}

                    {member.instagram && (
                        <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#14141e] hover:bg-white hover:text-black border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-mono-tech font-bold"
                            title="Instagram"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Instagram</span>
                        </a>
                    )}

                    {member.externalUrl && !member.imdb && (
                        <a
                            href={member.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#14141e] hover:bg-[#FFE500] hover:text-black border border-zinc-800 transition-colors text-xs font-mono-tech font-bold"
                            title="Site officiel ou portfolio"
                        >
                            Portfolio
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
);
