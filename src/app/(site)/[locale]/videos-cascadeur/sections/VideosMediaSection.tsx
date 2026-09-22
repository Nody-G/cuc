import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { MediaItem } from './videos-copy';
import type { VideosLabels } from './useVideosPage';

export interface VideosMediaSectionProps {
    mediaItems: MediaItem[];
    labels: VideosLabels;
}

export const VideosMediaSection: React.FC<VideosMediaSectionProps> = ({
    mediaItems,
    labels,
}) => (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
        <div className="page-shell">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2">
                    {labels.mediaTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
                    {labels.mediaTitle}
                </h2>
                <p className="text-sm font-tech text-zinc-400">
                    {labels.mediaIntro}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaItems.map((item, index) => (
                    <div
                        key={item.channel}
                        className="bg-[#121218] border border-zinc-800 p-6 text-center"
                    >
                        <div
                            className={`text-3xl sm:text-4xl font-display mb-1 ${index % 2 === 0 ? 'text-[#FFE500]' : 'text-white'}`}
                        >
                            {item.channel}
                        </div>
                        <div className="text-xs font-mono-tech text-zinc-400 uppercase">{item.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
                <a
                    href="https://www.instagram.com/campus.univers.cascades/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <span>{labels.socialInstagram}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
                </a>

                <a
                    href="https://www.tiktok.com/@campusuniverscascades"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#121218] border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <span>{labels.socialTiktok}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
                </a>
            </div>
        </div>
    </section>
);
