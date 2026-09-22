/**
 * Tests du moteur analytique — sessions, pression de remplissage, pages et
 * journal d'audit.
 */

import { analyzeCockpit } from './cockpit-analytics';
import { emptyInput, makeAuditLog, makePage, makeProgram } from './cockpit-analytics.fixtures';

describe('analyzeCockpit — sessions et pression de remplissage', () => {
    it('agrège les sièges et calcule le taux de remplissage global', () => {
        const report = analyzeCockpit(
            emptyInput({
                programs: [
                    makeProgram({
                        id: 'p1',
                        title: 'Cascade',
                        nextSessions: [
                            { id: 's1', date: '01/10', status: 'complet', max_seats: 10, booked_seats: 10 },
                            { id: 's2', date: '02/10', status: 'ouvert', max_seats: 10, booked_seats: 5 },
                        ],
                    }),
                ],
            })
        );

        expect(report.kpis.sessionsTotal).toBe(2);
        expect(report.kpis.sessionsFull).toBe(1);
        // 15 réservés / 20 sièges = 75 %
        expect(report.kpis.seatFillRate).toBe(75);

        expect(report.sessionPressure).toHaveLength(1);
        expect(report.sessionPressure[0].fillRate).toBe(75);
        expect(report.sessionPressure[0].openSessions).toBe(1);
        expect(report.sessionPressure[0].fullSessions).toBe(1);
    });

    it('trie la pression par taux de remplissage décroissant', () => {
        const report = analyzeCockpit(
            emptyInput({
                programs: [
                    makeProgram({
                        id: 'low',
                        title: 'Peu rempli',
                        nextSessions: [
                            { id: 's1', date: '01/10', status: 'ouvert', max_seats: 10, booked_seats: 1 },
                        ],
                    }),
                    makeProgram({
                        id: 'high',
                        title: 'Très rempli',
                        nextSessions: [
                            { id: 's2', date: '01/10', status: 'ouvert', max_seats: 10, booked_seats: 9 },
                        ],
                    }),
                ],
            })
        );

        expect(report.sessionPressure[0].programId).toBe('high');
        expect(report.sessionPressure[1].programId).toBe('low');
    });

    it('exclut de la pression les programmes sans session', () => {
        const report = analyzeCockpit(
            emptyInput({ programs: [makeProgram({ id: 'p1', nextSessions: [] })] })
        );
        expect(report.sessionPressure).toEqual([]);
        expect(report.kpis.sessionsTotal).toBe(0);
    });
});

describe('analyzeCockpit — pages et journal d’audit', () => {
    it('distingue pages publiées et brouillons', () => {
        const report = analyzeCockpit(
            emptyInput({
                pages: [
                    makePage({ slug: '/a', is_published: true }),
                    makePage({ slug: '/b', is_published: false }),
                    makePage({ slug: '/c' }), // is_published absent → publié par défaut
                ],
            })
        );

        expect(report.kpis.publishedPages).toBe(2);
        expect(report.kpis.draftPages).toBe(1);
    });

    it('compte les événements d’audit et les éditeurs actifs distincts', () => {
        const report = analyzeCockpit(
            emptyInput({
                auditLogs: [
                    makeAuditLog({ id: '1', user_name: 'Niels' }),
                    makeAuditLog({ id: '2', user_name: 'Niels' }),
                    makeAuditLog({ id: '3', user_name: 'Michel' }),
                ],
            })
        );

        expect(report.kpis.auditEvents).toBe(3);
        expect(report.kpis.activeEditors).toBe(2);
        expect(report.activityByAuthor[0].label).toBe('Niels');
        expect(report.activityByAuthor[0].value).toBe(2);
    });

    it('regroupe les auteurs vides sous « Inconnu »', () => {
        const report = analyzeCockpit(
            emptyInput({ auditLogs: [makeAuditLog({ id: '1', user_name: '' })] })
        );
        expect(report.activityByAuthor[0].label).toBe('Inconnu');
    });
});
