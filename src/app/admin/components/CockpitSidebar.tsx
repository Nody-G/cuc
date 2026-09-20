'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    Database,
    Globe,
    LogOut,
    Pin,
    PinOff,
    Search,
    Shield,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { TabType } from '../CockpitApp';
import { cx } from './ui';

/**
 * Navigation latérale du Cockpit.
 *
 * Améliorations UX :
 *  - Groupes repliables (état persisté dans localStorage).
 *  - Recherche instantanée filtrant les entrées par libellé.
 *  - Épinglage de favoris remontés en tête de liste.
 *  - Repli automatique en tiroir sur mobile.
 */

export interface CockpitNavItem {
    id: TabType;
    label: string;
    icon: LucideIcon;
    badge?: string;
}

export interface CockpitNavSection {
    title: string;
    items: CockpitNavItem[];
}

export interface CockpitSidebarProps {
    navSections: CockpitNavSection[];
    activeTab: TabType;
    onSelectTab: (tab: TabType) => void;
    userRole: string;
    realtimeStatus: 'connected' | 'connecting';
    userName: string;
    onLogout: () => void;
    onOpenBackup: () => void;
    /** Contrôle l'ouverture du tiroir sur mobile. */
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

const GROUPS_STORAGE_KEY = 'cuc.cockpit.sidebar.collapsed';
const PINS_STORAGE_KEY = 'cuc.cockpit.sidebar.pins';
const RAIL_STORAGE_KEY = 'cuc.cockpit.sidebar.rail';
/** Événement global émis par les raccourcis clavier (Ctrl/Cmd+B). */
export const TOGGLE_SIDEBAR_EVENT = 'cuc:cockpit:toggle-sidebar';

function readStringArray(key: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

export const CockpitSidebar: React.FC<CockpitSidebarProps> = ({
    navSections,
    activeTab,
    onSelectTab,
    userRole,
    realtimeStatus,
    userName,
    onLogout,
    onOpenBackup,
    isMobileOpen,
    onCloseMobile,
}) => {
    const [query, setQuery] = useState('');
    // Initialisation paresseuse depuis localStorage : la lecture n'a lieu
    // qu'une fois, côté client, sans effet ni rendu en cascade.
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() =>
        readStringArray(GROUPS_STORAGE_KEY)
    );
    const [pins, setPins] = useState<string[]>(() => readStringArray(PINS_STORAGE_KEY));
    const [isRail, setIsRail] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(RAIL_STORAGE_KEY) === '1';
    });

    // Repli/dépli piloté par le raccourci clavier global (Ctrl/Cmd+B).
    useEffect(() => {
        const handleToggle = () => setIsRail((prev) => !prev);
        window.addEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
        return () => window.removeEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(RAIL_STORAGE_KEY, isRail ? '1' : '0');
    }, [isRail]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(collapsedGroups));
    }, [collapsedGroups]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
    }, [pins]);

    const roleLabel =
        userRole === 'directeur'
            ? 'Direction Campus'
            : userRole === 'secretaire'
                ? 'Secrétariat'
                : userRole === 'coach'
                    ? 'Espace Formateur'
                    : 'Admin Vitrine';

    const normalizedQuery = query.trim().toLowerCase();

    // Index plat de toutes les entrées pour la recherche et les épingles.
    const allItems = useMemo(
        () => navSections.flatMap((section) => section.items),
        [navSections],
    );

    const pinnedItems = useMemo(
        () => pins.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as CockpitNavItem[],
        [pins, allItems],
    );

    const filteredSections = useMemo(() => {
        if (!normalizedQuery) return navSections;
        return navSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label.toLowerCase().includes(normalizedQuery),
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [navSections, normalizedQuery]);

    const toggleGroup = (title: string) => {
        setCollapsedGroups((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
        );
    };

    const togglePin = (id: TabType) => {
        setPins((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

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
                    onClick={() => togglePin(item.id)}
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

    const sidebarContent = (
        <>
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={() => handleSelect('dashboard')}
                    className="flex items-center gap-3 text-left group min-w-0"
                >
                    <div className="relative w-10 h-10 shrink-0">
                        <Image
                            src="/images/logos/cuc-logo-yellow.png"
                            alt="Logo Campus Univers Cascades"
                            fill
                            sizes="40px"
                            priority
                            className="object-contain drop-shadow-[0_0_12px_rgba(255,229,0,0.35)] group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold tracking-wider text-white uppercase font-mono">
                            COCKPIT
                        </div>
                        <div className="text-[10px] text-[#FFE500] font-semibold tracking-widest uppercase truncate">
                            {roleLabel}
                        </div>
                    </div>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span
                        title={
                            realtimeStatus === 'connected'
                                ? 'Flux Supabase Realtime actif (synchronisation instantanée)'
                                : 'Connexion au flux Realtime...'
                        }
                        className={cx(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border',
                            realtimeStatus === 'connected'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                        )}
                    >
                        <span
                            className={cx(
                                'w-1.5 h-1.5 rounded-full',
                                realtimeStatus === 'connected'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : 'bg-yellow-400',
                            )}
                        />
                        {realtimeStatus === 'connected' ? 'Realtime' : 'Syncing'}
                    </span>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Fermer le menu"
                        className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Recherche de menu */}
            <div className="px-3 pt-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un menu…"
                        aria-label="Rechercher un menu"
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FFE500] transition-colors"
                    />
                </div>
            </div>

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
                    const isCollapsed = collapsedGroups.includes(section.title) && !normalizedQuery;
                    return (
                        <div key={section.title} className="space-y-1">
                            <button
                                type="button"
                                onClick={() => toggleGroup(section.title)}
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

            {/* Pied de la sidebar */}
            <div className="p-4 border-t border-white/10 bg-black/40 text-xs text-gray-400 space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FFE500]/10 border border-[#FFE500]/30 flex items-center justify-center text-xs font-black text-[#FFE500] uppercase">
                        {userName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{userName}</div>
                        <div className="text-[10px] font-mono text-[#FFE500] uppercase font-semibold">
                            {userRole}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                        <Shield className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>CUC Secure</span>
                    </div>
                    <button
                        type="button"
                        onClick={onLogout}
                        title="Se déconnecter du Cockpit"
                        className="flex items-center gap-1 text-[10px] font-mono text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                    >
                        <LogOut className="w-3 h-3" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Sidebar desktop (repliable en rail via Ctrl/Cmd+B) */}
            <aside
                className={cx(
                    'hidden md:flex bg-[#0D0D12] border-r border-white/10 flex-col shrink-0 transition-[width] duration-200 overflow-hidden',
                    isRail ? 'w-0 border-r-0' : 'w-64',
                )}
                aria-hidden={isRail}
            >
                {sidebarContent}
            </aside>

            {/* Tiroir mobile */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={onCloseMobile}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                            aria-hidden="true"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0D0D12] border-r border-white/10 flex flex-col md:hidden"
                            role="dialog"
                            aria-label="Menu du Cockpit"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
