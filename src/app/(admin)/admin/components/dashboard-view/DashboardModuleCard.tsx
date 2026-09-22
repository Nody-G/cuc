'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DashboardModuleCardProps {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Classes de la pastille d'icône (fond + couleur). */
    iconClass: string;
    /** Valeur principale (chiffre, libellé, badge « new »…). */
    children: React.ReactNode;
    subtitle: React.ReactNode;
    cta: string;
    onClick: () => void;
    /** Bordure survolée par défaut ; `overflow-hidden` pour les badges animés. */
    overflowHidden?: boolean;
}

/** Carte d'accès à un module du Cockpit (valeur, sous-titre, CTA). */
export const DashboardModuleCard: React.FC<DashboardModuleCardProps> = ({
    label,
    icon: Icon,
    iconClass,
    children,
    subtitle,
    cta,
    onClick,
    overflowHidden,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`bg-[#0F0F14] border border-white/10 rounded-xl p-5 text-left group hover:border-[#FFE500]/50 transition-all hover:scale-[1.01] cursor-pointer ${overflowHidden ? 'relative overflow-hidden' : ''
            }`}
    >
        <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{label}</span>
            <div className={`p-2 rounded-lg ${iconClass}`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
        <div className="mt-4">
            {children}
            <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#FFE500] font-medium">
            {cta} <ArrowRight className="w-3 h-3" />
        </div>
    </button>
);
