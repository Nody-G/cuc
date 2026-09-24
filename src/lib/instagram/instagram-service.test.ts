import { parseCount, formatFollowerCount } from './instagram-service';

describe('instagram-service helpers', () => {
    it('parseCount parse correctement les formats d’abonnés réels Instagram', () => {
        expect(parseCount('1M')).toBe(1000000);
        expect(parseCount('2.2M')).toBe(2200000);
        expect(parseCount('2,5M')).toBe(2500000);
        expect(parseCount('847K')).toBe(847000);
        expect(parseCount('955k')).toBe(955000);
        expect(parseCount('31K')).toBe(31000);
        expect(parseCount('1,144')).toBe(1144);
        expect(parseCount('744')).toBe(744);
        expect(parseCount('')).toBe(0);
    });

    it('formatFollowerCount formate les chiffres selon les conventions françaises', () => {
        expect(formatFollowerCount(1000000)).toBe('1 M');
        expect(formatFollowerCount(2200000)).toBe('2,2 M');
        expect(formatFollowerCount(847000)).toBe('847 k');
        expect(formatFollowerCount(31000)).toBe('31 k');
        expect(formatFollowerCount(955000)).toBe('955 k');
        expect(formatFollowerCount(450)).toBe('450');
    });
});
