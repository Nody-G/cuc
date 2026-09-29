'use client';

/**
 * Onglets du hub Journal.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1). Les onglets sont produits
 * depuis `LOG_HUB_TABS` : ajouter une nature de trace ne demande donc aucune
 * retouche ici, et l'ordre affiché ne peut pas diverger du contrat.
 */

import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { cx } from '../ui';
import { LOG_HUB_TABS, type LogHubTab } from './log-hub.types';

interface LogHubSourceTabsProps {
    activeTab: LogHubTab;
    onTabChange: (tab: LogHubTab) => void;
    /** Nombre d'incidents (`error` + `critical`) sur 24 h — badge de l'onglet. */
    alertCount: number;
}

export const LogHubSourceTabs: React.FC<LogHubSourceTabsProps> = ({
    activeTab,
    onTabChange,
    alertCount,
}) => (
    <div role="tablist" aria-label="Natures de trace" className="flex flex-wrap gap-2">
        {LOG_HUB_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onTabChange(tab.id)}
                    title={tab.description}
                    className={cx(
                        'px-3.5 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2',
                        isActive
                            ? 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white',
                    )}
                >
                    {tab.label}
                    {tab.id === 'systeme' && alertCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-300">
                            <AlertOctagon className="w-3 h-3" aria-hidden="true" />
                            {alertCount}
                        </span>
                    )}
                </button>
            );
        })}
    </div>
);
