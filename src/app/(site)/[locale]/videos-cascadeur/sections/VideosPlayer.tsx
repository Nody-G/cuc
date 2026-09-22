import React from 'react';
import { Tv } from 'lucide-react';
import { VIDEOS_MEDIA } from './videos-copy';
import type { VideosLabels } from './useVideosPage';

export interface VideosPlayerProps {
    activeVideo: 'tf1' | 'france2';
    onSelectVideo: (video: 'tf1' | 'france2') => void;
    labels: VideosLabels;
}

export const VideosPlayer: React.FC<VideosPlayerProps> = ({
    activeVideo,
    onSelectVideo,
    labels,
}) => (
    <section className="py-16">
        <div className="page-shell">
            {/* Video Selector Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                <button
                    id="tf1"
                    onClick={() => onSelectVideo('tf1')}
                    className={`scroll-mt-28 px-5 py-3 border font-mono-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeVideo === 'tf1'
                        ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-lg'
                        : 'bg-[#101016] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                >
                    <Tv className="w-4 h-4" />
                    <span>{labels.tabTf1}</span>
                </button>

                <button
                    id="france2"
                    onClick={() => onSelectVideo('france2')}
                    className={`scroll-mt-28 px-5 py-3 border font-mono-tech text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${activeVideo === 'france2'
                        ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-lg'
                        : 'bg-[#101016] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                >
                    <Tv className="w-4 h-4" />
                    <span>{labels.tabFrance2}</span>
                </button>
            </div>

            {/* Main Video Screen with HUD Frame */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 p-4 sm:p-8 relative">
                <div className="relative aspect-video w-full bg-black border border-zinc-800 overflow-hidden mb-6">
                    {activeVideo === 'tf1' ? (
                        <video
                            key="tf1-video"
                            controls
                            preload="metadata"
                            className="w-full h-full object-contain"
                            poster={VIDEOS_MEDIA.tf1Poster}
                        >
                            <source src={VIDEOS_MEDIA.tf1Source} type="video/mp4" />
                            {labels.videoFallback}
                        </video>
                    ) : (
                        <video
                            key="france2-video"
                            controls
                            preload="metadata"
                            className="w-full h-full object-contain"
                            poster={VIDEOS_MEDIA.france2Poster}
                        >
                            {VIDEOS_MEDIA.france2Sources.map((source) => (
                                <source key={source} src={source} type="video/mp4" />
                            ))}
                            {labels.videoFallback}
                        </video>
                    )}
                </div>

                {/* Video Information */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-display uppercase text-white">
                            {activeVideo === 'tf1' ? labels.tf1Title : labels.france2Title}
                        </h2>
                        <p className="text-xs sm:text-sm font-tech text-zinc-400 mt-1 max-w-3xl">
                            {activeVideo === 'tf1' ? labels.tf1Desc : labels.france2Desc}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="px-3 py-1.5 bg-[#14141c] border border-zinc-800 text-xs font-mono-tech text-[#FFE500]">
                            {labels.broadcastBadge}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
