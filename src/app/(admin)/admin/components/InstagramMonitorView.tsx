'use client';

import React from 'react';
import { Activity, RefreshCw, Key, ShieldCheck, Play, Users, Trophy } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import { useInstagramMonitor } from './instagram-monitor/useInstagramMonitor';
import { InstagramLeaderboard } from './instagram-monitor/InstagramLeaderboard';
import { InstagramMilestoneAndImpact } from './instagram-monitor/InstagramMilestoneAndImpact';
import { InstagramReelsMonitor } from './instagram-monitor/InstagramReelsMonitor';
import { InstagramMetaConfigModal } from './instagram-monitor/InstagramMetaConfigModal';

interface InstagramMonitorViewProps {
    showToast: (msg: string) => void;
}

export const InstagramMonitorView: React.FC<InstagramMonitorViewProps> = ({ showToast }) => {
    const monitor = useInstagramMonitor(showToast);

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header supérieur du monitoring */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-[#0b0b10] border border-zinc-800 rounded-2xl shadow-xl">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <InstagramLogo className="w-5 h-5 text-[#FFE500]" />
                        <span className="text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
                            INSTAGRAM PULSE & METRICS
                        </span>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                        Monitoring Instagram en Temps Réel
                    </h2>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Surveillance du compte @campus.univers.cascades, vrai classement national et performance des 44 Reels.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Badge Mode Actuel */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono-tech">
                        <ShieldCheck className={`w-3.5 h-3.5 ${monitor.metaConfig.enabled ? 'text-emerald-400' : 'text-[#FFE500]'}`} />
                        <span className="text-zinc-300">
                            {monitor.metaConfig.enabled ? 'Meta Graph API' : 'Scraper Intelligent'}
                        </span>
                    </div>

                    {/* Bouton Config Meta */}
                    <button
                        type="button"
                        onClick={() => monitor.setIsMetaModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14141e] hover:bg-zinc-800 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all cursor-pointer"
                        title="Configurer les clés Meta API de Lucas"
                    >
                        <Key className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>Clés Meta API</span>
                    </button>

                    {/* Bouton Actualisation CUC */}
                    <button
                        type="button"
                        onClick={monitor.handleRefreshCuc}
                        disabled={monitor.isRefreshingCuc}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black font-bold text-xs font-mono-tech uppercase transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${monitor.isRefreshingCuc ? 'animate-spin' : ''}`} />
                        <span>{monitor.isRefreshingCuc ? 'Actualisation...' : 'Actualiser CUC'}</span>
                    </button>
                </div>
            </div>

            {/* Cartes métriques CUC en direct */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500] shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-400">Abonnés Instagram CUC</div>
                        <div className="text-2xl font-mono-tech font-bold text-white mt-0.5">
                            {monitor.cucAccount?.followersFormatted || '1,05 M'}
                        </div>
                        <div className="text-[10px] font-mono-tech text-emerald-400 mt-0.5">
                            Dernière synchro : {monitor.lastSyncTime}
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-400">Vrai Rang France</div>
                        <div className="text-2xl font-mono-tech font-bold text-[#FFE500] mt-0.5">
                            #{monitor.cucNationalRank} National
                        </div>
                        <div className="text-[10px] font-mono-tech text-zinc-400 mt-0.5">
                            Top 150 Créateurs & Médias FR
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <Play className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-400">Impact Cumulé Reels</div>
                        <div className="text-2xl font-mono-tech font-bold text-white mt-0.5">
                            {monitor.aggregates.totalViewsFormatted} vues
                        </div>
                        <div className="text-[10px] font-mono-tech text-cyan-400 mt-0.5">
                            {monitor.reels.length} vidéos monitorées
                        </div>
                    </div>
                </div>
            </div>

            {/* Jalon de Croissance, Ratios d'engagement et Records Viraux */}
            <InstagramMilestoneAndImpact
                milestone={monitor.milestone}
                aggregates={monitor.aggregates}
                cucNationalRank={monitor.cucNationalRank}
            />

            {/* Vrai Classement Comparatif Instagram */}
            <InstagramLeaderboard
                leaderboard={monitor.leaderboard}
                cucNationalRank={monitor.cucNationalRank}
                aheadAccount={monitor.aheadAccount}
                behindAccount={monitor.behindAccount}
                deltaAhead={monitor.deltaAhead}
                deltaBehind={monitor.deltaBehind}
                filterMode={monitor.filterMode}
                onSelectFilterMode={monitor.setFilterMode}
                isRefreshing={monitor.isRefreshingLeaderboard}
                onRefresh={monitor.handleRefreshLeaderboard}
                newAccountInput={monitor.newAccountInput}
                onChangeNewAccount={monitor.setNewAccountInput}
                onAddAccount={monitor.handleAddAccount}
                onRemoveAccount={monitor.handleRemoveAccount}
            />

            {/* Monitoring en direct des 44 Reels */}
            <InstagramReelsMonitor
                reels={monitor.reels}
                isRefreshingAll={monitor.isRefreshingAllReels}
                refreshingReelId={monitor.refreshingReelId}
                onRefreshAll={monitor.handleRefreshTopReels}
                onRefreshSingle={monitor.handleRefreshReel}
            />

            {/* Modal de Configuration Meta API */}
            <InstagramMetaConfigModal
                isOpen={monitor.isMetaModalOpen}
                onClose={() => monitor.setIsMetaModalOpen(false)}
                config={monitor.metaConfig}
                onSave={monitor.handleSaveMetaConfig}
            />
        </div>
    );
};
