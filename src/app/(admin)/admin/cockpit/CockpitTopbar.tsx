'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Command, Database, Globe, Menu, Moon, Search, Sun } from 'lucide-react';

export interface CockpitTopbarProps {
    onOpenMobileNav: () => void;
    onOpenCommandPalette: () => void;
    onOpenHealth: () => void;
    onOpenBackup: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

/**
 * Barre supérieure du Cockpit : ouverture du tiroir mobile, recherche rapide
 * (Ctrl+K), diagnostic système, sauvegardes, thème, lien vitrine.
 *
 * Composant de présentation pur : aucune donnée, aucun effet — tout remonte.
 */
export const CockpitTopbar: React.FC<CockpitTopbarProps> = ({
    onOpenMobileNav,
    onOpenCommandPalette,
    onOpenHealth,
    onOpenBackup,
    theme,
    onToggleTheme,
}) => (
    <header className="h-14 border-b border-white/10 bg-[#0D0D12]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
                type="button"
                onClick={onOpenMobileNav}
                aria-label="Ouvrir le menu du Cockpit"
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors shrink-0"
            >
                <Menu className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer w-full sm:w-72 justify-between"
            >
                <div className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span className="truncate">Recherche rapide...</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-gray-400">
                    <Command className="w-2.5 h-2.5" /> K
                </kbd>
            </button>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenHealth}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Ouvrir le Diagnostic Système"
                >
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline text-[11px]">Système</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>

                <button
                    type="button"
                    onClick={onOpenBackup}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title="Sauvegardes & Restauration"
                >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">Backups</span>
                </button>

                <button
                    type="button"
                    onClick={onToggleTheme}
                    className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
                    aria-label={theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-3.5 h-3.5" />
                    ) : (
                        <Moon className="w-3.5 h-3.5" />
                    )}
                </button>

                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500]/10 hover:bg-[#FFE500]/20 border border-[#FFE500]/30 text-xs font-medium text-[#FFE500] transition-colors"
                    title="Voir le site vitrine en direct"
                >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Site vitrine ↗</span>
                </Link>
            </div>
        </div>
    </header>
);
