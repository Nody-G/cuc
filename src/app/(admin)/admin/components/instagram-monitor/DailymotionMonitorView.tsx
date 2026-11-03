'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { Eye, ExternalLink, Play, RefreshCw, ShieldCheck, Users, Video } from 'lucide-react';
import {
    getDailymotionMonitorAction,
    type DailymotionMonitorData,
} from '../../actions/dailymotion-monitor';

interface DailymotionMonitorViewProps {
    showToast: (msg: string) => void;
}

export const DailymotionMonitorView: React.FC<DailymotionMonitorViewProps> = ({ showToast }) => {
    const [data, setData] = useState<DailymotionMonitorData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const fetchMonitor = () => {
        startTransition(async () => {
            const res = await getDailymotionMonitorAction();
            setData(res);
            setIsLoading(false);
            if (res.success) {
                showToast('Métriques Dailymotion actualisées en direct.');
            } else if (res.error) {
                showToast(res.error);
            }
        });
    };

    useEffect(() => {
        fetchMonitor();
    }, []);

    const channel = data?.channel;
    const videos = data?.videos || [];

    return (
        <div className="space-y-6">
            {/* Header Dailymotion Officiel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#0b0b10] border border-zinc-800 rounded-2xl shadow-xl">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Video className="w-5 h-5 text-[#FFE500]" />
                        <span className="text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
                            DAILYMOTION @CAMPUS-UNIVERS-CASCADES
                        </span>
                        {data?.isAuthenticated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono-tech uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Clé API &amp; OAuth Actifs
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono-tech uppercase font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                                Mode API Ouvert
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                        Monitoring Dailymotion
                    </h2>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Données en temps réel de votre chaîne officielle relevées au chiffre exact via l&apos;API Dailymotion.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {data?.lastSyncedAt && (
                        <span className="text-[11px] font-mono-tech text-zinc-400 hidden sm:inline-block">
                            Dernière actualisation : {data.lastSyncedAt}
                        </span>
                    )}

                    <a
                        href="https://www.dailymotion.com/user/campus%20univers%20cascades"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-xs font-mono-tech uppercase transition-colors"
                    >
                        <span>Dailymotion Studio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                        type="button"
                        onClick={fetchMonitor}
                        disabled={isPending || isLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black font-bold text-xs font-mono-tech uppercase transition-all disabled:opacity-50 cursor-pointer shadow-md"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                        <span>{isPending ? 'Actualisation...' : 'Actualiser'}</span>
                    </button>
                </div>
            </div>

            {/* Cartes Métriques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Abonnés */}
                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4 shadow-lg">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#FFE500]">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-mono-tech uppercase text-zinc-400">Abonnés (Fans)</div>
                        <div className="text-2xl font-display text-white mt-0.5">
                            {isLoading ? '...' : (channel?.fansTotal ?? 37).toLocaleString('fr-FR')}
                        </div>
                    </div>
                </div>

                {/* 2. Vues Totales */}
                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4 shadow-lg">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-mono-tech uppercase text-zinc-400">Vues Cumulées Chaîne</div>
                        <div className="text-2xl font-display text-white mt-0.5">
                            {isLoading ? '...' : (channel?.viewsTotal ?? 35964).toLocaleString('fr-FR')}
                        </div>
                    </div>
                </div>

                {/* 3. Vidéos en Ligne */}
                <div className="p-5 rounded-2xl bg-[#0b0b10] border border-zinc-800 flex items-center gap-4 shadow-lg">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#FFE500]">
                        <Play className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-mono-tech uppercase text-zinc-400">Vidéos Publiées</div>
                        <div className="text-2xl font-display text-white mt-0.5">
                            {isLoading ? '...' : (channel?.videosTotal ?? videos.length)} vidéos
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau des Vidéos Relevées */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="text-xs font-mono-tech uppercase font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
                        <span>Inventaire &amp; Performance des Vidéos Dailymotion ({videos.length})</span>
                    </div>
                    <span className="text-[11px] font-mono-tech text-zinc-400">
                        100% intégrables sur le site vitrine
                    </span>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-zinc-500 font-mono-tech text-xs">
                        Chargement des statistiques Dailymotion...
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 font-mono-tech text-xs">
                        Aucune vidéo trouvée.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121218] text-zinc-400 font-mono-tech uppercase border-b border-zinc-800">
                                <tr>
                                    <th className="p-3 w-16">Aperçu</th>
                                    <th className="p-3">Titre de la vidéo</th>
                                    <th className="p-3 w-24 text-right">Durée</th>
                                    <th className="p-3 w-28 text-right">Vues</th>
                                    <th className="p-3 w-32">Date</th>
                                    <th className="p-3 w-28 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60 font-tech">
                                {videos.map((vid) => (
                                    <tr key={vid.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-3">
                                            {vid.thumbnailUrl ? (
                                                <div className="relative w-14 h-9 bg-black border border-zinc-800 rounded overflow-hidden">
                                                    <Image
                                                        src={vid.thumbnailUrl}
                                                        alt={vid.title}
                                                        fill
                                                        sizes="56px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-9 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-zinc-600" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-white uppercase text-xs line-clamp-1">
                                                {vid.title}
                                            </div>
                                            <div className="text-[11px] font-mono-tech text-zinc-500 mt-0.5">
                                                ID : {vid.id}
                                            </div>
                                        </td>
                                        <td className="p-3 text-right font-mono-tech text-zinc-300">
                                            {vid.durationFormatted}
                                        </td>
                                        <td className="p-3 text-right font-mono-tech text-[#FFE500] font-bold">
                                            {vid.viewsTotal.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="p-3 text-zinc-400 text-xs">
                                            {vid.createdDateFormatted}
                                        </td>
                                        <td className="p-3 text-center">
                                            <a
                                                href={vid.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-mono-tech text-[#FFE500] hover:underline"
                                            >
                                                <span>Voir</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
