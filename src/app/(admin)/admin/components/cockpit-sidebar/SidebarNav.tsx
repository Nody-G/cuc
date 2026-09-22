import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Database, Globe, Pin, PinOff } from 'lucide-react';
import type { TabType } from '../../CockpitApp';
import { cx } from '../ui';
import type { CockpitNavItem, CockpitNavSection } from './sidebar-types';

export interface SidebarNavProps {
    activeTab: TabType;
    onSelectTab: (tab: TabType) => void;
    onCloseMobile: () => void;
    onOpenBackup: () => void;
    query: string;
    normalizedQuery: string;
    pins: string[];
    pinnedItems: CockpitNavItem[];
    filteredSections: CockpitNavSection[];
    isGroupCollapsed: (title: string) => boolean;
    onToggleGroup: (title: string) => void;
    onTogglePin: (id: TabType) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
    activeTab,
    onSelectTab,
    onCloseMobile,
    onOpenBackup,
    query,
    normalizedQuery,
    pins,
    pinnedItems,
    filteredSections,
    isGroupCollapsed,
    onToggleGroup,
    onTogglePin,
}) => {
    const handleSelect = (tab: TabType) => {
        onSelectTab(tab);
        onCloseMobile();
    };

    const renderItem = (item: CockpitNavItem) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isPinned = pins.includes(item.id);
        return (
            <div key={item.id} className="group/item relative">
                <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cx(
                        'w-full flex items-center justify-between gap-2 pl-3 pr-8 py-2 rounded-lg text-xs font-medium transition-all',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE500]/60',
                        isActive
                            ? 'bg-[#FFE500] text-black font-bold shadow-md shadow-yellow-500/10'
                            : 'text-zinc-300 hover:text-white hover:bg-white/5',
                    )}
                >
                    <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                            className={cx(
                                'w-4 h-4 shrink-0',
                                isActive ? 'text-black' : 'text-zinc-400',
                            )}
                        />
                        <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                        <span
                            className={cx(
                                'px-1.5 py-0.5 rounded text-[10px] font-mono uppercase shrink-0',
                                isActive
                                    ? 'bg-black text-amber-300 font-bold'
                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700',
                            )}
                        >
                            {item.badge}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => onTogglePin(item.id)}
                    aria-label={isPinned ? `Désépingler ${item.label}` : `Épingler ${item.label}`}
                    title={isPinned ? 'Retirer des favoris' : 'Épingler en favori'}
                    className={cx(
                        'absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE500]/60',
                        isPinned
                            ? 'opacity-100 text-[#FFE500]'
                            : 'opacity-0 group-hover/item:opacity-100 text-zinc-500 hover:text-white',
                    )}
                >
                    {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </button>
            </div>
        );
    };

    return (
        <nav aria-label="Navigation principale du Cockpit" className="p-3 space-y-3 flex-1 overflow-y-auto">
            {/* Favoris épinglés */}
            {pinnedItems.length > 0 && !normalizedQuery && (
                <div className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-[#FFE500] uppercase font-semibold flex items-center gap-1.5">
                        <Pin className="w-3 h-3" /> Favoris
                    </div>
                    {pinnedItems.map(renderItem)}
                </div>
            )}

            {filteredSections.map((section) => {
                const isCollapsed = isGroupCollapsed(section.title);
                return (
                    <div key={section.title} className="space-y-1">
                        <button
                            type="button"
                            onClick={() => onToggleGroup(section.title)}
                            aria-expanded={!isCollapsed}
                            className="w-full flex items-center justify-between px-3 py-1 rounded text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold hover:text-zinc-300 transition-colors"
                        >
                            <span>{section.title}</span>
                            <ChevronDown
                                className={cx(
                                    'w-3 h-3 transition-transform',
                                    isCollapsed && '-rotate-90',
                                )}
                            />
                        </button>
                        <AnimatePresence initial={false}>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.16, ease: 'easeOut' }}
                                    className="overflow-hidden space-y-1"
                                >
                                    {section.items.map(renderItem)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {normalizedQuery && filteredSections.length === 0 && (
                <div className="px-3 py-6 text-center text-[11px] text-zinc-500 font-mono">
                    Aucun menu ne correspond à « {query} ».
                </div>
            )}

            <div className="pt-2">
                <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
                    Raccourcis
                </div>
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors"
                >
                    <Globe className="w-4 h-4 text-zinc-500" />
                    <span>Voir le site vitrine ↗</span>
                </Link>
                <button
                    type="button"
                    onClick={onOpenBackup}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Sauvegardes / Export ↗</span>
                </button>
            </div>
        </nav>
    );
};
