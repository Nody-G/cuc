'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useOptionalCockpitTheme } from '../ui/CockpitThemeProvider';

export interface SidebarHeaderProps {
    roleLabel: string;
    onSelectDashboard: () => void;
    onCloseMobile: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    roleLabel,
    onSelectDashboard,
    onCloseMobile,
}) => {
    const themeContext = useOptionalCockpitTheme();
    const isLight = themeContext?.theme === 'light';
    const logoSrc = isLight
        ? '/images/logos/cuc-logo-bw.png'
        : '/images/logos/cuc-logo-yellow.png';

    return (
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-2">
            <button
                type="button"
                onClick={onSelectDashboard}
                className="flex items-center gap-3 text-left group min-w-0"
            >
                <div className="relative w-10 h-10 shrink-0">
                    <Image
                        src={logoSrc}
                        alt="Logo Campus Univers Cascades"
                        fill
                        sizes="40px"
                        priority
                        className={`object-contain transition-transform group-hover:scale-105 ${
                            isLight
                                ? 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                                : 'drop-shadow-[0_0_12px_rgba(255,229,0,0.35)]'
                        }`}
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
    );
};
