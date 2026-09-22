/**
 * Tests du moteur analytique — candidatures et entonnoir de conversion.
 */

import { analyzeCockpit } from './cockpit-analytics';
import { emptyInput, makeInquiry } from './cockpit-analytics.fixtures';

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
