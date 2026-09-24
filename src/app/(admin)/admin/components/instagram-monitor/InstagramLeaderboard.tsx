'use client';

import React from 'react';
import Image from 'next/image';
import { RefreshCw, Plus, Trash2, ExternalLink, Trophy, ShieldCheck } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { InstagramAccountStat } from '@/types/instagram-monitor';

interface InstagramLeaderboardProps {
    leaderboard: InstagramAccountStat[];
    cucRank: number;
    isRefreshing: boolean;
    onRefresh: () => void;
    newAccountInput: string;
    onChangeNewAccount: (val: string) => void;
    onAddAccount: () => void;
    onRemoveAccount: (username: string) => void;
}

export const InstagramLeaderboard: React.FC<InstagramLeaderboardProps> = ({
    leaderboard,
    cucRank,
    isRefreshing,
    onRefresh,
    newAccountInput,
    onChangeNewAccount,
    onAddAccount,
    onRemoveAccount,
}) => {
    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {/* Header du Leaderboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Classement Comparatif Instagram
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Position de la chaîne CUC (
                        <span className="text-[#FFE500] font-bold">#{cucRank}</span> sur {leaderboard.length}{' '}
                        comptes) : 10 au-dessus & 10 en-dessous
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FFE500]' : ''}`} />
                        <span>{isRefreshing ? 'Actualisation...' : 'Actualiser classement'}</span>
                    </button>
                </div>
            </div>

            {/* Formulaire ajout d'un compte */}
            <div className="pt-4 pb-4 flex items-center gap-2">
                <div className="relative flex-grow">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono-tech">@</span>
                    <input
                        type="text"
                        value={newAccountInput}
                        onChange={(e) => onChangeNewAccount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddAccount()}
                        placeholder="Ajouter un compte Instagram à comparer (ex: redbull, plkpb)..."
                        className="w-full bg-[#121218] border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none"
                    />
                </div>
                <button
                    type="button"
                    onClick={onAddAccount}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFE500] text-black font-bold text-xs font-mono-tech uppercase hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                </button>
            </div>

            {/* Tableau du classement */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-[10px] font-mono-tech uppercase text-zinc-500">
                            <th className="py-2.5 px-3">Rang</th>
                            <th className="py-2.5 px-3">Compte Instagram</th>
                            <th className="py-2.5 px-3 text-right">Abonnés</th>
                            <th className="py-2.5 px-3 text-center">Écart vs CUC</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-xs font-tech">
                        {leaderboard.map((account, index) => {
                            const rank = index + 1;
                            const isCuc = account.isCuc;
                            const cucAccount = leaderboard.find((a) => a.isCuc);
                            const diff = cucAccount
                                ? account.followersCount - cucAccount.followersCount
                                : 0;

                            return (
                                <tr
                                    key={account.id}
                                    className={`transition-colors ${
                                        isCuc
                                            ? 'bg-[#FFE500]/10 border-l-4 border-l-[#FFE500] font-bold'
                                            : 'hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-tech ${
                                                    isCuc
                                                        ? 'bg-[#FFE500] text-black font-bold'
                                                        : rank <= 3
                                                        ? 'bg-zinc-800 text-yellow-300'
                                                        : 'bg-zinc-900 text-zinc-400'
                                                }`}
                                            >
                                                {rank}
                                            </span>
                                        </div>
                                    </td>
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
                                                <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                                                    {account.displayName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <span className={`font-mono-tech font-bold text-sm ${isCuc ? 'text-[#FFE500]' : 'text-zinc-200'}`}>
                                            {account.followersFormatted}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {isCuc ? (
                                            <span className="text-[10px] font-mono-tech text-[#FFE500]">Point de repère</span>
                                        ) : (
                                            <span
                                                className={`text-[10px] font-mono-tech px-2 py-0.5 rounded-full ${
                                                    diff > 0
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-zinc-800 text-zinc-400'
                                                }`}
                                            >
                                                {diff > 0 ? `+${(diff / 1000).toFixed(0)}k` : `${(diff / 1000).toFixed(0)}k`}
                                            </span>
                                        )}
                                    </td>
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
                                                    title="Retirer du classement"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
