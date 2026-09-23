import React from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { InstagramReel } from './instagram-reels.data';

export interface VideosReelsModalProps {
    reel: InstagramReel | null;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
    labels: {
        closeTitle: string;
        watchOnInsta: string;
        prev: string;
        next: string;
    };
}

/**
 * Modale de lecture d'un Reel Instagram officiel du CUC.
 * Format smartphone cinématique 9:16, lecture iframe officielle sans badge.
 */
export const VideosReelsModal: React.FC<VideosReelsModalProps> = ({
    reel,
    onClose,
    onPrev,
    onNext,
    hasPrev = false,
    hasNext = false,
    labels,
}) => {
    React.useEffect(() => {
        if (!reel) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
            if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [reel, onClose, onPrev, onNext, hasPrev, hasNext]);

    if (!reel) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={reel.title}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[400px] bg-[#0c0c10] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header épuré */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#121218]">
                    <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                        <span className="text-xs font-mono-tech uppercase tracking-wider text-zinc-300 truncate">
                            {reel.title}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        title={labels.closeTitle}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        aria-label={labels.closeTitle}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Lecteur iframe officiel Instagram au format vertical */}
                <div className="relative w-full aspect-[9/16] max-h-[68vh] bg-black overflow-hidden flex items-center justify-center">
                    <iframe
                        src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
                        title={reel.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                        scrolling="no"
                        loading="lazy"
                    />
                </div>

                {/* Barre de navigation & lien direct */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/80 bg-[#121218]">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onPrev}
                            disabled={!hasPrev}
                            title={labels.prev}
                            className="p-2 border border-zinc-800 bg-[#0c0c10] text-zinc-300 hover:text-[#FFE500] hover:border-[#FFE500] disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                            aria-label={labels.prev}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!hasNext}
                            title={labels.next}
                            className="p-2 border border-zinc-800 bg-[#0c0c10] text-zinc-300 hover:text-[#FFE500] hover:border-[#FFE500] disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                            aria-label={labels.next}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors"
                    >
                        <span>{labels.watchOnInsta}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
};
