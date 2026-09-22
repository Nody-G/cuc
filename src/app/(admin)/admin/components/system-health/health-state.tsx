'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { HealthState } from '@/app/(admin)/admin/actions';

export interface HealthStateStyle {
    badge: string;
    icon: React.ReactNode;
    label: string;
}

/** Badge, icône et libellé pour chaque état de santé rapporté par la sonde. */
export const STATE_STYLES: Record<HealthState, HealthStateStyle> = {
    ok: {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        label: 'OPÉRATIONNEL',
    },
    degraded: {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: 'DÉGRADÉ',
    },
    down: {
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: 'INDISPONIBLE',
    },
};

export type RealtimeStatus = 'connecting' | 'connected' | 'offline';

/** Badge et libellé du canal Supabase Realtime du Cockpit. */
export const REALTIME_STYLES: Record<RealtimeStatus, { badge: string; label: string }> = {
    connected: {
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        label: 'SYNCHRONISÉ',
    },
    connecting: {
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: 'CONNEXION',
    },
    offline: {
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: 'HORS LIGNE',
    },
};
