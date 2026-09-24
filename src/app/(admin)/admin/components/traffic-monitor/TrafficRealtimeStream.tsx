'use client';

import React from 'react';
import { Smartphone, Monitor, Tablet, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import type { RealtimeVisitor } from '@/types/site-traffic';
import { formatDuration } from '@/lib/traffic/traffic-service';

interface TrafficRealtimeStreamProps {
    visitors: RealtimeVisitor[];
    isRefreshing: boolean;
    onRefresh: () => void;
    onSimulate: () => void;
    isSimulating: boolean;
    pollingInterval: number;
    onChangePolling: (interval: number) => void;
}

export const TrafficRealtimeStream: React.FC<TrafficRealtimeStreamProps> = ({
    visitors,
    isRefreshing,
    onRefresh,
    onSimulate,
    isSimulating,
    pollingInterval,
    onChangePolling,
}) => {
    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {/* Header du flux temps réel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Flux Visiteurs en Direct
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-tech text-[10px] uppercase font-bold border border-emerald-500/30">
                            {visitors.length} en ligne
                        </span>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Utilisateurs actifs en train de consulter le site en ce moment même
                    </p>
                </div>

                {/* Actions & Fréquence de rafraîchissement */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Sélecteur de cadence de polling */}
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-[11px] font-mono-tech text-zinc-400">
                        <span>Flux:</span>
                        <select
                            value={pollingInterval}
                            onChange={(e) => onChangePolling(Number(e.target.value))}
                            className="bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                            <option value={5000} className="bg-zinc-900">5s</option>
                            <option value={10000} className="bg-zinc-900">10s</option>
                            <option value={30000} className="bg-zinc-900">30s</option>
                            <option value={0} className="bg-zinc-900">Pause</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={onSimulate}
                        disabled={isSimulating}
                        title="Simuler un visiteur réel pour tester la détection en direct"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>{isSimulating ? 'Simulation...' : 'Simuler visite'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Actualiser le flux"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tableau des visiteurs en ligne */}
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-[11px] font-mono-tech uppercase text-zinc-500">
                            <th className="py-2.5 px-3">Localisation</th>
                            <th className="py-2.5 px-3">Page Consultée</th>
                            <th className="py-2.5 px-3">Canal / Provenance</th>
                            <th className="py-2.5 px-3 text-center">Appareil</th>
                            <th className="py-2.5 px-3 text-right">Temps sur site</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                        {visitors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono-tech">
                                    Aucun visiteur actif en ce moment.
                                </td>
                            </tr>
                        ) : (
                            visitors.map((visitor) => (
                                <tr key={visitor.id} className="hover:bg-zinc-900/40 transition-colors">
                                    {/* Localisation */}
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{visitor.flag}</span>
                                            <div>
                                                <div className="font-mono-tech text-white font-medium">
                                                    {visitor.city}
                                                </div>
                                                <div className="text-[10px] text-zinc-500">{visitor.country}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Page consultée */}
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono-tech text-zinc-200 hover:text-[#FFE500] transition-colors">
                                                {visitor.pageTitle}
                                            </span>
                                            <a
                                                href={visitor.currentPath}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-zinc-500 hover:text-zinc-300"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <div className="text-[10px] font-mono-tech text-zinc-500 truncate max-w-xs">
                                            {visitor.currentPath}
                                        </div>
                                    </td>

                                    {/* Source */}
                                    <td className="py-3 px-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono-tech ${visitor.source.includes('Instagram')
                                                    ? 'bg-fuchsia-950/40 text-fuchsia-300 border border-fuchsia-800/40'
                                                    : visitor.source.includes('Google')
                                                        ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40'
                                                        : visitor.source.includes('YouTube')
                                                            ? 'bg-red-950/40 text-red-300 border border-red-800/40'
                                                            : 'bg-zinc-800/60 text-zinc-300'
                                                }`}
                                        >
                                            {visitor.source}
                                        </span>
                                    </td>

                                    {/* Appareil */}
                                    <td className="py-3 px-3 text-center">
                                        {visitor.device === 'mobile' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono-tech">
                                                <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
                                                Mobile
                                            </span>
                                        ) : visitor.device === 'desktop' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono-tech">
                                                <Monitor className="w-3.5 h-3.5 text-zinc-300" />
                                                Desktop
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono-tech">
                                                <Tablet className="w-3.5 h-3.5 text-zinc-300" />
                                                Tablette
                                            </span>
                                        )}
                                    </td>

                                    {/* Temps actif */}
                                    <td className="py-3 px-3 text-right font-mono-tech text-emerald-400 font-semibold">
                                        {formatDuration(visitor.activeSeconds)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
