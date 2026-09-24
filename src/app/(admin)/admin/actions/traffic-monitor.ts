'use server';

import type { TrafficWindow, SiteTrafficReport, RealtimeVisitor, IncomingVisitPayload } from '@/types/site-traffic';
import {
    getSiteTrafficReport,
    getRealtimeVisitors,
    recordSiteVisit,
} from '@/lib/traffic/traffic-service';

export interface TrafficActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/** Récupère le rapport de trafic pour la période sélectionnée */
export async function getSiteTrafficReportAction(
    window: TrafficWindow
): Promise<TrafficActionResult<SiteTrafficReport>> {
    try {
        const report = getSiteTrafficReport(window);
        return { success: true, data: report };
    } catch (err) {
        console.error('[traffic-monitor] Erreur getSiteTrafficReportAction:', err);
        return { success: false, error: 'Impossible de charger le rapport de trafic.' };
    }
}

/** Récupère les visiteurs en ligne en temps réel */
export async function getRealtimeVisitorsAction(): Promise<
    TrafficActionResult<{ count: number; visitors: RealtimeVisitor[] }>
> {
    try {
        const data = getRealtimeVisitors();
        return { success: true, data };
    } catch (err) {
        console.error('[traffic-monitor] Erreur getRealtimeVisitorsAction:', err);
        return { success: false, error: 'Impossible de récupérer les visiteurs en temps réel.' };
    }
}

/** Enregistre une visite envoyée par le tracker vitrine */
export async function recordSiteVisitAction(
    payload: IncomingVisitPayload
): Promise<TrafficActionResult<{ visitorId: string }>> {
    try {
        const visitor = recordSiteVisit(payload);
        return { success: true, data: { visitorId: visitor.id } };
    } catch (err) {
        console.error('[traffic-monitor] Erreur recordSiteVisitAction:', err);
        return { success: false, error: 'Erreur lors de l’enregistrement de la visite.' };
    }
}

/** Simule l’arrivée d’un visiteur en direct pour tester le pulse temps réel */
export async function simulateVisitorAction(): Promise<TrafficActionResult<RealtimeVisitor>> {
    try {
        const simulatedPaths = [
            '/formation-de-cascadeur',
            '/videos-cascadeur',
            '/visite-virtuelle',
            '/stages-cascades-parkour-2',
            '/team-building-cascades',
        ];
        const randomPath = simulatedPaths[Math.floor(Math.random() * simulatedPaths.length)];
        const visitor = recordSiteVisit({
            path: randomPath,
            referrer: 'https://www.instagram.com/p/live-simulated',
            locale: 'fr',
            device: 'mobile',
        });
        return { success: true, data: visitor };
    } catch (err) {
        console.error('[traffic-monitor] Erreur simulateVisitorAction:', err);
        return { success: false, error: 'Erreur simulation.' };
    }
}
