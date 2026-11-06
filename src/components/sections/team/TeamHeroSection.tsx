'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { withContactIntent } from '@/lib/contact-intent';
import { useHeroParallax } from '@/lib/hooks/useHeroParallax';
import { Film, ChevronRight } from 'lucide-react';
import { SitePageHero } from '@/lib/data/site-service';

interface TeamHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const TeamHeroSection: React.FC<TeamHeroSectionProps> = ({ hero }) => {
  const t = useTranslations('teamProduction');
  const badge = hero?.badge || t('hero.badge');
  const title = hero?.title || t('hero.title');
  const subtitle = hero?.subtitle || t('hero.subtitle');
  const bgImage =
    hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/cascadeur-cuc-5-0-ech-4.webp';
  const ctaPrimaryText = hero?.cta_primary_text || t('hero.ctaPrimary');
  /**
   * CTA du hero TOURNAGE → page contact, pré-remplie « tournage & production »
   * (même si le lien est configuré en `/contact-cuc` dans le Cockpit).
   */
  const ctaPrimaryLink = withContactIntent(
    hero?.cta_primary_link || '/contact-cuc',
    'tournage-production'
  );
  const parallaxOffset = useHeroParallax();

  return (
    <section className="relative py-12 sm:py-14 bg-black border-b border-zinc-800 overflow-hidden">
      <div
        data-cuc-field="hero.bg_image"
        data-cuc-kind="image"
        className="absolute inset-x-0 -top-24 -bottom-24 z-0 will-change-transform"
        style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
      >
        <Image
          src={bgImage}
          alt={t('hero.bgAlt')}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_25%] brightness-75 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/75 to-[#060608]/35 pointer-events-none" />
      </div>

      <div className="relative z-10 page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-3">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                <span {...cucMicro('teamProduction.hero.breadcrumbHome')}>
                  {t('hero.breadcrumbHome')}
                </span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]" {...cucMicro('teamProduction.hero.breadcrumbCurrent')}>
                {t('hero.breadcrumbCurrent')}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
              <span {...cucField('hero.badge')}>{badge}</span>
            </div>

            <h1
              {...cucField('hero.title')}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display uppercase tracking-tight text-white max-w-4xl leading-tight"
            >
              {title.includes('&') ? (
                <>
                  {title.split('&')[0]}
                  {' & '}
                  <span className="text-[#FFE500]">{title.split('&')[1]}</span>
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
              <a
                href="#filmographie"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono-tech uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
              >
                <Film className="w-4 h-4 text-[#FFE500]" />
                <span {...cucMicro('teamProduction.hero.posters')}>{t('hero.posters')}</span>
              </a>
            </div>
          </div>

          {/* CUC Stunt Team Emblem Showcase — Sans cadre, fond transparent */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div className="relative w-72 h-64 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-500">
              <Image
                src="/images/logos/cuc-stunt-team-logo.png"
                alt={t('hero.emblemAlt')}
                width={300}
                height={266}
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
