/**
 * Tests des convertisseurs de lignes.
 *
 * Le point sensible est la ligne **mal formée** : elle doit rester affichable.
 * Un journal qui rejette silencieusement ce qu'il ne comprend pas finit par
 * cacher précisément les incidents qu'on cherchait.
 */
import { toActivityLogEntries, toActivityLogEntry } from './mappers';

describe('toActivityLogEntry', () => {
    it('convertit une ligne complète', () => {
        const entry = toActivityLogEntry({
            id: 'abc',
            occurred_at: '2026-09-29T10:00:00.000Z',
            level: 'error',
            source: 'supabase',
            category: 'db.rls_denied',
            message: 'Écriture refusée',
            target: 'site_pages',
            context: { code: '42501' },
            request_id: 'req-1',
            duration_ms: 42,
            origin: 'savePageContent',
            actor_id: 'user-1',
            actor_name: 'Niels',
            repeat_count: 3,
        });

        expect(entry.level).toBe('error');
        expect(entry.source).toBe('supabase');
        expect(entry.context).toEqual({ code: '42501' });
        expect(entry.duration_ms).toBe(42);
        expect(entry.repeat_count).toBe(3);
    });

    it('ramène une gravité inconnue à « info » et un domaine inconnu à « cockpit »', () => {
        const entry = toActivityLogEntry({ level: 'catastrophe', source: 'inventé' });
        expect(entry.level).toBe('info');
        expect(entry.source).toBe('cockpit');
    });

    it('remplace les valeurs absentes par des neutres plutôt que par undefined', () => {
        const entry = toActivityLogEntry({ id: 42, occurred_at: null, message: undefined });
        expect(entry.id).toBe('42');
        expect(entry.occurred_at).toBe('');
        expect(entry.message).toBe('');
        expect(entry.target).toBeNull();
        expect(entry.context).toBeNull();
        expect(entry.repeat_count).toBe(1);
    });

    it('ignore un contexte qui n’est pas un objet', () => {
        expect(toActivityLogEntry({ context: ['a'] }).context).toBeNull();
        expect(toActivityLogEntry({ context: 'texte' }).context).toBeNull();
    });
});

describe('toActivityLogEntries', () => {
    it('accepte un tableau vide ou absent', () => {
        expect(toActivityLogEntries(null)).toEqual([]);
        expect(toActivityLogEntries(undefined)).toEqual([]);
        expect(toActivityLogEntries([])).toEqual([]);
    });

    it('écarte les entrées non conformes sans perdre les autres', () => {
        const entries = toActivityLogEntries([null, 'texte', { id: 'ok' }]);
        expect(entries).toHaveLength(1);
        expect(entries[0].id).toBe('ok');
    });
});
