import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cx } from '../ui';

export interface SidebarHeaderProps {
    roleLabel: string;
    realtimeStatus: 'connected' | 'connecting';
    onSelectDashboard: () => void;
    onCloseMobile: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    roleLabel,
    realtimeStatus,
    onSelectDashboard,
    onCloseMobile,
}) => (
    <div className="p-5 border-b border-white/10 flex items-center justify-between gap-2">
        <button
            type="button"
            onClick={onSelectDashboard}
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
);
