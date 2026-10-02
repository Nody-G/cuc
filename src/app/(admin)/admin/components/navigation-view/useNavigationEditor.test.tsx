import { act, renderHook } from '@testing-library/react';
import { DEFAULT_NAVIGATION } from '@/data/navigation';

const LOADED = DEFAULT_NAVIGATION.structure;

vi.mock('@/lib/data/site-service', () => ({
    getNavigation: vi.fn(async () => ({ structure: LOADED, is_published: true })),
    upsertNavigation: vi.fn(async () => true),
}));

vi.mock('@/app/(admin)/admin/actions', () => ({
    getSiteTranslation: vi.fn(async () => ({ success: true, payload: {}, updatedAt: null })),
    upsertSiteTranslation: vi.fn(async () => ({ success: true, payload: {} })),
    deleteSiteTranslation: vi.fn(async () => ({ success: true })),
}));

import { useNavigationEditor } from './useNavigationEditor';
import { useNavigationSourceActions } from './useNavigationSourceActions';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useNavigationEditor — abandon', () => {
    it('revient à la navigation persistée et éteint le drapeau', async () => {
        const { result } = renderHook(() => useNavigationEditor({ showToast: vi.fn() }));

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            result.current.addItem();
        });
        expect(result.current.isDirty).toBe(true);

        act(() => {
            result.current.handleDiscard();
        });

        expect(result.current.isDirty).toBe(false);
        expect(result.current.structure).toEqual(LOADED);
    });
});

describe('useNavigationSourceActions — « Réinitialiser » en anglais', () => {
    it('n’est plus un no-op : la structure revient aux valeurs par défaut', () => {
        const setStructure = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() =>
            useNavigationSourceActions({
                structure: LOADED,
                setStructure,
                mutateStructure: vi.fn(),
                setIsDirty: vi.fn(),
                setIsPublished: vi.fn(),
                setExpandedId: vi.fn(),
                isEnglish: true,
                showToast: vi.fn(),
            })
        );

        act(() => {
            result.current.handleReset();
        });

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(setStructure).toHaveBeenCalledWith(DEFAULT_NAVIGATION.structure);
        confirmSpy.mockRestore();
    });
});
