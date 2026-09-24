'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { InstagramAccountStat } from '@/types/instagram-monitor';

interface InstagramStrategicBannerProps {
    cucNationalRank: number;
    aheadAccount: InstagramAccountStat | null;
    behindAccount: InstagramAccountStat | null;
    deltaAhead: number;
    deltaBehind: number;
}

export const InstagramStrategicBanner: React.FC<InstagramStrategicBannerProps> = ({
    cucNationalRank,
    aheadAccount,
    behindAccount,
    deltaAhead,
    deltaBehind,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gradient-to-r from-zinc-900/90 via-[#FFE500]/5 to-zinc-900/90 border border-zinc-800 text-xs font-mono-tech">
            {/* 1. Statut National */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFE500] text-black font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                    #{cucNationalRank}
                </div>
                <div>
                    <div className="text-white font-bold">Top 150 Français</div>
                    <div className="text-[10px] text-zinc-400">Club des Millionnaires Instagram</div>
                </div>
            </div>

            {/* 2. Prochain Concurrent à Dépasser */}
            {aheadAccount && (
                <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-3">
                    <ArrowUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                        <div className="text-zinc-300">
                            Prochain : <strong className="text-white">@{aheadAccount.username}</strong> (#{aheadAccount.nationalRank || 'Monde'})
                        </div>
                        <div className="text-[10px] text-emerald-400">
                            Écart de {deltaAhead > 0 ? (deltaAhead / 1000).toFixed(0) : '0'} k abonnés
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Avance sur le Poursuivant */}
            {behindAccount && (
                <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-3">
                    <ArrowDown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                        <div className="text-zinc-300">
                            Poursuivant : <strong className="text-white">@{behindAccount.username}</strong>
                        </div>
                        <div className="text-[10px] text-amber-400">
                            Avance de +{(deltaBehind / 1000).toFixed(0)} k abonnés
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
