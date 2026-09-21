import { SAVE_TONE_CLASSES, describeSaveStatus } from './persistenceStatus';

describe('persistenceStatus — destination des écritures', () => {
    it('annonce une écriture locale comme non partagée', () => {
        const local = describeSaveStatus({ state: 'saved', backend: 'local', savedAt: Date.now() });
        expect(local.tone).toBe('success');
        expect(local.label).toMatch(/localement/i);
        expect(local.detail).toMatch(/non partagé/i);
    });

    it('annonce une écriture Supabase comme partagée', () => {
        const remote = describeSaveStatus({ state: 'saved', backend: 'database', savedAt: Date.now() });
        expect(remote.tone).toBe('success');
        expect(remote.label).toMatch(/supabase/i);
        expect(remote.detail).toMatch(/partagé/i);
    });

    it('distingue un succès partiel d’un échec : les données sont bien en base', () => {
        const partial = describeSaveStatus({
            state: 'saved',
            backend: 'database',
            savedAt: Date.now(),
            warning: 'Données enregistrées, revalidation en échec : routes indisponibles',
        });
        expect(partial.tone).toBe('success');
        expect(partial.detail).toMatch(/attention/i);
        expect(partial.detail).toMatch(/revalidation/i);
    });

    it('prévient dès l’état au repos qu’un studio public n’écrit que dans le navigateur', () => {
        const idle = describeSaveStatus({ state: 'idle', backend: 'local' });
        expect(idle.label).toMatch(/locales/i);
        expect(idle.detail).toMatch(/navigateur/i);
    });

    it('ne prétend jamais qu’un studio local modifie le plan partagé', () => {
        const states = ['idle', 'saving', 'saved', 'error'] as const;
        states.forEach((state) => {
            const presentation = describeSaveStatus({ state, backend: 'local' });
            const text = `${presentation.label} ${presentation.detail ?? ''}`;
            expect(text).not.toMatch(/plan partagé/i);
            expect(text).not.toMatch(/supabase/i);
        });
    });
});

describe('persistenceStatus — états', () => {
    it('signale l’absence de modification en attente', () => {
        const idle = describeSaveStatus({ state: 'idle', backend: 'database' });
        expect(idle.tone).toBe('neutral');
        expect(idle.detail).toBeUndefined();
    });

    it('rappelle le dernier enregistrement réussi', () => {
        const idle = describeSaveStatus({ state: 'idle', backend: 'database', savedAt: Date.now() });
        expect(idle.detail).toMatch(/dernier enregistrement/i);
    });

    it('signale une écriture en cours', () => {
        expect(describeSaveStatus({ state: 'saving', backend: 'database' }).tone).toBe('progress');
    });

    it('remonte le message d’erreur réel au lieu de le masquer', () => {
        const failed = describeSaveStatus({
            state: 'error',
            backend: 'database',
            error: 'permission denied for table site_settings',
        });
        expect(failed.tone).toBe('error');
        expect(failed.label).toMatch(/échec/i);
        expect(failed.detail).toBe('permission denied for table site_settings');
    });

    it('fournit un repli explicite quand aucune cause n’est remontée', () => {
        expect(describeSaveStatus({ state: 'error', backend: 'database' }).detail).toMatch(/supabase/i);
        expect(describeSaveStatus({ state: 'error', backend: 'local' }).detail).toMatch(/stockage local/i);
    });

    it('tolère un état absent', () => {
        expect(describeSaveStatus(undefined).tone).toBe('neutral');
    });

    it('associe une classe de couleur à chaque intention', () => {
        (['neutral', 'progress', 'success', 'error'] as const).forEach((tone) => {
            expect(SAVE_TONE_CLASSES[tone]).toBeTruthy();
        });
    });
});
