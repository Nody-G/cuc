import { render, screen, waitFor } from '@testing-library/react';
import { SiteDataProvider } from '@/components/i18n/SiteDataProvider';
import { usePageDynamicContent } from './usePageDynamicContent';

/**
 * ==============================================================================
 * Preuve du contrat « contenu de page fourni par le serveur » (WS-D / WS-P1.1)
 * ==============================================================================
 * Quand le serveur a injecté `page` dans le provider (via `SitePageScope` /
 * `PageDataProvider`), le hook NE DOIT PAS rejouer la lecture `site_pages`.
 * C'est exactement ce chemin qui supprimait la lecture PostgREST par visiteur
 * — et le téléchargement de `@supabase/supabase-js` — sur les routes publiques.
 */

const mocks = vi.hoisted(() => ({
    loadSupabase: vi.fn(),
    isCockpitRoute: vi.fn(),
    subscribeTable: vi.fn(),
}));

vi.mock('@/lib/supabase/lazy-client', () => ({
    loadSupabaseBrowserClient: mocks.loadSupabase,
}));

vi.mock('@/lib/supabase/realtime', () => ({
    isCockpitRoute: (path: string) => mocks.isCockpitRoute(path),
    subscribeTable: (...args: unknown[]) => mocks.subscribeTable(...args),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => '/fr/videos-cascadeur',
}));

vi.mock('@/lib/preview/preview-context', () => ({
    isPreviewFrame: () => false,
}));

function Harness() {
    const { content } = usePageDynamicContent('videos-cascadeur');
    return <span data-testid="title">{content.title}</span>;
}

const serverPage = {
    slug: 'videos-cascadeur',
    title: 'Titre servi par le serveur',
    hero: { title: 'H', subtitle: 'S' },
    layout_sections: [],
    sections_data: {},
    sections: [],
    is_published: true,
} as never;

describe('usePageDynamicContent — page fournie par le serveur', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isCockpitRoute.mockReturnValue(false);
        mocks.subscribeTable.mockReturnValue(() => { });
    });

    it('n’instancie AUCUN client Supabase et sert le contenu serveur', async () => {
        render(
            <SiteDataProvider value={{ locale: 'fr', page: serverPage }}>
                <Harness />
            </SiteDataProvider>
        );

        // Premier rendu : le contenu vient du serveur, sans clignotement.
        expect(screen.getByTestId('title').textContent).toBe('Titre servi par le serveur');

        // La garde est évaluée…
        await waitFor(() => expect(mocks.isCockpitRoute).toHaveBeenCalled());

        // …et court-circuite AVANT toute ouverture du client Supabase.
        expect(mocks.loadSupabase).not.toHaveBeenCalled();
        expect(mocks.subscribeTable).not.toHaveBeenCalled();
    });

    it('rejoue la lecture quand AUCUNE page serveur n’est fournie (repli)', async () => {
        mocks.loadSupabase.mockResolvedValue({
            from: () => ({
                select: () => ({
                    eq: () => ({
                        maybeSingle: async () => ({ data: null, error: null }),
                        eq: () => ({
                            eq: () => ({
                                maybeSingle: async () => ({ data: null, error: null }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        render(
            <SiteDataProvider value={{ locale: 'fr' }}>
                <Harness />
            </SiteDataProvider>
        );

        await waitFor(() => expect(mocks.loadSupabase).toHaveBeenCalledTimes(1));
    });
});
