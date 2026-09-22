'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Users, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface EquipeHeroSectionProps {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBg: string;
}

/**
 * En-tête de la page équipe : image de fond éditable, fil d'Ariane, badge et
 * titre scindé sur le dernier mot (accent jaune).
 */
export const EquipeHeroSection: React.FC<EquipeHeroSectionProps> = ({
    heroBadge,
    heroTitle,
    heroSubtitle,
    heroBg,
}) => {
    const t = useTranslations('team');

    return (
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
            <div data-cuc-field="hero.bg_image" data-cuc-kind="image" className="absolute inset-0 z-0">
                <Image
                    src={heroBg}
                    alt="L'équipe pédagogique et cascadeurs professionnels du CUC"
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
                        <span {...cucMicro('team.breadcrumbHome')}>{t('breadcrumbHome')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[#FFE500]" {...cucMicro('team.breadcrumbCurrent')}>
                        {t('breadcrumbCurrent')}
                    </span>
                </div>

                <div className="inline-flex items-center gap-2 mb-4">
                    <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                        <span {...cucField('hero.badge')}>{heroBadge}</span>
                    </StuntBadge>
                    <span className="text-xs font-mono-tech text-zinc-400">
                        <span {...cucMicro('team.performerTag')}>{t('performerTag')}</span>
                    </span>
                </div>

                <h1
                    {...cucField('hero.title')}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
                >
                    {heroTitle.includes(' ') ? (
                        <>
                            {heroTitle.substring(0, heroTitle.lastIndexOf(' '))}{' '}
                            <span className="text-[#FFE500]">
                                {heroTitle.substring(heroTitle.lastIndexOf(' ') + 1)}
                            </span>
                        </>
                    ) : (
                        heroTitle
                    )}
                </h1>

                <p
                    {...cucField('hero.subtitle', 'textarea')}
                    className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
                >
                    {heroSubtitle}
                </p>
            </div>
        </section>
    );
};
