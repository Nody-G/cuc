'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CUC_PARTNERS } from '../partenaires.data';
import { getPartners, type SitePartner } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { createPartnerLocalizer, type PartnerCopy, type PartnerLocalizer } from './partner-localization';

export interface PartnersGridController {
    localizer: PartnerLocalizer;
    failedImages: Record<string, boolean>;
    markImageFailed: (id: string) => void;
    /** Partenaires CMS catégorie `cinema` absents du catalogue certifié. */
    additionalCinemaPartners: SitePartner[];
    /** Autres partenaires CMS absents du catalogue certifié. */
    additionalOtherPartners: SitePartner[];
}

/**
 * Chargement et dédoublonnage des partenaires : catalogue certifié
 * `CUC_PARTNERS` + fiches du CMS (`site_partners`), avec synchronisation
 * Realtime Cockpit → Vitrine.
 */
export function usePartnersGrid(partnerCopy: PartnerCopy[]): PartnersGridController {
    const [dbPartners, setDbPartners] = useState<SitePartner[]>([]);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    const localizer = useMemo(() => createPartnerLocalizer(partnerCopy), [partnerCopy]);

    /** Recharge les partenaires du CMS (état initial + synchronisation Realtime). */
    const loadPartners = useCallback(() => {
        getPartners().then((parts) => {
            if (parts && parts.length > 0) {
                setDbPartners(parts);
            }
        });
    }, []);

    useEffect(() => {
        loadPartners();
    }, [loadPartners]);

    // Synchronisation Realtime Cockpit → Vitrine (partenaires additionnels).
    useRealtimeRefresh(['site_partners'], loadPartners);

    const markImageFailed = useCallback((id: string) => {
        setFailedImages((prev) => ({ ...prev, [id]: true }));
    }, []);

    // Dédupliquer les partenaires du CMS par rapport à CUC_PARTNERS (base certifiée)
    const staticPartnerNames = useMemo(
        () =>
            new Set(
                CUC_PARTNERS.flatMap((group) => group.partners.map((p) => p.name.toLowerCase().trim()))
            ),
        []
    );

    const additionalCinemaPartners = useMemo(
        () =>
            dbPartners.filter(
                (p) => p.category === 'cinema' && !staticPartnerNames.has(p.name.toLowerCase().trim())
            ),
        [dbPartners, staticPartnerNames]
    );
    const additionalOtherPartners = useMemo(
        () =>
            dbPartners.filter(
                (p) => p.category !== 'cinema' && !staticPartnerNames.has(p.name.toLowerCase().trim())
            ),
        [dbPartners, staticPartnerNames]
    );

    return {
        localizer,
        failedImages,
        markImageFailed,
        additionalCinemaPartners,
        additionalOtherPartners,
    };
}
