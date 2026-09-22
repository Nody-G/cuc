import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Play, Video } from 'lucide-react';
import type { SelectedDmVideo, VideosLabels } from './useVideosPage';
import type { VideosProgram } from './videos-copy';

export interface VideosDocusGridProps {
    programs: VideosProgram[];
    onSelectProgram: (video: SelectedDmVideo) => void;
    labels: VideosLabels;
}

export const VideosDocusGrid: React.FC<VideosDocusGridProps> = ({
    programs,
    onSelectProgram,
    labels,
}) => (
    <section className="py-16 bg-[#09090d] border-t border-zinc-800">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((v, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onSelectProgram({ id: v.dmId, title: v.title })}
                        className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all p-4 group text-left cursor-pointer focus:outline-hidden"
                    >
                        <div className="relative aspect-video w-full mb-3 border border-zinc-800 overflow-hidden bg-black">
                            <Image
                                src={v.img}
                                alt={v.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-[#FFE500] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-black ml-0.5" />
                                </div>
                            </div>
                        </div>
                        <h3 className="font-display uppercase text-lg text-white group-hover:text-[#FFE500] transition-colors">
                            {v.title}
                        </h3>
                        <p className="text-xs font-tech text-zinc-400">{v.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    </section>
);
