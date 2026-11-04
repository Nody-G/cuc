'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { ChevronDown, ChevronUp, ExternalLink, Play, Video } from 'lucide-react';
import type { SelectedDmVideo, VideosLabels } from './useVideosPage';
import type { VideosProgram } from './videos-copy';

export interface VideosDocusGridProps {
    programs: VideosProgram[];
    onSelectProgram?: (video: SelectedDmVideo) => void;
    labels: VideosLabels;
}

const DEFAULT_VISIBLE_COUNT = 9; // 3 rangées de 3 colonnes

export const VideosDocusGrid: React.FC<VideosDocusGridProps> = ({
    programs,
    labels,
}) => {
    const [showAll, setShowAll] = useState(false);

    const visiblePrograms = showAll
        ? programs
        : programs.slice(0, DEFAULT_VISIBLE_COUNT);

    const hasMore = programs.length > DEFAULT_VISIBLE_COUNT;
    const remainingCount = programs.length - DEFAULT_VISIBLE_COUNT;

    return (
        <section id="documentaires" className="py-16 bg-[#09090d] border-t border-zinc-800 scroll-mt-28">
            <div className="page-shell">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <StuntBadge variant="yellow" icon={<Video className="w-3.5 h-3.5" />}>
                        {labels.docusBadge}
                    </StuntBadge>
                    <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-2">
                        {labels.docusTitle}
                    </h2>
                    <p className="text-xs sm:text-sm font-tech text-zinc-400">
                        {labels.docusHint}
                    </p>
                </div>

                {/* Grille 3 colonnes x 3 rangées avec redirection Dailymotion sans erreur */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visiblePrograms.map((v, i) => {
                        const targetUrl = `https://www.dailymotion.com/video/${v.dmId}`;
                        return (
                            <a
                                key={v.dmId || i}
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all p-4 group text-left cursor-pointer focus:outline-hidden block shadow-lg hover:-translate-y-1"
                            >
                                <div className="relative aspect-video w-full mb-3 border border-zinc-800 overflow-hidden bg-black">
                                    <Image
                                        src={v.img}
                                        alt={v.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-[#FFE500] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-5 h-5 fill-black ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-display uppercase text-lg text-white group-hover:text-[#FFE500] transition-colors line-clamp-1">
                                    {v.title}
                                </h3>
                                <p className="text-xs font-tech text-zinc-400 line-clamp-2 mt-1">{v.sub}</p>
                                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono-tech text-zinc-500 group-hover:text-[#FFE500] transition-colors">
                                    <span>Visionner sur Dailymotion</span>
                                    <ExternalLink className="w-3 h-3 text-[#FFE500]" />
                                </div>
                            </a>
                        );
                    })}
                </div>

                {/* Bouton d'extension si plus de 9 vidéos */}
                {hasMore && (
                    <div className="mt-10 text-center">
                        <button
                            type="button"
                            onClick={() => setShowAll(!showAll)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#121218] hover:bg-[#181822] border border-zinc-700 hover:border-[#FFE500] text-zinc-200 hover:text-white text-xs font-mono-tech uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer shadow-lg group"
                        >
                            {showAll ? (
                                <>
                                    <span>Afficher moins (3 rangées)</span>
                                    <ChevronUp className="w-4 h-4 text-[#FFE500] group-hover:-translate-y-0.5 transition-transform" />
                                </>
                            ) : (
                                <>
                                    <span>Voir tous les reportages (+{remainingCount})</span>
                                    <ChevronDown className="w-4 h-4 text-[#FFE500] group-hover:translate-y-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};
