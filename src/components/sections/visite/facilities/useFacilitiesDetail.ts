'use client';

/**
 * Orchestration de la section « installations » : chargement (repli certifié
 * `CAMPUS_FACILITIES`), overlays EN, correctifs éditoriaux en place, RealTime
 * `site_settings`, synchronisation de la sélection avec l'URL et préchargement
 * des visuels.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { getCampusFacilities } from '@/lib/data/site-service';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { usePageSectionData } from '@/lib/hooks/usePageSectionData';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { applyFacilityOverlays } from '@/lib/i18n/apply-facility-overlay';
import type { InfrastructureSpot } from '@/types';
import {
    InstallationsBlock,
    mergeFacilityEdits,
    preloadImage,
    resolveInitialFacilityId,
} from './facilities-model';

export interface FacilitiesDetailChrome {
    tag: string;
    title: string;
    subtitle: string;
    specsLabel: string;
    complianceLabel: string;
}

export interface FacilitiesDetail {
    chrome: FacilitiesDetailChrome;
    facilities: InfrastructureSpot[];
    activeFacilityId: string;
    selectFacility: (id: string) => void;
    selectedFacility: InfrastructureSpot;
    selectedIndex: number;
    preload: (src: string) => void;
}

export function useFacilitiesDetail(): FacilitiesDetail {
    const t = useTranslations('visite');
    const [rawFacilities, setRawFacilities] = useState<InfrastructureSpot[]>(CAMPUS_FACILITIES);
    const [activeFacilityId, setActiveFacilityId] = useState(() =>
        resolveInitialFacilityId(CAMPUS_FACILITIES)
    );

    /**
     * Chrome + correctifs d'installations saisis en place
     * (`sections_data.installations.<clé>` et `.items.<index>`). Les données
     * restent celles de `site_settings`/`campus_facilities` : la saisie prime,
     * le repli reste la donnée.
     */
    const block = usePageSectionData<InstallationsBlock>('installations');

    const chrome: FacilitiesDetailChrome = {
        tag: block?.tag || t('facilitiesTag'),
        title: block?.title || t('facilitiesTitle'),
        subtitle: block?.subtitle || t('facilitiesSubtitle'),
        specsLabel: block?.specs_label || t('facilitiesSpecsLabel'),
        complianceLabel: block?.compliance_label || t('facilitiesComplianceLabel'),
    };

    /**
     * Noms, gabarits, descriptions, équipements et normes des installations sont
     * des DONNÉES : l'anglais arrive par l'overlay `campus_facility`, appliqué ici.
     */
    const facilityOverlays = useEntityOverlays('campus_facility');
    const facilityItems = block?.items;
    const facilities = useMemo(() => {
        const merged = applyFacilityOverlays(rawFacilities, facilityOverlays);
        return mergeFacilityEdits(merged, facilityItems);
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
        [facilities, activeFacilityId]
    );

    /** Index de l'installation affichée : il porte le chemin éditable du détail. */
    const selectedIndex = facilities.findIndex((f) => f.id === selectedFacility?.id);

    return {
        chrome,
        facilities,
        activeFacilityId,
        selectFacility: setActiveFacilityId,
        selectedFacility,
        selectedIndex,
        preload: preloadImage,
    };
}
