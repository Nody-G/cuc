'use client';

import React from 'react';
import { Share2, MapPin, Smartphone, Monitor, Tablet, Globe } from 'lucide-react';
import type { ReferrerMetric, GeoMetric, DeviceMetric, BrowserMetric } from '@/types/site-traffic';

interface TrafficSourcesAndGeoProps {
    referrers: ReferrerMetric[];
    geography: GeoMetric[];
    devices: DeviceMetric[];
    browsers: BrowserMetric[];
}

export const TrafficSourcesAndGeo: React.FC<TrafficSourcesAndGeoProps> = ({
    referrers,
    geography,
    devices,
    browsers,
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Canaux d'acquisition */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                        <Share2 className="w-5 h-5 text-[#FFE500]" />
                        <div>
                            <h3 className="text-base font-display uppercase tracking-wider text-white">
                                Canaux d&apos;Acquisition
                            </h3>
                            <p className="text-xs font-tech text-zinc-400">
                                Provenance des visiteurs du site
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-5">
                        {referrers.map((ref) => {
                            const isIg = ref.category === 'instagram';
                            const isGoogle = ref.category === 'google';

                            return (
                                <div key={ref.source} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-mono-tech">
                                        <span className={`font-medium ${isIg ? 'text-fuchsia-300' : isGoogle ? 'text-blue-300' : 'text-zinc-200'}`}>
                                            {ref.source}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400">{ref.visitors.toLocaleString('fr-FR')}</span>
                                            <span className={`font-bold ${isIg ? 'text-fuchsia-400' : 'text-zinc-300'}`}>
                                                {ref.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${ref.percentage}%` }}
                                            className={`h-full rounded-full ${
                                                isIg
                                                    ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                                                    : isGoogle
                                                    ? 'bg-blue-400'
                                                    : 'bg-[#FFE500]'
                                            }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-800/80 text-[11px] font-mono-tech text-zinc-500">
                    💡 <strong className="text-zinc-300">Instagram</strong> génère ~49% du trafic global grâce à la communauté d&apos;1M+ abonnés.
                </div>
            </div>

            {/* 2. Répartition Géographique */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h3 className="text-base font-display uppercase tracking-wider text-white">
                                Répartition Géographique
                            </h3>
                            <p className="text-xs font-tech text-zinc-400">
                                Villes et bassins de recrutement
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 mt-5">
                        {geography.map((geo) => (
                            <div key={geo.city} className="flex items-center justify-between text-xs font-mono-tech">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{geo.flag}</span>
                                    <span className="text-zinc-200">{geo.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400">{geo.visitors.toLocaleString('fr-FR')}</span>
                                    <span className="font-bold text-cyan-400 w-8 text-right">
                                        {geo.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-800/80 text-[11px] font-mono-tech text-zinc-500">
                    📍 Fort ancrage en <strong className="text-zinc-300">Île-de-France</strong> et dans les <strong className="text-zinc-300">Hauts-de-France</strong> (Le Cateau).
                </div>
            </div>

            {/* 3. Appareils & Navigateurs */}
            <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                        <div>
                            <h3 className="text-base font-display uppercase tracking-wider text-white">
                                Appareils & Navigateurs
                            </h3>
                            <p className="text-xs font-tech text-zinc-400">
                                Écrans et plateformes utilisés
                            </p>
                        </div>
                    </div>

                    {/* Appareils */}
                    <div className="grid grid-cols-3 gap-2 mt-5">
                        {devices.map((dev) => (
                            <div
                                key={dev.device}
                                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center"
                            >
                                <div className="flex justify-center mb-1 text-zinc-400">
                                    {dev.device === 'mobile' && <Smartphone className="w-4 h-4 text-emerald-400" />}
                                    {dev.device === 'desktop' && <Monitor className="w-4 h-4 text-cyan-400" />}
                                    {dev.device === 'tablet' && <Tablet className="w-4 h-4 text-purple-400" />}
                                </div>
                                <div className="text-[10px] font-mono-tech uppercase text-zinc-400">
                                    {dev.device}
                                </div>
                                <div className="text-base font-display text-white mt-0.5">
                                    {dev.percentage}%
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigateurs */}
                    <div className="space-y-2 mt-5">
                        <div className="text-[11px] font-mono-tech uppercase text-zinc-500">Top Navigateurs</div>
                        {browsers.map((b) => (
                            <div key={b.name} className="flex items-center justify-between text-xs font-mono-tech">
                                <span className="text-zinc-300 truncate max-w-[170px]">{b.name}</span>
                                <span className="text-zinc-400 font-bold">{b.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-800/80 text-[11px] font-mono-tech text-zinc-500">
                    📱 <strong className="text-zinc-300">69% sur Mobile</strong> : vitrine ultra-optimisée tactile et format vertical.
                </div>
            </div>
        </div>
    );
};
