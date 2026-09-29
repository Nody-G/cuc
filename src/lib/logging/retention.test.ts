/**
 * Tests de la politique de rétention.
 *
 * Le §3 de `durability_health.md` impose que la croissance du journal soit
 * plafonnée et vérifiée, pas espérée : ces cas verrouillent les durées par
 * niveau, la seule source utilisée par la purge du Cockpit et par le script de
 * rétention.
 */
import {
    DEFAULT_RETENTION,
    buildPurgeThresholds,
    isLongLivedLevel,
    purgeThresholdIso,
    retentionDaysFor,
} from './retention';

/** Un repère fixe : 2026-09-29T00:00:00Z. */
const NOW = Date.UTC(2026, 8, 29);

describe('retentionDaysFor', () => {
    it('applique 90 jours à l’information', () => {
        expect(retentionDaysFor('info')).toBe(DEFAULT_RETENTION.infoDays);
        expect(retentionDaysFor('info')).toBe(90);
    });

    it('applique 180 jours aux signaux utiles', () => {
        expect(retentionDaysFor('warning')).toBe(180);
        expect(retentionDaysFor('error')).toBe(180);
    });

    it('conserve un incident critique une année', () => {
        expect(retentionDaysFor('critical')).toBe(365);
    });

    it('respecte une politique fournie', () => {
        const policy = { infoDays: 7, signalDays: 30, criticalDays: 90, maxRows: 100 };
        expect(retentionDaysFor('info', policy)).toBe(7);
        expect(retentionDaysFor('error', policy)).toBe(30);
        expect(retentionDaysFor('critical', policy)).toBe(90);
    });
});

describe('isLongLivedLevel', () => {
    it('sépare le bruit du signal', () => {
        expect(isLongLivedLevel('info')).toBe(false);
        expect(isLongLivedLevel('warning')).toBe(true);
        expect(isLongLivedLevel('error')).toBe(true);
        expect(isLongLivedLevel('critical')).toBe(true);
    });
});

describe('purgeThresholdIso', () => {
    it('calcule la borne de purge à partir de l’instant injecté', () => {
        expect(purgeThresholdIso('info', NOW)).toBe('2026-07-01T00:00:00.000Z');
        expect(purgeThresholdIso('warning', NOW)).toBe('2026-04-02T00:00:00.000Z');
        expect(purgeThresholdIso('critical', NOW)).toBe('2025-09-29T00:00:00.000Z');
    });

    it('reste pure : deux appels identiques donnent le même résultat', () => {
        expect(purgeThresholdIso('error', NOW)).toBe(purgeThresholdIso('error', NOW));
    });
});

describe('buildPurgeThresholds', () => {
    it('couvre les quatre niveaux, dans l’ordre de gravité', () => {
        const thresholds = buildPurgeThresholds(NOW);
        expect(thresholds.map((t) => t.level)).toEqual(['info', 'warning', 'error', 'critical']);
        for (const entry of thresholds) expect(typeof entry.before).toBe('string');
    });

    it('purge plus tard les niveaux graves', () => {
        const byLevel = new Map(buildPurgeThresholds(NOW).map((t) => [t.level, t.before]));
        const info = byLevel.get('info') as string;
        const critical = byLevel.get('critical') as string;
        expect(new Date(critical).getTime()).toBeLessThan(new Date(info).getTime());
    });
});
