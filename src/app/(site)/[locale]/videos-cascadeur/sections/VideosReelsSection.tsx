import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { InstagramReel } from './instagram-reels.data';

export interface VideosReelsSectionProps {
    reels: InstagramReel[];
    onSelectReel: (reel: InstagramReel) => void;
    labels: {
        title: string;
        intro: string;
        play: string;
        socialInstagram: string;
    };
}

/**
 * Section des vidéos & Reels verticaux officiels du CUC.
 * Présentation cinématique 9:16 épurée — strictement aucun badge sur les vidéos.
 */
export const VideosReelsSection: React.FC<VideosReelsSectionProps> = ({
    reels,
    onSelectReel,
    labels,
}) => (
    <section id="reels" className="py-20 bg-[#060608] border-t border-zinc-800 scroll-mt-28 relative">
        <div className="page-shell">
            {/* Header de section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                        <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                            INSTAGRAM @CAMPUS.UNIVERS.CASCADES
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-wide text-white">
                        {labels.title}
                    </h2>
                    <p className="text-sm font-tech text-zinc-400 mt-2 max-w-2xl">
                        {labels.intro}
                    </p>
                </div>

                <a
                    href="https://www.instagram.com/campus.univers.cascades/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-800 bg-[#0c0c10] hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-300 hover:text-white transition-all duration-200 group self-start md:self-auto"
                >
                    <span>{labels.socialInstagram}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                </a>
            </div>

            {/* Grille 9:16 cinématique — aucun badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {reels.map((reel) => (
                    <article
                        key={reel.id}
                        onClick={() => onSelectReel(reel)}
                        className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#0c0c10] border border-zinc-800/80 hover:border-[#FFE500]/70 cursor-pointer shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.15)] transition-all duration-300 flex flex-col justify-end"
                    >
                        {/* Image de fond avec zoom fluide au survol */}
                        <Image
                            src={reel.coverImage}
                            alt={reel.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                        />

                        {/* Dégradé cinématique sombre */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                        {/* Bouton Play central moderne avec halo */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                                <Play className="w-7 h-7 fill-current translate-x-0.5" />
                            </div>
                        </div>

                        {/* Métadonnées & Description — Zéro badge */}
                        <div className="relative z-10 p-6">
                            <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2">
                                {reel.title}
                            </h3>
                            <p className="text-xs font-tech text-zinc-300 leading-relaxed line-clamp-2">
                                {reel.description}
                            </p>
                            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tech text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                <span className="uppercase tracking-wider">{labels.play}</span>
                                <span className="text-[#FFE500] group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);
