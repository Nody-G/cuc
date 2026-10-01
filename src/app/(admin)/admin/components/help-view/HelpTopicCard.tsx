'use client';

/**
 * Carte de sujet de l'aide — accordéon dépliable avec guide détaillé et dépannage.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : props in, render out.
 */

import React from 'react';
import { AlertTriangle, ChevronDown, Lightbulb } from 'lucide-react';
import type { HelpTopic } from './help-content';

export interface HelpTopicCardProps {
    topic: HelpTopic;
    isOpen: boolean;
    onToggle: () => void;
}

export const HelpTopicCard: React.FC<HelpTopicCardProps> = ({ topic, isOpen, onToggle }) => (
    <div
        className={`rounded-xl border transition-colors ${isOpen
            ? 'border-[#FFE500]/40 bg-[#0F0F14]'
            : 'border-white/10 bg-[#0D0D12] hover:border-white/20'
            }`}
    >
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer"
        >
            <div className="min-w-0">
                <div className="text-sm font-bold text-white">{topic.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{topic.summary}</div>
            </div>
            <ChevronDown
                className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#FFE500]' : ''
                    }`}
            />
        </button>

        {isOpen && (
            <div className="px-4 pb-5 pt-1 space-y-4 border-t border-white/5 animate-in fade-in duration-150">
                {/* Marche à suivre pas à pas si disponible */}
                {topic.steps && topic.steps.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider font-bold">
                            Marche à suivre pas à pas :
                        </div>
                        <ol className="space-y-1.5">
                            {topic.steps.map((step, idx) => (
                                <li key={step} className="flex items-start gap-2.5 text-xs text-gray-300">
                                    <span className="w-4 h-4 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Points opérationnels & règles clés */}
                <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                        Ce qu’il faut savoir :
                    </div>
                    <ul className="space-y-1.5">
                        {topic.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2 text-xs text-gray-300">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#FFE500] shrink-0" />
                                <span className="leading-relaxed">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Astuce de pro */}
                {topic.proTip && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-gray-300 flex items-start gap-2.5">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-amber-400 block mb-0.5">Astuce de pro :</span>
                            <span className="leading-relaxed">{topic.proTip}</span>
                        </div>
                    </div>
                )}

                {/* En cas de doute ou de problème */}
                {topic.troubleshooting && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-gray-300 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-red-400 block mb-0.5">En cas de doute ou de blocage :</span>
                            <span className="leading-relaxed">{topic.troubleshooting}</span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);
