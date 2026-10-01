import type { BackupIndexEntry } from './contracts';
import {
    DEFAULT_RETENTION_POLICY,
    isFirstOfMonthUtc,
    isSundayUtc,
    selectRetention,
} from './retention';

/** Horloge fixe : la décision ne doit dépendre que de cette valeur. */
const NOW = new Date('2026-10-02T00:00:00.000Z');

function entry(
    id: string,
    createdAt: string,
    tier: BackupIndexEntry['tier'] = 'daily',
    status: BackupIndexEntry['status'] = 'complete',
): BackupIndexEntry {
    return {
        id,
        createdAt,
        tier,
        status,
        partsCount: 1,
        bytes: 1000,
        prefix: `site/${id}`,
        appVersion: '0.1.0',
        gitCommit: null,
    };
}

describe('backup/retention — politique GFS 7 / 4 / 12', () => {
    it('annonce la politique par défaut 7 quotidiennes / 4 hebdomadaires / 12 mensuelles', () => {
        expect(DEFAULT_RETENTION_POLICY).toEqual({ daily: 7, weekly: 4, monthly: 12 });
    });

    it('conserve les 7 dernières quotidiennes et purge la 8e', () => {
        const entries = [
            entry('d02', '2026-09-02T02:00:00.000Z'),
            entry('d03', '2026-09-03T02:00:00.000Z'),
            entry('d04', '2026-09-04T02:00:00.000Z'),
            entry('d05', '2026-09-05T02:00:00.000Z'),
            entry('d07', '2026-09-07T02:00:00.000Z'),
            entry('d08', '2026-09-08T02:00:00.000Z'),
            entry('d09', '2026-09-09T02:00:00.000Z'),
            entry('d10', '2026-09-10T02:00:00.000Z'),
        ];

        const { keep, delete: purge, promote } = selectRetention({ entries, now: NOW });

        expect(keep).toEqual(['d10', 'd09', 'd08', 'd07', 'd05', 'd04', 'd03']);
        expect(purge).toEqual(['d02']);
        expect(promote).toEqual([]);
    });

    it('promeut le snapshot du dimanche en hebdomadaire et le conserve', () => {
        const entries = [entry('sunday', '2026-09-06T02:00:00.000Z')];

        const { keep, promote, delete: purge } = selectRetention({ entries, now: NOW });

        expect(promote).toEqual([{ id: 'sunday', tier: 'weekly' }]);
        expect(keep).toContain('sunday');
        expect(purge).toEqual([]);
    });

    it('promeut le snapshot du 1er du mois en mensuel', () => {
        const entries = [entry('premier', '2026-10-01T02:00:00.000Z')];

        const { promote } = selectRetention({ entries, now: NOW });

        expect(promote).toEqual([{ id: 'premier', tier: 'monthly' }]);
    });

    it('exclut les entrées incomplètes : jamais conservées, jamais promues', () => {
        const entries = [
            entry('ok', '2026-09-10T02:00:00.000Z'),
            entry('casse', '2026-09-06T02:00:00.000Z', 'daily', 'incomplete'),
        ];

        const { keep, promote, delete: purge } = selectRetention({ entries, now: NOW });

        expect(keep).toEqual(['ok']);
        expect(promote).toEqual([]);
        expect(purge).toEqual(['casse']);
    });

    it('ne purge jamais un tiers déjà promu : une hebdomadaire est immuable', () => {
        const entries = [
            entry('w1', '2026-08-02T02:00:00.000Z', 'weekly'),
            entry('w2', '2026-08-09T02:00:00.000Z', 'weekly'),
            entry('w3', '2026-08-16T02:00:00.000Z', 'weekly'),
            entry('w4', '2026-08-23T02:00:00.000Z', 'weekly'),
            entry('w5', '2026-08-30T02:00:00.000Z', 'weekly'),
            entry('m1', '2026-08-01T02:00:00.000Z', 'monthly'),
        ];

        const { keep, delete: purge } = selectRetention({ entries, now: NOW });

        expect(keep).toHaveLength(6);
        expect(purge).toEqual([]);
    });

    it('conserve sans promouvoir une entrée datée dans le futur (dérive d’horloge)', () => {
        const entries = [entry('futur', '2027-01-01T00:00:00.000Z')];

        const { keep, promote, delete: purge } = selectRetention({ entries, now: NOW });

        expect(keep).toEqual(['futur']);
        expect(promote).toEqual([]);
        expect(purge).toEqual([]);
    });

    it('est déterministe à now fixe et respecte une politique réduite', () => {
        const entries = [
            entry('d1', '2026-09-02T02:00:00.000Z'),
            entry('d2', '2026-09-03T02:00:00.000Z'),
            entry('d3', '2026-09-04T02:00:00.000Z'),
        ];

        const first = selectRetention({ entries, now: NOW });
        const second = selectRetention({ entries, now: NOW });
        expect(second).toEqual(first);

        const reduced = selectRetention({
            entries,
            now: NOW,
            policy: { daily: 2, weekly: 4, monthly: 12 },
        });
        expect(reduced.keep).toEqual(['d3', 'd2']);
        expect(reduced.delete).toEqual(['d1']);
    });

    it('identifie correctement dimanche et premier du mois (arithmétique pure)', () => {
        expect(isSundayUtc('2026-09-06T02:00:00.000Z')).toBe(true);
        expect(isSundayUtc('2026-09-07T02:00:00.000Z')).toBe(false);
        expect(isFirstOfMonthUtc('2026-10-01T02:00:00.000Z')).toBe(true);
        expect(isFirstOfMonthUtc('2026-10-02T02:00:00.000Z')).toBe(false);
    });
});
