import { act, renderHook } from '@testing-library/react';

vi.mock('../../actions', () => ({
    updateSiteSettings: vi.fn(async () => ({ success: true })),
}));

vi.mock('@/lib/data/site-service', () => ({
    DEFAULT_SITE_SETTINGS: {},
}));

import { useSettingsForm } from './useSettingsForm';

describe('useSettingsForm — abandon', () => {
    it('revient aux réglages persistés et éteint le drapeau', () => {
        const initial = { campusName: 'CUC initial' } as never;

        const { result } = renderHook(() => useSettingsForm({ initialSettings: initial }));

        act(() => {
            result.current.handleChange('campusName' as never, 'Modifié');
        });
        expect(result.current.isDirty).toBe(true);

        act(() => {
            result.current.handleDiscard();
        });

        expect(result.current.settings).toBe(initial);
        expect(result.current.isDirty).toBe(false);
    });

    it('« Valeurs par défaut » reste distinct de l’abandon', () => {
        const initial = { campusName: 'CUC initial' } as never;
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() => useSettingsForm({ initialSettings: initial }));

        act(() => {
            result.current.handleResetToDefault();
        });

        expect(result.current.settings).not.toBe(initial);
        expect(result.current.isDirty).toBe(true);
        confirmSpy.mockRestore();
    });
});
