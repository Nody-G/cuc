'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { Instructor } from '@/types';

export interface CoachOtherMembersProps {
    members: Instructor[];
    chrome: ReturnType<typeof useTranslations<'commonChrome'>>;
    tt: ReturnType<typeof useTranslations<'team'>>;
}

/** Découvrir les autres formateurs du Campus. */
export const CoachOtherMembers: React.FC<CoachOtherMembersProps> = ({
    members,
    chrome,
    tt,
}) => (
    <div className="pt-12 border-t border-zinc-800">
        <div className="flex items-center justify-between gap-4 mb-8">
            <div>
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold block mb-1">
                    {tt('campusFacultyTag')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                    {chrome('otherCoordinatorsTitle')}
                </h2>
            </div>

            <Link
                href="/equipe-cascadeurs-pro"
                className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors group"
            >
                <span>{tt('seeWholeTeam')}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((other) => (
                <Link
                    key={other.id}
                    href={`/equipe-cascadeurs-pro/${other.id}`}
                    className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-4 group transition-all flex flex-col justify-between"
                >
                    <div className="relative w-full h-44 bg-gradient-to-b from-[#181824] to-[#0e0e14] overflow-hidden flex items-end justify-center mb-3">
                        {other.avatarUrl ? (
                            <Image
                                src={other.avatarUrl}
                                alt={other.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <span className="text-5xl font-display text-zinc-700">{other.name.charAt(0)}</span>
                        )}
                    </div>

                    <div>
                        <span className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold block">
                            {other.role}
                        </span>
                        <h3 className="text-base font-display uppercase text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                            {other.name}
                        </h3>
                    </div>

                    <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-tech text-zinc-500">
                        <span>{tt('cardCta')}</span>
                        <ArrowRight className="w-3 h-3 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>
            ))}
        </div>
    </div>
);
