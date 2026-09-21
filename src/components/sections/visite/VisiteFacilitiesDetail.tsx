'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { getCampusFacilities } from '@/lib/data/site-service';
import { InfrastructureSpot } from '@/types';

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
  const [facilities, setFacilities] = useState<InfrastructureSpot[]>(CAMPUS_FACILITIES);
  const [activeFacilityId, setActiveFacilityId] = useState(() => resolveInitialFacilityId(CAMPUS_FACILITIES));

  useEffect(() => {
    getCampusFacilities().then((data) => {
      if (data && data.length > 0) {
        setFacilities(data);
      }
    });
  }, []);

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

  return (
    <section id="installations-detail" className="py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
            {t('facilitiesTag')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
            {t('facilitiesTitle')}
          </h2>
          <p className="text-sm font-tech text-zinc-400">
            {t('facilitiesSubtitle')}
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
                      <span className="font-display uppercase text-sm tracking-wide block truncate">
                        {facility.name}
                      </span>
                      <span className="text-[10px] font-mono-tech text-zinc-500 block truncate">
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
            <div className="relative h-72 sm:h-96 w-full mb-6 border border-zinc-800 overflow-hidden bg-black">
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

            <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
              {selectedFacility.name}
            </h3>
            <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
              {selectedFacility.description}
            </p>

            <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs font-tech">
              <div>
                <strong className="text-[#FFE500] font-mono-tech block mb-2 uppercase">
                  Spécifications &amp; Équipements Clés :
                </strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFacility.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FFE500] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-zinc-800 text-zinc-400">
                <strong className="text-zinc-300 font-mono-tech text-[11px] block uppercase mb-0.5">
                  Conformité &amp; Normes :
                </strong>
                {selectedFacility.specifications}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
