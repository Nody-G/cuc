'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import { Navigation, Car, Train, Plane, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const VisiteAccessTransport: React.FC = () => {
  const t = useTranslations('visiteGuidee');
  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <StuntBadge variant="yellow" icon={<Navigation className="w-3.5 h-3.5" />}>
              {t('accessBadge')}
            </StuntBadge>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
              {t('accessTitle')}
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
              {t('accessIntro')}
            </p>

            <div className="space-y-4 text-xs font-tech text-zinc-300">
              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Car className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    {t('accessCarLabel')}
                  </strong>
                  {t('accessCarBody')}
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Train className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    {t('accessTrainLabel')}
                  </strong>
                  {t('accessTrainBody')}
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Plane className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    {t('accessPlaneLabel')}
                  </strong>
                  {t('accessPlaneBody')}
                </div>
              </div>
            </div>
          </div>

          {/* Adresse & Contact Box */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative">

            <h3 className="text-2xl font-display uppercase text-white mb-4">
              {t('coordinatesTitle')}
            </h3>

            <div className="space-y-3 text-xs font-tech text-zinc-300 mb-6">
              <div>
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  {t('addressLabel')}
                </strong>
                CAMPUS UNIVERS CASCADES
                <br />
                {t('accessAddress')}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/contact-cuc#campus-map-hub"
                    className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase hover:bg-[#FFF04D] transition-colors inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{t('mapRadarLabel')}</span>
                  </Link>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#222230] text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono-tech inline-flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#FFE500]" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>

              <div>
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  {t('standardLabel')}
                </strong>
                {t('phoneLabel')}{' '}
                <a
                  href="tel:+33672849492"
                  className="text-white font-bold hover:text-[#FFE500]"
                >
                  (+33) 06 72 84 94 92
                </a>
                <br />
                {t('emailLabel')}{' '}
                <a
                  href="mailto:contact@campus-universcascades.com"
                  className="text-zinc-400 hover:text-white"
                >
                  contact@campus-universcascades.com
                </a>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  {t('idfLabel')}
                </strong>
                {t('idfValue')}
                <br />
                92230 Gennevilliers
              </div>
            </div>

            <Link href="/contact-cuc?demande=stage-decouverte">
              <TacticalButton variant="primary" size="md" className="w-full">
                {t('accessCta')}
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
