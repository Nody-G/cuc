'use client';

/**
 * Carte de sujet de l'aide — accordéon dépliable.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : props in, render out.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
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
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
        >
            <div className="min-w-0">
                <div className="text-sm font-bold text-white">{topic.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{topic.summary}</div>
            </div>
            <ChevronDown
                className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#FFE500]' : ''}`}
            />
        </button>

        {isOpen && (
            <ul className="px-4 pb-4 space-y-1.5 animate-in fade-in duration-150">
                {topic.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#FFE500] shrink-0" />
                        <span className="leading-relaxed">{bullet}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);
