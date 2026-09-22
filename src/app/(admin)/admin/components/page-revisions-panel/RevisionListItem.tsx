'use client';

import React from 'react';
import { GitCompare, RotateCcw, Trash2, Clock, User } from 'lucide-react';
import type { SitePageRevision } from '@/lib/data/site-service';
import { CockpitBadge, CockpitIconButton, cx } from '../ui';
import { formatDate, STATUS_LABELS, STATUS_TONES } from './revision-format';

interface RevisionListItemProps {
    rev: SitePageRevision;
    isSelected: boolean;
    isCompared: boolean;
    onToggleSelect: () => void;
    onToggleCompare: () => void;
    onRestore: () => void;
    onDelete: () => void;
}

/** Ligne de l'historique : numéro, statut, auteur, horodatage et actions. */
export const RevisionListItem: React.FC<RevisionListItemProps> = ({
    rev,
    isSelected,
    isCompared,
    onToggleSelect,
    onToggleCompare,
    onRestore,
    onDelete,
}) => (
    <li
        className={cx(
            'px-4 py-3 transition-colors',
            isSelected ? 'bg-[#FFE500]/5' : 'hover:bg-white/[0.03]'
        )}
    >
        <div className="flex items-start justify-between gap-3">
            <button
                type="button"
                onClick={onToggleSelect}
                className="flex-1 min-w-0 text-left cursor-pointer"
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                        n°{rev.revision_number}
                    </span>
                    <CockpitBadge tone={STATUS_TONES[rev.status]}>
                        {STATUS_LABELS[rev.status]}
                    </CockpitBadge>
                </div>
                {rev.label && (
                    <p className="mt-1 text-[11px] text-gray-300 truncate">{rev.label}</p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-[10px] font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(rev.created_at)}
                    </span>
                    {rev.author_name && (
                        <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3" />
                            {rev.author_name}
                        </span>
                    )}
                </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
                <CockpitIconButton
                    icon={GitCompare}
                    label="Comparer avec la version courante"
                    tone={isCompared ? 'accent' : 'default'}
                    onClick={onToggleCompare}
                />
                <CockpitIconButton
                    icon={RotateCcw}
                    label="Restaurer cette version"
                    onClick={onRestore}
                />
                <CockpitIconButton
                    icon={Trash2}
                    label="Supprimer cette version"
                    tone="danger"
                    onClick={onDelete}
                />
            </div>
        </div>
    </li>
);
