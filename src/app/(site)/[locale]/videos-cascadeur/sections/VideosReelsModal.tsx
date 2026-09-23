import React from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { InstagramReel } from './instagram-reels.data';

export interface VideosReelsModalProps {
    reel: InstagramReel | null;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
    labels: {
        closeTitle: string;
        watchOnInsta?: string;
        prev: string;
        next: string;
    };
}

/**
 * Modale de lecture cinématique pour les Reels officiels du CUC.
 * Présentation moderne et accueillante à deux colonnes sur desktop (lecteur 9:16 + détails CUC),
 * rétro-éclairage d'ambiance et navigation fluide.
 */
export const VideosReelsModal: React.FC<VideosReelsModalProps> = ({
    reel,
    onClose,
    onPrev,
    onNext,
    hasPrev = false,
    hasNext = false,
    currentIndex,
    totalCount,
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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-label={reel.title}
            onClick={onClose}
        >
            {/* Halo d'ambiance cinématique en arrière-plan */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="w-[600px] h-[600px] rounded-full bg-[#FFE500]/[0.08] blur-[140px]" />
            </div>

            {/* Fenêtre principale du lecteur */}
            <div
                className="relative w-full max-w-4xl bg-[#0c0c12] border border-zinc-800/90 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(255,229,0,0.06)] flex flex-col md:flex-row overflow-hidden max-h-[92vh] md:h-[680px]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header compact pour écran mobile */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#121218] flex-shrink-0">
                    <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
                        <span className="text-xs font-mono-tech uppercase tracking-wider text-zinc-300 truncate">
                            {reel.title}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        title={labels.closeTitle}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        aria-label={labels.closeTitle}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Colonne gauche : Lecteur 9:16 officiel Instagram */}
                <div className="relative w-full md:w-[380px] lg:w-[410px] flex-shrink-0 bg-black flex items-center justify-center overflow-hidden aspect-[9/16] md:aspect-auto md:h-full border-b md:border-b-0 md:border-r border-zinc-800/80">
                    <iframe
                        src={`https://www.instagram.com/reel/${reel.shortcode}/embed/`}
                        title={reel.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                        scrolling="no"
                        loading="lazy"
                    />
                </div>

                {/* Colonne droite : Présentation chaleureuse, histoire & navigation */}
                <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#12121a] via-[#0d0d14] to-[#09090d] overflow-hidden">
                    {/* Header desktop */}
                    <div className="hidden md:flex items-center justify-between p-6 border-b border-zinc-800/60 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/80 border border-[#FFE500]/50 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(255,229,0,0.15)] flex-shrink-0">
                                <Image
                                    src="/images/logos/cuc-logo-yellow.png"
                                    alt="CUC"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-display uppercase tracking-wide text-white">
                                    Campus Univers Cascades
                                </h3>
                                <p className="text-[11px] font-mono-tech text-[#FFE500]">
                                    @campus.univers.cascades • Officiel
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            title={labels.closeTitle}
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFE500]/60 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            aria-label={labels.closeTitle}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Corps scrollable : Titre, histoire & description */}
                    <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFE500]/10 border border-[#FFE500]/30 text-[10px] font-mono-tech uppercase text-[#FFE500] font-bold tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse" />
                            <span>Action & Cascade CUC</span>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-white leading-tight">
                                {reel.title}
                            </h2>
                            <div className="h-0.5 w-12 bg-[#FFE500] rounded-full mt-3" />
                        </div>

                        {reel.description && (
                            <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                <p className="text-xs sm:text-sm font-tech text-zinc-200 leading-relaxed whitespace-pre-line">
                                    {reel.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-2 text-[11px] font-mono-tech text-zinc-400 flex items-center gap-1.5">
                            <span className="text-[#FFE500]">📍</span>
                            <span>Domaine CUC • Le Cateau-Cambrésis (Hauts-de-France)</span>
                        </div>
                    </div>

                    {/* Footer de navigation fluide */}
                    <div className="p-4 md:px-6 md:py-4 border-t border-zinc-800/80 bg-[#0c0c12]/95 flex items-center justify-between gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onPrev}
                            disabled={!hasPrev}
                            title={labels.prev}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 hover:border-[#FFE500] bg-[#14141c] hover:bg-[#1c1c28] text-xs font-mono-tech uppercase text-zinc-300 hover:text-[#FFE500] transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                            aria-label={labels.prev}
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">{labels.prev}</span>
                        </button>

                        {currentIndex && totalCount ? (
                            <span className="text-xs font-mono-tech text-zinc-400 uppercase tracking-widest">
                                {currentIndex} / {totalCount}
                            </span>
                        ) : null}

                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!hasNext}
                            title={labels.next}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 hover:border-[#FFE500] bg-[#14141c] hover:bg-[#1c1c28] text-xs font-mono-tech uppercase text-zinc-300 hover:text-[#FFE500] transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                            aria-label={labels.next}
                        >
                            <span className="hidden sm:inline">{labels.next}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
