'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEVICE_WIDTHS, type PreviewDevice } from './preview-devices';

interface UseLivePreviewPaneArgs {
    /** URL absolue de la page vitrine à charger (pour l'ouverture externe). */
    previewUrl: string;
}

export interface LivePreviewPaneController {
    device: PreviewDevice;
    setDevice: React.Dispatch<React.SetStateAction<PreviewDevice>>;
    /** Incrémenté pour forcer le rechargement de l'iframe. */
    localKey: number;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    handleRefresh: () => void;
    handleOpenExternal: () => void;
    frameWidth: string;
    frameHeight: string;
}

/**
 * Orchestration de l'aperçu : appareil simulé, rechargement, plein écran
 * (Échap pour sortir, page figée derrière l'aperçu).
 */
export function useLivePreviewPane({ previewUrl }: UseLivePreviewPaneArgs): LivePreviewPaneController {
    const [device, setDevice] = useState<PreviewDevice>('desktop');
    const [localKey, setLocalKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleRefresh = useCallback(() => {
        setLocalKey((prev) => prev + 1);
    }, []);

    const handleOpenExternal = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
        }
    }, [previewUrl]);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    // Plein écran : Échap pour sortir, page figée derrière l'aperçu.
    useEffect(() => {
        if (!isFullscreen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsFullscreen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isFullscreen]);

    const frameWidth = useMemo(() => DEVICE_WIDTHS[device], [device]);
    const frameHeight = isFullscreen ? '100%' : '72vh';

    return {
        device,
        setDevice,
        localKey,
        isFullscreen,
        toggleFullscreen,
        handleRefresh,
        handleOpenExternal,
        frameWidth,
        frameHeight,
    };
}
