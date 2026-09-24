'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { mergeSectionItems } from '@/lib/hooks/usePageSectionData';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

interface HomeAboutSectionProps {
  aboutData?: {
    tag?: string;
    subtag?: string;
    title?: string;
    description?: string;
    founder_quote?: string;
    founder_name?: string;
    founder_role?: string;
    founder_label?: string;
    badge_year?: string;
    image_url?: string;
    cta_primary_text?: string;
    cta_primary_link?: string;
    cta_secondary_text?: string;
    cta_secondary_link?: string;
    /** Piliers éditoriaux — fusionnés index par index avec les libellés traduits. */
    pillars?: Array<{ title?: string; desc?: string; tag?: string }>;
  };
}

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({ aboutData }) => {
  const t = useTranslations('home.about');

  /**
   * Piliers : toute la copie est dans les catalogues (`home.about.pillars`),
   * seules les amplitudes de parallaxe restent locales — ce sont des valeurs de
   * mise en page, pas du texte.
   */
  const pillarSpeeds = [-0.05, 0.05, -0.04, 0.06];
  const pillarDefaults = (
    (t.raw('pillars') as { title: string; desc: string; tag: string }[]) ?? []
  ).map((pillar, idx) => ({ ...pillar, speed: pillarSpeeds[idx] ?? 0 }));
  /**
   * Fusion index par index avec `sections_data.about.pillars` : les textes sont
   * éditoriaux, les amplitudes de parallaxe restent des valeurs de mise en page.
   */
  const pillars = mergeSectionItems(
    pillarDefaults,
    aboutData?.pillars ? { items: aboutData.pillars } : null
  );

  const title = aboutData?.title || t('title');
  const tag = aboutData?.tag || t('tag');
  const subtag = aboutData?.subtag || t('subtag');
  const description = aboutData?.description || t('description');
  const imageUrl = aboutData?.image_url || 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg';
  const ctaPrimaryText = aboutData?.cta_primary_text || t('ctaPrimary');
  const ctaPrimaryLink = aboutData?.cta_primary_link || '/formation-de-cascadeur';
  const ctaSecondaryText = aboutData?.cta_secondary_text || t('ctaSecondary');
  const ctaSecondaryLink = aboutData?.cta_secondary_link || '/equipe-cascadeurs-pro';

  return (
    <StudioParallaxScene className="py-28 bg-[#08080a]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Soft Glow Layer */}
      <StudioParallaxLayer speed={-0.18} className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FFE500]/[0.025] blur-3xl pointer-events-none" />

      <div className="page-shell relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Side: 2.5D Multi-Plane Portrait Composition */}
          <div className="lg:col-span-5 relative">
            {/* Layer A: Background Shadow Frame & Photo (Deep plane) */}
            <StudioParallaxLayer speed={-0.12} className="relative">
              <div className="relative h-[460px] sm:h-[540px] w-full border border-zinc-800 bg-[#0c0c12] overflow-hidden shadow-2xl group">
                <Image
                  src={imageUrl}
                  alt={t('imageAlt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center brightness-90 contrast-110 group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              </div>
            </StudioParallaxLayer>

          </div>

          {/* Editorial Content Side */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  data-cuc-field="sections_data.about.tag"
                  className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider"
                >
                  {tag}
                </span>
                <span
                  data-cuc-field="sections_data.about.subtag"
                  className="text-xs font-mono-tech text-zinc-400"
                >
                  {subtag}
                </span>
              </div>

              <h2
                data-cuc-field="sections_data.about.title"
                className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight"
              >
                {title}
              </h2>

              <p
                data-cuc-field="sections_data.about.description"
                className="text-sm sm:text-base font-tech text-zinc-300 mt-3 leading-relaxed"
              >
                {description}
              </p>
            </motion.div>

            {/* 4 Pillars Grid with Staggered Parallax Wave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {pillars.map((pillar, idx) => (
                <StudioParallaxLayer key={idx} speed={pillar.speed}>
                  <StudioParallaxCard maxTilt={4} className="h-full">
                    <div className="p-4 sm:p-5 border border-zinc-800 bg-[#0d0d12]/90 backdrop-blur-xs flex flex-col justify-between h-full hover:border-[#FFE500]/40 transition-colors group">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3
                            data-cuc-field={`sections_data.about.pillars.${idx}.title`}
                            className="text-sm font-display uppercase tracking-wider text-white group-hover:text-[#FFE500] transition-colors"
                          >
                            {pillar.title}
                          </h3>
                          <span
                            data-cuc-field={`sections_data.about.pillars.${idx}.tag`}
                            className="text-[9px] font-mono-tech text-[#FFE500] border border-[#FFE500]/30 px-1.5 py-0.5"
                          >
                            {pillar.tag}
                          </span>
                        </div>
                        <p
                          data-cuc-field={`sections_data.about.pillars.${idx}.desc`}
                          className="text-xs text-zinc-400 font-tech leading-relaxed"
                        >
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </StudioParallaxCard>
                </StudioParallaxLayer>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href={ctaPrimaryLink} data-cuc-field="sections_data.about.cta_primary_text">
                <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  {ctaPrimaryText}
                </TacticalButton>
              </Link>
              <Link href={ctaSecondaryLink} data-cuc-field="sections_data.about.cta_secondary_text">
                <TacticalButton variant="secondary" size="md">
                  {ctaSecondaryText}
                </TacticalButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudioParallaxScene>
  );
};
