'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { isPreviewFrame } from '@/lib/preview/preview-context';
import { isCockpitRoute } from '@/lib/supabase/realtime';
import {
    DEFAULT_SAMPLE_RATE,
    MAX_SAMPLES_PER_REQUEST,
    isVitalsMetric,
    resolveLocale,
    resolveRating,
    sanitizePath,
    shouldSample,
    type VitalsSample,
} from '@/lib/perf/vitals';

/**
 * ==============================================================================
 * CUC — Mesure de la performance **réellement vécue** par les visiteurs
 * ==============================================================================
 * Rien ne mesurait jusqu'ici le LCP, l'INP ou le CLS effectivement subis : les
 * budgets du dépôt portent sur le **poids** et le **nombre de requêtes**, pas sur
 * ce que l'utilisateur ressent.
 *
 * Ce composant comble ce trou sans rouvrir la porte à la charge : il est
 * **échantillonné** (un visiteur sur vingt, décision prise une fois par session),
 * il n'écrit **qu'une fois par page vue**, à la sortie de page, et il est
 * strictement silencieux — sans `await`, sans état d'interface, sans effet sur
 * l'affichage. La vitrine continue de ne faire aucune lecture et d'ouvrir aucun
 * WebSocket (voir `durability_health.md` § 6).
 *
 * Inerte dans l'aperçu du Cockpit, sur les routes d'administration et sur l'API.
 */

/** Décision d'échantillonnage — mise en cache de session, jamais retirée au sort. */
const SAMPLING_KEY = 'cuc-vitals-sampled';

function decideSampling(): boolean {
    try {
        const stored = window.sessionStorage.getItem(SAMPLING_KEY);
        if (stored === '1') return true;
        if (stored === '0') return false;
        const sampled = shouldSample(Math.random(), DEFAULT_SAMPLE_RATE);
        window.sessionStorage.setItem(SAMPLING_KEY, sampled ? '1' : '0');
        return sampled;
    } catch {
        // Navigation privée sans stockage : on ne mesure pas, jamais d'exception.
        return false;
    }
}

export function VitalsReporter() {
    const pathname = usePathname();
    const samplesRef = useRef<VitalsSample[]>([]);
    const collectingRef = useRef(false);

    useEffect(() => {
        const clean = pathname ?? '';
        collectingRef.current =
            clean.length > 0 &&
            !isCockpitRoute(clean) &&
            !clean.startsWith('/api') &&
            !isPreviewFrame() &&
            decideSampling();
    }, [pathname]);

    useReportWebVitals((metric) => {
        if (!collectingRef.current) return;
        if (!isVitalsMetric(metric.name)) return;

        const path = sanitizePath(pathname ?? '/');
        samplesRef.current.push({
            path,
            metric: metric.name,
            value: metric.value,
            rating: resolveRating(metric.name, metric.value),
            locale: resolveLocale(path),
        });
    });

    // Envoi à la sortie de page : un seul aller-retour, non bloquant, jamais retenté.
    useEffect(() => {
        const flush = () => {
            if (!collectingRef.current) return;
            const samples = samplesRef.current.slice(0, MAX_SAMPLES_PER_REQUEST);
            samplesRef.current = [];
            if (samples.length === 0) return;

            const body = JSON.stringify(samples);
            try {
                if (typeof navigator.sendBeacon === 'function') {
                    navigator.sendBeacon('/api/vitals', new Blob([body], { type: 'application/json' }));
                    return;
                }
            } catch {
                /* Repli `fetch` ci-dessous. */
            }
            try {
                void fetch('/api/vitals', {
                    method: 'POST',
                    body,
                    headers: { 'Content-Type': 'application/json' },
                    keepalive: true,
                }).catch(() => {
                    /* Silencieux : une panne de télémétrie ne concerne pas le visiteur. */
                });
            } catch {
                /* Aucun impact : la mesure n'est pas une dépendance. */
            }
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') flush();
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('pagehide', flush);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('pagehide', flush);
            flush();
        };
    }, []);

    return null;
}

export default VitalsReporter;
