'use client';

import React from 'react';
import Image from 'next/image';
import { Target, Flame, Play, Heart, TrendingUp, Sparkles, Award } from 'lucide-react';
import type { InstagramGrowthMilestone, InstagramReelsAggregates } from '@/types/instagram-monitor';

interface InstagramMilestoneAndImpactProps {
    milestone: InstagramGrowthMilestone;
    aggregates: InstagramReelsAggregates;
    cucNationalRank: number;
}

export const InstagramMilestoneAndImpact: React.FC<InstagramMilestoneAndImpactProps> = ({
    milestone,
    aggregates,
    cucNationalRank,
}) => {
    return (
        <div className="space-y-6">
            {/* 1. Jalon de croissance CUC & Progression Palier */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
                    <div className="flex items-center gap-2.5">
                        <Target className="w-5 h-5 text-[#FFE500]" />
                        <div>
                            <h3 className="text-base font-display uppercase tracking-wider text-white">
                                Objectif de Croissance & Prochain Jalon
                            </h3>
                            <p className="text-xs font-tech text-zinc-400">
                                Trajectoire vers le seuil symbolique de {(milestone.nextTarget / 1000000).toFixed(1)} M d&apos;abonnés
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono-tech text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{milestone.dailyGrowthRate.toLocaleString('fr-FR')} abonnés / jour
                        </span>
                    </div>
                </div>

                {/* Barre de progression du palier */}
                <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono-tech">
                        <span className="text-zinc-400">
                            Cap actuel : <strong className="text-white">1 000 000</strong>
                        </span>
                        <span className="text-[#FFE500] font-bold text-sm">
                            {milestone.currentFollowers.toLocaleString('fr-FR')} abonnés ({milestone.progressPercent}% du palier)
                        </span>
                        <span className="text-zinc-400">
                            Prochain jalon : <strong className="text-white">{(milestone.nextTarget / 1000000).toFixed(1)} M</strong>
                        </span>
                    </div>

                    <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                        <div
                            style={{ width: `${milestone.progressPercent}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#FFE500] to-yellow-300 transition-all duration-500 shadow-md shadow-[#FFE500]/20"
                        />
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono-tech text-zinc-500 pt-1">
                        <span>🎯 Plus que <strong>{milestone.remainingToTarget.toLocaleString('fr-FR')}</strong> abonnés restants</span>
                        <span>⏱️ Atteinte estimée dans environ <strong>{milestone.estimatedDaysToTarget} jours</strong></span>
                    </div>
                </div>
            </div>

            {/* 2. Statistiques Virales Globales & Top 3 Historique */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Ratio Vues Totales */}
                <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-xs font-mono-tech uppercase">Vues Cumulées Reels</span>
                        <Play className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="my-2">
                        <div className="text-2xl font-display text-white tracking-wide">
                            {aggregates.totalViewsFormatted}
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-tech text-cyan-400">
                        Sur l&apos;ensemble des 44 Reels
                    </div>
                </div>

                {/* Moyenne par Reel */}
                <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-xs font-mono-tech uppercase">Moyenne par Vidéo</span>
                        <Sparkles className="w-4 h-4 text-[#FFE500]" />
                    </div>
                    <div className="my-2">
                        <div className="text-2xl font-display text-[#FFE500] tracking-wide">
                            {aggregates.avgViewsFormatted}
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-tech text-zinc-400">
                        Vues moyennes par publication
                    </div>
                </div>

                {/* Engagement moyen */}
                <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-xs font-mono-tech uppercase">Taux d&apos;Engagement</span>
                        <Heart className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="my-2">
                        <div className="text-2xl font-display text-white tracking-wide">
                            {aggregates.avgEngagementRate}%
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-tech text-emerald-400">
                        3× supérieur à la moyenne 1M+
                    </div>
                </div>

                {/* Rang Mondial Spécialité */}
                <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-xs font-mono-tech uppercase">Statut Niche</span>
                        <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="my-2">
                        <div className="text-2xl font-display text-amber-300 tracking-wide">
                            #1 Mondial
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-tech text-zinc-400 truncate">
                        Académie & École de Cascade
                    </div>
                </div>
            </div>

            {/* 3. Top 3 des Cascades Records CUC */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-display uppercase tracking-wider text-white">
                        Top 3 des Cascades les Plus Virales de l&apos;Histoire du CUC
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    {aggregates.topReels.map((reel, idx) => (
                        <div
                            key={reel.id}
                            className="bg-zinc-900/60 border border-zinc-800 hover:border-[#FFE500]/60 rounded-xl p-4 transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded-md bg-[#FFE500] text-black font-mono-tech text-xs font-bold">
                                        Record #{idx + 1}
                                    </span>
                                    <span className="text-xs font-mono-tech text-zinc-500">{reel.date}</span>
                                </div>

                                <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                                    {reel.coverImage ? (
                                        <Image
                                            src={reel.coverImage}
                                            alt={reel.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            unoptimized
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                            <Play className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs font-mono-tech text-white">
                                        <span className="font-bold flex items-center gap-1">
                                            <Play className="w-3.5 h-3.5 text-[#FFE500] fill-current" />
                                            {reel.viewsFormatted} vues
                                        </span>
                                        {reel.likes && (
                                            <span className="text-zinc-300 flex items-center gap-1">
                                                <Heart className="w-3 h-3 text-rose-400 fill-current" />
                                                {reel.likes}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h4 className="text-sm font-display text-white line-clamp-2">
                                    {reel.title}
                                </h4>
                            </div>

                            <a
                                href={reel.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center justify-between transition-colors"
                            >
                                <span>Voir sur Instagram</span>
                                <span>→</span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
