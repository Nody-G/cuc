import { act, renderHook } from '@testing-library/react';
import { usePageEditorDirtyState, type PageEditorDraftSource } from './usePageEditorDirtyState';
import type { ChromeDraftState } from './useChromeDraftState';
import {
    clearDraftSnapshot,
    readDraftSnapshot,
    writeDraftSnapshot,
} from '@/lib/preview/draft-storage';
import {
    CHROME_DRAFT_STORAGE_PREFIX,
    clearChromeDraftSnapshot,
} from '@/lib/preview/chrome-draft-storage';

const makeChrome = (overrides: Partial<ChromeDraftState> = {}): ChromeDraftState => ({
    settings: {},
    microcopy: {},
    entities: {},
    commitSetting: vi.fn(),
    commitMicrocopy: vi.fn(),
    commitEntity: vi.fn(),
    clearSettings: vi.fn(),
    clearMicrocopy: vi.fn(),
    clearEntities: vi.fn(),
    ...overrides,
});

const makeDraft = (overrides: Partial<PageEditorDraftSource> = {}): PageEditorDraftSource => ({
    draftChanges: [{ path: 'hero.title' }],
    translation: { dirty: false, revert: vi.fn() },
    handleRevertAllChanges: vi.fn(),
    ...overrides,
});

/** Purge réelle des deux filets locaux, telle que câblée par `PagesEditorView`. */
const purgeLocalSnapshots = () => {
    clearDraftSnapshot('/', 'fr');
    clearChromeDraftSnapshot('fr');
};

beforeEach(() => {
    localStorage.clear();
});

describe('usePageEditorDirtyState', () => {
    it('signale un brouillon tant qu’une source est modifiée', () => {
        const { result } = renderHook(() =>
            usePageEditorDirtyState(makeDraft(), makeChrome(), 'fr', vi.fn())
        );

        expect(result.current.isDirty).toBe(true);
    });

    it('abandonne page + chrome, puis purge les clés localStorage (aucune résurrection)', () => {
        const handleRevertAllChanges = vi.fn();
        const revert = vi.fn();
        const draft = makeDraft({
            handleRevertAllChanges,
            translation: { dirty: false, revert },
        });
        const chrome = makeChrome({ settings: { hero_badge: 'X' } });

        writeDraftSnapshot('/', 'fr', { title: 'brouillon abandonné' });
        localStorage.setItem(
            `${CHROME_DRAFT_STORAGE_PREFIX}.fr`,
            JSON.stringify({
                version: 1,
                savedAt: Date.now(),
                locale: 'fr',
                settings: { hero_badge: 'X' },
                microcopy: {},
                entities: {},
            })
        );
        expect(readDraftSnapshot('/', 'fr')).not.toBeNull();

        const { result } = renderHook(() =>
            usePageEditorDirtyState(draft, chrome, 'fr', purgeLocalSnapshots)
        );

        act(() => {
            result.current.discardAll();
        });

        expect(handleRevertAllChanges).toHaveBeenCalledTimes(1);
        expect(revert).not.toHaveBeenCalled();
        expect(chrome.clearSettings).toHaveBeenCalledTimes(1);
        expect(chrome.clearMicrocopy).toHaveBeenCalledTimes(1);
        expect(chrome.clearEntities).toHaveBeenCalledTimes(1);
        // Les deux filets locaux ont réellement disparu du stockage.
        expect(readDraftSnapshot('/', 'fr')).toBeNull();
        expect(localStorage.getItem(`${CHROME_DRAFT_STORAGE_PREFIX}.fr`)).toBeNull();
    });

    it('en anglais, abandonne la traduction et purge le filet local', () => {
        const handleRevertAllChanges = vi.fn();
        const revert = vi.fn();
        const draft = makeDraft({
            handleRevertAllChanges,
            translation: { dirty: true, revert },
        });
        const purge = vi.fn();

        const { result } = renderHook(() =>
            usePageEditorDirtyState(draft, makeChrome(), 'en', purge)
        );

        act(() => {
            result.current.discardAll();
        });

        expect(revert).toHaveBeenCalledTimes(1);
        expect(handleRevertAllChanges).not.toHaveBeenCalled();
        expect(purge).toHaveBeenCalledTimes(1);
    });
});
