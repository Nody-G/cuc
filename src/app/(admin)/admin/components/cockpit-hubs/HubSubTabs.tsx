'use client';

import React from 'react';
import type { TabType } from '../../cockpit/cockpit-nav';

export interface HubSubTabsProps {
    subTabs: ReadonlyArray<{ tab: TabType; label: string }>;
    activeTab: TabType;
    onSelect: (tab: TabType) => void;
}

/**
 * Barre de sous-onglets d'un hub — présentation pure (`AGENTS.md` § 1).
 *
 * Une seule implémentation partagée par les hubs Chrome, Journal et Audience :
 * dupliquer trois fois le même sélecteur serait de la sur-fragmentation inutile
 * (ici l'extraction répond à un besoin de réutilisabilité réel, § 2).
 */
export const HubSubTabs: React.FC<HubSubTabsProps> = ({ subTabs, activeTab, onSelect }) => (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl w-fit">
        {subTabs.map((sub) => (
            <button
                key={sub.tab}
                type="button"
                onClick={() => onSelect(sub.tab)}
                aria-current={activeTab === sub.tab ? 'page' : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === sub.tab
                        ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/10'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
            >
                {sub.label}
            </button>
        ))}
    </div>
);
