'use client';

import { useCallback, useEffect, useState } from 'react';
import { getEvents, type SiteEvent } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { applyEventOverlays } from '@/lib/i18n/apply-event-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';

/** Copie éditoriale d'un pilier d'agence (repli quand la base est vide). */
export interface PillarCopy {
    tag: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    cta: string;
    imageAlt: string;
}

/** Visuels des trois piliers de repli (spectacles, animations, team building). */
export const STATIC_PILLAR_IMAGES = [
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Photos-Spectacle-300x200.jpg',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/FreeJump-CCJ-Puteaux-03-300x200.jpg',
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/A-atelier-cinema-indoor-300x200.jpg',
];

export interface EventsPillarsController {
    /** Textes des piliers : données de la page par-dessus le repli traduit. */
    pillarItems: PillarCopy[];
    /** Événements CMS localisés (overlays EN appliqués). */
    localizedEvents: SiteEvent[];
}

/**
 * Orchestration des piliers d'agence : textes éditables en place
 * (`sections_data.events_pillars`), événements `site_events` et overlays EN.
 */
export function useEventsPillars(pillars: PillarCopy[]): EventsPillarsController {
    /**
     * Textes des piliers éditables en place : les données de la page
     * (`sections_data.events_pillars.items`) priment, le repli traduit reste.
     */
    const sectionData = usePageSectionData<{ items?: Array<Partial<PillarCopy>> }>(
        'events_pillars'
    );
    const pillarItems = mergeSectionItems(pillars, sectionData);
    const [dbEvents, setDbEvents] = useState<SiteEvent[]>([]);

    /**
     * Overlays EN des événements (entité `event`).
     *
     * Sans eux, les trois événements de `site_events` s'affichaient en français
     * sur les pages anglaises : la traduction existait en base mais aucun écran ne
     * la lisait. Défaut hors de portée du crawler, ces lignes étant chargées côté
     * navigateur (hors HTML initial).
     */
    const eventOverlays = useEntityOverlays('event');
    const localizedEvents = applyEventOverlays(dbEvents, eventOverlays);

    /** Recharge les événements (état initial + synchronisation Realtime). */
    const loadEvents = useCallback(() => {
        getEvents().then((evts) => {
            if (evts && evts.length > 0) {
                setDbEvents(evts);
            }
        });
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Synchronisation Realtime Cockpit → Vitrine (événements d'agence).
    useRealtimeRefresh(['site_events'], loadEvents);

    return { pillarItems, localizedEvents };
}
