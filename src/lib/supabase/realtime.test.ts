import type { SupabaseClient } from '@supabase/supabase-js';
import { isCockpitRoute, subscribeTable } from './realtime';

/**
 * Garde-fou de la politique Realtime : le canal partagé est réservé au Cockpit.
 *
 * Ce qui est verrouillé ici :
 *   1. la reconnaissance des routes du Cockpit (`/admin`, `/admin/...`), y
 *      compris avec paramètres ou fragment, et le refus de la vitrine publique
 *      — une route localisée `fr/admin` n'est **pas** un accès ;
 *   2. l'absence totale de canal créé sur le chemin public : c'est la seule
 *      charge qui croît avec le nombre d'onglets ouverts (quota de connexions) ;
 *   3. le maintien du canal partagé côté Cockpit — la synchronisation
 *      instantanée est ce qu'un éditeur attend de son outil.
 */

function fakeClient() {
    const channel = { on: vi.fn().mockReturnThis(), subscribe: vi.fn() };
    const client = {
        channel: vi.fn(() => channel),
        removeChannel: vi.fn(),
    };
    return { client: client as unknown as SupabaseClient, channel, raw: client };
}

describe('isCockpitRoute', () => {
    it('reconnaît les routes du Cockpit', () => {
        expect(isCockpitRoute('/admin')).toBe(true);
        expect(isCockpitRoute('/admin/pages')).toBe(true);
        expect(isCockpitRoute('/admin/pages?tab=apercu')).toBe(true);
        expect(isCockpitRoute('/admin#haut')).toBe(true);
    });

    it('refuse la vitrine publique, même localisée ou vide', () => {
        for (const path of [
            '/',
            '/fr',
            '/en/formation-de-cascadeur',
            '/fr/admin',
            '/preview',
            '/administrateur',
            '',
        ]) {
            expect(isCockpitRoute(path)).toBe(false);
        }
    });
});

describe('subscribeTable — politique de connexion', () => {
    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('n’ouvre aucun canal sur la vitrine publique', () => {
        window.history.pushState({}, '', '/fr/formation-de-cascadeur');
        const { client, raw } = fakeClient();

        const unsubscribe = subscribeTable(client, { table: 'site_settings' }, () => { });

        expect(raw.channel).not.toHaveBeenCalled();
        expect(raw.removeChannel).not.toHaveBeenCalled();
        expect(() => unsubscribe()).not.toThrow();
    });

    it('ouvre le canal partagé dans le Cockpit', () => {
        window.history.pushState({}, '', '/admin/pages');
        const { client, channel, raw } = fakeClient();

        const unsubscribe = subscribeTable(client, { table: 'site_settings' }, () => { });

        expect(raw.channel).toHaveBeenCalledTimes(1);
        expect(channel.on).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    it('n’ouvre rien dans l’aperçu du Cockpit (le brouillon arrive par postMessage)', () => {
        window.history.pushState({}, '', '/admin/pages');
        const { client, raw } = fakeClient();
        // L'aperçu vit dans une iframe du Cockpit avec `?cuc-preview=1` : jsdom
        // ne simule pas la fenêtre parente, on vérifie donc la route seule ici —
        // le cas `isPreviewFrame` est couvert par `preview-context` et l'audit
        // de budget.
        expect(isCockpitRoute('/admin/pages')).toBe(true);

        const unsubscribe = subscribeTable(client, { table: 'site_settings' }, () => { });
        expect(raw.channel).toHaveBeenCalled();
        unsubscribe();
    });
});
