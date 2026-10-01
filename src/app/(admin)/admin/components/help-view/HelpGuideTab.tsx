'use client';

/**
 * Volet « Guide & Raccourcis » du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { BookOpen, Keyboard } from 'lucide-react';
import { HELP_QUICK_START, type HelpGroup } from './help-content';
import { HelpTopicCard } from './HelpTopicCard';
import type { ShortcutGroup } from './shortcuts';

export interface HelpGuideTabProps {
    groups: HelpGroup[];
    openId: string | null;
    onToggleTopic: (id: string) => void;
    shortcutGroups: ShortcutGroup[];
}

export const HelpGuideTab: React.FC<HelpGuideTabProps> = ({
    groups,
    openId,
    onToggleTopic,
    shortcutGroups,
}) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* Démarrage rapide */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-[#FFE500]" /> Démarrage rapide en 4 étapes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {HELP_QUICK_START.map((step) => (
                        <div
                            key={step.label}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-1.5 hover:border-white/20 transition-colors"
                        >
                            <div className="text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                                {step.label}
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{step.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sujets thématiques Cockpit */}
            <section className="space-y-6">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Guide Opérationnel par Pôle
                    </h2>
                </div>
                {groups.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">
                        Aucun sujet ne correspond à votre filtre.
                    </p>
                ) : (
                    groups.map((group) => (
                        <div key={group.id} className="space-y-2.5">
                            <h3 className="text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-2">
                                {group.topics.map((topic) => (
                                    <HelpTopicCard
                                        key={topic.id}
                                        topic={topic}
                                        isOpen={openId === topic.id}
                                        onToggle={() => onToggleTopic(topic.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            {/* Raccourcis clavier */}
            <section className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Keyboard className="w-3.5 h-3.5 text-[#FFE500]" /> Raccourcis clavier du Cockpit
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
