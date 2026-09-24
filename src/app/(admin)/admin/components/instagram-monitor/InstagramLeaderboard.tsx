'use client';

import React from 'react';
import { RefreshCw, Plus, Trophy } from 'lucide-react';
import type { InstagramAccountStat, LeaderboardFilterMode } from '@/types/instagram-monitor';
import { InstagramStrategicBanner } from './InstagramStrategicBanner';
import { InstagramLeaderboardRow } from './InstagramLeaderboardRow';

interface InstagramLeaderboardProps {
    leaderboard: InstagramAccountStat[];
    cucNationalRank: number;
    aheadAccount: InstagramAccountStat | null;
    behindAccount: InstagramAccountStat | null;
    deltaAhead: number;
    deltaBehind: number;
    filterMode: LeaderboardFilterMode;
    onSelectFilterMode: (mode: LeaderboardFilterMode) => void;
    isRefreshing: boolean;
    onRefresh: () => void;
    newAccountInput: string;
    onChangeNewAccount: (val: string) => void;
    onAddAccount: () => void;
    onRemoveAccount: (username: string) => void;
}

export const InstagramLeaderboard: React.FC<InstagramLeaderboardProps> = ({
    leaderboard,
    cucNationalRank,
    aheadAccount,
    behindAccount,
    deltaAhead,
    deltaBehind,
    filterMode,
    onSelectFilterMode,
    isRefreshing,
    onRefresh,
    newAccountInput,
    onChangeNewAccount,
    onAddAccount,
    onRemoveAccount,
}) => {
    const cucAccount = leaderboard.find((a) => a.isCuc) || leaderboard[0];
    const cucFollowersCount = cucAccount ? cucAccount.followersCount : 1050000;

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Header du Leaderboard avec vrai positionnement */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Classement Réel Instagram France & Monde
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#FFE500]/20 text-[#FFE500] text-xs font-mono-tech font-bold border border-[#FFE500]/30">
                            CUC Rang #{cucNationalRank} France
                        </span>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Position réelle du Campus Univers Cascades parmi l&apos;ensemble des créateurs et médias français
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
                        <span>{isRefreshing ? 'Actualisation...' : 'Actualiser en direct'}</span>
                    </button>
                </div>
            </div>

            {/* Bandeau d'analyse stratégique CUC */}
            <InstagramStrategicBanner
                cucNationalRank={cucNationalRank}
                aheadAccount={aheadAccount}
                behindAccount={behindAccount}
                deltaAhead={deltaAhead}
                deltaBehind={deltaBehind}
            />

            {/* Barre de filtres de classement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 flex-wrap">
                    <button
                        type="button"
                        onClick={() => onSelectFilterMode('direct_context')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            filterMode === 'direct_context'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        🎯 Entourage CUC (±10)
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectFilterMode('top_france')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            filterMode === 'top_france'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        🇫🇷 Top France Absolu
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectFilterMode('action_stunt')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            filterMode === 'action_stunt'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        🥋 Cascades & Action
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectFilterMode('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                            filterMode === 'all'
                                ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        📋 Tous les comptes
                    </button>
                </div>

                {/* Formulaire ajout rapide */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newAccountInput}
                        onChange={(e) => onChangeNewAccount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onAddAccount()}
                        placeholder="Ajouter un compte (@...)"
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono-tech text-white placeholder-zinc-500 focus:border-[#FFE500] focus:outline-none w-48"
                    />
                    <button
                        type="button"
                        onClick={onAddAccount}
                        className="p-1.5 rounded-xl bg-[#FFE500] text-black hover:bg-yellow-400 transition-colors cursor-pointer"
                        title="Ajouter au classement"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tableau du classement */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-[11px] font-mono-tech uppercase text-zinc-500">
                            <th className="py-2.5 px-3 w-28">Rang France</th>
                            <th className="py-2.5 px-3">Compte & Spécialité</th>
                            <th className="py-2.5 px-3">Position Niche</th>
                            <th className="py-2.5 px-3 text-right">Abonnés Réels</th>
                            <th className="py-2.5 px-3 text-center">Écart vs CUC</th>
                            <th className="py-2.5 px-3 text-right w-16">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                        {leaderboard.map((account) => (
                            <InstagramLeaderboardRow
                                key={account.id}
                                account={account}
                                cucNationalRank={cucNationalRank}
                                cucFollowersCount={cucFollowersCount}
                                onRemoveAccount={onRemoveAccount}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
