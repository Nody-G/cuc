import { Link } from '@/i18n/navigation';
import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { ChevronRight, Tv } from 'lucide-react';
import type { VideosHeroCopy, VideosLabels } from './useVideosPage';

export interface VideosHeroProps {
    hero: VideosHeroCopy;
    labels: VideosLabels;
}

export const VideosHero: React.FC<VideosHeroProps> = ({ hero, labels }) => (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image
                src={hero.bg}
                alt={labels.heroImageAlt}
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
                    {labels.breadcrumbHome}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[#FFE500]">{labels.breadcrumbCurrent}</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
                <StuntBadge variant="yellow" icon={<Tv className="w-3.5 h-3.5" />}>
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
                {hero.title.includes('&') ? (
                    <>
                        {hero.title.split('&')[0]} &{' '}
                        <span className="text-[#FFE500]">{hero.title.split('&')[1]}</span>
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
        </div>
    </section>
);
