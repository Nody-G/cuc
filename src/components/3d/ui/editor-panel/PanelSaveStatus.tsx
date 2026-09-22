'use client';

import React from 'react';
import { Save, AlertTriangle, Loader2 } from 'lucide-react';
import { CampusSaveStatus } from '../../types/campus3d.types';
import { SAVE_TONE_CLASSES, describeSaveStatus } from '../../data/persistenceStatus';

interface PanelSaveStatusProps {
    saveStatus: CampusSaveStatus;
    onSaveNow: () => void;
}

/** Persistance : état réel de l'écriture, message d'erreur compris. */
export const PanelSaveStatus: React.FC<PanelSaveStatusProps> = ({ saveStatus, onSaveNow }) => {
    const save = describeSaveStatus(saveStatus);
    const SaveIcon =
        save.tone === 'error' ? AlertTriangle : save.tone === 'progress' ? Loader2 : Save;

    return (
        <div className={`border p-2.5 space-y-1.5 ${SAVE_TONE_CLASSES[save.tone]}`}>
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <SaveIcon className={`w-3.5 h-3.5 ${save.tone === 'progress' ? 'animate-spin' : ''}`} />
                    {save.label}
                </span>
                <button
                    onClick={onSaveNow}
                    className="px-2 py-0.5 border border-current text-[9px] uppercase cursor-pointer hover:bg-white/5"
                    title="Écrire immédiatement l'état courant dans Supabase"
                >
                    Enregistrer
                </button>
            </div>
            {save.detail && <div className="text-[9px] text-zinc-400 break-words">{save.detail}</div>}
        </div>
    );
};
