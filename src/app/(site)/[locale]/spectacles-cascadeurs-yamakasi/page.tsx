'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { withContactIntent } from '@/lib/contact-intent';
import { SPECTACLE_TYPES, SpectacleTypeCard } from '@/components/sections/events/spectacles';

export default function SpectaclesCascadeursYamakasiPage() {
  const t = useTranslations('spectacles');
  const { content } = usePageDynamicContent('spectacles-cascadeurs-yamakasi');

  const heroBadge = content.hero?.badge || t('heroBadge');
  const heroTitle = content.hero?.title || t('heroTitle');
  const heroSubtitle = content.hero?.subtitle || t('heroSubtitle');
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.webp';
  const ctaPrimaryText = content.hero?.cta_primary_text || t('ctaPrimaryText');
  /** CTA spectacles → page contact, pré-remplie « devis CUC Events ». */
  const ctaPrimaryLink = withContactIntent(
    content.hero?.cta_primary_link || '/contact-cuc',
    'cuc-events'
  );
  const ctaSecondaryText = content.hero?.cta_secondary_text || t('ctaSecondaryText');
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/videos-cascadeur';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
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
                <span {...cucMicro('spectacles.breadcrumbHome')}>{t('breadcrumbHome')}</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <Link href="/cuc-events-agence" className="hover:text-[#FFE500] transition-colors">
                <span {...cucMicro('spectacles.breadcrumbEvents')}>{t('breadcrumbEvents')}</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]" {...cucMicro('spectacles.breadcrumbCurrent')}>
                {t('breadcrumbCurrent')}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
                <span data-cuc-field="hero.badge" data-cuc-kind="text">
                  {heroBadge}
                </span>
              </StuntBadge>
              <span
                data-cuc-field="hero.meta"
                data-cuc-kind="text"
                className="text-xs font-mono-tech text-zinc-400"
              >
                {content.hero?.meta || t('heroMeta')}
              </span>
            </div>

            <h1
              data-cuc-field="hero.title"
              data-cuc-kind="text"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
            >
              {heroTitle.includes('&') ? (
                <>
                  {heroTitle.split('&')[0]} &amp;{' '}
                  <span className="text-[#FFE500]">{heroTitle.split('&')[1]}</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>

            <p
              data-cuc-field="hero.subtitle"
              data-cuc-kind="textarea"
              className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
            >
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  <span data-cuc-field="hero.cta_primary_text" data-cuc-kind="text">
                    {ctaPrimaryText}
                  </span>
                </TacticalButton>
              </Link>
              {ctaSecondaryText && (
                <Link href={ctaSecondaryLink}>
                  <TacticalButton variant="secondary" size="lg">
                    <span data-cuc-field="hero.cta_secondary_text" data-cuc-kind="text">
                      {ctaSecondaryText}
                    </span>
                  </TacticalButton>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Catalogue des Spectacles CUC */}
        <section className="py-16">
          <div className="page-shell space-y-12">
            <div className="text-center max-w-3xl mx-auto mb-6">
              <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
                Formats &amp; Répertoires de Scène
              </span>
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white">
                Nos Spectacles &amp; Démonstrations en Direct
              </h2>
              <p className="text-sm font-tech text-zinc-400 mt-2">
                Du grand show en arène aux tableaux historiques immersifs, chaque spectacle est entièrement conçu, sécurisé et interprété par les cascadeurs professionnels du CUC.
              </p>
            </div>

            {/* Liste des blocs de spectacles dédiés */}
            {SPECTACLE_TYPES.map((spectacle, index) => (
              <SpectacleTypeCard
                key={spectacle.id}
                item={spectacle}
                reversed={index % 2 === 1}
              />
            ))}

            {/* Référence Prestige : Accor Arena */}
            <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-10 relative shadow-[0_0_30px_rgba(255,229,0,0.1)] mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 relative">
                  <div className="relative h-72 w-full border border-zinc-700 overflow-hidden bg-black">
                    <Image
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.webp"
                      alt={t('arenaImageAlt')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <StuntBadge variant="yellow" icon={<Award className="w-3.5 h-3.5" />}>
                      <span {...cucMicro('spectacles.arenaBadge')}>{t('arenaBadge')}</span>
                    </StuntBadge>
                    <span className="text-xs font-mono-tech text-zinc-400">ACCOR ARENA • PARIS</span>
                  </div>

                  <h3 className="text-3xl font-display uppercase text-white">
                    <span {...cucMicro('spectacles.arenaTitle')}>{t('arenaTitle')}</span>
                  </h3>

                  <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                    <span {...cucMicro('spectacles.arenaParagraph')}>{t('arenaParagraph')}</span>
                  </p>

                  <div className="pt-2">
                    <Link href="/contact-cuc?demande=cuc-events">
                      <TacticalButton variant="primary" size="md">
                        <span {...cucMicro('spectacles.arenaCta')}>{t('arenaCta')}</span>
                      </TacticalButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
