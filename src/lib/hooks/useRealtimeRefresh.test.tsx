import { render } from '@testing-library/react';
import {
    shouldRefreshOnReturn,
    useRealtimeRefresh,
    VISITOR_RETURN_MIN_INTERVAL_MS,
    type RealtimeRefreshOptions,
} from './useRealtimeRefresh';

/**
 * Garde-fou du régime de fraîcheur côté vitrine : pas de WebSocket, mais une
 * reprise d'onglet qui recharge — et un sondage de secours **visible seulement**.
 */

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock('@/lib/supabase/client', () => ({ createClient: mocks.createClient }));

function fakeChannel() {
    return { on: vi.fn().mockReturnThis(), subscribe: vi.fn() };
}

function Harness({
    refresh,
    options,
}: {
    refresh: () => void;
    options?: RealtimeRefreshOptions;
}) {
    useRealtimeRefresh(['site_settings'], refresh, options);
    return null;
}

describe('shouldRefreshOnReturn', () => {
    it('accepte un retour après l’intervalle minimum, refuse une rafale', () => {
        expect(shouldRefreshOnReturn(0, VISITOR_RETURN_MIN_INTERVAL_MS)).toBe(true);
        expect(shouldRefreshOnReturn(0, VISITOR_RETURN_MIN_INTERVAL_MS - 1)).toBe(false);
        expect(shouldRefreshOnReturn(Number.NaN, 1000)).toBe(false);
    });
});

describe('useRealtimeRefresh — vitrine publique', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
        mocks.createClient.mockReset();
        mocks.createClient.mockReturnValue({ channel: vi.fn(fakeChannel), removeChannel: vi.fn() });
        window.history.pushState({}, '', '/fr/formation-de-cascadeur');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('n’ouvre aucun client Supabase et recharge à la reprise d’onglet', () => {
        const refresh = vi.fn();
        render(<Harness refresh={refresh} />);

        expect(mocks.createClient).not.toHaveBeenCalled();

        // Un aller-retour immédiat ne recharge pas : le montage vient de le faire.
        window.dispatchEvent(new Event('focus'));
        expect(refresh).not.toHaveBeenCalled();

        vi.advanceTimersByTime(VISITOR_RETURN_MIN_INTERVAL_MS + 1);
        window.dispatchEvent(new Event('focus'));
        expect(refresh).toHaveBeenCalledTimes(1);

        // `focus` puis `visibilitychange` arrivent ensemble : un seul rechargement.
        document.dispatchEvent(new Event('visibilitychange'));
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('ne sonde que si l’onglet est visible, et seulement quand c’est demandé', () => {
        const refresh = vi.fn();
        let visibility: DocumentVisibilityState = 'hidden';
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => visibility,
        });

        render(<Harness refresh={refresh} options={{ pollMs: 1000 }} />);

        vi.advanceTimersByTime(5000);
        expect(refresh).not.toHaveBeenCalled();

        visibility = 'visible';
        vi.advanceTimersByTime(1000);
        expect(refresh).toHaveBeenCalledTimes(1);

        // Le retour d'onglet reste soumis à l'intervalle minimum, pas le sondage.
        document.dispatchEvent(new Event('visibilitychange'));
        expect(refresh).toHaveBeenCalledTimes(1);
    });

    it('ne sonde pas quand aucun intervalle n’est demandé (défaut de la vitrine)', () => {
        const refresh = vi.fn();
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => 'visible',
        });

        render(<Harness refresh={refresh} />);

        vi.advanceTimersByTime(10 * 60 * 1000);
        expect(refresh).not.toHaveBeenCalled();
    });
});

describe('useRealtimeRefresh — Cockpit', () => {
    beforeEach(() => {
        mocks.createClient.mockReset();
        mocks.createClient.mockReturnValue({ channel: vi.fn(fakeChannel), removeChannel: vi.fn() });
        window.history.pushState({}, '', '/admin/pages');
    });

    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('garde le canal partagé pour l’outil d’édition', () => {
        const refresh = vi.fn();
        render(<Harness refresh={refresh} />);

        expect(mocks.createClient).toHaveBeenCalledTimes(1);
    });
});
