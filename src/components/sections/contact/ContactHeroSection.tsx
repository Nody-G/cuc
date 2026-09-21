'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Phone, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';

import { SitePageHero } from '@/lib/data/site-service';

interface ContactHeroSectionProps {
  heroData?: Partial<SitePageHero>;
}

export const ContactHeroSection: React.FC<ContactHeroSectionProps> = ({ heroData }) => {
  const t = useTranslations('contact.hero');
  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroData?.bg_image || "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-7-scaled.jpg"}
          alt={t('imageAlt')}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-35 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
          <Link href="/" className="hover:text-[#FFE500] transition-colors">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FFE500]">{t('breadcrumbCurrent')}</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Phone className="w-3.5 h-3.5" />}>
            {heroData?.badge || t('badge')}
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400">
            {t('locationLabel')}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
          {heroData?.title ? (
            <span>{heroData.title}</span>
          ) : (
            <>
              {t('titleLine')}{' '}
              <span className="text-[#FFE500]">{t('titleAccent')}</span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
          {heroData?.subtitle || t('subtitle')}
        </p>
      </div>
    </section>
  );
};
