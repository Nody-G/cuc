'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, ShieldCheck, Flame } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { InstagramAccountStat } from '@/types/instagram-monitor';

interface InstagramLeaderboardRowProps {
    account: InstagramAccountStat;
    cucFollowersCount: number;
    onRemoveAccount: (username: string) => void;
}

export const InstagramLeaderboardRow: React.FC<InstagramLeaderboardRowProps> = ({
    account,
    cucFollowersCount,
    onRemoveAccount,
}) => {
    const isCuc = account.isCuc || account.username === 'campus.univers.cascades';
    /**
     * Rang affiché = rang **dans ce comparatif**, attribué par la position réelle
     * (`rankAccountsByFollowers`). Aucun « rang national » n'est montré : il
     * n'existe pas de source mesurée, et une valeur inventée finissait par
     * contredire l'ordre des abonnés.
     */
    const rank = account.comparativeRank;
    const rankDisplay = rank ? `#${rank}` : account.country || 'Monde';

    const diff = account.followersCount - cucFollowersCount;

    return (
        <tr
            className={`transition-colors ${isCuc
                    ? 'bg-[#FFE500]/10 border-l-4 border-l-[#FFE500] font-bold'
                    : 'hover:bg-white/[0.02]'
                }`}
        >
            {/* Vrai rang France */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`px-2 py-0.5 rounded-md text-xs font-mono-tech font-bold ${isCuc
                                ? 'bg-[#FFE500] text-black shadow-md shadow-[#FFE500]/20'
                                : rank && rank <= 3
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                            }`}
                    >
                        {rankDisplay}
                    </span>
                    {isCuc && <Flame className="w-3.5 h-3.5 text-[#FFE500]" />}
                </div>
            </td>

            {/* Compte & Métier */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
                        {account.avatarUrl ? (
                            <Image
                                src={account.avatarUrl}
                                alt={account.username}
                                width={28}
                                height={28}
                                unoptimized
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <InstagramLogo className="w-4 h-4 text-zinc-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className={`font-mono-tech ${isCuc ? 'text-[#FFE500]' : 'text-white'}`}>
                                @{account.username}
                            </span>
                            {isCuc && (
                                <span className="px-1.5 py-0.2 rounded bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase">
                                    CUC Officiel
                                </span>
                            )}
                            {account.verified && !isCuc && (
                                <ShieldCheck className="w-3 h-3 text-blue-400 inline" />
                            )}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-[220px]">
                            {account.displayName} {account.category && `· ${account.category}`}
                        </div>
                    </div>
                </div>
            </td>

            {/* Position Niche */}
            <td className="py-3 px-3">
                <span className={`text-[11px] font-mono-tech px-2 py-0.5 rounded-md ${isCuc
                        ? 'bg-[#FFE500]/20 text-[#FFE500] font-bold border border-[#FFE500]/30'
                        : 'text-zinc-400 bg-zinc-900 border border-zinc-800/80'
                    }`}>
                    {account.categoryRank || 'Créateur'}
                </span>
            </td>

            {/* Abonnés */}
            <td className="py-3 px-3 text-right">
                <span className={`font-mono-tech font-bold text-sm ${isCuc ? 'text-[#FFE500]' : 'text-zinc-200'}`}>
                    {account.followersFormatted}
                </span>
            </td>

            {/* Écart vs CUC */}
            <td className="py-3 px-3 text-center">
                {isCuc ? (
                    <span className="text-[10px] font-mono-tech text-[#FFE500] font-bold">Base Référence</span>
                ) : (
                    <span
                        className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full ${diff > 0
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                    >
                        {diff > 0 ? `+${(diff / 1000).toFixed(0)} k` : `${(diff / 1000).toFixed(0)} k`}
                    </span>
                )}
            </td>

            {/* Actions */}
            <td className="py-3 px-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <a
                        href={`https://www.instagram.com/${account.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Voir sur Instagram"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {!isCuc && (
                        <button
                            type="button"
                            onClick={() => onRemoveAccount(account.username)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Retirer du tableau"
                        >
                            <span className="text-xs">×</span>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
