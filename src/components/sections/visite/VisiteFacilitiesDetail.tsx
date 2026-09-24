'use client';

import React from 'react';
import { FacilityDetailPanel } from './facilities/FacilityDetailPanel';
import { FacilitiesHeader } from './facilities/FacilitiesHeader';
import { FacilitiesSelector } from './facilities/FacilitiesSelector';
import { useFacilitiesDetail } from './facilities/useFacilitiesDetail';

/**
 * Section « installations » de la visite guidée — **façade de composition**.
 *
 * Domaine et orchestration dans `facilities/` : `facilities-model.ts` (bloc
 * éditable, préchargement, résolution `?installation=`), `useFacilitiesDetail`
 * (chargement, overlays EN, Realtime, sélection) puis deux blocs de présentation
 * (`FacilitiesHeader`, `FacilitiesSelector`, `FacilityDetailPanel`).
 */
export const VisiteFacilitiesDetail: React.FC = () => {
  const {
    chrome,
    facilities,
    activeFacilityId,
    selectFacility,
    selectedFacility,
    selectedIndex,
    preload,
  } = useFacilitiesDetail();

  return (
    <section id="installations-detail" className="py-16 scroll-mt-24">
      <div className="page-shell">
        <FacilitiesHeader
          tag={chrome.tag}
          title={chrome.title}
          subtitle={chrome.subtitle}
        />

        {/* Selector Grid / Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <FacilitiesSelector
            facilities={facilities}
            activeFacilityId={activeFacilityId}
            onSelect={selectFacility}
            onPreload={preload}
          />

          <FacilityDetailPanel
            facility={selectedFacility}
            index={selectedIndex}
            specsLabel={chrome.specsLabel}
            complianceLabel={chrome.complianceLabel}
          />
        </div>
      </div>
    </section>
  );
};
