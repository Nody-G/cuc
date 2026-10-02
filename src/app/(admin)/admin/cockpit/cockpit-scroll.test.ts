import type React from 'react';
import { act, renderHook } from '@testing-library/react';
import { resetWindowScroll } from './cockpit-scroll';
import { useCockpitShortcuts } from './useCockpitShortcuts';
import type { TabType } from './cockpit-nav';

describe('resetWindowScroll', () => {
    it('remet la fenêtre en haut de façon instantanée', () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => { });

        resetWindowScroll();

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        scrollTo.mockRestore();
    });
});

describe('useCockpitShortcuts — changement d’onglet', () => {
    const renderShortcuts = (setActiveTab: React.Dispatch<React.SetStateAction<TabType>>) => {
        const noop = vi.fn();
        return renderHook(() =>
            useCockpitShortcuts({
                setActiveTab,
                isCommandPaletteOpen: false,
                setIsCommandPaletteOpen: noop,
                isShortcutsHelpOpen: false,
                setIsShortcutsHelpOpen: noop,
                isBackupModalOpen: false,
                setIsBackupModalOpen: noop,
                isHealthModalOpen: false,
                setIsHealthModalOpen: noop,
            })
        );
    };

    it('remonte la page à chaque changement d’onglet', () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => { });
        const setActiveTab = vi.fn() as unknown as React.Dispatch<React.SetStateAction<TabType>>;

        const { result } = renderShortcuts(setActiveTab);

        act(() => {
            result.current.switchTab('inquiries');
        });

        expect(setActiveTab).toHaveBeenCalledWith('inquiries');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        scrollTo.mockRestore();
    });
});
