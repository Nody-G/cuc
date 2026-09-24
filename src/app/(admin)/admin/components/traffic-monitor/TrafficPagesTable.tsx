'use client';

import React, { useState } from 'react';
import { FileText, Search, ExternalLink, ArrowRight } from 'lucide-react';
import type { PageVisitMetric } from '@/types/site-traffic';
import { formatDuration } from '@/lib/traffic/traffic-service';

interface TrafficPagesTableProps {
    pages: PageVisitMetric[];
}

export const TrafficPagesTable: React.FC<TrafficPagesTableProps> = ({ pages }) => {
    const [search, setSearch] = useState('');

    const filtered = pages.filter(
        (p) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.path.toLowerCase().includes(search.toLowerCase())
    );

    const maxViews = Math.max(...pages.map((p) => p.views), 1);

    const getCategoryBadge = (category: PageVisitMetric['category']) => {
        switch (category) {
            case 'formation':
                return 'bg-[#FFE500]/20 text-[#FFE500] border-[#FFE500]/40';
            case 'experience':
                return 'bg-purple-900/40 text-purple-300 border-purple-800/50';
            case 'stages':
                return 'bg-amber-900/40 text-amber-300 border-amber-800/50';
            case 'b2b':
                return 'bg-cyan-900/40 text-cyan-300 border-cyan-800/50';
            default:
                return 'bg-zinc-800 text-zinc-300 border-zinc-700';
        }
    };

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {/* Header du tableau */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Pages les Plus Consultées du Site
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Classement par volume de consultations, temps passé et objectifs de conversion
                    </p>
                </div>

                {/* Champ de recherche */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Filtrer une page..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-[#FFE500] focus:outline-none rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono-tech text-white placeholder-zinc-500"
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-[11px] font-mono-tech uppercase text-zinc-500">
                            <th className="py-2.5 px-3">Page / Contenu</th>
                            <th className="py-2.5 px-3">Catégorie</th>
                            <th className="py-2.5 px-3 text-right">Vues</th>
                            <th className="py-2.5 px-3 text-right">Uniques</th>
                            <th className="py-2.5 px-3 text-right">Temps Moyen</th>
                            <th className="py-2.5 px-3 text-right">Rebond</th>
                            <th className="py-2.5 px-3">Objectif CUC</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                        {filtered.map((item) => {
                            const barPct = Math.round((item.views / maxViews) * 100);

                            return (
                                <tr key={item.path} className="hover:bg-zinc-900/40 transition-colors">
                                    {/* Page */}
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono-tech text-white font-medium hover:text-[#FFE500] transition-colors">
                                                {item.title}
                                            </span>
                                            <a
                                                href={item.path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-zinc-500 hover:text-zinc-300"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <div className="text-[10px] font-mono-tech text-zinc-500">
                                            {item.path}
                                        </div>
                                    </td>

                                    {/* Catégorie */}
                                    <td className="py-3 px-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono-tech uppercase border ${getCategoryBadge(
                                                item.category
                                            )}`}
                                        >
                                            {item.category}
                                        </span>
                                    </td>

                                    {/* Vues + barre */}
                                    <td className="py-3 px-3 text-right">
                                        <div className="font-mono-tech font-bold text-white">
                                            {item.views.toLocaleString('fr-FR')}
                                        </div>
                                        <div className="w-20 bg-zinc-800 h-1 rounded-full mt-1 ml-auto overflow-hidden">
                                            <div
                                                style={{ width: `${barPct}%` }}
                                                className="bg-[#FFE500] h-full rounded-full"
                                            />
                                        </div>
                                    </td>

                                    {/* Visiteurs Uniques */}
                                    <td className="py-3 px-3 text-right font-mono-tech text-zinc-300">
                                        {item.uniques.toLocaleString('fr-FR')}
                                    </td>

                                    {/* Temps moyen */}
                                    <td className="py-3 px-3 text-right font-mono-tech text-amber-300">
                                        {formatDuration(item.avgDurationSec)}
                                    </td>

                                    {/* Rebond */}
                                    <td className="py-3 px-3 text-right font-mono-tech text-zinc-400">
                                        {item.bounceRate}%
                                    </td>

                                    {/* Objectif CUC */}
                                    <td className="py-3 px-3">
                                        <div className="inline-flex items-center gap-1 text-[11px] font-mono-tech text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                                            <ArrowRight className="w-3 h-3 text-[#FFE500]" />
                                            <span>{item.conversionGoal}</span>
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
