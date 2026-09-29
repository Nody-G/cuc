/**
 * Tests du modèle du hub Journal.
 *
 * Ces cas verrouillent les décisions de rangement : un regroupement par jour qui
 * inverse l'ordre, ou une traduction de filtres approximative, produirait un
 * écran qui « a l'air » correct tout en montrant autre chose que la demande.
 */
import type { ActivityLogEntry } from '@/lib/logging/types';
import {
    filtersToQuery,
    groupLogsByDay,
    isFilterStateEmpty,
    summarizeLogs,
    toggleLevel,
    toggleSource,
    worstLevel,
} from './log-hub-model';
import { EMPTY_LOG_FILTERS } from './log-hub.types';

/** Un repère fixe : 2026-09-29T12:00:00Z. */
const NOW = Date.UTC(2026, 8, 29, 12);

function entry(overrides: Partial<ActivityLogEntry> = {}): ActivityLogEntry {
    return {
        id: 'id',
        occurred_at: new Date(NOW).toISOString(),
        level: 'info',
        source: 'cockpit',
        category: 'page.save',
        message: 'Page enregistrée',
        target: null,
        context: null,
        request_id: null,
        duration_ms: null,
        origin: null,
        actor_id: null,
        actor_name: null,
        repeat_count: 1,
        ...overrides,
    };
}

describe('groupLogsByDay', () => {
    it('groupe les entrées d’un même jour en conservant l’ordre d’arrivée', () => {
        const groups = groupLogsByDay(
            [
                entry({ id: 'a', occurred_at: '2026-09-29T11:00:00.000Z' }),
                entry({ id: 'b', occurred_at: '2026-09-29T09:00:00.000Z' }),
                entry({ id: 'c', occurred_at: '2026-09-28T08:00:00.000Z' }),
            ],
            NOW,
        );

        expect(groups).toHaveLength(2);
        expect(groups[0].label).toBe('Aujourd’hui');
        expect(groups[0].entries.map((item) => item.id)).toEqual(['a', 'b']);
        expect(groups[1].entries.map((item) => item.id)).toEqual(['c']);
    });

    it('range une entrée sans date valide dans un groupe « inconnue »', () => {
        const groups = groupLogsByDay([entry({ occurred_at: 'pas une date' })], NOW);
        expect(groups[0].key).toBe('unknown');
        expect(groups[0].label).toBe('Date inconnue');
    });
});

describe('summarizeLogs', () => {
    it('compte par gravité et trie les domaines par volume', () => {
        const summary = summarizeLogs([
            entry({ level: 'error', source: 'supabase' }),
            entry({ level: 'error', source: 'supabase' }),
            entry({ level: 'warning', source: 'email' }),
            entry({ level: 'info', source: 'cockpit' }),
        ]);

        expect(summary.total).toBe(4);
        expect(summary.byLevel).toEqual({ info: 1, warning: 1, error: 2, critical: 0 });
        expect(summary.bySource[0]).toEqual({ source: 'supabase', count: 2 });
    });
});

describe('worstLevel', () => {
    it('retient la gravité la plus élevée', () => {
        expect(worstLevel([entry({ level: 'info' }), entry({ level: 'critical' })])).toBe('critical');
    });

    it('renvoie null pour une liste vide', () => {
        expect(worstLevel([])).toBeNull();
    });
});

describe('toggleLevel / toggleSource', () => {
    it('ajoute puis retire un niveau', () => {
        expect(toggleLevel([], 'error')).toEqual(['error']);
        expect(toggleLevel(['error'], 'error')).toEqual([]);
    });

    it('ajoute puis retire un domaine', () => {
        expect(toggleSource([], 'realtime')).toEqual(['realtime']);
        expect(toggleSource(['realtime'], 'realtime')).toEqual([]);
    });
});

describe('filtersToQuery', () => {
    it('omet les critères au repos plutôt que de les envoyer vides', () => {
        expect(filtersToQuery(EMPTY_LOG_FILTERS, NOW)).toEqual({
            limit: 60,
            offset: 0,
        });
    });

    it('traduit la plage en borne ISO et nettoie la recherche', () => {
        const query = filtersToQuery(
            { levels: ['error'], sources: ['supabase'], range: '24h', search: 'table, colonne' },
            NOW,
        );
        expect(query.levels).toEqual(['error']);
        expect(query.sources).toEqual(['supabase']);
        expect(query.since).toBe('2026-09-28T12:00:00.000Z');
        expect(query.search).toBe('table colonne');
    });
});

describe('isFilterStateEmpty', () => {
    it('reconnaît l’état au repos', () => {
        expect(isFilterStateEmpty(EMPTY_LOG_FILTERS)).toBe(true);
        expect(isFilterStateEmpty({ ...EMPTY_LOG_FILTERS, search: '   ' })).toBe(true);
    });

    it('détecte un filtre actif', () => {
        expect(isFilterStateEmpty({ ...EMPTY_LOG_FILTERS, range: '7d' })).toBe(false);
        expect(isFilterStateEmpty({ ...EMPTY_LOG_FILTERS, levels: ['info'] })).toBe(false);
    });
});
