'use client';

import React from 'react';
import { CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { CHECKLIST_STEPS } from './checklist';
import type { ChecklistStep } from '@/lib/inquiries/pipelines';

export interface InquiryChecklistSectionProps {
    checklist: Record<string, boolean>;
    onToggle: (stepId: string) => void;
    /** Étapes du pipeline du dossier. Défaut : parcours Formation. */
    steps?: readonly ChecklistStep[];
    /** Intitulé adapté au pipeline (un tournage n'a pas de « candidat »). */
    title?: string;
}

/** Suivi opérationnel : cases à cocher persistées dans `admin_notes`. */
export const InquiryChecklistSection: React.FC<InquiryChecklistSectionProps> = ({
    checklist,
    onToggle,
    steps = CHECKLIST_STEPS,
    title = 'Suivi opérationnel du dossier',
}) => {
    const completedCount = steps.filter((step) => checklist[step.id]).length;

    return (
        <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {title}
                </span>
                <span className="text-gray-400">
                    {completedCount} / {steps.length} validés
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {steps.map((step) => {
                    const isChecked = !!checklist[step.id];
                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => onToggle(step.id)}
                            className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${isChecked
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                                <Square className="w-4 h-4 text-gray-500 shrink-0" />
                            )}
                            <span>{step.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
