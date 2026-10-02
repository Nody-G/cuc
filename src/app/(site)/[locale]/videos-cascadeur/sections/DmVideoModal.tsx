import React from 'react';
import Image from 'next/image';
import { ExternalLink, X } from 'lucide-react';
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
 * La résolution de la référence (`resolveEmbedUrl`) vit dans
 * [`src/lib/video-embed.ts`](../../../../../../lib/video-embed.ts) : ce composant
 * ne garde que la présentation. Un repli explicite (affiche + lien sortant) est
 * proposé lorsque le média est identifié sur une plateforme tierce, car un
 * hébergeur peut refuser l'encadrement (403 « Forbidden ») sans que l'URL soit
 * fautive.
 */
export const DmVideoModal: React.FC<DmVideoModalProps> = ({
    video,
    onClose,
    closeTitle,
    externalLabel,
}) => {
    if (!video) return null;
    const embed = resolveEmbedUrl(video.id);
    const watchUrl = embed.provider === 'file' ? undefined : embed.watchUrl;

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
                    {embed.kind === 'video' ? (
                        <video
                            src={embed.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                        />
                    ) : embed.url ? (
                        <iframe
                            src={embed.url}
                            title={video.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    ) : video.img ? (
                        <Image
                            src={video.img}
                            alt={video.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 896px"
                            className="object-cover opacity-70"
                        />
                    ) : null}
                </div>

                {watchUrl && externalLabel && (
                    <div className="mt-3 flex items-center gap-3 border border-zinc-800 bg-[#0b0b10] p-2.5">
                        {video.img && (
                            <Image
                                src={video.img}
                                alt=""
                                width={96}
                                height={54}
                                className="h-[54px] w-24 shrink-0 object-cover border border-zinc-800"
                            />
                        )}
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-tech uppercase tracking-wide text-[#FFE500] hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {externalLabel}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
