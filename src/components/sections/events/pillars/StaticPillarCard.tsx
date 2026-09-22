'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField, itemPath } from '@/lib/preview/cuc-field';
import type { PillarCopy } from './useEventsPillars';

interface StaticPillarCardProps {
    item: PillarCopy;
    /** Index du pilier dans `sections_data.events_pillars.items`. */
    index: number;
    /** Mise en page inversée : image à gauche (pilier « animations »). */
    reversed: boolean;
    imageUrl: string;
}

/** Carte pilier de repli (catalogue statique éditable en place). */
export const StaticPillarCard: React.FC<StaticPillarCardProps> = ({
    item,
    index,
    reversed,
    imageUrl,
}) => (
    <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className={`lg:col-span-7 space-y-4 ${reversed ? 'order-1 lg:order-2' : ''}`}>
                <div className="mb-4">
                    <span
                        {...cucField(itemPath('events_pillars', index, 'tag'))}
                        className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
                    >
                        {item.tag}
                    </span>
                    <h3
                        {...cucField(itemPath('events_pillars', index, 'title'))}
                        className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
                    >
                        {item.title}
                    </h3>
                </div>

                <p
                    {...cucField(itemPath('events_pillars', index, 'paragraph1'), 'textarea')}
                    className="text-sm font-tech text-zinc-300 leading-relaxed"
                >
                    {item.paragraph1}
                </p>
                <p
                    {...cucField(itemPath('events_pillars', index, 'paragraph2'), 'textarea')}
                    className="text-xs font-tech text-zinc-400 leading-relaxed"
                >
                    {item.paragraph2}
                </p>

                <div className="pt-4">
                    <Link href="/contact-cuc?demande=cuc-events">
                        <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                            <span {...cucField(itemPath('events_pillars', index, 'cta'))}>
                                {item.cta}
                            </span>
                        </TacticalButton>
                    </Link>
                </div>
            </div>

            <div
                {...cucField(itemPath('events_pillars', index, 'image'), 'image')}
                className={`lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black ${reversed ? 'order-2 lg:order-1' : ''
                    }`}
            >
                <Image
                    src={imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                />
            </div>
        </div>
    </div>
);
