import { isTokenRefreshDue } from './instagram-token-refresh';

describe('instagram-token-refresh', () => {
    it('isTokenRefreshDue renvoie true si aucune date de mise à jour n\'est fournie', () => {
        expect(isTokenRefreshDue(undefined)).toBe(true);
        expect(isTokenRefreshDue('')).toBe(true);
        expect(isTokenRefreshDue('invalid-date')).toBe(true);
    });

    it('isTokenRefreshDue renvoie false si le jeton a été mis à jour il y a moins de 20 jours', () => {
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        expect(isTokenRefreshDue(fiveDaysAgo)).toBe(false);

        const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
        expect(isTokenRefreshDue(tenDaysAgo)).toBe(false);
    });

    it('isTokenRefreshDue renvoie true si le jeton a plus de 20 jours', () => {
        const twentyFiveDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
        expect(isTokenRefreshDue(twentyFiveDaysAgo)).toBe(true);

        const fiftyDaysAgo = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString();
        expect(isTokenRefreshDue(fiftyDaysAgo)).toBe(true);
    });
});
