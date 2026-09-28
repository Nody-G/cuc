'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, ThumbsUp, MessageCircle, ExternalLink, Film, Image as ImageIcon, Star, Zap, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

interface InstagramMediaTableProps {
    items: InstagramReelMetric[];
    featuredShortcodes: Set<string>;
    onToggleFeatured: (item: InstagramReelMetric) => void;
    showToast: (msg: string) => void;
}

export const InstagramMediaTable: React.FC<InstagramMediaTableProps> = ({
    items,
    featuredShortcodes,
    onToggleFeatured,
    showToast,
}) => {
    const [expandedShortcode, setExpandedShortcode] = React.useState<string | null>(null);
    const [copiedShortcode, setCopiedShortcode] = React.useState<string | null>(null);

    const handleCopy = (e: React.MouseEvent, url: string, shortcode: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setCopiedShortcode(shortcode);
        showToast(`Lien copié : #${shortcode}`);
        setTimeout(() => setCopiedShortcode(null), 2000);
    };

    const toggleExpand = (shortcode: string) => {
        setExpandedShortcode((prev) => (prev === shortcode ? null : shortcode));
    };

    return (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0c0c12]">
            <table className="w-full text-left text-xs font-mono-tech border-collapse min-w-[760px]">
                <thead>
                    <tr className="border-b border-zinc-800 bg-[#12121a] text-zinc-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5 w-16 text-center">Média</th>
                        <th className="py-3 px-4">Titre & Légende</th>
                        <th className="py-3 px-3 w-24">Date</th>
                        <th className="py-3 px-3 w-28 text-right">Vues (Meta)</th>
                        <th className="py-3 px-3 w-24 text-right">Likes</th>
                        <th className="py-3 px-3 w-24 text-right">Comm.</th>
                        <th className="py-3 px-3 w-24 text-right">Eng. (%)</th>
                        <th className="py-3 px-3 w-16 text-center">Vitrine</th>
                        <th className="py-3 px-3 w-20 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                    {items.map((item) => {
                        const isVideo = item.mediaType === 'VIDEO' || (!item.mediaType && (item.views ?? 0) > 0);
                        const isCarousel = item.mediaType === 'CAROUSEL_ALBUM';
                        const isFeatured = featuredShortcodes.has(item.shortcode) || item.isFeatured;
                        const isExpanded = expandedShortcode === item.shortcode;
                        const totalEng = (item.likesCount || 0) + (item.commentsCount || 0);
                        const engRate = isVideo && (item.views || 0) > 0
                            ? ((totalEng / item.views) * 100).toFixed(2)
                            : null;

                        return (
                            <React.Fragment key={item.id || item.shortcode}>
                                <tr className="hover:bg-[#151520] transition-colors group">
                                    {/* Vignette */}
                                    <td className="py-2.5 px-3.5 text-center">
                                        <div className="w-11 h-14 rounded-lg overflow-hidden relative mx-auto bg-zinc-900 border border-white/10 shrink-0">
                                            {item.coverImage ? (
                                                <Image
                                                    src={item.coverImage}
                                                    alt={item.title}
                                                    fill
                                                    sizes="60px"
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px]">
                                                    {isVideo ? 'Vid' : 'Img'}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0.5 right-0.5 bg-black/80 rounded px-1 text-[8px] text-white">
                                                {isVideo ? (
                                                    <Film className="w-2.5 h-2.5 text-[#FFE500]" />
                                                ) : isCarousel ? (
                                                    <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                                                ) : (
                                                    <ImageIcon className="w-2.5 h-2.5 text-zinc-400" />
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Titre & Description */}
                                    <td className="py-2.5 px-4 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] text-zinc-500">#{item.shortcode}</span>
                                            {isFeatured && (
                                                <span className="px-1.5 py-0.2 rounded bg-[#FFE500] text-black text-[9px] font-bold uppercase">
                                                    ★ Vitrine
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(item.shortcode)}
                                            className="text-left font-display text-xs text-white hover:text-[#FFE500] line-clamp-1 cursor-pointer transition-colors block"
                                            title="Cliquer pour afficher la description complète"
                                        >
                                            {item.title}
                                        </button>
                                    </td>

                                    {/* Date */}
                                    <td className="py-2.5 px-3 text-zinc-400 text-[11px] whitespace-nowrap">
                                        {item.date || '—'}
                                    </td>

                                    {/* Vues */}
                                    <td className="py-2.5 px-3 text-right">
                                        {isVideo ? (
                                            <div
                                                className="inline-flex items-center gap-1 text-[#FFE500] font-bold"
                                                title={`${(item.views || 0).toLocaleString('fr-FR')} vues certifiées`}
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>{(item.views || 0).toLocaleString('fr-FR')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600">—</span>
                                        )}
                                    </td>

                                    {/* Likes */}
                                    <td className="py-2.5 px-3 text-right text-rose-300">
                                        {(typeof item.likesCount === 'number' || item.likes) ? (
                                            <div className="inline-flex items-center gap-1" title={`${(item.likesCount || 0).toLocaleString('fr-FR')} j'aime`}>
                                                <ThumbsUp className="w-3 h-3 text-rose-400" />
                                                <span>{(item.likesCount || 0).toLocaleString('fr-FR')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600">—</span>
                                        )}
                                    </td>

                                    {/* Commentaires */}
                                    <td className="py-2.5 px-3 text-right text-cyan-300">
                                        {typeof item.commentsCount === 'number' && item.commentsCount > 0 ? (
                                            <div className="inline-flex items-center gap-1" title={`${item.commentsCount.toLocaleString('fr-FR')} commentaires`}>
                                                <MessageCircle className="w-3 h-3 text-cyan-400" />
                                                <span>{item.commentsCount.toLocaleString('fr-FR')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-zinc-600">0</span>
                                        )}
                                    </td>

                                    {/* Taux d'engagement */}
                                    <td className="py-2.5 px-3 text-right">
                                        {engRate ? (
                                            <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[11px]">
                                                <Zap className="w-2.5 h-2.5" />
                                                {engRate}%
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">—</span>
                                        )}
                                    </td>

                                    {/* Étoile Vitrine */}
                                    <td className="py-2.5 px-3 text-center">
                                        {isVideo ? (
                                            <button
                                                type="button"
                                                onClick={() => onToggleFeatured(item)}
                                                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                    isFeatured
                                                        ? 'bg-[#FFE500] text-black font-bold shadow-xs'
                                                        : 'text-zinc-500 hover:text-[#FFE500] hover:bg-zinc-800'
                                                }`}
                                                title={isFeatured ? 'Retirer de la vitrine' : 'Mettre en avant sur la vitrine'}
                                            >
                                                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                                            </button>
                                        ) : (
                                            <span className="text-zinc-700">•</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-2.5 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                                title="Voir sur Instagram"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={(e) => handleCopy(e, item.url, item.shortcode)}
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                                title="Copier le lien"
                                            >
                                                {copiedShortcode === item.shortcode ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Ligne de description intégrale dépliée */}
                                {isExpanded && item.description && (
                                    <tr className="bg-[#09090e] border-b border-zinc-800/80">
                                        <td colSpan={9} className="py-3 px-6">
                                            <div className="text-xs font-mono-tech text-zinc-300 bg-[#12121a] p-3.5 rounded-xl border border-zinc-800/80 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto selection:bg-[#FFE500] selection:text-black">
                                                <div className="text-[10px] text-zinc-500 uppercase mb-1 font-bold">
                                                    Légende complète • #{item.shortcode}
                                                </div>
                                                {item.description}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
