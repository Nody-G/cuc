'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { splitHeroTitle, type TeamBuildingHeroCopy } from './team-building-copy';

interface TeamBuildingHeroProps {
    copy: TeamBuildingHeroCopy;
    meta: string;
}

/** Hero de la page : visuel plein cadre, fil d'Ariane, titre à dernier mot accentué. */
export const TeamBuildingHero: React.FC<TeamBuildingHeroProps> = ({ copy, meta }) => {
    const t = useTranslations('teamBuilding');
    /** Chrome commun : fil d'Ariane et enseigne de l'agence événements. */
    const chrome = useTranslations('commonChrome');
    const title = splitHeroTitle(copy.title);

    return (
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={copy.bgImage}
                    alt={t('heroMeta')}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center brightness-35 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
            </div>

            <div className="relative z-10 page-shell">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
                    <Link href="/" className="hover:text-[#FFE500] transition-colors">
                        <span {...cucMicro('commonChrome.breadcrumbHome')}>
                            {chrome('breadcrumbHome')}
                        </span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <Link href="/cuc-events-agence" className="hover:text-[#FFE500] transition-colors">
                        <span {...cucMicro('commonChrome.siteEvents')}>{chrome('siteEvents')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[#FFE500]" {...cucMicro('teamBuilding.breadcrumbCurrent')}>
                        {t('breadcrumbCurrent')}
                    </span>
                </div>

                <div className="inline-flex items-center gap-2 mb-4">
                    <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                        <span data-cuc-field="hero.badge" data-cuc-kind="text">
                            {copy.badge}
                        </span>
                    </StuntBadge>
                    <span
                        data-cuc-field="hero.meta"
                        data-cuc-kind="text"
                        className="text-xs font-mono-tech text-zinc-400"
                    >
                        {meta}
                    </span>
                </div>

                <h1
                    data-cuc-field="hero.title"
                    data-cuc-kind="text"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
                >
                    {title.accent ? (
                        <>
                            {title.lead}{' '}
                            <span className="text-[#FFE500]">{title.accent}</span>
                        </>
                    ) : (
                        title.lead
                    )}
                </h1>

                <p
                    data-cuc-field="hero.subtitle"
                    data-cuc-kind="textarea"
                    className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
                >
                    {copy.subtitle}
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                    <Link href={copy.ctaPrimaryLink}>
                        <TacticalButton
                            variant="primary"
                            size="lg"
                            icon={<ChevronRight className="w-4 h-4" />}
                        >
                            <span data-cuc-field="hero.cta_primary_text" data-cuc-kind="text">
                                {copy.ctaPrimaryText}
                            </span>
                        </TacticalButton>
                    </Link>
                    {copy.ctaSecondaryText && (
                        <Link href={copy.ctaSecondaryLink}>
                            <TacticalButton variant="secondary" size="lg">
                                <span data-cuc-field="hero.cta_secondary_text" data-cuc-kind="text">
                                    {copy.ctaSecondaryText}
                                </span>
                            </TacticalButton>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};
