'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import type { SiteEvent } from '@/lib/data/site-service';

interface DbEventPillarCardProps {
    evt: SiteEvent;
    /** Alternance de mise en page : pair = texte à gauche, impair = image à gauche. */
    isReversed: boolean;
}

/** Carte pilier alimentée par un événement `site_events` (Cockpit). */
export const DbEventPillarCard: React.FC<DbEventPillarCardProps> = ({ evt, isReversed }) => {
    const t = useTranslations('eventsAgence');
    /** Chrome commun : nom du campus (repli visuel d'affiche). */
    const chrome = useTranslations('commonChrome');

    return (
        <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div
                    className={`lg:col-span-7 space-y-4 ${isReversed ? 'order-1 lg:order-2' : ''
                        }`}
                >
                    <div className="mb-4">
                        {evt.badge && (
                            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
                                {evt.badge}
                            </span>
                        )}
                        <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                            {evt.title}
                        </h3>
                        {evt.subtitle && (
                            <div className="text-xs font-mono-tech text-zinc-400 mt-1 uppercase">
                                {evt.subtitle}
                            </div>
                        )}
                    </div>

                    {evt.description && (
                        <p className="text-sm font-tech text-zinc-300 leading-relaxed whitespace-pre-line">
                            {evt.description}
                        </p>
                    )}

                    {evt.features && evt.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {evt.features.map((feat, fIdx) => (
                                <div
                                    key={fIdx}
                                    className="flex items-center gap-2 text-xs text-zinc-300 font-tech"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4">
                        <Link href={evt.cta_link || '/contact-cuc?demande=cuc-events'}>
                            <TacticalButton
                                variant="primary"
                                size="md"
                                icon={<ArrowRight className="w-4 h-4" />}
                            >
                                {evt.cta_text || t('learnMore')}
                            </TacticalButton>
                        </Link>
                    </div>
                </div>

                <div
                    className={`lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black ${isReversed ? 'order-2 lg:order-1' : ''
                        }`}
                >
                    {evt.image_url ? (
                        <Image
                            src={evt.image_url}
                            alt={evt.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xs">
                            {chrome('campusNameTitle')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
