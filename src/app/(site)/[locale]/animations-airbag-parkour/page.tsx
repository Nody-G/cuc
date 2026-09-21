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
  Flame,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function AnimationsAirbagParkourPage() {
  const t = useTranslations('animations');
  const { content } = usePageDynamicContent('animations-airbag-parkour');
  const includedItems = t.raw('includedItems') as string[];

  const heroBadge = content.hero?.badge || t('heroBadge');
  const heroTitle = content.hero?.title || t('heroTitle');
  const heroSubtitle = content.hero?.subtitle || t('heroSubtitle');
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/xtrem-jump-1.png';
  const ctaPrimaryText = content.hero?.cta_primary_text || t('ctaPrimaryText');
  const ctaPrimaryLink = content.hero?.cta_primary_link || '/contact-cuc';
  const ctaSecondaryText = content.hero?.cta_secondary_text || t('ctaSecondaryText');
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/cuc-events-agence';

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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                {t('breadcrumbHome')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <Link href="/cuc-events-agence" className="hover:text-[#FFE500] transition-colors">
                {t('breadcrumbEvents')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">{t('breadcrumbCurrent')}</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Flame className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                {t('heroMeta')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              {heroTitle.includes('&') ? (
                <>
                  {heroTitle.split('&')[0]} &amp;{' '}
                  <span className="text-[#FFE500]">{heroTitle.split('&')[1]}</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  {ctaPrimaryText}
                </TacticalButton>
              </Link>
              {ctaSecondaryText && (
                <Link href={ctaSecondaryLink}>
                  <TacticalButton variant="secondary" size="lg">
                    {ctaSecondaryText}
                  </TacticalButton>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Chiffres Clés Airbag */}
        <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-white">+20 000</div>
                <div className="text-zinc-400 uppercase">{t('stat1Label')}</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">{t('stat2Value')}</div>
                <div className="text-zinc-400 uppercase">{t('stat2Label')}</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-white">100%</div>
                <div className="text-zinc-400 uppercase">{t('stat3Label')}</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">2009</div>
                <div className="text-zinc-400 uppercase">{t('stat4Label')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contenu Détaillé */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0e0e14] border-2 border-zinc-800 p-6 sm:p-10 relative">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src="/images/logos/cuc-logo-yellow.png"
                      alt={t('logoAlt')}
                      width={44}
                      height={44}
                      className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.3)]"
                    />
                    <div>
                      <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-wider uppercase block">
                        CUC EVENTS ANIMATIONS
                      </span>
                      <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">
                        XTREM JUMP AIRBAG CINÉMA &amp; PARKOUR
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display uppercase text-white">
                    {t('panelTitle')}
                  </h2>

                  <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                    {t('panelParagraph1')}
                  </p>

                  <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed">
                    {t('panelParagraph2')}
                  </p>

                  <div className="p-4 bg-[#14141c] border border-zinc-800 space-y-2 text-xs font-tech">
                    <strong className="text-[#FFE500] font-mono-tech block uppercase">
                      {t('includedTitle')}
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                      {includedItems.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  <div className="relative h-80 sm:h-[450px] w-full border border-zinc-800 overflow-hidden bg-black shadow-2xl">
                    <Image
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/xtrem-jump-1.png"
                      alt={t('panelImageAlt')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center"
                    />
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
