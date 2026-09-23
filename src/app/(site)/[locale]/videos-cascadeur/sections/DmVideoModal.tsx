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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-label={video.title}
            onClick={onClose}
        >
            {/* Halo d'ambiance cinématique */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-[600px] h-[600px] rounded-full bg-[#FFE500]/[0.08] blur-[140px]" />
            </div>

            <div
                className="relative w-full max-w-4xl bg-[#0c0c12] border border-zinc-800/90 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(255,229,0,0.06)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header cinématique */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#121218]">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] animate-pulse flex-shrink-0" />
                        <h3 className="font-display text-base sm:text-xl uppercase text-white tracking-wide truncate">
                            {video.title}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFE500]/60 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                        title={closeTitle}
                        aria-label={closeTitle}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Lecteur 16:9 */}
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
