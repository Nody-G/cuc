import React from 'react';
import { X } from 'lucide-react';
import type { SelectedDmVideo } from './useVideosPage';

export interface DmVideoModalProps {
    video: SelectedDmVideo | null;
    onClose: () => void;
    closeTitle: string;
}

export const DmVideoModal: React.FC<DmVideoModalProps> = ({ video, onClose, closeTitle }) => {
    if (!video) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-[#0e0e14] border-2 border-[#FFE500] p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <h3 className="font-display text-xl uppercase text-white tracking-wide">
                        {video.title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-[#FFE500] transition-colors cursor-pointer"
                        title={closeTitle}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative aspect-video w-full bg-black">
                    <iframe
                        src={`https://www.dailymotion.com/embed/video/${video.id}?autoplay=1`}
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
