import { act, renderHook } from '@testing-library/react';
import { usePersistedDraftDiscard } from './usePersistedDraftDiscard';

describe('usePersistedDraftDiscard', () => {
    it('restaure la dernière valeur persistée et rend le brouillon propre', () => {
        const restoreDraft = vi.fn();
        const markClean = vi.fn();

        const { result } = renderHook(() =>
            usePersistedDraftDiscard<string>('valeur initiale', restoreDraft, markClean)
        );

        act(() => {
            result.current.rememberPersisted('valeur enregistrée');
        });
        act(() => {
            result.current.discardPersisted();
        });

        expect(restoreDraft).toHaveBeenCalledWith('valeur enregistrée');
        expect(markClean).toHaveBeenCalledTimes(1);
    });

    it('sans enregistrement, revient à la valeur de départ', () => {
        const restoreDraft = vi.fn();

        const { result } = renderHook(() =>
            usePersistedDraftDiscard<{ a: number }>({ a: 1 }, restoreDraft, vi.fn())
        );

        act(() => {
            result.current.discardPersisted();
        });

        expect(restoreDraft).toHaveBeenCalledWith({ a: 1 });
    });
});
