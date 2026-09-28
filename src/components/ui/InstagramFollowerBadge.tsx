'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import { useInstagramFollowers } from '@/lib/instagram/useInstagramFollowers';

export interface InstagramFollowerBadgeProps {
    variant?: 'pill' | 'card' | 'compact' | 'header';
    className?: string;
}

/**
 * Composant de présentation du compteur d'abonnés officiel CUC.
 * Design premium sombre, accents dorés CUC, indicateur certifié Meta.
 */
export const InstagramFollowerBadge: React.FC<InstagramFollowerBadgeProps> = ({
    variant = 'pill',
    className = '',
}) => {
    const { exactFollowersFormatted, followersFormatted } = useInstagramFollowers();
    const instagramUrl = 'https://www.instagram.com/campus.univers.cascades/';

    if (variant === 'header') {
        return (
            <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Consulter le compte Instagram officiel @campus.univers.cascades (1,1M+ abonnés)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all text-xs font-mono-tech group shadow-xs ${className}`}
            >
                <InstagramLogo className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="font-bold text-white group-hover:text-[#FFE500] transition-colors">
                    {followersFormatted}
                </span>
            </a>
        );
    }

    if (variant === 'compact') {
        return (
            <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Consulter le compte Instagram officiel @campus.univers.cascades (1,1M+ abonnés)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/70 transition-all text-xs font-mono-tech group shadow-xs ${className}`}
            >
                <InstagramLogo className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="font-bold text-white group-hover:text-[#FFE500] transition-colors">
                    {followersFormatted}
                </span>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                    abonnés
                </span>
            </a>
        );
    }

    if (variant === 'card') {
        return (
            <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Rejoindre les 1,1M+ d'abonnés sur Instagram"
                className={`block p-5 rounded-2xl bg-[#0b0b12]/95 border border-zinc-800/80 hover:border-[#FFE500]/60 transition-all duration-300 shadow-xl hover:shadow-[0_10px_35px_rgba(255,229,0,0.15)] group ${className}`}
            >
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500]">
                            <InstagramLogo className="w-5 h-5 text-[#FFE500]" />
                        </div>
                        <div>
                            <div className="text-[11px] font-mono-tech uppercase font-bold text-[#FFE500] tracking-wider">
                                Instagram Officiel
                            </div>
                            <div className="text-xs font-mono-tech text-zinc-400">
                                @campus.univers.cascades
                            </div>
                        </div>
                    </div>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-mono-tech font-bold text-white tracking-tight group-hover:text-[#FFE500] transition-colors">
                        {exactFollowersFormatted}
                    </span>
                    <span className="text-xs font-mono-tech uppercase text-zinc-400">
                        abonnés
                    </span>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-400">
                    <span className="text-[11px] text-zinc-400">
                        Communauté officielle certifiée
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#FFE500] font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                        <span>Rejoindre</span>
                        <ExternalLink className="w-3 h-3" />
                    </span>
                </div>
            </a>
        );
    }

    // Default 'pill' variant
    return (
        <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Rejoindre la communauté officielle Instagram @campus.univers.cascades"
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0c0c12]/95 border border-zinc-800/90 hover:border-[#FFE500]/60 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(255,229,0,0.18)] group cursor-pointer ${className}`}
        >
            <div className="flex items-center gap-2">
                <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
            </div>

            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-mono-tech font-bold text-white group-hover:text-[#FFE500] transition-colors tracking-tight">
                    {exactFollowersFormatted}
                </span>
                <span className="text-[11px] font-mono-tech uppercase text-zinc-400">
                    abonnés
                </span>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FFE500] group-hover:translate-x-0.5 transition-all" />
        </a>
    );
};
