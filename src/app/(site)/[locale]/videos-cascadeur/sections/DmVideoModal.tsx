import React from 'react';
import Image from 'next/image';
import { ExternalLink, Play, X } from 'lucide-react';
import { resolveEmbedUrl } from '@/lib/video-embed';
import type { SelectedDmVideo } from './useVideosPage';

export interface DmVideoModalProps {
    video: SelectedDmVideo | null;
    onClose: () => void;
    closeTitle: string;
    /** Libellé du repli sortant (page publique de visionnage). */
    externalLabel?: string;
}

/**
 * Modale de lecture d'un reportage TV.
 *
 * Pour Dailymotion, les iframes intégrées sans Player ID retournent HTTP 403 « Forbidden ».
 * La modale affiche donc l'affiche en haute définition et invite à visionner le reportage
 * directement sur la chaîne officielle Dailymotion du CUC en toute fluidité.
 */
export const DmVideoModal: React.FC<DmVideoModalProps> = ({
    video,
    onClose,
    closeTitle,
    externalLabel,
}) => {
    if (!video) return null;
    const embed = resolveEmbedUrl(video.id);
    const watchUrl = embed.provider === 'file' ? undefined : (embed.watchUrl || `https://www.dailymotion.com/video/${video.id}`);

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-[#0e0e14] border-2 border-[#FFE500] p-4 sm:p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <h3 className="font-display text-xl uppercase text-white tracking-wide line-clamp-1">
                        {video.title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-[#FFE500] transition-colors cursor-pointer shrink-0 ml-4"
                        title={closeTitle}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative aspect-video w-full bg-black overflow-hidden group">
                    {embed.kind === 'video' ? (
                        <video
                            src={embed.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative block w-full h-full cursor-pointer"
                        >
                            {video.img ? (
                                <Image
                                    src={video.img}
                                    alt={video.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 896px"
                                    className="object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                                />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-20 h-20 rounded-full bg-[#FFE500] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-4">
                                    <Play className="w-9 h-9 fill-black ml-1" />
                                </div>
                                <span className="font-display text-xl sm:text-2xl uppercase tracking-wide text-white drop-shadow-md">
                                    Visionner sur Dailymotion
                                </span>
                                <span className="text-xs font-mono-tech text-zinc-300 mt-2 max-w-md bg-black/60 px-3 py-1.5 border border-zinc-700">
                                    Diffusion officielle HD • Clic pour ouvrir la vidéo
                                </span>
                            </div>
                        </a>
                    )}
                </div>

                {watchUrl && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-zinc-800 bg-[#0b0b10] p-3">
                        <div className="flex items-center gap-3">
                            {video.img && (
                                <Image
                                    src={video.img}
                                    alt=""
                                    width={96}
                                    height={54}
                                    className="h-[54px] w-24 shrink-0 object-cover border border-zinc-800 hidden sm:block"
                                />
                            )}
                            <div className="text-xs font-tech text-zinc-400">
                                <span className="text-zinc-200 block font-mono-tech font-bold uppercase">{video.title}</span>
                                <span>Reportage disponible sur la chaîne Dailymotion du Campus</span>
                            </div>
                        </div>
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE500] text-black hover:bg-white text-xs font-mono-tech uppercase font-bold tracking-wider transition-colors cursor-pointer"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {externalLabel || 'Ouvrir sur Dailymotion'}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
