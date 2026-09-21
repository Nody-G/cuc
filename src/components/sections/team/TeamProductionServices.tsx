'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import { TacticalButton } from '@/components/ui/TacticalButton';

interface ServiceItemCopy {
  label: string;
  body: string;
}

export const TeamProductionServices: React.FC = () => {
  const t = useTranslations('teamProduction');
  const items = t.raw('services.items') as ServiceItemCopy[];

  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
              {t('services.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-4">
              {t('services.title')}
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
              {t('services.intro')}
            </p>

            <div className="space-y-3 text-xs font-tech text-zinc-300">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#14141c] border border-zinc-800">
                  <strong className="text-[#FFE500] font-mono-tech block mb-1">
                    {item.label}
                  </strong>
                  {item.body}
                </div>
              ))}
            </div>
          </div>

          {/* Callout contact production */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative shadow-xl">

            <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
              {t('services.contactTitle')}
            </h3>
            <p className="text-xs font-tech text-zinc-400 mb-6">
              {t('services.contactIntro')}
            </p>

            <div className="space-y-3 text-xs font-mono-tech text-zinc-300 mb-6">
              <div>
                <span className="text-[#FFE500] block">{t('services.coordinatorLabel')}</span>
                {t('services.coordinatorValue')}
              </div>
              <div>
                <span className="text-[#FFE500] block">{t('services.phoneLabel')}</span>
                <a href="tel:+33672849492" className="text-white hover:text-[#FFE500]">06 72 84 94 92</a>
              </div>
              <div>
                <span className="text-[#FFE500] block">{t('services.emailLabel')}</span>
                <a href="mailto:contact@campus-universcascades.com" className="text-zinc-400 hover:text-white">
                  contact@campus-universcascades.com
                </a>
              </div>
            </div>

            <Link href="/contact-cuc?demande=tournage-production">
              <TacticalButton variant="primary" size="md" className="w-full">
                {t('services.cta')}
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
