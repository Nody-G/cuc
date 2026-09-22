'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ChevronRight, Layers, Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { cucField } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';
import type { SitePageHero } from '@/lib/data/site-service';

interface HeroStatCopy {
  value: string;
  label: string;
}

interface VisiteHeroSectionProps {
  /** Hero de la page (`site_pages.hero`) — prioritaire sur les libellés traduits. */
  hero?: Partial<SitePageHero>;
}

export const VisiteHeroSection: React.FC<VisiteHeroSectionProps> = ({ hero }) => {
  const t = useTranslations('visite');
  const stats = t.raw('hero.stats') as HeroStatCopy[];

  return (
    <>
      {/* Hero Header */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div data-cuc-field="hero.bg_image" data-cuc-kind="image" className="absolute inset-0 z-0">
          <Image
            src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-campus-2.jpg"
            alt={t('hero.bgAlt')}
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
              <span {...cucMicro('visite.hero.breadcrumbHome')}>{t('hero.breadcrumbHome')}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]" {...cucMicro('visite.hero.breadcrumbCurrent')}>
              {t('hero.breadcrumbCurrent')}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
            <span {...cucField('hero.badge')}>{hero?.badge || t('hero.badge')}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{t('hero.location')}</span>
          </div>

          <h1
            {...cucField('hero.title')}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
          >
            {hero?.title ? (
              hero.title
            ) : (
              <>
                <span {...cucMicro('visite.hero.titleLead')}>{t('hero.titleLead')}</span>{' '}
                <span className="text-[#FFE500]" {...cucMicro('visite.hero.titleAccent')}>
                  {t('hero.titleAccent')}
                </span>
              </>
            )}
          </h1>

          <p
            {...cucField('hero.subtitle', 'textarea')}
            className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
          >
            {hero?.subtitle || t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a href="#installations-detail">
              <TacticalButton
                variant="primary"
                size="lg"
                icon={<Layers className="w-4 h-4 text-black" />}
              >
                <span {...cucField('hero.cta_primary_text')}>
                  {hero?.cta_primary_text || t('hero.ctaFacilities')}
                </span>
              </TacticalButton>
            </a>
            <a href="#visite-virtuelle-360">
              <TacticalButton
                variant="secondary"
                size="lg"
                icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
              >
                <span {...cucField('hero.cta_secondary_text')}>
                  {hero?.cta_secondary_text || t('hero.ctaTour360')}
                </span>
              </TacticalButton>
            </a>
            <a href="#plan-3d-domaine">
              <TacticalButton variant="outline" size="lg">
                <span {...cucMicro('visite.hero.ctaPlan3D')}>{t('hero.ctaPlan3D')}</span>
              </TacticalButton>
            </a>
          </div>
        </div>
      </section>

      {/* Chiffres Clés du Site */}
      <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
        <div className="page-shell">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
            {stats.map((stat, idx) => (
              <div key={idx} className="border-l-2 border-[#FFE500] pl-4">
                <div
                  className={`text-3xl sm:text-4xl font-display ${idx % 2 === 1 ? 'text-[#FFE500]' : 'text-white'
                    }`}
                >
                  {stat.value}
                </div>
                <div className="text-zinc-400 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
