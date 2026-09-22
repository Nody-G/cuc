'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import React from 'react';
import Image from 'next/image';

import { Award, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';

import { SitePageHero } from '@/lib/data/site-service';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface FormationHeroSectionProps {
  onApply: (programId: string) => void;
  heroData?: Partial<SitePageHero>;
}

export const FormationHeroSection: React.FC<FormationHeroSectionProps> = ({
  onApply,
  heroData,
}) => {
  const t = useTranslations('formation');

  return (
    <>
      {/* Page Header Hero */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div data-cuc-field="hero.bg_image" data-cuc-kind="image" className="absolute inset-0 z-0">
          <Image
            src={heroData?.bg_image || "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-7-scaled.jpg"}
            alt={t('hero.imageAlt')}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-40 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
        </div>

        <div className="relative z-10 page-shell">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              <span {...cucMicro('formation.hero.breadcrumbHome')}>{t('hero.breadcrumbHome')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]" {...cucMicro('formation.hero.breadcrumbCurrent')}>
              {t('hero.breadcrumbCurrent')}
            </span>
          </div>

          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo CUC"
                width={36}
                height={36}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
              />
            </div>
            <StuntBadge variant="yellow" icon={<Award className="w-3.5 h-3.5" />}>
              <span data-cuc-field="hero.badge" data-cuc-kind="text">
                {heroData?.badge || t('hero.badge')}
              </span>
            </StuntBadge>
            <span
              data-cuc-field="hero.meta"
              data-cuc-kind="text"
              className="text-xs font-mono-tech text-zinc-400 hidden sm:inline"
            >
              {heroData?.meta || 'AFDAS 100% • FRANCE TRAVAIL'}
            </span>
          </div>

          <h1
            data-cuc-field="hero.title"
            data-cuc-kind="text"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
          >
            {heroData?.title ? (
              <span>{heroData.title}</span>
            ) : (
              <>{t('hero.titleLead')} <span className="text-[#FFE500]">{t('hero.titleHighlight')}</span></>
            )}
          </h1>

          <p
            data-cuc-field="hero.subtitle"
            data-cuc-kind="textarea"
            className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
          >
            {heroData?.subtitle || t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <TacticalButton
              variant="primary"
              size="lg"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => onApply('pro-longue-duree')}
            >
              <span data-cuc-field="hero.cta_primary_text" data-cuc-kind="text">
                {heroData?.cta_primary_text || t('ctaApplyPro')}
              </span>
            </TacticalButton>
            <TacticalButton
              variant="secondary"
              size="lg"
              onClick={() => onApply('stage-decouverte')}
            >
              <span data-cuc-field="hero.cta_secondary_text" data-cuc-kind="text">
                {heroData?.cta_secondary_text || t('hero.ctaDiscovery')}
              </span>
            </TacticalButton>
            <a
              href="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
              title={t('hero.certificateTitle')}
            >
              <Image
                src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Encart-plaquette.png"
                alt={t('hero.brochureAlt')}
                width={240}
                height={50}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Chiffres clés & indicateurs */}
      <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
        <div className="page-shell">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-white">
                720H
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                <span {...cucMicro('formation.stats.practiceLabel')}>{t('stats.practiceLabel')}</span>
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                224
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                <span {...cucMicro('formation.stats.graduatesLabel')}>{t('stats.graduatesLabel')}</span>
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-white">
                100%
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                <span {...cucMicro('formation.stats.satisfactionLabel')}>
                  {t('stats.satisfactionLabel')}
                </span>
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                {t('stats.since')}
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                <span {...cucMicro('formation.stats.referenceLabel')}>{t('stats.referenceLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
