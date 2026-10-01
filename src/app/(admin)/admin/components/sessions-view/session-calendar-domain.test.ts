import { describe, expect, it } from 'vitest';
import {
    computePresetEndDate,
    formatSessionRange,
    getMonthCalendarGrid,
    padDay,
    toIsoDate,
} from './session-calendar-domain';

describe('session-calendar-domain', () => {
    describe('padDay', () => {
        it('formate sur 2 chiffres', () => {
            expect(padDay(5)).toBe('05');
            expect(padDay(9)).toBe('09');
            expect(padDay(18)).toBe('18');
            expect(padDay(30)).toBe('30');
        });
    });

    describe('toIsoDate', () => {
        it('génère un YYYY-MM-DD correct', () => {
            const date = new Date(2027, 4, 15); // 15 mai 2027
            expect(toIsoDate(date)).toBe('2027-05-15');
        });
    });

    describe('formatSessionRange', () => {
        it('formate une journée unique', () => {
            const start = new Date(2027, 4, 15); // 15 mai 2027
            expect(formatSessionRange(start)).toBe('15 mai 2027');
        });

        it('formate une plage dans le même mois (norme CUC)', () => {
            const start = new Date(2026, 9, 18); // 18 octobre 2026
            const end = new Date(2026, 9, 30); // 30 octobre 2026
            expect(formatSessionRange(start, end)).toBe('18 au 30 octobre 2026');
        });

        it('formate avec le connecteur "et" pour les week-ends immersion', () => {
            const start = new Date(2026, 8, 12); // 12 septembre 2026
            const end = new Date(2026, 8, 13); // 13 septembre 2026
            expect(formatSessionRange(start, end, 'et')).toBe('12 et 13 septembre 2026');
        });

        it('formate une plage à cheval sur deux mois de la même année', () => {
            const start = new Date(2027, 1, 21); // 21 février 2027
            const end = new Date(2027, 2, 5); // 05 mars 2027
            expect(formatSessionRange(start, end)).toBe('21 février au 05 mars 2027');
        });

        it('formate une plage à cheval sur deux années consécutives', () => {
            const start = new Date(2026, 11, 28); // 28 décembre 2026
            const end = new Date(2027, 0, 8); // 08 janvier 2027
            expect(formatSessionRange(start, end)).toBe('28 décembre 2026 au 08 janvier 2027');
        });

        it('ordonne automatiquement si la date de fin est antérieure', () => {
            const start = new Date(2026, 9, 30);
            const end = new Date(2026, 9, 18);
            expect(formatSessionRange(start, end)).toBe('18 au 30 octobre 2026');
        });
    });

    describe('getMonthCalendarGrid', () => {
        it('génère un nombre de jours multiple de 7 (semaines complètes)', () => {
            const grid = getMonthCalendarGrid(2026, 9); // Octobre 2026
            expect(grid.length % 7).toBe(0);
            expect(grid.length).toBeGreaterThanOrEqual(35);
        });

        it('marque correctement les jours du mois courant', () => {
            const grid = getMonthCalendarGrid(2026, 9); // Octobre 2026 (31 jours)
            const currentMonthDays = grid.filter((d) => d.isCurrentMonth);
            expect(currentMonthDays.length).toBe(31);
        });
    });

    describe('computePresetEndDate', () => {
        it('calcule la formule week-end (+1j)', () => {
            const start = new Date(2026, 8, 12); // Samedi 12 sept 2026
            const end = computePresetEndDate(start, 'weekend');
            expect(end.getDate()).toBe(13);
        });

        it('calcule un stage 5 jours (+4j)', () => {
            const start = new Date(2026, 9, 5); // Lundi 5 oct 2026
            const end = computePresetEndDate(start, 'stage5');
            expect(end.getDate()).toBe(9); // Vendredi 9 oct
        });

        it('calcule un stage 12 jours (+12j)', () => {
            const start = new Date(2026, 9, 18);
            const end = computePresetEndDate(start, 'stage12');
            expect(end.getDate()).toBe(30);
        });
    });
});
