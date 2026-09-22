'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import { Navigation, Car, Train, Plane, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { usePageSectionData } from '@/lib/hooks/usePageSectionData';

/**
 * Bloc « accès & transport » : chaque libellé est éditable en place
 * (`sections_data.access_transport.<clé>`) et retombe sur sa traduction ; les
 * coordonnées brutes (téléphone, e-mail, adresse) ont pour repli la valeur
 * certifiée du campus.
 */
interface AccessTransportBlock {
  access_badge?: string;
  access_title?: string;
  access_intro?: string;
  access_car_label?: string;
  access_car_body?: string;
  access_train_label?: string;
  access_train_body?: string;
  access_plane_label?: string;
  access_plane_body?: string;
  coordinates_title?: string;
  address_label?: string;
  campus_name?: string;
  campus_address?: string;
  map_radar_label?: string;
  map_external_label?: string;
  standard_label?: string;
  phone_label?: string;
  phone_display?: string;
  phone_href?: string;
  email_label?: string;
  email_address?: string;
  email_href?: string;
  idf_label?: string;
  idf_value?: string;
  idf_zip?: string;
  access_cta?: string;
}

export const VisiteAccessTransport: React.FC = () => {
  const t = useTranslations('visiteGuidee');
  const block = usePageSectionData<AccessTransportBlock>('access_transport');

  const accessBadge = block?.access_badge || t('accessBadge');
  const accessTitle = block?.access_title || t('accessTitle');
  const accessIntro = block?.access_intro || t('accessIntro');
  const accessCarLabel = block?.access_car_label || t('accessCarLabel');
  const accessCarBody = block?.access_car_body || t('accessCarBody');
  const accessTrainLabel = block?.access_train_label || t('accessTrainLabel');
  const accessTrainBody = block?.access_train_body || t('accessTrainBody');
  const accessPlaneLabel = block?.access_plane_label || t('accessPlaneLabel');
  const accessPlaneBody = block?.access_plane_body || t('accessPlaneBody');
  const coordinatesTitle = block?.coordinates_title || t('coordinatesTitle');
  const addressLabel = block?.address_label || t('addressLabel');
  const campusName = block?.campus_name || 'CAMPUS UNIVERS CASCADES';
  const campusAddress = block?.campus_address || t('accessAddress');
  const mapRadarLabel = block?.map_radar_label || t('mapRadarLabel');
  const mapExternalLabel = block?.map_external_label || 'Google Maps';
  const standardLabel = block?.standard_label || t('standardLabel');
  const phoneLabel = block?.phone_label || t('phoneLabel');
  const phoneDisplay = block?.phone_display || '(+33) 06 72 84 94 92';
  const phoneHref = block?.phone_href || 'tel:+33672849492';
  const emailLabel = block?.email_label || t('emailLabel');
  const emailAddress = block?.email_address || 'contact@campus-universcascades.com';
  const emailHref = block?.email_href || 'mailto:contact@campus-universcascades.com';
  const idfLabel = block?.idf_label || t('idfLabel');
  const idfValue = block?.idf_value || t('idfValue');
  const idfZip = block?.idf_zip || '92230 Gennevilliers';
  const accessCta = block?.access_cta || t('accessCta');

  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <StuntBadge variant="yellow" icon={<Navigation className="w-3.5 h-3.5" />}>
              <span data-cuc-field="sections_data.access_transport.access_badge">
                {accessBadge}
              </span>
            </StuntBadge>
            <h2
              data-cuc-field="sections_data.access_transport.access_title"
              className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4"
            >
              {accessTitle}
            </h2>
            <p
              data-cuc-field="sections_data.access_transport.access_intro"
              className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6"
            >
              {accessIntro}
            </p>

            <div className="space-y-4 text-xs font-tech text-zinc-300">
              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Car className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong
                    data-cuc-field="sections_data.access_transport.access_car_label"
                    className="text-white font-mono-tech block mb-0.5"
                  >
                    {accessCarLabel}
                  </strong>
                  <span data-cuc-field="sections_data.access_transport.access_car_body">
                    {accessCarBody}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Train className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong
                    data-cuc-field="sections_data.access_transport.access_train_label"
                    className="text-white font-mono-tech block mb-0.5"
                  >
                    {accessTrainLabel}
                  </strong>
                  <span data-cuc-field="sections_data.access_transport.access_train_body">
                    {accessTrainBody}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Plane className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong
                    data-cuc-field="sections_data.access_transport.access_plane_label"
                    className="text-white font-mono-tech block mb-0.5"
                  >
                    {accessPlaneLabel}
                  </strong>
                  <span data-cuc-field="sections_data.access_transport.access_plane_body">
                    {accessPlaneBody}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Adresse & Contact Box */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative">

            <h3
              data-cuc-field="sections_data.access_transport.coordinates_title"
              className="text-2xl font-display uppercase text-white mb-4"
            >
              {coordinatesTitle}
            </h3>

            <div className="space-y-3 text-xs font-tech text-zinc-300 mb-6">
              <div>
                <strong
                  data-cuc-field="sections_data.access_transport.address_label"
                  className="text-[#FFE500] font-mono-tech block uppercase"
                >
                  {addressLabel}
                </strong>
                <span data-cuc-field="sections_data.access_transport.campus_name">
                  {campusName}
                </span>
                <br />
                <span data-cuc-field="sections_data.access_transport.campus_address">
                  {campusAddress}
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/contact-cuc#campus-map-hub"
                    className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase hover:bg-[#FFF04D] transition-colors inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span data-cuc-field="sections_data.access_transport.map_radar_label">
                      {mapRadarLabel}
                    </span>
                  </Link>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#222230] text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono-tech inline-flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#FFE500]" />
                    <span data-cuc-field="sections_data.access_transport.map_external_label">
                      {mapExternalLabel}
                    </span>
                  </a>
                </div>
              </div>

              <div>
                <strong
                  data-cuc-field="sections_data.access_transport.standard_label"
                  className="text-[#FFE500] font-mono-tech block uppercase"
                >
                  {standardLabel}
                </strong>
                <span data-cuc-field="sections_data.access_transport.phone_label">
                  {phoneLabel}
                </span>{' '}
                <a
                  href={phoneHref}
                  className="text-white font-bold hover:text-[#FFE500]"
                >
                  <span data-cuc-field="sections_data.access_transport.phone_display">
                    {phoneDisplay}
                  </span>
                </a>
                <br />
                <span data-cuc-field="sections_data.access_transport.email_label">
                  {emailLabel}
                </span>{' '}
                <a
                  href={emailHref}
                  className="text-zinc-400 hover:text-white"
                >
                  <span data-cuc-field="sections_data.access_transport.email_address">
                    {emailAddress}
                  </span>
                </a>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <strong
                  data-cuc-field="sections_data.access_transport.idf_label"
                  className="text-[#FFE500] font-mono-tech block uppercase"
                >
                  {idfLabel}
                </strong>
                <span data-cuc-field="sections_data.access_transport.idf_value">
                  {idfValue}
                </span>
                <br />
                <span data-cuc-field="sections_data.access_transport.idf_zip">
                  {idfZip}
                </span>
              </div>
            </div>

            <Link href="/contact-cuc?demande=stage-decouverte">
              <TacticalButton variant="primary" size="md" className="w-full">
                <span data-cuc-field="sections_data.access_transport.access_cta">
                  {accessCta}
                </span>
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
