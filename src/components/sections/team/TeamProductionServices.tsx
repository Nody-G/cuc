'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import { TacticalButton } from '@/components/ui/TacticalButton';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';
import { cucField, itemPath } from '@/lib/preview/cuc-field';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface ServiceItemCopy {
  label: string;
  body: string;
}

export const TeamProductionServices: React.FC = () => {
  const t = useTranslations('teamProduction');
  const items = t.raw('services.items') as ServiceItemCopy[];

  /**
   * Textes éditables en place : données de page prioritaires
   * (`sections_data.services_production.*`), repli traduit conservé.
   */
  const block = usePageSectionData<{
    badge?: string;
    title?: string;
    intro?: string;
    contact_title?: string;
    contact_intro?: string;
    cta?: string;
    items?: Array<Partial<ServiceItemCopy>>;
  }>('services_production');
  const serviceItems = mergeSectionItems(items, block ? { items: block.items } : null);

  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span
              {...cucField('sections_data.services_production.badge')}
              className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1.5"
            >
              {block?.badge || t('services.badge')}
            </span>
            <h2
              {...cucField('sections_data.services_production.title')}
              className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-wide text-white mb-4"
            >
              {block?.title || t('services.title')}
            </h2>
            <p
              {...cucField('sections_data.services_production.intro', 'textarea')}
              className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6"
            >
              {block?.intro || t('services.intro')}
            </p>

            <div className="space-y-3 text-xs font-tech text-zinc-300">
              {serviceItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#14141c] border border-zinc-800">
                  <strong
                    {...cucField(itemPath('services_production', idx, 'label'))}
                    className="text-[#FFE500] font-mono-tech block mb-1"
                  >
                    {item.label}
                  </strong>
                  <span {...cucField(itemPath('services_production', idx, 'body'), 'textarea')}>
                    {item.body}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Callout contact production */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative shadow-xl">

            <h3
              {...cucField('sections_data.services_production.contact_title')}
              className="text-2xl sm:text-3xl font-display uppercase text-white mb-2"
            >
              {block?.contact_title || t('services.contactTitle')}
            </h3>
            <p
              {...cucField('sections_data.services_production.contact_intro', 'textarea')}
              className="text-xs font-tech text-zinc-400 mb-6"
            >
              {block?.contact_intro || t('services.contactIntro')}
            </p>

            <div className="space-y-3 text-xs font-mono-tech text-zinc-300 mb-6">
              <div>
                <span
                  className="text-[#FFE500] block"
                  {...cucMicro('teamProduction.services.coordinatorLabel')}
                >
                  {t('services.coordinatorLabel')}
                </span>
                <span {...cucMicro('teamProduction.services.coordinatorValue')}>
                  {t('services.coordinatorValue')}
                </span>
              </div>
              <div>
                <span
                  className="text-[#FFE500] block"
                  {...cucMicro('teamProduction.services.phoneLabel')}
                >
                  {t('services.phoneLabel')}
                </span>
                <a href="tel:+33672849492" className="text-white hover:text-[#FFE500]">06 72 84 94 92</a>
              </div>
              <div>
                <span
                  className="text-[#FFE500] block"
                  {...cucMicro('teamProduction.services.emailLabel')}
                >
                  {t('services.emailLabel')}
                </span>
                <a href="mailto:contact@campus-universcascades.com" className="text-zinc-400 hover:text-white">
                  contact@campus-universcascades.com
                </a>
              </div>
            </div>

            <Link href="/contact-cuc?demande=tournage-production">
              <TacticalButton variant="primary" size="md" className="w-full">
                <span {...cucField('sections_data.services_production.cta')}>
                  {block?.cta || t('services.cta')}
                </span>
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
