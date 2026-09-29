/**
 * Tests des plages temporelles partagées.
 *
 * Elles servent au Journal d'audit **et** au hub Journal : une borne fausse
 * fausserait les deux écrans d'un coup. `nowMs` est injecté, aucun test ne dépend
 * de l'horloge réelle.
 */
import { RANGE_MS, isWithinRange, rangeSinceIso, rangeThresholdMs } from './time-range';

/** 2026-09-29T00:00:00Z. */
const NOW = Date.UTC(2026, 8, 29);

describe('rangeThresholdMs', () => {
    it('renvoie null pour tout l’historique', () => {
        expect(rangeThresholdMs('all', NOW)).toBeNull();
    });

    it('retranche la durée de la plage', () => {
        expect(rangeThresholdMs('24h', NOW)).toBe(NOW - RANGE_MS['24h']);
        expect(rangeThresholdMs('7d', NOW)).toBe(NOW - 7 * 24 * 60 * 60 * 1000);
    });
});

describe('rangeSinceIso', () => {
    it('produit une borne ISO exploitable par Supabase', () => {
        expect(rangeSinceIso('24h', NOW)).toBe('2026-09-28T00:00:00.000Z');
    });

    it('ne borne rien pour tout l’historique', () => {
        expect(rangeSinceIso('all', NOW)).toBeNull();
    });
});

describe('isWithinRange', () => {
    it('accepte un horodatage récent et refuse un ancien', () => {
        expect(isWithinRange('2026-09-28T18:00:00.000Z', '24h', NOW)).toBe(true);
        expect(isWithinRange('2026-09-20T18:00:00.000Z', '24h', NOW)).toBe(false);
    });

    it('accepte tout pour tout l’historique', () => {
        expect(isWithinRange('2020-01-01T00:00:00.000Z', 'all', NOW)).toBe(true);
    });

    it('écarte un horodatage illisible plutôt que de le retenir', () => {
        expect(isWithinRange('pas une date', '7d', NOW)).toBe(false);
    });
});
