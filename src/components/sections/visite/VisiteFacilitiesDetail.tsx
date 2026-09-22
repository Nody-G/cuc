'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { getCampusFacilities } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { applyFacilityOverlays } from '@/lib/i18n/apply-facility-overlay';
import { InfrastructureSpot } from '@/types';
import { usePageSectionData } from '@/lib/hooks/usePageSectionData';

/**
 * Précharge une image distante dans le cache navigateur (et, en amont, dans le
 * cache de l'optimiseur Next.js via l'URL `/_next/image`). Évite le délai
 * d'environ 1 s constaté lors du changement d'installation : sans préchargement,
 * chaque clic déclenche un aller-retour réseau complet vers le CDN distant.
 */
const preloadImage = (src: string): void => {
  if (typeof window === 'undefined' || !src) return;
  const img = new window.Image();
  img.decoding = 'async';
  img.src = src;
};

/**
 * Résout l'installation à afficher depuis le paramètre d'URL `?installation=<id>`
 * (transmis par la fiche du plan 3D). Retombe sur la première installation si
 * l'identifiant est absent ou inconnu.
 */
const resolveInitialFacilityId = (list: InfrastructureSpot[] = CAMPUS_FACILITIES): string => {
  if (typeof window === 'undefined') return list[0].id;
  const requested = new URLSearchParams(window.location.search).get('installation');
  if (requested && list.some((f) => f.id === requested)) {
    return requested;
  }
  return list[0].id;
};

