'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { cucMicro } from '@/lib/preview/cuc-micro';

export const EventsPartnersBanners: React.FC = () => {
  const t = useTranslations('eventsAgence');
  return (
    <>
      {/* ILS NOUS ONT FAIT CONFIANCE (BANDES LOGOS) */}
      <section className="py-16 bg-[#09090d] border-t border-zinc-800">
        <div className="page-shell">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <StuntBadge variant="yellow">
                <span {...cucMicro('eventsAgence.partnersBadge')}>{t('partnersBadge')}</span>
              </StuntBadge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              <span {...cucMicro('eventsAgence.partnersTitle')}>{t('partnersTitle')}</span>
            </h2>
          </div>

          {/* Authentic Brand Logo Strips directly from the live site */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-1.png"
                alt="Partenaires CUC Bande 1"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-2.webp"
                alt="Partenaires CUC Bande 2"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-3.webp"
                alt="Partenaires CUC Bande 3"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
