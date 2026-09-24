'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordSiteVisitAction } from '@/app/(admin)/admin/actions/traffic-monitor';

/** Vrai uniquement pour `/en` ou `/en/...` — évite les faux positifs d'un préfixe
 * textuel (une route FR comme `/entreprise` n'est pas anglophone). */
function isEnglishPath(pathname: string): boolean {
    return pathname === '/en' || pathname.startsWith('/en/');
}

/**
 * Tracker d'audience léger, anonyme et conforme RGPD.
 * - Ne dépose aucun cookie traceur tiers.
 * - S'exécute en arrière-plan sans ralentir le rendu (requestIdleCallback / setTimeout).
 * - S'active uniquement sur les routes vitrine publiques (exclut automatiquement `/admin`).
 */
export function SiteVisitTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
            return;
        }

        // Évite les doublons sur le même chemin lors des re-rendus
        if (lastTrackedPath.current === pathname) {
            return;
        }
        lastTrackedPath.current = pathname;

        const scheduleBeacon = () => {
            const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
            const device: 'mobile' | 'desktop' | 'tablet' =
                width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

            const referrer = typeof document !== 'undefined' ? document.referrer : '';
            const locale = isEnglishPath(pathname) ? 'en' : 'fr';

            recordSiteVisitAction({
                path: pathname,
                referrer,
                locale,
                device,
            }).catch(() => {
                // Silencieux : une panne de télémétrie ne doit jamais impacter l'utilisateur
            });
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
                scheduleBeacon
            );
        } else {
            setTimeout(scheduleBeacon, 800);
        }
    }, [pathname]);

    return null;
}
