'use client';

/**
 * Barre de navigation à onglets du centre d'aide.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import type { HelpTabConfigItem } from './help-tabs.config';
import type { HelpTabId } from './help-content.types';

export interface HelpTabNavProps {
    tabs: readonly HelpTabConfigItem[];
    activeTab: HelpTabId;
    onSelectTab: (tabId: HelpTabId) => void;
}

export const HelpTabNav: React.FC<HelpTabNavProps> = ({ tabs, activeTab, onSelectTab }) => {
    return (
        <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${isActive
                            ? 'bg-[#FFE500] text-black font-bold shadow-lg shadow-[#FFE500]/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-black' : 'text-[#FFE500]'}`} />
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {tab.badge && (
                            <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isActive
                                    ? 'bg-black/20 text-black'
                                    : 'bg-white/5 text-gray-400 group-hover:text-white'
                                    }`}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
