import React from 'react';
import type { MediaState } from './overlay-model';

export interface MediaReplaceOverlayProps {
    media: MediaState;
    onReplace: () => void;
}

export const MediaReplaceOverlay: React.FC<MediaReplaceOverlayProps> = ({ media, onReplace }) => (
    <div
        data-cuc-media-overlay=""
        style={{
            position: 'fixed',
            left: media.layout.left,
            top: media.layout.top,
            maxWidth: media.layout.width,
            zIndex: 2147483000,
        }}
    >
        <button
            type="button"
            onClick={onReplace}
            className="w-full bg-[#FFE500] text-black font-mono-tech text-[11px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-black/40 hover:opacity-90 transition-opacity"
        >
            Remplacer l’image
        </button>
    </div>
);
