'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { withContactIntent } from '@/lib/contact-intent';
import { useHeroParallax } from '@/lib/hooks/useHeroParallax';
import { Sparkles, ChevronRight } from 'lucide-react';

import { SitePageHero } from '@/lib/data/site-service';

interface EventsHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const EventsHeroSection: React.FC<EventsHeroSectionProps> = ({ hero }) => {
  const t = useTranslations('eventsAgence');
  /** Fil d'Ariane commun — éditable via « Micro-textes du site ». */
  const chrome = useTranslations('commonChrome');
  const badge = hero?.badge || t('heroBadge');
  const title = hero?.title || t('heroTitle');
  const subtitle = hero?.subtitle || t('heroSubtitle');
  const bgImage =
    hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/events/events-agency-00-bandeau.webp';
  const ctaPrimaryText = hero?.cta_primary_text || t('heroCtaPrimary');
  /** CTA du hero ÉVÉNEMENTS → page contact, pré-remplie « devis CUC Events ». */
  const ctaPrimaryLink = withContactIntent(
    hero?.cta_primary_link || '/contact-cuc',
    'cuc-events'
  );
  const ctaSecondaryText = hero?.cta_secondary_text;
  const ctaSecondaryLink = hero?.cta_secondary_link || '/videos-cascadeur';

  /** Effet de parallaxe subtil et performant */
  const parallaxOffset = useHeroParallax();

  return (
    <section className="relative py-12 sm:py-14 bg-black border-b border-zinc-800 overflow-hidden">
      {/* Background avec parallaxe cinématique et cadrage valorisant les silhouettes et costumes */}
      <div
        data-cuc-field="hero.bg_image"
        data-cuc-kind="image"
        className="absolute inset-x-0 -top-24 -bottom-24 z-0 will-change-transform"
        style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
      >
        <Image
          src={bgImage}
          alt={t('heroImageAlt')}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%] brightness-75 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/75 to-[#060608]/35 pointer-events-none" />
      </div>

      <div className="relative z-10 page-shell w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-3">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                <span {...cucMicro('commonChrome.breadcrumbHome')}>{chrome('breadcrumbHome')}</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]" {...cucMicro('eventsAgence.breadcrumbCurrent')}>
                {t('breadcrumbCurrent')}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 mb-3">
              <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
                <span {...cucField('hero.badge')}>{badge}</span>
              </StuntBadge>
              <span {...cucField('hero.meta')} className="text-xs font-mono-tech text-zinc-400">
                {hero?.meta || 'SPECTACLES • ANIMATIONS • TEAM BUILDING'}
              </span>
            </div>

            <h1
              {...cucField('hero.title')}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-tight text-white max-w-4xl leading-tight"
            >
              {title.includes(':') ? (
                <>
                  {title.split(':')[0]} :{' '}
                  <span className="text-[#FFE500]">{title.split(':')[1]}</span>
                </>
              ) : (
                title
              )}
            </h1>

            <p
              {...cucField('hero.subtitle', 'textarea')}
              className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-3 leading-relaxed"
            >
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-5">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="md" icon={<ChevronRight className="w-4 h-4" />}>
                  <span {...cucField('hero.cta_primary_text')}>{ctaPrimaryText}</span>
                </TacticalButton>
              </Link>
              {ctaSecondaryText && (
                <Link href={ctaSecondaryLink}>
                  <TacticalButton variant="secondary" size="md">
                    <span {...cucField('hero.cta_secondary_text')}>{ctaSecondaryText}</span>
                  </TacticalButton>
                </Link>
              )}
            </div>
          </div>

          {/* CUC Events Emblem Showcase — Sans cadre, fond transparent */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div className="relative w-56 h-48 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-500">
              <Image
                src="/images/logos/cuc-events-logo.png"
                alt="CUC Events - Break The Limits"
                width={300}
                height={272}
                priority
                unoptimized
                className="w-auto h-auto max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
