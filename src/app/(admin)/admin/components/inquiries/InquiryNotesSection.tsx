'use client';

import React from 'react';
import { Check, FileText } from 'lucide-react';

export interface InquiryNotesSectionProps {
    notes: string;
    onNotesChange: (value: string) => void;
    onSave: () => void;
    saving: boolean;
}

/** Notes administratives internes : saisie et sauvegarde. */
export const InquiryNotesSection: React.FC<InquiryNotesSectionProps> = ({
    notes,
    onNotesChange,
    onSave,
    saving,
}) => (
    <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes Administratives Internes
            </span>
            <span className="text-gray-500">Visible uniquement par l'équipe CUC</span>
        </div>
        <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            placeholder="Ex: Convoqué pour l'audition du 14 octobre, dossier AFDAS validé..."
            className="w-full bg-[#14141c] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-[#FFE500] focus:outline-hidden"
        />
        <div className="flex justify-end">
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Enregistrement...' : 'Sauvegarder la note'}</span>
            </button>
        </div>
    </div>
);
