'use client';

import React from 'react';
import { Play, Users, Star } from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import { useInstagramMonitor } from './instagram-monitor/useInstagramMonitor';
import { useInstagramFeaturedReels } from './instagram-monitor/useInstagramFeaturedReels';
import { InstagramFeaturedReelsManager } from './instagram-monitor/InstagramFeaturedReelsManager';
import { InstagramReelsMonitor } from './instagram-monitor/InstagramReelsMonitor';

interface InstagramMonitorViewProps {
    showToast: (msg: string) => void;
}

export const InstagramMonitorView: React.FC<InstagramMonitorViewProps> = ({ showToast }) => {
    const monitor = useInstagramMonitor(showToast);
    const featured = useInstagramFeaturedReels(showToast);

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header épuré du module Instagram */}
            <div className="p-6 bg-[#0b0b10] border border-zinc-800 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                    <InstagramLogo className="w-5 h-5 text-[#FFE500]" />
                    <span className="text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
                        INSTAGRAM @CAMPUS.UNIVERS.CASCADES
                    </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                    Gestion des Reels & Vitrine
                </h2>
                <p className="text-xs font-tech text-zinc-400 mt-1 max-w-2xl">
                    Sélectionnez les Reels mis en avant sur le site vitrine (page Vidéos) et suivez les métriques officielles certifiées via l&apos;API Meta.
                </p>
            </div>

            {/* Cartes métriques réelles certifiées */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-[#FFE500] shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-400">Abonnés Instagram CUC</div>
                        <div className="text-2xl font-mono-tech font-bold text-white mt-0.5">
                            {monitor.cucAccount?.followersFormatted || '1,12 M'}
                        </div>
                        <div className="text-[10px] font-mono-tech text-emerald-400 mt-0.5">
                            Compte officiel certifié Meta
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFE500] shrink-0">
                        <Star className="w-6 h-6 fill-current text-[#FFE500]" />
                    </div>
                    <div>
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-400">Reels Mis en Avant Vitrine</div>
                        <div className="text-2xl font-mono-tech font-bold text-[#FFE500] mt-0.5">
                            {featured.featuredReels.length} à la une
                        </div>
                        <div className="text-[10px] font-mono-tech text-emerald-400 mt-0.5">
                            Synchronisé avec /videos-cascadeur
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
                            {monitor.reels.length} vidéos analysées
                        </div>
                    </div>
                </div>
            </div>

            {/* Curateur officiel des Reels mis en avant sur le site vitrine */}
            <InstagramFeaturedReelsManager
                featuredReels={featured.featuredReels}
                isLoading={featured.isLoading}
                isSaving={featured.isSaving}
                isSyncingMeta={featured.isSyncingMeta}
                isImporting={featured.isImporting}
                importInput={featured.importInput}
                onChangeImportInput={featured.setImportInput}
                onImportReel={featured.handleImportReel}
                onSyncAllMeta={featured.handleSyncAllMeta}
                onMoveReel={featured.handleMoveReel}
                onRemoveReel={featured.handleRemoveReel}
            />

            {/* Catalogue complet et explorateur des Reels CUC */}
            <InstagramReelsMonitor
                reels={monitor.reels}
                isRefreshingAll={monitor.isRefreshingAllReels}
                refreshingReelId={monitor.refreshingReelId}
                onRefreshAll={monitor.handleRefreshTopReels}
                onRefreshSingle={monitor.handleRefreshReel}
                isSynced={monitor.isSynced}
                featuredShortcodes={featured.featuredShortcodes}
                onToggleFeatured={featured.handleToggleFeatured}
            />
        </div>
    );
};
