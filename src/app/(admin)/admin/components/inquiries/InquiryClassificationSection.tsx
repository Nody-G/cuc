'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import type { StuntProgram } from '@/types';

export const INQUIRY_CLASSIFICATION_OPTIONS: Array<{ id: string; title: string }> = [
    { id: 'autre', title: 'Autre question générale / Demande non classée' },
    { id: 'pro-longue-duree', title: 'Formation Professionnelle Longue Durée (2 ans / 720h)' },
    { id: 'stage-decouverte', title: 'Stage Découverte & Sélection (12 jours / 80h)' },
    { id: 'weekend-immersion', title: 'Formule Week-end Immersion (250 € pension complète)' },
    { id: 'afdas-artistes-interpretes', title: 'Stage AFDAS Artistes Interprètes (Gennevilliers)' },
    { id: 'stunt-summer-camp', title: 'Stunt Summer Camp (Séjour d\'été)' },
    { id: 'workshop-international', title: 'International Stunt Workshop' },
    { id: 'tournage-production', title: 'Production de Cinéma / Tournage / Coordination' },
    { id: 'cuc-events', title: 'CUC Events / Spectacles & Animations Live' },
];

export interface InquiryClassificationSectionProps {
    currentProgramId: string;
    currentProgramTitle?: string;
    programs?: StuntProgram[];
    onProgramChange?: (programId: string, programTitle: string) => void;
}

/**
 * Section de classification administrative du besoin d'un dossier.
 * Permet à l'équipe Cockpit d'assigner ou requalifier le programme / style
 * de demande d'un message reçu par défaut en « demande générale ».
 */
export const InquiryClassificationSection: React.FC<InquiryClassificationSectionProps> = ({
    currentProgramId,
    currentProgramTitle,
    programs = [],
    onProgramChange,
}) => {
    // Fusionne les options standards avec les programmes personnalisés enregistrés
    const options = [
        ...INQUIRY_CLASSIFICATION_OPTIONS,
        ...programs
            .filter((p) => !INQUIRY_CLASSIFICATION_OPTIONS.some((opt) => opt.id === p.id))
            .map((p) => ({ id: p.id, title: p.title })),
    ];

    const isUnclassified =
        currentProgramId === 'autre' ||
        currentProgramId === 'general' ||
        !currentProgramId;

    return (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5 text-[#FFE500] font-bold uppercase">
                    <Layers className="w-3.5 h-3.5" /> Classification du besoin
                </span>
                {isUnclassified && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        À classer par l'équipe
                    </span>
                )}
            </div>
            <p className="text-[11px] text-gray-500">
                Les demandes reçues depuis la vitrine arrivent par défaut comme demandes générales. Classez-les ici pour organiser le suivi.
            </p>
            <div className="flex items-center gap-2">
                <select
                    value={currentProgramId}
                    onChange={(e) => {
                        const opt = options.find((o) => o.id === e.target.value);
                        onProgramChange?.(e.target.value, opt?.title || e.target.value);
                    }}
                    aria-label="Classifier le type de demande"
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                >
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.title}
                        </option>
                    ))}
                    {!options.some((o) => o.id === currentProgramId) && (
                        <option value={currentProgramId}>
                            {currentProgramTitle || currentProgramId} (Valeur personnalisée)
                        </option>
                    )}
                </select>
            </div>
        </div>
    );
};
