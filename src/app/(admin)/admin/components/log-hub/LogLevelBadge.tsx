'use client';

/**
 * Pastille de gravité d'un événement.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : props entrantes, rendu pur,
 * aucun calcul — la correspondance gravité → tonalité vit dans
 * `log-hub-format.ts`, où elle est testable.
 */

import React from 'react';
import { AlertOctagon, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { LogLevel } from '@/lib/logging/types';
import { CockpitBadge } from '../ui';
import { levelLabel, levelTone } from './log-hub-format';

const LEVEL_ICONS: Record<LogLevel, typeof Info> = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    critical: AlertOctagon,
};

interface LogLevelBadgeProps {
    level: LogLevel;
}

export const LogLevelBadge: React.FC<LogLevelBadgeProps> = ({ level }) => {
    const Icon = LEVEL_ICONS[level] ?? Info;
    return (
        <CockpitBadge tone={levelTone(level)}>
            <span className="inline-flex items-center gap-1">
                <Icon className="w-3 h-3" aria-hidden="true" />
                {levelLabel(level)}
            </span>
        </CockpitBadge>
    );
};