export const VisiteFacilitiesDetail: React.FC = () => {
  const t = useTranslations('visite');
  const [rawFacilities, setRawFacilities] = useState<InfrastructureSpot[]>(CAMPUS_FACILITIES);
  const [activeFacilityId, setActiveFacilityId] = useState(() => resolveInitialFacilityId(CAMPUS_FACILITIES));

  /**
   * Chrome + correctifs d'installations saisis en place
   * (`sections_data.installations.<clé>` et `.items.<index>`). Les données
   * restent celles de `site_settings`/`campus_facilities` : la saisie prime,
   * le repli reste la donnée.
   */
  const block = usePageSectionData<{
    tag?: string;
    title?: string;
    subtitle?: string;
    specs_label?: string;
    compliance_label?: string;
    items?: Array<{
      name?: string;
      size?: string;
      description?: string;
      image?: string;
      specifications?: string;
      features?: string[];
    }>;
  }>('installations');

  const tag = block?.tag || t('facilitiesTag');
  const title = block?.title || t('facilitiesTitle');
  const subtitle = block?.subtitle || t('facilitiesSubtitle');
  const specsLabel = block?.specs_label || t('facilitiesSpecsLabel');
  const complianceLabel = block?.compliance_label || t('facilitiesComplianceLabel');

  /**
   * Noms, gabarits, descriptions, équipements et normes des installations sont
   * des DONNÉES : l'anglais arrive par l'overlay `campus_facility`, appliqué ici.
   */
  const facilityOverlays = useEntityOverlays('campus_facility');
  const facilityItems = block?.items;
  const facilities = useMemo(() => {
    const merged = applyFacilityOverlays(rawFacilities, facilityOverlays);
    if (!facilityItems || facilityItems.length === 0) return merged;
    return merged.map((facility, index) => {
      const over = facilityItems[index];
      if (!over) return facility;
      return {
        ...facility,
        name: over.name || facility.name,
        size: over.size || facility.size,
        description: over.description || facility.description,
        image: over.image || facility.image,
        specifications: over.specifications || facility.specifications,
        features: over.features?.length ? over.features : facility.features,
      };
    });
  }, [rawFacilities, facilityOverlays, facilityItems]);

  /** Recharge les installations (état initial + synchronisation Realtime). */
  const loadFacilities = useCallback(() => {
    getCampusFacilities().then((data) => {
      if (data && data.length > 0) {
        setRawFacilities(data);
      }
    });
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  // Synchronisation Realtime Cockpit → Vitrine (installations, miroir site_settings).
  useRealtimeRefresh(['site_settings'], loadFacilities);

  // Synchronise la sélection si l'utilisateur arrive avec un autre paramètre
  useEffect(() => {
    const syncFromUrl = () => {
      const requested = new URLSearchParams(window.location.search).get('installation');
      if (requested && facilities.some((f) => f.id === requested)) {
        setActiveFacilityId(requested);
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [facilities]);

  // Précharge toutes les images d'installations dès que la liste est connue.
  // Le changement d'onglet devient instantané (image déjà en cache navigateur
  // et optimiseur Next.js déjà amorcé).
  useEffect(() => {
    facilities.forEach((facility) => preloadImage(facility.image));
  }, [facilities]);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === activeFacilityId) || facilities[0],
    [facilities, activeFacilityId],
  );
  /** Index de l'installation affichée : il porte le chemin éditable du détail. */
  const selectedIndex = facilities.findIndex((f) => f.id === selectedFacility?.id);

  return (
    <section id="installations-detail" className="py-16 scroll-mt-24">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span
            data-cuc-field="sections_data.installations.tag"
            className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2"
          >
            {tag}
          </span>
          <h2
            data-cuc-field="sections_data.installations.title"
            className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3"
          >
            {title}
          </h2>
          <p
            data-cuc-field="sections_data.installations.subtitle"
            className="text-sm font-tech text-zinc-400"
          >
            {subtitle}
          </p>
        </div>

        {/* Selector Grid / Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Selector List */}
          <div className="lg:col-span-4 space-y-2">
            {facilities.map((facility, index) => {
              const isSelected = facility.id === activeFacilityId;
              return (
                <button
                  key={facility.id}
                  onClick={() => setActiveFacilityId(facility.id)}
                  onMouseEnter={() => preloadImage(facility.image)}
                  onFocus={() => preloadImage(facility.image)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-center justify-between ${isSelected
                    ? 'bg-[#14141c] border-[#FFE500] text-white shadow-lg'
                    : 'bg-[#0b0b0f] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`font-mono-tech text-xs font-bold ${isSelected ? 'text-[#FFE500]' : 'text-zinc-500'
                        }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="truncate">
                      <span
                        data-cuc-field={`sections_data.installations.items.${index}.name`}
                        className="font-display uppercase text-sm tracking-wide block truncate"
                      >
                        {facility.name}
                      </span>
                      <span
                        data-cuc-field={`sections_data.installations.items.${index}.size`}
                        className="text-[10px] font-mono-tech text-zinc-500 block truncate"
                      >
                        {facility.size}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FFE500] translate-x-1' : 'text-zinc-600'
                      }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Detail Display */}
          <div className="lg:col-span-8 bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 relative">
            {/* Facility Image — `loading="eager"` + préchargement amont : le
                changement d'installation est instantané (aucun aller-retour
                réseau au clic). */}
            <div
              data-cuc-field={`sections_data.installations.items.${selectedIndex}.image`}
              data-cuc-kind="image"
              className="relative h-72 sm:h-96 w-full mb-6 border border-zinc-800 overflow-hidden bg-black"
            >
              <Image
                key={selectedFacility.id}
                src={selectedFacility.image}
                alt={selectedFacility.name}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover object-center"
                style={{ animation: 'cuc-fade-in 300ms ease-out both' }}
              />
            </div>

            <h3
              data-cuc-field={`sections_data.installations.items.${selectedIndex}.name`}
              className="text-2xl sm:text-3xl font-display uppercase text-white mb-2"
            >
              {selectedFacility.name}
            </h3>
            <p
              data-cuc-field={`sections_data.installations.items.${selectedIndex}.description`}
              className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6"
            >
              {selectedFacility.description}
            </p>

            <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs font-tech">
              <div>
                <strong
                  data-cuc-field="sections_data.installations.specs_label"
                  className="text-[#FFE500] font-mono-tech block mb-2 uppercase"
                >
                  {specsLabel}
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFacility.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                      <span
                        data-cuc-field={`sections_data.installations.items.${selectedIndex}.features.${idx}`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-zinc-800 text-zinc-400">
                <strong
                  data-cuc-field="sections_data.installations.compliance_label"
                  className="text-zinc-300 font-mono-tech text-[11px] block uppercase mb-0.5"
                >
                  {complianceLabel}
                </strong>
                <span
                  data-cuc-field={`sections_data.installations.items.${selectedIndex}.specifications`}
                >
                  {selectedFacility.specifications}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
