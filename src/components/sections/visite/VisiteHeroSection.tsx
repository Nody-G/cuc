'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ChevronRight, Layers, Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

interface HeroStatCopy {
  value: string;
  label: string;
}

export const VisiteHeroSection: React.FC = () => {
  const t = useTranslations('visite');
  const stats = t.raw('hero.stats') as HeroStatCopy[];

  return (
    <>
      {/* Hero Header */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
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
              {t('hero.breadcrumbHome')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">{t('hero.breadcrumbCurrent')}</span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
            <span>{t('hero.badge')}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{t('hero.location')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
            {t('hero.titleLead')} <span className="text-[#FFE500]">{t('hero.titleAccent')}</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a href="#installations-detail">
              <TacticalButton
                variant="primary"
                size="lg"
                icon={<Layers className="w-4 h-4 text-black" />}
              >
                {t('hero.ctaFacilities')}
              </TacticalButton>
            </a>
            <a href="#visite-virtuelle-360">
              <TacticalButton
                variant="secondary"
                size="lg"
                icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
              >
                {t('hero.ctaTour360')}
              </TacticalButton>
            </a>
            <a href="#plan-3d-domaine">
              <TacticalButton variant="outline" size="lg">
                {t('hero.ctaPlan3D')}
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
