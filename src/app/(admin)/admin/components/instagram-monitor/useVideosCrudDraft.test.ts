import { act, renderHook } from '@testing-library/react';
import type { ProgrammeTvItem } from '@/data/videos';

const VIDEO_A: ProgrammeTvItem = { title: 'A', sub: 'S', img: '', dmId: 'a' };

vi.mock('@/lib/data/site-service', () => ({
    getVideos: vi.fn(async () => [VIDEO_A]),
}));

vi.mock('../../actions', () => ({
    updateSiteSettings: vi.fn(async () => ({ success: true })),
}));

import { useVideosCrudDraft } from './useVideosCrudDraft';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useVideosCrudDraft — abandon', () => {
    it('revient à la liste persistée et éteint le drapeau', async () => {
        const { result } = renderHook(() => useVideosCrudDraft(vi.fn()));

        await act(async () => {
            await Promise.resolve();
        });
        expect(result.current.isLoading).toBe(false);

        act(() => {
            result.current.addVideo({ title: 'B', sub: 'S', img: '', dmId: 'b' });
        });
        expect(result.current.isDirty).toBe(true);
        expect(result.current.videos).toHaveLength(2);

        act(() => {
            result.current.handleDiscard();
        });

        expect(result.current.videos).toEqual([VIDEO_A]);
        expect(result.current.isDirty).toBe(false);
    });
});
