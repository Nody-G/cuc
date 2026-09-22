'use client';

import React from 'react';
import { CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { CHECKLIST_STEPS } from './checklist';

export interface InquiryChecklistSectionProps {
    checklist: Record<string, boolean>;
    onToggle: (stepId: string) => void;
}

/** Suivi opérationnel : cases à cocher persistées dans `admin_notes`. */
export const InquiryChecklistSection: React.FC<InquiryChecklistSectionProps> = ({
    checklist,
    onToggle,
}) => (
    <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Suivi Opérationnel du Candidat
            </span>
            <span className="text-gray-400">
                {CHECKLIST_STEPS.filter((s) => checklist[s.id]).length} / {CHECKLIST_STEPS.length} validés
            </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHECKLIST_STEPS.map((step) => {
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
