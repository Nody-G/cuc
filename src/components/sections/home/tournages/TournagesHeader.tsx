'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Clapperboard, ChevronRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

interface TournagesHeaderProps {
    badge: string;
    teamTag: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
}

/** En-tête du bloc tournages : badge, titre, sous-titre et CTA équipe. */
export const TournagesHeader: React.FC<TournagesHeaderProps> = ({
    badge,
    teamTag,
    title,
    subtitle,
    ctaText,
    ctaLink,
}) => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span
                    data-cuc-field="sections_data.tournages.badge"
                    className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider flex items-center gap-1.5"
                >
                    <Clapperboard className="w-3.5 h-3.5" />
                    {badge}
                </span>
                <span
                    data-cuc-field="sections_data.tournages.team_tag"
                    className="text-xs font-mono-tech text-zinc-500 hidden sm:inline"
                >
                    {teamTag}
                </span>
            </div>

            <h2
                data-cuc-field="sections_data.tournages.title"
                className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight max-w-3xl"
            >
                {title}
            </h2>

            <p
                data-cuc-field="sections_data.tournages.subtitle"
                className="text-sm sm:text-base font-tech text-zinc-300 leading-relaxed max-w-3xl"
            >
                {subtitle}
            </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
            <Link href={ctaLink} data-cuc-field="sections_data.tournages.cta_text">
                <TacticalButton variant="primary" size="md" icon={<ChevronRight className="w-4 h-4" />}>
                    {ctaText}
                </TacticalButton>
            </Link>
        </div>
    </div>
);
