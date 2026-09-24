import { describe, it, expect } from 'vitest';
import {
    recordSiteVisit,
    getSiteTrafficReport,
    getRealtimeVisitors,
    formatDuration,
    exportTrafficCsv,
} from './traffic-service';

describe('traffic-service', () => {
    it('formate correctement les durées en minutes et secondes', () => {
        expect(formatDuration(45)).toBe('45s');
        expect(formatDuration(65)).toBe('1m 05s');
        expect(formatDuration(184)).toBe('3m 04s');
    });

    it('génère un rapport cohérent pour la fenêtre demandée', () => {
        const report = getSiteTrafficReport('7d');
        expect(report.window).toBe('7d');
        expect(report.kpis.uniqueVisitors).toBeGreaterThan(0);
        expect(report.kpis.pageViews).toBeGreaterThan(report.kpis.uniqueVisitors);
        expect(report.topPages.length).toBeGreaterThan(0);
        expect(report.referrers.length).toBeGreaterThan(0);
        expect(report.funnels.length).toBe(3);
    });

    it('enregistre une visite et identifie correctement la source', () => {
        const visit = recordSiteVisit({
            path: '/formation-de-cascadeur',
            referrer: 'https://www.instagram.com/reel/CUC123',
            locale: 'fr',
            device: 'mobile',
        });

        expect(visit.currentPath).toBe('/formation-de-cascadeur');
        expect(visit.source).toContain('Instagram');
        expect(visit.device).toBe('mobile');

        const live = getRealtimeVisitors();
        expect(live.count).toBeGreaterThan(0);
    });

    it('génère un fichier CSV d’export valide', () => {
        const report = getSiteTrafficReport('today');
        const csv = exportTrafficCsv(report);
        expect(csv).toContain('Rapport d\'audience CUC');
        expect(csv).toContain('Formation Cascadeur Pro');
        expect(csv).toContain('INDICATEURS CLÉS');
    });
});
