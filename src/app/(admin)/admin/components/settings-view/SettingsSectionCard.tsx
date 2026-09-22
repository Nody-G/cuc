'use client';

import React from 'react';

export interface SettingsSectionCardProps {
    icon: React.ReactNode;
    /** Classes de couleur du pastille d'icône (ex. `bg-amber-500/10 text-amber-400`). */
    iconClassName: string;
    title: string;
    description: string;
    /** Contenu additionnel aligné à droite de l'en-tête (ex. bascule d'urgence). */
    headerExtra?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/** Carte de section de réglages : en-tête (icône, titre, description) + contenu. */
export const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
    icon,
    iconClassName,
    title,
    description,
    headerExtra,
    className,
    children,
}) => (
    <div className={`bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5 ${className || ''}`}>
        <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-3">
            <div className={`p-2 rounded-lg ${iconClassName}`}>{icon}</div>
            {headerExtra ? (
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
                        <p className="text-xs text-zinc-400">{description}</p>
                    </div>
                    {headerExtra}
                </div>
            ) : (
                <div>
                    <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
                    <p className="text-xs text-zinc-400">{description}</p>
                </div>
            )}
        </div>

        {children}
    </div>
);
