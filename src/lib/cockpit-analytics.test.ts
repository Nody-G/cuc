import { analyzeCockpit, seriesToPolyline } from './cockpit-analytics';
import type { AnalyticsInput } from './cockpit-analytics';
import type { SiteInquiry, AuditLogEntry, SitePageContent } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';

/**
 * Tests unitaires du moteur analytique du Cockpit.
 *
 * Le moteur est une fonction pure : aucun accès réseau, aucun effet de bord.
 * Ces tests garantissent deux invariants doctrinaux :
 *  1. Aucune valeur inventée — un jeu vide produit des zéros, jamais de
 *     chiffres fictifs.
 *  2. Les indicateurs dérivés (taux, entonnoir, répartitions) sont
 *     mathématiquement cohérents avec les données fournies.
 */

const NOW = new Date('2026-09-20T12:00:00.000Z');

function makeInquiry(overrides: Partial<SiteInquiry> = {}): SiteInquiry {
    return {
        id: overrides.id ?? 'inq-1',
        full_name: 'Candidat Test',
        email: 'test@example.com',
        phone: '0600000000',
        program_id: 'prog-1',
        message: 'Message',
        status: 'nouveau',
        created_at: '2026-09-19T10:00:00.000Z',
        ...overrides,
    };
}

function makeAuditLog(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
    return {
        id: overrides.id ?? 'log-1',
        user_name: 'Niels',
        action: 'update',
        entity: 'Page',
        created_at: '2026-09-19T10:00:00.000Z',
        ...overrides,
    };
}

function makePage(overrides: Partial<SitePageContent> = {}): SitePageContent {
    return {
        slug: '/test',
        title: 'Page de test',
        is_published: true,
        ...overrides,
    } as SitePageContent;
}

function makeProgram(overrides: Partial<StuntProgram> = {}): StuntProgram {
    return {
        id: 'prog-1',
        title: 'Formation Cascadeur',
        nextSessions: [],
        ...overrides,
    } as StuntProgram;
}

function emptyInput(overrides: Partial<AnalyticsInput> = {}): AnalyticsInput {
    return {
        inquiries: [],
        programs: [],
        auditLogs: [],
        pages: [],
        windowDays: 30,
        now: NOW,
        ...overrides,
    };
}

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

describe('analyzeCockpit — candidatures', () => {
    it('compte les statuts et calcule le taux d’admission sur les décisions rendues', () => {
        const report = analyzeCockpit(
            emptyInput({
                inquiries: [
                    makeInquiry({ id: '1', status: 'admis' }),
                    makeInquiry({ id: '2', status: 'admis' }),
                    makeInquiry({ id: '3', status: 'refuse' }),
                    makeInquiry({ id: '4', status: 'refuse' }),
                    makeInquiry({ id: '5', status: 'nouveau' }),
                ],
            })
        );

        expect(report.kpis.inquiriesTotal).toBe(5);
        expect(report.kpis.inquiriesAdmitted).toBe(2);
        expect(report.kpis.inquiriesRefused).toBe(2);
        expect(report.kpis.inquiriesNew).toBe(1);
        // 2 admis / 4 décisions rendues = 50 %
        expect(report.kpis.admissionRate).toBe(50);
    });

    it('calcule le délai moyen de traitement uniquement sur les dossiers traités', () => {
        const report = analyzeCockpit(
            emptyInput({
                inquiries: [
                    makeInquiry({
                        id: '1',
                        status: 'admis',
                        created_at: '2026-09-18T10:00:00.000Z',
                        updated_at: '2026-09-18T20:00:00.000Z', // 10 h
                    }),
                    makeInquiry({
                        id: '2',
                        status: 'refuse',
                        created_at: '2026-09-18T10:00:00.000Z',
                        updated_at: '2026-09-19T10:00:00.000Z', // 24 h
                    }),
                    // Statut « nouveau » : exclu du calcul.
                    makeInquiry({
                        id: '3',
                        status: 'nouveau',
                        created_at: '2026-09-18T10:00:00.000Z',
                        updated_at: '2026-09-19T10:00:00.000Z',
                    }),
                ],
            })
        );

        // (10 + 24) / 2 = 17 h
        expect(report.kpis.avgResponseHours).toBe(17);
    });

    it('ignore les dates invalides sans planter', () => {
        const report = analyzeCockpit(
            emptyInput({
                inquiries: [
                    makeInquiry({ id: '1', status: 'admis', created_at: 'pas-une-date', updated_at: 'x' }),
                ],
            })
        );
        expect(report.kpis.avgResponseHours).toBeNull();
    });

    it('répartit les candidatures par programme avec des parts cohérentes', () => {
        const report = analyzeCockpit(
            emptyInput({
                inquiries: [
                    makeInquiry({ id: '1', program_title: 'Cascade' }),
                    makeInquiry({ id: '2', program_title: 'Cascade' }),
                    makeInquiry({ id: '3', program_title: 'Parkour' }),
                ],
            })
        );

        const cascade = report.programDistribution.find((s) => s.label === 'Cascade');
        const parkour = report.programDistribution.find((s) => s.label === 'Parkour');
        expect(cascade?.value).toBe(2);
        expect(parkour?.value).toBe(1);
        // Tri décroissant : Cascade en tête.
        expect(report.programDistribution[0].label).toBe('Cascade');
        // 2/3 ≈ 66.7 %
        expect(cascade?.share).toBeCloseTo(66.7, 1);
    });

    it('retombe sur « Non précisé » quand le programme est absent', () => {
        const report = analyzeCockpit(
            emptyInput({ inquiries: [makeInquiry({ id: '1', program_title: undefined, program_id: '' })] })
        );
        expect(report.programDistribution[0].label).toBe('Non précisé');
    });
});

describe('analyzeCockpit — entonnoir de conversion', () => {
    it('calcule les conversions depuis l’étape précédente et depuis le départ', () => {
        const report = analyzeCockpit(
            emptyInput({
                inquiries: [
                    makeInquiry({ id: '1', status: 'nouveau' }),
                    makeInquiry({ id: '2', status: 'en_cours' }),
                    makeInquiry({ id: '3', status: 'admis' }),
                    makeInquiry({ id: '4', status: 'refuse' }),
                ],
            })
        );

        const [received, processing, decided, admitted] = report.funnel;
        expect(received.count).toBe(4);
        expect(processing.count).toBe(3); // en_cours + admis + refusé
        expect(decided.count).toBe(2); // admis + refusé
        expect(admitted.count).toBe(1);

        expect(received.conversionFromPrevious).toBe(100);
        expect(processing.conversionFromPrevious).toBe(75); // 3/4
        expect(decided.conversionFromPrevious).toBeCloseTo(66.7, 1); // 2/3
        expect(admitted.conversionFromPrevious).toBe(50); // 1/2

        expect(admitted.conversionFromStart).toBe(25); // 1/4
    });
});

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

describe('seriesToPolyline', () => {
    it('retourne une chaîne vide pour une série vide', () => {
        expect(seriesToPolyline([])).toBe('');
    });

    it('produit un point par valeur', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 5 },
            { label: 'c', value: 10 },
        ]);
        expect(polyline.split(' ')).toHaveLength(3);
    });

    it('place la valeur maximale en haut du viewBox (y = 0)', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 10 },
        ]);
        const [, secondPoint] = polyline.split(' ');
        const y = Number(secondPoint.split(',')[1]);
        expect(y).toBe(0);
    });

    it('ne divise jamais par zéro sur une série plate', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 0 },
        ]);
        expect(polyline).not.toContain('NaN');
        expect(polyline).not.toContain('Infinity');
    });
});
