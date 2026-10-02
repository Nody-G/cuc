import { act, renderHook } from '@testing-library/react';

vi.mock('@/app/(admin)/admin/actions', () => ({
    getSiteTranslation: vi.fn(async () => ({ success: true, payload: {}, updatedAt: null })),
    upsertSiteTranslation: vi.fn(async () => ({ success: true, payload: {} })),
    deleteSiteTranslation: vi.fn(async () => ({ success: true })),
}));

import { useEntityTranslation } from './useEntityTranslation';

interface Content {
    title: string;
    body: string;
}

const BASE: Content = { title: 'Bonjour', body: 'Texte source' };

describe('useEntityTranslation — signal de modification', () => {
    /**
     * Régression : en édition française, l'overlay anglais n'est ni chargé ni
     * édité. Le drapeau `dirty` ne doit jamais s'allumer — sinon la barre
     * d'enregistrement restait affichée et « Annuler » semblait sans effet.
     */
    it('reste propre en édition française même quand le contenu source change', () => {
        const { result, rerender } = renderHook(
            ({ base }: { base: Content }) =>
                useEntityTranslation<Content>({
                    entity: 'page',
                    entityId: '/',
                    locale: 'fr',
                    base,
                }),
            { initialProps: { base: BASE } }
        );

        expect(result.current.dirty).toBe(false);

        rerender({ base: { title: 'Modifié côté FR', body: 'Texte source' } });

        expect(result.current.dirty).toBe(false);
    });

    it('détecte une saisie anglaise non enregistrée', async () => {
        const { result } = renderHook(() =>
            useEntityTranslation<Content>({
                entity: 'page',
                entityId: '/',
                locale: 'en',
                base: BASE,
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.dirty).toBe(false);

        act(() => {
            result.current.setLocalized({ title: 'Hello', body: 'Source text' });
        });

        expect(result.current.dirty).toBe(true);
    });
});
