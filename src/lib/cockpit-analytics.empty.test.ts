/**
 * Tests du moteur analytique — invariants de base et fenêtre temporelle.
 *
 * Le moteur est une fonction pure : aucun accès réseau, aucun effet de bord.
 * Ces tests garantissent l'invariant doctrinal : aucune valeur inventée — un
 * jeu vide produit des zéros, jamais de chiffres fictifs.
 */

import { analyzeCockpit } from './cockpit-analytics';
import { NOW, emptyInput } from './cockpit-analytics.fixtures';

describe('analyzeCockpit — jeu vide (aucune valeur inventée)', () => {
    const report = analyzeCockpit(emptyInput());

    it('retourne des KPI à zéro', () => {
        expect(report.kpis.inquiriesTotal).toBe(0);
        expect(report.kpis.inquiriesNew).toBe(0);
        expect(report.kpis.inquiriesAdmitted).toBe(0);
        expect(report.kpis.inquiriesRefused).toBe(0);
        expect(report.kpis.admissionRate).toBe(0);
        expect(report.kpis.sessionsTotal).toBe(0);
        expect(report.kpis.sessionsFull).toBe(0);
        expect(report.kpis.seatFillRate).toBe(0);
        expect(report.kpis.publishedPages).toBe(0);
        expect(report.kpis.draftPages).toBe(0);
        expect(report.kpis.auditEvents).toBe(0);
        expect(report.kpis.activeEditors).toBe(0);
    });

    it('ne fabrique pas de délai de réponse moyen', () => {
        expect(report.kpis.avgResponseHours).toBeNull();
    });

    it('produit des séries temporelles vides mais dimensionnées sur la fenêtre', () => {
        expect(report.inquiryTrend.points).toHaveLength(30);
        expect(report.inquiryTrend.total).toBe(0);
        expect(report.inquiryTrend.deltaPct).toBe(0);
        expect(report.inquiryTrend.direction).toBe('flat');
    });

    it('retourne des répartitions vides', () => {
        expect(report.statusDistribution).toEqual([]);
        expect(report.programDistribution).toEqual([]);
        expect(report.sessionPressure).toEqual([]);
        expect(report.activityByAuthor).toEqual([]);
        expect(report.activityByEntity).toEqual([]);
    });

    it('conserve les quatre étapes de l’entonnoir à zéro', () => {
        expect(report.funnel).toHaveLength(4);
        expect(report.funnel.every((stage) => stage.count === 0)).toBe(true);
        expect(report.funnel[0].conversionFromPrevious).toBe(100);
    });
});

describe('analyzeCockpit — fenêtre temporelle', () => {
    it('respecte la fenêtre demandée pour les séries', () => {
        const report = analyzeCockpit(emptyInput({ windowDays: 7 }));
        expect(report.windowDays).toBe(7);
        expect(report.inquiryTrend.points).toHaveLength(7);
    });

    it('borne la fenêtre à un minimum de 1 jour', () => {
        const report = analyzeCockpit(emptyInput({ windowDays: 0 }));
        expect(report.windowDays).toBe(1);
        expect(report.inquiryTrend.points).toHaveLength(1);
    });

    it('utilise 30 jours par défaut', () => {
        const report = analyzeCockpit({
            inquiries: [],
            programs: [],
            auditLogs: [],
            pages: [],
            now: NOW,
        });
        expect(report.windowDays).toBe(30);
    });

    it('expose la date de génération fournie', () => {
        const report = analyzeCockpit(emptyInput());
        expect(report.generatedAt).toBe(NOW.toISOString());
    });
});
