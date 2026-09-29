'use client';

/**
 * Ligne d'un événement du journal.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1). Toute la mise en texte est
 * déléguée à `log-hub-format.ts` : ce composant ne décide de rien, il rend.
 *
 * La ligne est un bouton : le détail (contexte expurgé, identifiant de requête,
 * origine) s'ouvre dans un tiroir plutôt que d'alourdir la liste.
 */

import React from 'react';
import { ChevronRight, Repeat } from 'lucide-react';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { LogLevelBadge } from './LogLevelBadge';
import { authorLabel, durationLabel, entryDate, entryHeadline, repeatLabel, sourceLabel } from './log-hub-format';

interface LogEntryRowProps {
    entry: ActivityLogEntry;
    onOpen: (entry: ActivityLogEntry) => void;
}

export const LogEntryRow: React.FC<LogEntryRowProps> = ({ entry, onOpen }) => {
    const repeat = repeatLabel(entry);
    const duration = durationLabel(entry);

    return (
        <button
            type="button"
            onClick={() => onOpen(entry)}
            className="w-full text-left px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-colors cursor-pointer"
        >
            <div className="flex items-start gap-3">
                <div className="pt-0.5 shrink-0">
                    <LogLevelBadge level={entry.level} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs text-white break-words">{entryHeadline(entry)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                        <span>{sourceLabel(entry.source)}</span>
                        <span>{entryDate(entry)}</span>
                        <span>{authorLabel(entry)}</span>
                        {entry.target && <span className="truncate max-w-[16rem]">→ {entry.target}</span>}
                        {duration && <span>{duration}</span>}
                        {repeat && (
                            <span className="inline-flex items-center gap-1 text-amber-300">
                                <Repeat className="w-3 h-3" aria-hidden="true" />
                                {repeat}
                            </span>
                        )}
                    </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" aria-hidden="true" />
            </div>
        </button>
    );
};
