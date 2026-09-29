'use client';

/**
 * Tiroir de détail d'un événement.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1). Il montre ce qui est
 * **stocké**, sans embellissement : le contexte affiché est celui qui a été
 * expurgé à l'écriture (`src/lib/logging/redact.ts`). Rien n'est re-dérivé ici —
 * un détail reconstruit à l'affichage pourrait contredire la trace.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { CockpitButton } from '../ui';
import { LogLevelBadge } from './LogLevelBadge';
import { authorLabel, durationLabel, entryDate, repeatLabel, sourceLabel } from './log-hub-format';

interface LogDetailDrawerProps {
    entry: ActivityLogEntry | null;
    onClose: () => void;
}

interface DetailLineProps {
    label: string;
    value: React.ReactNode;
}

const DetailLine: React.FC<DetailLineProps> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-b-0">
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 shrink-0 pt-0.5">
            {label}
        </span>
        <span className="text-xs text-gray-200 text-right break-words min-w-0">{value}</span>
    </div>
);

export const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({ entry, onClose }) => {
    useEffect(() => {
        if (!entry) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [entry, onClose]);

    if (!entry) return null;

    const repeat = repeatLabel(entry);
    const duration = durationLabel(entry);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button
                type="button"
                aria-label="Fermer le détail"
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Détail de l’événement"
                className="relative w-full max-w-lg h-full overflow-y-auto bg-[#0D0D12] border-l border-white/10 p-5 space-y-4"
            >
                <header className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <LogLevelBadge level={entry.level} />
                        <p className="text-sm font-bold text-white break-words">{entry.message}</p>
                    </div>
                    <CockpitButton variant="ghost" size="sm" icon={X} onClick={onClose}>
                        Fermer
                    </CockpitButton>
                </header>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2">
                    <DetailLine label="Catégorie" value={<code className="text-[11px]">{entry.category}</code>} />
                    <DetailLine label="Domaine" value={sourceLabel(entry.source)} />
                    <DetailLine label="Date" value={entryDate(entry)} />
                    <DetailLine label="Auteur" value={authorLabel(entry)} />
                    <DetailLine label="Cible" value={entry.target || '—'} />
                    <DetailLine label="Durée" value={duration || '—'} />
                    <DetailLine label="Origine" value={entry.origin || '—'} />
                    <DetailLine label="Requête" value={entry.request_id || '—'} />
                    <DetailLine label="Occurrences" value={repeat || 'Une seule fois'} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                        Contexte enregistré
                    </h3>
                    {entry.context && Object.keys(entry.context).length > 0 ? (
                        <pre className="text-[11px] text-gray-300 bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto">
                            {JSON.stringify(entry.context, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-[11px] text-gray-500">
                            Aucun contexte structuré pour cet événement.
                        </p>
                    )}
                </div>

                <p className="text-[10px] text-gray-600 leading-relaxed">
                    Les jetons, clés et adresses e-mail sont retirés avant écriture : ce détail montre la
                    trace telle qu’elle est conservée, jamais davantage.
                </p>
            </aside>
        </div>
    );
};
