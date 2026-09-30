import React from 'react';
import { X } from 'lucide-react';
import type { SelectedDmVideo } from './useVideosPage';

export interface DmVideoModalProps {
    video: SelectedDmVideo | null;
    onClose: () => void;
    closeTitle: string;
}

function resolveEmbedUrl(raw: string): { type: 'iframe' | 'video'; url: string } {
    if (!raw) return { type: 'iframe', url: '' };

    // Fichier vidéo direct (mp4, webm)
    if (raw.endsWith('.mp4') || raw.endsWith('.webm') || raw.includes('/video/upload/')) {
        return { type: 'video', url: raw };
    }

    // YouTube (URL longue, courte ou ID à 11 caractères)
    const ytMatch = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
        return { type: 'iframe', url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
    }

    // Dailymotion (URL ou identifiant x...)
    const dmMatch = raw.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|^)([a-zA-Z0-9]+)/);
    if (dmMatch && (dmMatch[1].startsWith('x') || dmMatch[1].startsWith('k'))) {
        return { type: 'iframe', url: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1` };
    }

    if (raw.startsWith('http')) {
        return { type: 'iframe', url: raw };
    }

    return { type: 'iframe', url: `https://www.dailymotion.com/embed/video/${raw}?autoplay=1` };
}

export const DmVideoModal: React.FC<DmVideoModalProps> = ({ video, onClose, closeTitle }) => {
    if (!video) return null;
    const embed = resolveEmbedUrl(video.id);

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
                    {embed.type === 'video' ? (
                        <video
                            src={embed.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <iframe
                            src={embed.url}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
