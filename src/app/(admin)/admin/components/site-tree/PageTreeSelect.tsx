'use client';

/**
 * Sélecteur de page du Cockpit (`AGENTS.md` § 1, couche UI).
 *
 * Remplace la liste plate « menu / autres » : l'arborescence publiée est rendue
 * telle quelle — entrée de menu, menu déroulant, sous-pages dans l'ordre réel —
 * et chaque ligne porte le **nom canonique** de la page, le libellé du menu
 * restant visible à côté. Aucun calcul métier ici : tout vient de `page-tree.ts`.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, CornerDownRight, ExternalLink, FileText } from 'lucide-react';
import { findPageTreeEntry, type PageTree, type PageTreeEntry } from '@/lib/data/site/page-tree';

export interface PageTreeSelectProps {
    tree: PageTree;
    selectedSlug: string;
    onSelectPage: (slug: string) => void;
    /** Referme le panneau et signale que le référentiel est encore en lecture. */
    isLoading?: boolean;
}

/** Raison pour laquelle une page citée n'est pas éditable, ou `null`. */
function unselectableReason(entry: PageTreeEntry): string | null {
    if (!entry.inCatalog) return 'hors catalogue éditable';
    if (!entry.inDatabase) return 'absente de la base';
    return null;
}

const PageTreeSelectRow: React.FC<{
    entry: PageTreeEntry;
    isSelected: boolean;
    isChild?: boolean;
    onSelectPage: (slug: string) => void;
}> = ({ entry, isSelected, isChild = false, onSelectPage }) => {
    const reason = unselectableReason(entry);

    return (
        <button
            type="button"
            disabled={reason !== null}
            onClick={() => onSelectPage(entry.key)}
            className={`w-full flex items-start gap-2 px-3 py-2 text-left rounded-lg transition-colors ${isChild ? 'pl-8' : ''
                } ${isSelected
                    ? 'bg-[#FFE500]/10 text-white'
                    : reason
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
        >
            {isChild ? (
                <CornerDownRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-600" />
            ) : (
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-500" />
            )}
            <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold truncate">{entry.label}</span>
                <span className="block text-[10px] font-mono text-gray-500 truncate">
                    /{entry.key === '/' ? '' : entry.key}
                    {entry.menuLabel ? ` · menu : ${entry.menuLabel}` : ' · hors menu'}
                    {reason ? ` · ${reason}` : ''}
                </span>
            </span>
            {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] mt-1.5 shrink-0" />
            )}
        </button>
    );
};

export const PageTreeSelect: React.FC<PageTreeSelectProps> = ({
    tree,
    selectedSlug,
    onSelectPage,
    isLoading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    /** Groupes repliés ; par défaut tout est déplié — l'arborescence se voit. */
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(() => findPageTreeEntry(tree, selectedSlug), [tree, selectedSlug]);

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (slug: string) => {
        onSelectPage(slug);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative min-w-[300px]">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="w-full flex items-center gap-2 bg-black/60 border border-white/20 hover:border-white/40 rounded-lg px-3 py-2 text-left focus:border-[#FFE500] focus:outline-none"
            >
                <span className="min-w-0 flex-1">
                    <span className="block text-xs text-white font-semibold truncate">
                        {selected?.label ?? (isLoading ? 'Chargement…' : 'Page inconnue')}
                    </span>
                    {selected?.menuPath && (
                        <span className="block text-[10px] font-mono text-gray-500 truncate">
                            {selected.menuPath}
                        </span>
                    )}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div
                    role="listbox"
                    className="absolute z-40 mt-2 w-full max-h-96 overflow-y-auto bg-[#0D0D12] border border-white/15 rounded-xl p-2 shadow-2xl"
                >
                    {tree.groups.map((group) => {
                        const hasChildren = group.children.length > 0;
                        const isCollapsed = collapsed[group.id] === true;

                        return (
                            <div key={group.id} className="mb-1">
                                <div className="flex items-center gap-1 px-2 py-1.5">
                                    {hasChildren ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCollapsed((prev) => ({
                                                    ...prev,
                                                    [group.id]: !isCollapsed,
                                                }))
                                            }
                                            aria-expanded={!isCollapsed}
                                            className="p-1 rounded hover:bg-white/10 text-gray-400"
                                            title={isCollapsed ? 'Déplier' : 'Replier'}
                                        >
                                            <ChevronRight
                                                className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'
                                                    }`}
                                            />
                                        </button>
                                    ) : (
                                        <span className="w-5" />
                                    )}
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 truncate">
                                        {group.menuLabel}
                                    </span>
                                    {group.isExternal && (
                                        <ExternalLink className="w-3 h-3 text-gray-600 shrink-0" />
                                    )}
                                </div>

                                {group.page && (
                                    <PageTreeSelectRow
                                        entry={group.page}
                                        isSelected={group.page.key === selected?.key}
                                        onSelectPage={handleSelect}
                                    />
                                )}

                                {hasChildren && !isCollapsed &&
                                    group.children.map((child) => (
                                        <PageTreeSelectRow
                                            key={child.key}
                                            entry={child}
                                            isChild
                                            isSelected={child.key === selected?.key}
                                            onSelectPage={handleSelect}
                                        />
                                    ))}
                            </div>
                        );
                    })}

                    {tree.outsideMenu.length > 0 && (
                        <div className="mt-1 pt-2 border-t border-white/10">
                            <span className="block px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                                Hors menu (accès direct)
                            </span>
                            {tree.outsideMenu.map((page) => (
                                <PageTreeSelectRow
                                    key={page.key}
                                    entry={page}
                                    isSelected={page.key === selected?.key}
                                    onSelectPage={handleSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
