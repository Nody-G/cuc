'use client';

/**
 * Section « Aide & Guide » du Cockpit — façade de composition (`AGENTS.md` § 1).
 *
 * Rassemble en un seul endroit :
 * 1. Guide pratique du Cockpit et raccourcis clavier
 * 2. Dossier complet de l'application (chiffres clés, comparatif WordPress, cartographie 42 modules)
 * 3. Méthodologie Vibe Coding de Niels (Google Antigravity, Gemini, DeepSeek, GitHub, Vercel, règles)
 * 4. Interconnexion CUC Sign & vision stratégique à 3-5 ans
 * 5. FAQ concrète et chiffrée pour Lucas Dollfus
 */

import React from 'react';
import { LifeBuoy, Search } from 'lucide-react';
import { HELP_TABS } from './help-view/help-tabs.config';
import { HelpTabNav } from './help-view/HelpTabNav';
import { HelpGuideTab } from './help-view/HelpGuideTab';
import { HelpApplicationTab } from './help-view/HelpApplicationTab';
import { HelpMethodologyTab } from './help-view/HelpMethodologyTab';
import { HelpCucSignTab } from './help-view/HelpCucSignTab';
import { HelpFaqTab } from './help-view/HelpFaqTab';
import { useHelpView } from './help-view/useHelpView';

export const HelpView: React.FC = () => {
    const {
        activeTab,
        setActiveTab,
        query,
        setQuery,
        filteredGroups,
        openTopicId,
        toggleTopic,
        shortcutGroups,
    } = useHelpView();

    return (
        <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl pb-12">
            {/* En-tête principal */}
            <div className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <LifeBuoy className="w-3.5 h-3.5" /> Centre de Connaissances & Méthodologie
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Aide, Architecture & Coulisses du CUC
                </h1>
                <p className="text-sm text-gray-400 mt-1 max-w-3xl leading-relaxed">
                    Tout ce qu’il faut savoir sur l’application : prise en main du Cockpit, cartographie des 42 modules,
                    coulisses du « Vibe Coding » avec Antigravity & l’IA, et trajectoire d’avenir CUC Sign.
                </p>
            </div>

            {/* Navigation par Onglets */}
            <HelpTabNav
                tabs={HELP_TABS}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
            />

            {/* Recherche (spécifique au guide ou pour filtrer) */}
            {activeTab === 'guide' && (
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher une aide, un écran, un mot-clé (ex: devis, studio, versions)…"
                        className="w-full bg-[#0D0D12] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFE500]/50"
                        aria-label="Rechercher dans le guide du Cockpit"
                    />
                </div>
            )}

            {/* Contenu selon l'onglet actif */}
            <div className="pt-2">
                {activeTab === 'guide' && (
                    <HelpGuideTab
                        groups={filteredGroups}
                        openId={openTopicId}
                        onToggleTopic={toggleTopic}
                        shortcutGroups={shortcutGroups}
                    />
                )}

                {activeTab === 'application' && <HelpApplicationTab />}

                {activeTab === 'methodologie' && <HelpMethodologyTab />}

                {activeTab === 'cuc-sign' && <HelpCucSignTab />}

                {activeTab === 'faq' && <HelpFaqTab />}
            </div>
        </div>
    );
};
