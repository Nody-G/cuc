import { Link } from '@/i18n/navigation';
import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { ChevronRight, Globe } from 'lucide-react';
import type { WorkshopHeroCopy } from './useWorkshopContent';

export interface WorkshopHeroProps {
    breadcrumbs: { home: string; current: string };
    hero: WorkshopHeroCopy;
    onApply: () => void;
}

export const WorkshopHero: React.FC<WorkshopHeroProps> = ({ breadcrumbs, hero, onApply }) => (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image
                src={hero.bg}
                alt="CUC International Stunt Workshop"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center brightness-40 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
        </div>

        <div className="relative z-10 page-shell">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
                <Link
                    href="/"
                    data-cuc-field="sections_data.workshop.breadcrumb_home"
                    className="hover:text-[#FFE500] transition-colors"
                >
                    {breadcrumbs.home}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span
                    data-cuc-field="sections_data.workshop.breadcrumb_current"
                    className="text-[#FFE500]"
                >
                    {breadcrumbs.current}
                </span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
                <StuntBadge variant="yellow" icon={<Globe className="w-3.5 h-3.5" />}>
                    <span data-cuc-field="hero.badge" data-cuc-kind="text">
                        {hero.badge}
                    </span>
                </StuntBadge>
                <span
                    data-cuc-field="hero.meta"
                    data-cuc-kind="text"
                    className="text-xs font-mono-tech text-zinc-400"
                >
                    {hero.meta}
                </span>
            </div>

            <h1
                data-cuc-field="hero.title"
                data-cuc-kind="text"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
            >
                {hero.title.includes(' ') ? (
                    <>
                        {hero.title.substring(0, hero.title.lastIndexOf(' '))}{' '}
                        <span className="text-[#FFE500]">
                            {hero.title.substring(hero.title.lastIndexOf(' ') + 1)}
                        </span>
                    </>
                ) : (
                    hero.title
                )}
            </h1>

            <p
                data-cuc-field="hero.subtitle"
                data-cuc-kind="textarea"
                className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
            >
                {hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
                <TacticalButton
                    variant="primary"
                    size="lg"
                    icon={<ChevronRight className="w-4 h-4" />}
                    onClick={onApply}
                >
                    <span data-cuc-field="hero.cta_primary_text" data-cuc-kind="text">
                        {hero.ctaPrimaryText}
                    </span>
                </TacticalButton>
                <Link href={hero.ctaSecondaryLink}>
                    <TacticalButton variant="secondary" size="lg">
                        <span data-cuc-field="hero.cta_secondary_text" data-cuc-kind="text">
                            {hero.ctaSecondaryText}
                        </span>
                    </TacticalButton>
                </Link>
            </div>
        </div>
    </section>
);
