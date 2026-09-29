'use client';

/**
 * Page vitrine liée à une entrée de menu (`AGENTS.md` § 1, couche UI).
 *
 * Le menu était un monde à part : un libellé, une URL, et rien qui dise de
 * quelle **page** il s'agissait. Cette puce rapproche les deux mondes — elle
 * nomme la page (nom canonique) et ouvre son édition d'un clic. Un lien externe
 * ou vide n'affiche rien : il n'y a pas de page à relier.
 */

import React from 'react';
import { Pencil } from 'lucide-react';
import type { PageTreeEntry } from '@/lib/data/site/page-tree';

export interface LinkedPageChipProps {
    entry: PageTreeEntry | null;
    onEditPage?: (slug: string) => void;
}

export const LinkedPageChip: React.FC<LinkedPageChipProps> = ({ entry, onEditPage }) => {
    if (!entry) return null;

    const isEditable = entry.inCatalog && entry.inDatabase;

    return (
        <div className="mt-1.5 flex items-center gap-2 text-[10px] min-w-0">
            <span className="font-mono uppercase tracking-wider text-gray-500 shrink-0">Page</span>
            <span
                className={`truncate font-semibold ${isEditable ? 'text-[#FFE500]' : 'text-amber-300'}`}
                title={entry.menuPath ?? entry.label}
            >
                {entry.label}
            </span>
            {!entry.inCatalog && <span className="text-gray-500 shrink-0">hors catalogue</span>}
            {entry.inCatalog && !entry.inDatabase && (
                <span className="text-gray-500 shrink-0">absente de la base</span>
            )}
            {isEditable && onEditPage && (
                <button
                    type="button"
                    onClick={() => onEditPage(entry.key)}
                    className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={`Ouvrir « ${entry.label} » dans l’éditeur de pages`}
                >
                    <Pencil className="w-3 h-3" />
                    Éditer la page
                </button>
            )}
        </div>
    );
};
