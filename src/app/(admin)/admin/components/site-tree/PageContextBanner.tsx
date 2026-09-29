'use client';

/**
 * Bandeau d'identité de la page éditée (`AGENTS.md` § 1, couche UI).
 *
 * L'écran d'édition empilait ses onglets sans jamais nommer la page : on
 * réglait des « blocs » sans savoir de quelle page il s'agissait, ni où elle
 * vivait dans le menu. Ce bandeau rétablit l'ordre de lecture attendu —
 * **la page**, son **emplacement dans le menu**, puis ses **sections**.
 */

import React from 'react';
import { ExternalLink, LayoutList, MenuSquare } from 'lucide-react';
import type { PageTreeEntry } from '@/lib/data/site/page-tree';

export interface PageContextBannerProps {
    entry: PageTreeEntry | null;
    /** Nombre de sections structurantes déclarées sur la page. */
    blockCount: number;
    /** `false` si la vitrine enchaîne ses sections dans un ordre fixe. */
    blockStructureSupported: boolean;
    /** Ouvre l'onglet « Menu du Site » sur cette page. */
    onOpenMenu?: (pageKey: string) => void;
}

export const PageContextBanner: React.FC<PageContextBannerProps> = ({
    entry,
    blockCount,
    blockStructureSupported,
    onOpenMenu,
}) => {
    if (!entry) {
        return (
            <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 text-xs text-gray-400">
                Cette page n’est pas référencée dans l’arborescence du site.
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">
                    Page en cours d’édition
                </span>
                <h3 className="text-sm font-bold text-white truncate">{entry.label}</h3>
                <span className="block text-[11px] font-mono text-gray-500 truncate">
                    /{entry.key === '/' ? '' : entry.key}
                </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start gap-2 text-[11px]">
                    <MenuSquare className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                    {entry.menuPath ? (
                        <span className="text-gray-300 min-w-0">
                            Menu du site :{' '}
                            <span className="font-semibold text-white">{entry.menuPath}</span>
                        </span>
                    ) : (
                        <span className="text-gray-400">
                            Hors menu : la page s’atteint par un lien direct ou le pied de page.
                        </span>
                    )}
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                    <LayoutList className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                        {blockCount} section{blockCount > 1 ? 's' : ''} déclarée
                        {blockCount > 1 ? 's' : ''}
                        {blockStructureSupported
                            ? ' — leur ordre s’applique sur la vitrine.'
                            : ' — ordre fixe sur la vitrine, l’onglet Mise en page est inerte ici.'}
                    </span>
                </div>
                <div className="flex items-start gap-2 text-[11px]">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-400">
                        {entry.footerLabel
                            ? `Pied de page : « ${entry.footerLabel} »`
                            : 'Non citée dans le pied de page.'}
                    </span>
                </div>
            </div>

            {entry.menuPath && onOpenMenu && (
                <button
                    type="button"
                    onClick={() => onOpenMenu(entry.key)}
                    className="shrink-0 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                    title="Ouvrir cette page dans l’éditeur du menu"
                >
                    Voir dans le menu du site
                </button>
            )}
        </div>
    );
};
