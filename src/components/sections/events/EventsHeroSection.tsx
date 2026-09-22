'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField } from '@/lib/preview/cuc-field';
import { Sparkles, ChevronRight } from 'lucide-react';

import { SitePageHero } from '@/lib/data/site-service';

interface EventsHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const EventsHeroSection: React.FC<EventsHeroSectionProps> = ({ hero }) => {
  const t = useTranslations('eventsAgence');
  const badge = hero?.badge || t('heroBadge');
  const title = hero?.title || t('heroTitle');
  const subtitle = hero?.subtitle || t('heroSubtitle');
  const bgImage =
    hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Image1-scaled.jpg';
  const ctaPrimaryText = hero?.cta_primary_text || t('heroCtaPrimary');
  const ctaPrimaryLink = hero?.cta_primary_link || '/contact-cuc';
  const ctaSecondaryText = hero?.cta_secondary_text || t('heroCtaSecondary');
  const ctaSecondaryLink = hero?.cta_secondary_link || '/videos-cascadeur';

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
            ACCUEIL
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FFE500]">CUC EVENTS & SPECTACLES</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
            <span {...cucField('hero.badge')}>{badge}</span>
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400">
            SPECTACLES • ANIMATIONS • TEAM BUILDING
          </span>
        </div>

        <h1
          {...cucField('hero.title')}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
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
          className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
        >
          {subtitle}
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link href={ctaPrimaryLink}>
            <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
              <span {...cucField('hero.cta_primary_text')}>{ctaPrimaryText}</span>
            </TacticalButton>
          </Link>
          {ctaSecondaryText && (
            <Link href={ctaSecondaryLink}>
              <TacticalButton variant="secondary" size="lg">
                <span {...cucField('hero.cta_secondary_text')}>{ctaSecondaryText}</span>
              </TacticalButton>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
