'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { parseCredit } from '@/types';

interface CoachCreditsListProps {
    /** Crédits notables du coach (les 4 premiers sont affichés). */
    credits: string[];
}

/** Références & tournages qualifiés, avec couleur par catégorie de crédit. */
export const CoachCreditsList: React.FC<CoachCreditsListProps> = ({ credits }) => {
    const t = useTranslations('team');

    return (
        <div className="pt-2">
            <div className="flex items-center justify-between gap-1 mb-1.5">
                <strong className="text-[11px] font-mono-tech text-zinc-400 uppercase block">
                    {t('creditsLabel')}
                </strong>
                <span className="text-[10px] font-mono-tech text-zinc-500">
                    {credits.length} {t('creditsUnit')}
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {credits.slice(0, 4).map((credit, idx) => {
                    const parsed = parseCredit(credit);
                    const isCoord = parsed.category === 'coordination';
                    const isDoublure = parsed.category === 'doublure';

                    return (
                        <span
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-tech border rounded-xs ${isCoord
                                ? 'bg-[#FFE500]/10 text-[#FFE500] border-[#FFE500]/30 font-semibold'
                                : isDoublure
                                    ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                                    : 'bg-black/60 text-zinc-300 border-zinc-800'
                                }`}
                            title={parsed.role ? `${parsed.title} (${parsed.role})` : parsed.title}
                        >
                            <span className="truncate max-w-[130px]">{parsed.title}</span>
                            {parsed.role && (
                                <span className="text-[9px] opacity-75 font-normal shrink-0">
                                    [{isCoord ? t('roleCoordination') : isDoublure ? t('roleDouble') : t('roleStunt')}]
                                </span>
                            )}
                        </span>
                    );
                })}
                {credits.length > 4 && (
                    <span className="text-[10px] font-mono-tech text-[#FFE500] self-center px-1 font-semibold">
                        {t('othersLabel', { count: credits.length - 4 })}
                    </span>
                )}
            </div>
        </div>
    );
};
