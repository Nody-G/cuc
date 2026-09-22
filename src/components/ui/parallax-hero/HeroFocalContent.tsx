'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronRight, Compass, Building } from 'lucide-react';
import { TacticalButton } from '../TacticalButton';
import { cucField } from '@/lib/preview/cuc-field';
import type { SitePageHero } from '@/lib/data/site-service';
import type { HeroMetric, SlideCopy } from './useParallaxHero';

interface HeroFocalContentProps {
    heroData?: Partial<SitePageHero>;
    currentSlide: number;
    activeCopy?: SlideCopy;
    quickMetrics: HeroMetric[];
    /** Fondu du plan focal au scroll (ressort amorti, aucun déplacement du texte). */
    focalTextOpacity: MotionValue<number>;
}

/**
 * Couche 4 : plan focal texte (badge, titre, sous-titre, métriques, CTA).
 * 100 % stable — aucun parallaxe de déplacement, seulement un fondu d'opacité.
 */
export const HeroFocalContent: React.FC<HeroFocalContentProps> = ({
    heroData,
    currentSlide,
    activeCopy,
    quickMetrics,
    focalTextOpacity,
}) => {
    const tHero = useTranslations('home.hero');
    /** Chrome commun : la seconde ligne du titre est un libellé éditable. */
    const chrome = useTranslations('commonChrome');

    return (
        <div className="relative z-20 flex-grow flex items-center justify-center pt-24 pb-8 sm:pt-28 pointer-events-auto">
            <motion.div
                style={{ opacity: focalTextOpacity }}
                className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center will-change-transform"
            >
                {/* Refined Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md text-[11px] font-mono-tech tracking-widest text-zinc-300 uppercase shadow-xs mb-5"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
                    <span {...cucField('hero.badge')}>{heroData?.badge || tHero('badge')}</span>
                    <span className="text-zinc-600">•</span>
                    <span {...cucField('hero.since')} className="text-[#FFE500] font-semibold">
                        {heroData?.since || tHero('since')}
                    </span>
                </motion.div>

                {/* Clean Editorial Title */}
                <motion.h1
                    {...cucField('hero.title')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display uppercase tracking-tight text-white leading-[0.92] max-w-5xl"
                >
                    {heroData?.title ? (
                        <span>{heroData.title}</span>
                    ) : (
                        <>
                            Campus Univers <br />
                            <span className="text-[#FFE500] drop-shadow-[0_0_35px_rgba(255,229,0,0.32)]">
                                {chrome('heroTitleTail')}
                            </span>
                        </>
                    )}
                </motion.h1>

                {/* Dynamic Subtitle with smooth crossfade */}
                <div className="h-16 sm:h-12 flex items-center justify-center my-3">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentSlide}
                            {...cucField('hero.subtitle', 'textarea')}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-2xl font-normal leading-relaxed text-balance"
                        >
                            {heroData?.subtitle || activeCopy?.sub || ''}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Key Metrics Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="my-4 flex flex-wrap items-center justify-center gap-3"
                >
                    {quickMetrics.map((stat, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 pl-3 pr-4 py-2.5 bg-black/50 backdrop-blur-md border border-white/[0.08] border-l-2 border-l-[#FFE500]"
                        >
                            <div className="text-left">
                                <div
                                    {...cucField(`hero.metrics.${i}.val`)}
                                    className="text-[#FFE500] font-display text-base sm:text-lg font-bold tracking-wide leading-none"
                                >
                                    {stat.val}
                                </div>
                                <div
                                    {...cucField(`hero.metrics.${i}.label`)}
                                    className="text-zinc-400 font-mono-tech text-[9px] uppercase tracking-widest mt-0.5"
                                >
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Action CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                >
                    <Link
                        href={heroData?.cta_primary_link || '/formation-de-cascadeur'}
                        data-cuc-field="hero.cta_primary_link"
                        data-cuc-kind="link"
                    >
                        <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                            <span {...cucField('hero.cta_primary_text')}>
                                {heroData?.cta_primary_text || tHero('ctaFormation')}
                            </span>
                        </TacticalButton>
                    </Link>

                    <Link
                        href={heroData?.cta_secondary_link || '/visite-guidee'}
                        data-cuc-field="hero.cta_secondary_link"
                        data-cuc-kind="link"
                    >
                        <TacticalButton
                            variant="secondary"
                            size="lg"
                            icon={<Building className="w-4 h-4 text-[#FFE500]" />}
                        >
                            <span {...cucField('hero.cta_secondary_text')}>
                                {heroData?.cta_secondary_text || tHero('ctaVisit')}
                            </span>
                        </TacticalButton>
                    </Link>

                    <Link
                        href={heroData?.cta_tertiary_link || '/cuc-team-cascadeur'}
                        data-cuc-field="hero.cta_tertiary_link"
                        data-cuc-kind="link"
                    >
                        <TacticalButton
                            variant="outline"
                            size="lg"
                            icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
                        >
                            <span {...cucField('hero.cta_tertiary_text')}>
                                {heroData?.cta_tertiary_text || tHero('ctaStuntTeam')}
                            </span>
                        </TacticalButton>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};
