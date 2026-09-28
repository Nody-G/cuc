'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, ThumbsUp, MessageCircle, ExternalLink, Film, Image as ImageIcon, Star, Zap, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
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
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const isVideo = item.mediaType === 'VIDEO' || (!item.mediaType && (item.views ?? 0) > 0);
    const isCarousel = item.mediaType === 'CAROUSEL_ALBUM';

    // Calcul du taux d'engagement réel Meta (likes + comments) / views
    const totalEng = (item.likesCount || 0) + (item.commentsCount || 0);
    const engagementRate = isVideo && (item.views || 0) > 0
        ? ((totalEng / item.views) * 100).toFixed(2)
        : null;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(item.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`p-4 rounded-2xl border flex flex-col justify-between bg-[#0e0e15] hover:bg-[#12121c] transition-all group ${
                isFeatured
                    ? 'border-[#FFE500]/60 shadow-[0_0_20px_rgba(255,229,0,0.12)]'
                    : 'border-zinc-800/80 hover:border-zinc-700'
            }`}
        >
            <div className="flex gap-3.5 items-start">
                {/* Miniature 9:16 ou carrée */}
                <div className="w-20 h-28 rounded-xl overflow-hidden relative shrink-0 bg-zinc-900 border border-white/5 shadow-inner">
                    {item.coverImage ? (
                        <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="120px"
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono-tech">
                            {isVideo ? 'Vidéo' : 'Photo'}
                        </div>
                    )}

                    {/* Badge Type de publication */}
                    <div className="absolute top-1.5 left-1.5 bg-black/85 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[9px] font-mono-tech font-bold flex items-center gap-1 text-white shadow-xs">
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

                {/* Métadonnées & Métriques exactes */}
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-mono-tech text-zinc-500">#{item.shortcode}</span>

                        {item.date && (
                            <span className="text-[10px] font-mono-tech text-zinc-500">
                                • {item.date}
                            </span>
                        )}

                        {isFeatured && (
                            <span className="px-1.5 py-0.2 rounded bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase shadow-sm">
                                ★ Vitrine
                            </span>
                        )}
                    </div>

                    <h4 className="text-xs font-display font-medium text-white line-clamp-2 leading-relaxed" title={item.title}>
                        {item.title}
                    </h4>

                    {/* Métriques certifiées Meta */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono-tech text-zinc-400">
                        {isVideo && (
                            <div
                                className="flex items-center gap-1.5 text-[#FFE500] font-bold"
                                title={`${(item.views || 0).toLocaleString('fr-FR')} vues certifiées Meta API`}
                            >
                                <Eye className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{item.viewsFormatted || (item.views || 0).toLocaleString('fr-FR')} vues</span>
                            </div>
                        )}

                        {(typeof item.likesCount === 'number' || item.likes) && (
                            <div
                                className="flex items-center gap-1.5 text-rose-300"
                                title={`${(item.likesCount || 0).toLocaleString('fr-FR')} j'aime`}
                            >
                                <ThumbsUp className="w-3 h-3 text-rose-400 shrink-0" />
                                <span className="truncate">{item.likesCount ? item.likesCount.toLocaleString('fr-FR') : item.likes}</span>
                            </div>
                        )}

                        {typeof item.commentsCount === 'number' && (
                            <div
                                className="flex items-center gap-1.5 text-cyan-300"
                                title={`${item.commentsCount.toLocaleString('fr-FR')} commentaires`}
                            >
                                <MessageCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span className="truncate">{item.commentsCount.toLocaleString('fr-FR')}</span>
                            </div>
                        )}

                        {engagementRate && (
                            <div
                                className="flex items-center gap-1 text-emerald-400 font-bold"
                                title="Taux d'engagement calculé sur les vues réelles"
                            >
                                <Zap className="w-3 h-3 shrink-0" />
                                <span>{engagementRate}% eng.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions latérales : Étoile vitrine + Lien IG */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                    {isVideo && onToggleFeatured && (
                        <button
                            type="button"
                            onClick={onToggleFeatured}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isFeatured
                                    ? 'bg-[#FFE500] text-black hover:bg-yellow-400 font-bold shadow-md'
                                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-[#FFE500] border border-zinc-800'
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
                        className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                        title="Voir directement sur Instagram"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800 cursor-pointer"
                        title="Copier le lien"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Description détaillée dépliable */}
            {item.description && (
                <div className="mt-3 pt-3 border-t border-zinc-800/70">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-between w-full text-[11px] font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors cursor-pointer"
                    >
                        <span>{isExpanded ? 'Masquer la description' : 'Lire la description complète'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                        <div className="mt-2 text-xs font-mono-tech text-zinc-300 bg-[#07070b] p-3 rounded-xl border border-zinc-800/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto selection:bg-[#FFE500] selection:text-black">
                            {item.description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
