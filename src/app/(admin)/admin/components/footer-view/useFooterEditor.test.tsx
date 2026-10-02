import { act, renderHook } from '@testing-library/react';
import { DEFAULT_FOOTER } from '@/data/navigation';

const LOADED = DEFAULT_FOOTER.structure;

vi.mock('@/lib/data/site-service', () => ({
    getFooter: vi.fn(async () => ({ structure: LOADED, is_published: true })),
    upsertFooter: vi.fn(async () => true),
}));

vi.mock('@/app/(admin)/admin/actions', () => ({
    getSiteTranslation: vi.fn(async () => ({ success: true, payload: {}, updatedAt: null })),
    upsertSiteTranslation: vi.fn(async () => ({ success: true, payload: {} })),
    deleteSiteTranslation: vi.fn(async () => ({ success: true })),
}));

import { useFooterEditor } from './useFooterEditor';
import { useFooterSourceActions } from './useFooterSourceActions';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useFooterEditor — abandon', () => {
    it('revient au pied de page persisté et éteint le drapeau', async () => {
        const { result } = renderHook(() => useFooterEditor({ showToast: vi.fn() }));

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            result.current.updateBrand({ tagline: 'Modifié' });
        });
        expect(result.current.isDirty).toBe(true);

        act(() => {
            result.current.handleDiscard();
        });

        expect(result.current.isDirty).toBe(false);
        expect(result.current.structure).toEqual(LOADED);
    });
});

describe('useFooterSourceActions — « Réinitialiser » en anglais', () => {
    it('n’est plus un no-op : la structure revient aux valeurs par défaut', () => {
        const setStructure = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        const { result } = renderHook(() =>
            useFooterSourceActions({
                structure: LOADED,
                setStructure,
                mutateStructure: vi.fn(),
                isPublished: true,
                setIsPublished: vi.fn(),
                setIsDirty: vi.fn(),
                setExpandedColumn: vi.fn(),
                isEnglish: true,
                showToast: vi.fn(),
                startTransition: ((cb: () => void) => cb()) as never,
            })
        );

        act(() => {
            result.current.handleReset();
        });

        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(setStructure).toHaveBeenCalledWith(DEFAULT_FOOTER.structure);
        confirmSpy.mockRestore();
    });
});
