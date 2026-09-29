'use client';

import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { PIPELINE_CATALOG, type PipelineId } from '@/lib/inquiries/pipelines';

export interface InquiryReclassifySectionProps {
    /** Pipeline actuel du dossier (exclu du sélecteur). */
    currentPipeline: PipelineId;
    onReclassify: (targetPipeline: string, reason: string) => void;
    busy?: boolean;
}

/**
 * Re-catégorisation d'un dossier : correction d'une erreur de catégorie du
 * visiteur. Le dossier repart à la première étape du pipeline cible et le motif,
 * obligatoire, est conservé dans son historique.
 */
export const InquiryReclassifySection: React.FC<InquiryReclassifySectionProps> = ({
    currentPipeline,
    onReclassify,
    busy = false,
}) => {
    const targets = PIPELINE_CATALOG.filter((pipeline) => pipeline.id !== currentPipeline);
    const [target, setTarget] = useState<PipelineId>(targets[0]?.id ?? 'formation');
    const [reason, setReason] = useState('');

    const ready = reason.trim().length >= 3 && !busy;

    return (
        <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#FFE500]" /> Re-catégoriser ce dossier
            </div>
            <p className="text-[11px] text-gray-500">
                Si la demande a été classée dans le mauvais projet, déplacez-la : elle repart à la
                première étape du pipeline choisi, et le motif est conservé.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as PipelineId)}
                    aria-label="Pipeline cible"
                    className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer sm:w-56"
                >
                    {targets.map((pipeline) => (
                        <option key={pipeline.id} value={pipeline.id}>
                            {pipeline.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motif (ex : demande de tournage reçue en formation)"
                    aria-label="Motif de la re-catégorisation"
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFE500]"
                />
                <button
                    type="button"
                    disabled={!ready}
                    onClick={() => {
                        onReclassify(target, reason.trim());
                        setReason('');
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    Déplacer
                </button>
            </div>
        </div>
    );
};
