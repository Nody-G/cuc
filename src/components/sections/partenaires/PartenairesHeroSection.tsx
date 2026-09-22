'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { cucField } from '@/lib/preview/cuc-field';
import { Handshake, ChevronRight } from 'lucide-react';
import { SitePageHero } from '@/lib/data/site-service';

interface PartenairesHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const PartenairesHeroSection: React.FC<PartenairesHeroSectionProps> = ({ hero }) => {
  const t = useTranslations('partenaires');
  const badge = hero?.badge || t('heroBadge');
  const title = hero?.title || t('heroTitle');
  const subtitle = hero?.subtitle || t('heroSubtitle');
  const bgImage =
    hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-6-scaled.jpg';

  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={t('heroImageAlt')}
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
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FFE500]">{t('breadcrumbCurrent')}</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Handshake className="w-3.5 h-3.5" />}>
            <span {...cucField('hero.badge')}>{badge}</span>
          </StuntBadge>
          <span {...cucField('hero.meta')} className="text-xs font-mono-tech text-zinc-400">
            {hero?.meta || t('heroMeta')}
          </span>
        </div>

        <h1
          {...cucField('hero.title')}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
        >
          {title.includes(' ') ? (
            <>
              {title.substring(0, title.lastIndexOf(' '))}{' '}
              <span className="text-[#FFE500]">
                {title.substring(title.lastIndexOf(' ') + 1)}
              </span>
            </>
          ) : (
            title
          )}
        </h1>

        <p
          {...cucField('hero.subtitle', 'textarea')}
          className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
};
