'use client';

/**
 * Section « Aide & Guide » du Cockpit — façade de composition (`AGENTS.md` § 1).
 *
 * Rassemble en un seul endroit toute la pédagogie de l'application : parcours
 * conseillé, sujets par thème, raccourcis clavier. Le contenu vit dans
 * `help-view/help-content.ts`, l'état de recherche dans `useHelpFilter`.
 */

import React from 'react';
import { BookOpen, Keyboard, LifeBuoy, Search } from 'lucide-react';
import { HELP_QUICK_START } from './help-view/help-content';
import { buildShortcutGroups } from './help-view/shortcuts';
import { useHelpFilter } from './help-view/useHelpFilter';
import { HelpTopicCard } from './help-view/HelpTopicCard';

export const HelpView: React.FC = () => {
    const { query, setQuery, groups, openId, toggle } = useHelpFilter();
    const shortcutGroups = buildShortcutGroups();
    const totalTopics = groups.reduce((sum, group) => sum + group.topics.length, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
            {/* En-tête */}
            <div className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <LifeBuoy className="w-3.5 h-3.5" /> Aide & Guide
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Tout savoir sur le Cockpit
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    L’essentiel de l’application réuni ici — les écrans métier restent volontairement
                    sobres.
                </p>
            </div>

            {/* Parcours conseillé */}
            <div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-[#FFE500]" /> Démarrage rapide
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {HELP_QUICK_START.map((step) => (
                        <div
                            key={step.label}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-1.5"
                        >
                            <div className="text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                                {step.label}
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recherche */}
            <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une aide, un onglet, un mot-clé…"
                    className="w-full bg-[#0D0D12] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFE500]/50"
                    aria-label="Rechercher dans l’aide"
                />
            </div>

            {/* Sujets par thème */}
            {totalTopics === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                    Aucun sujet ne correspond à « {query} ».
                </p>
            ) : (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <section key={group.id} className="space-y-2.5">
                            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                                {group.title}
                            </h2>
                            <div className="space-y-2">
                                {group.topics.map((topic) => (
                                    <HelpTopicCard
                                        key={topic.id}
                                        topic={topic}
                                        isOpen={openId === topic.id}
                                        onToggle={() => toggle(topic.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* Raccourcis clavier */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Keyboard className="w-3.5 h-3.5 text-[#FFE500]" /> Raccourcis clavier
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shortcutGroups.map((group) => (
                        <div
                            key={group.title}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2"
                        >
                            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                                {group.title}
                            </div>
                            <div className="space-y-1.5">
                                {group.shortcuts.map((shortcut) => (
                                    <div
                                        key={shortcut.label}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <span className="text-xs text-gray-300">{shortcut.label}</span>
                                        <span className="flex items-center gap-1 shrink-0">
                                            {shortcut.keys.map((key, idx) => (
                                                <React.Fragment key={`${shortcut.label}-${key}-${idx}`}>
                                                    {idx > 0 && (
                                                        <span className="text-gray-600 text-[10px]">+</span>
                                                    )}
                                                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-gray-200 bg-white/5 border border-white/15 rounded-md min-w-[20px] text-center">
                                                        {key}
                                                    </kbd>
                                                </React.Fragment>
                                            ))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
