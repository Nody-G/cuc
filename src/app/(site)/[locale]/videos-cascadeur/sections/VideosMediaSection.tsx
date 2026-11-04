import React from 'react';
import { ExternalLink, Play } from 'lucide-react';
import type { MediaItem } from './videos-copy';
import type { VideosLabels } from './useVideosPage';

export interface VideosMediaSectionProps {
    mediaItems: MediaItem[];
    labels: VideosLabels;
}

const CHANNEL_DAILYMOTION_URLS: Record<string, string> = {
    TF1: 'https://www.dailymotion.com/video/xbf6gk2',
    'FRANCE 2': 'https://www.dailymotion.com/video/x8mmmm3',
    'BFM TV': 'https://www.dailymotion.com/video/xbfafoi',
};

export const VideosMediaSection: React.FC<VideosMediaSectionProps> = ({
    mediaItems,
    labels,
}) => (
    <section id="medias" className="py-16 bg-[#0c0c10] border-t border-zinc-800 scroll-mt-28">
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
                {mediaItems.map((item, index) => {
                    const videoUrl =
                        item.url ||
                        CHANNEL_DAILYMOTION_URLS[item.channel.toUpperCase().trim()] ||
                        'https://www.dailymotion.com/campus-univers-cascades';

                    return (
                        <a
                            key={item.channel}
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-[#121218] border border-zinc-800 hover:border-[#FFE500] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] flex flex-col justify-between cursor-pointer"
                        >
                            <div>
                                <div
                                    className={`text-3xl sm:text-4xl font-display mb-1 transition-colors ${index % 2 === 0 ? 'text-[#FFE500]' : 'text-white'} group-hover:text-[#FFE500]`}
                                >
                                    {item.channel}
                                </div>
                                <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wide group-hover:text-zinc-200 transition-colors">
                                    {item.label}
                                </div>
                            </div>
                            <div className="mt-6 pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-xs font-mono-tech text-zinc-400 group-hover:text-[#FFE500] transition-colors">
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Voir sur Dailymotion</span>
                                <ExternalLink className="w-3 h-3 text-[#FFE500] ml-0.5" />
                            </div>
                        </a>
                    );
                })}
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
                    href="https://www.tiktok.com/@campus.univers.cascades"
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
