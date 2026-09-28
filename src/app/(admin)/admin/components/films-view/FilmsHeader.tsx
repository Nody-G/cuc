'use client';

import React from 'react';
import { Crown, Film, Plus, Search, Sparkles, Users } from 'lucide-react';
import type { Instructor } from '@/types';
import type { FilmViewPreset } from './film-filters-domain';

export interface FilmsHeaderProps {
    count: number;
    filteredCount: number;
    preset: FilmViewPreset;
    onPresetChange: (preset: FilmViewPreset) => void;
    counts: {
        lucasCoord: number;
        allCoord: number;
        lucasAll: number;
        total: number;
    };
    team: Instructor[];
    selectedCoachId: string;
    onCoachChange: (coachId: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreate: () => void;
}

/**
 * En-tête du catalogue :
 * - Classification principale (Vue par défaut : Lucas DOLLFUS coordinateur).
 * - Sélecteur de coach pour identifier « qui a bossé dans quoi ».
 * - Recherche et création de projet.
 */
export const FilmsHeader: React.FC<FilmsHeaderProps> = ({
    count,
    filteredCount,
    preset,
    onPresetChange,
    counts,
    team,
    selectedCoachId,
    onCoachChange,
    searchTerm,
    onSearchChange,
    onCreate,
}) => {
    const presets: Array<{ id: FilmViewPreset; label: string; count: number; icon: React.ReactNode }> = [
        {
            id: 'lucas-coord',
            label: 'Coordonnés par Lucas Dollfus',
            count: counts.lucasCoord,
            icon: <Crown className="w-3.5 h-3.5 text-[#FFE500]" />,
        },
        {
            id: 'all-coord',
            label: 'Tous coordonnés CUC',
            count: counts.allCoord,
            icon: <Film className="w-3.5 h-3.5" />,
        },
        {
            id: 'lucas-all',
            label: 'Toutes participations Lucas',
            count: counts.lucasAll,
            icon: <Sparkles className="w-3.5 h-3.5" />,
        },
        {
            id: 'all',
            label: 'Tout le catalogue',
            count: counts.total,
            icon: <Users className="w-3.5 h-3.5" />,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                        <Film className="w-3.5 h-3.5" /> Filmographie & Cascades
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                        Projets Cinéma & Cascades
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Vue par défaut centrée sur les productions coordonnées par Lucas DOLLFUS. Toutes les participations et doublures d'acteurs de l'équipe restent tracées en base.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCreate}
                    className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6] shrink-0 self-start sm:self-auto cursor-pointer shadow-xs transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un projet
                </button>
            </div>

            {/* Sélecteur de vue & classification de coordination (Défaut : Lucas) */}
            <div className="flex items-center gap-2 flex-wrap">
                {presets.map((p) => {
                    const isActive = preset === p.id;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onPresetChange(p.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${isActive
                                ? 'bg-[#FFE500]/15 border-[#FFE500] text-white font-bold shadow-[0_0_12px_rgba(255,229,0,0.15)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {p.icon}
                            <span>{p.label}</span>
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isActive
                                    ? 'bg-[#FFE500] text-black'
                                    : 'bg-black/60 text-zinc-400'
                                    }`}
                            >
                                {p.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Outils de filtrage : Recherche + Sélecteur Coach + Compteur */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                    <div className="relative min-w-[240px] flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un film, réalisateur, acteur doublé..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FFE500] w-full"
                        />
                    </div>

                    {/* Sélecteur pour filtrer par coach spécifique (« qui a bossé dans quoi ») */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={selectedCoachId}
                            onChange={(e) => onCoachChange(e.target.value)}
                            className="bg-black/80 border border-white/20 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FFE500] cursor-pointer"
                            title="Filtrer pour voir exactement ce que ce coach a fait"
                        >
                            <option value="all">👥 Tous les intervenants CUC</option>
                            {team.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} {member.id === 'lucas-dollfus' ? '(Directeur CUC)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="text-xs font-mono text-gray-400 shrink-0">
                    <span className="text-[#FFE500] font-bold">{filteredCount}</span> affiché{filteredCount > 1 ? 's' : ''} sur <span className="text-white font-bold">{count}</span> en base
                </div>
            </div>
        </div>
    );
};
