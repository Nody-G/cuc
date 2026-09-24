'use client';

import React from 'react';
import { ChevronDown, Video } from 'lucide-react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';
import { InstagramReelsStatsHeader } from './InstagramReelsStatsHeader';
import { InstagramReelsFilterBar, type ReelSortMode } from './InstagramReelsFilterBar';
import { InstagramReelCard } from './InstagramReelCard';
import { generateReelsCsv, downloadCsvFile } from '@/lib/instagram/instagram-export';

interface InstagramReelsMonitorProps {
    reels: InstagramReelMetric[];
    isRefreshingAll: boolean;
    refreshingReelId: string | null;
    onRefreshAll: () => void;
    onRefreshSingle: (shortcode: string, id: string) => void;
}

const PAGE_SIZE = 18;

export const InstagramReelsMonitor: React.FC<InstagramReelsMonitorProps> = ({
    reels,
    isRefreshingAll,
    refreshingReelId,
    onRefreshAll,
    onRefreshSingle,
}) => {
    const [search, setSearch] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [sortMode, setSortMode] = React.useState<ReelSortMode>('views_desc');
    const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

    // Filtrage dynamique combiné (recherche texte + catégorie)
    const filteredReels = React.useMemo(() => {
        let list = reels;

        if (selectedCategory !== 'all') {
            list = list.filter((r) => (r.stuntCategory || 'workshop') === selectedCategory);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.shortcode.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q)
            );
        }

        return list;
    }, [reels, selectedCategory, search]);

    // Tri dynamique sur la liste filtrée
    const sortedReels = React.useMemo(() => {
        const list = [...filteredReels];
        switch (sortMode) {
            case 'views_desc':
                return list.sort((a, b) => (b.views || 0) - (a.views || 0));
            case 'views_asc':
                return list.sort((a, b) => (a.views || 0) - (b.views || 0));
            case 'date_desc':
                return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            case 'date_asc':
                return list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            case 'likes_desc':
                return list.sort((a, b) => {
                    const likesA = parseFloat((a.likes || '0').replace(',', '.').replace(/k/i, '')) || 0;
                    const likesB = parseFloat((b.likes || '0').replace(',', '.').replace(/k/i, '')) || 0;
                    return likesB - likesA;
                });
            default:
                return list;
        }
    }, [filteredReels, sortMode]);

    // Pagination progressive
    const displayedReels = React.useMemo(() => {
        return sortedReels.slice(0, visibleCount);
    }, [sortedReels, visibleCount]);

    const hasMore = visibleCount < sortedReels.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedReels.length));
    };

    // Exportation CSV intégrale de l'ensemble du catalogue
    const handleExportCsv = () => {
        const csvContent = generateReelsCsv(reels);
        const filename = `cuc-reels-instagram-${new Date().toISOString().split('T')[0]}.csv`;
        downloadCsvFile(filename, csvContent);
    };

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* En-tête avec Grand Calculateur des Vues Cumulées */}
            <InstagramReelsStatsHeader
                reels={reels}
                filteredReels={filteredReels}
                isRefreshingAll={isRefreshingAll}
                onRefreshAll={onRefreshAll}
                onExportCsv={handleExportCsv}
                selectedCategory={selectedCategory}
            />

            {/* Barre de filtres & recherche & tri */}
            <InstagramReelsFilterBar
                reels={reels}
                search={search}
                onSearchChange={(val) => {
                    setSearch(val);
                    setVisibleCount(PAGE_SIZE);
                }}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setVisibleCount(PAGE_SIZE);
                }}
                sortMode={sortMode}
                onSortModeChange={setSortMode}
                filteredCount={sortedReels.length}
            />

            {/* Grille des Reels */}
            {displayedReels.length === 0 ? (
                <div className="py-12 text-center rounded-xl bg-[#121218] border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono-tech space-y-2">
                    <Video className="w-6 h-6 mx-auto text-zinc-600" />
                    <p>Aucun Reel ne correspond à vos critères de recherche ou de filtre.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
                    {displayedReels.map((reel) => (
                        <InstagramReelCard
                            key={reel.id}
                            reel={reel}
                            isRefreshing={refreshingReelId === reel.id}
                            onRefresh={() => onRefreshSingle(reel.shortcode, reel.id)}
                        />
                    ))}
                </div>
            )}

            {/* Bouton de chargement progressif */}
            {hasMore && (
                <div className="pt-2 text-center border-t border-zinc-800/60">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#FFE500] text-xs font-mono-tech uppercase text-zinc-200 hover:text-white transition-all cursor-pointer shadow-md"
                    >
                        <span>Afficher plus de vidéos ({sortedReels.length - visibleCount} restantes)</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#FFE500]" />
                    </button>
                </div>
            )}
        </div>
    );
};
