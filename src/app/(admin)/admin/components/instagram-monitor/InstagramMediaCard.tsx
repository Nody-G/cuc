'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, ThumbsUp, MessageCircle, ExternalLink, Film, Image as ImageIcon, Star } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramMediaCardProps {
    item: InstagramReelMetric;
    isFeatured?: boolean;
    onToggleFeatured?: () => void;
}

export const InstagramMediaCard: React.FC<InstagramMediaCardProps> = ({
    item,
    isFeatured,
    onToggleFeatured,
}) => {
    const isVideo = item.mediaType === 'VIDEO' || (!item.mediaType && (item.views ?? 0) > 0);
    const isCarousel = item.mediaType === 'CAROUSEL_ALBUM';

    return (
        <div
            className={`p-3.5 rounded-xl border flex gap-3.5 items-start bg-[#101017] hover:bg-[#13131c] transition-all group ${
                isFeatured
                    ? 'border-[#FFE500]/60 shadow-[0_0_15px_rgba(255,229,0,0.1)]'
                    : 'border-zinc-800/80 hover:border-zinc-700'
            }`}
        >
            {/* Miniature */}
            <div className="w-16 h-22 rounded-lg overflow-hidden relative shrink-0 bg-zinc-900 border border-white/5">
                {item.coverImage ? (
                    <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        sizes="90px"
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono-tech">
                        {isVideo ? 'Vidéo' : 'Photo'}
                    </div>
                )}

                {/* Badge Type de publication */}
                <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono-tech flex items-center gap-1 text-white">
                    {isVideo ? (
                        <>
                            <Film className="w-2.5 h-2.5 text-[#FFE500]" />
                            <span>Reel</span>
                        </>
                    ) : isCarousel ? (
                        <>
                            <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                            <span>Album</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="w-2.5 h-2.5 text-zinc-400" />
                            <span>Photo</span>
                        </>
                    )}
                </div>
            </div>

            {/* Données & Métriques exactes */}
            <div className="flex-grow min-w-0 flex flex-col justify-between self-stretch">
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono-tech text-zinc-500">#{item.shortcode}</span>

                        {item.date && (
                            <span className="text-[10px] font-mono-tech text-zinc-500">
                                {item.date}
                            </span>
                        )}

                        {isFeatured && (
                            <span className="px-1.5 py-0.2 rounded bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase shadow-sm">
                                ★ Vitrine
                            </span>
                        )}
                    </div>

                    <h4 className="text-xs font-display text-white line-clamp-2" title={item.title}>
                        {item.title}
                    </h4>
                </div>

                {/* Métriques certifiées */}
                <div className="flex items-center gap-3.5 mt-2.5 text-xs font-mono-tech text-zinc-400 flex-wrap">
                    {isVideo && (
                        <div
                            className="flex items-center gap-1 text-[#FFE500] font-bold"
                            title={`${(item.views || 0).toLocaleString('fr-FR')} vues certifiées`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{item.viewsFormatted || (item.views || 0).toLocaleString('fr-FR')}</span>
                        </div>
                    )}

                    {(typeof item.likesCount === 'number' || item.likes) && (
                        <div
                            className="flex items-center gap-1 text-zinc-300"
                            title={`${(item.likesCount || 0).toLocaleString('fr-FR')} j'aime`}
                        >
                            <ThumbsUp className="w-3 h-3 text-rose-400" />
                            <span>{item.likesCount ? item.likesCount.toLocaleString('fr-FR') : item.likes}</span>
                        </div>
                    )}

                    {typeof item.commentsCount === 'number' && item.commentsCount > 0 && (
                        <div
                            className="flex items-center gap-1 text-zinc-400"
                            title={`${item.commentsCount.toLocaleString('fr-FR')} commentaires`}
                        >
                            <MessageCircle className="w-3 h-3 text-cyan-400" />
                            <span>{item.commentsCount.toLocaleString('fr-FR')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions : Lien Instagram + Étoile vitrine */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
                {isVideo && onToggleFeatured && (
                    <button
                        type="button"
                        onClick={onToggleFeatured}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isFeatured
                                ? 'bg-[#FFE500] text-black hover:bg-yellow-400 font-bold'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#FFE500]'
                        }`}
                        title={isFeatured ? 'Retirer de la vitrine' : 'Mettre en avant sur la vitrine'}
                    >
                        <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                    </button>
                )}

                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Voir sur Instagram"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
};
