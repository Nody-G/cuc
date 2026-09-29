'use client';

import React from 'react';
import { Archive, CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';
import {
    getPipeline,
    resolveStage,
    type StageTone,
} from '@/lib/inquiries/pipelines';

const TONE_CLASSES: Record<StageTone, string> = {
    accent:
        'bg-[#FFE500] text-black shadow-xs font-bold',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    neutral: 'bg-white/10 text-gray-400 border border-white/10',
};

/**
 * Icônes par état — table **statique** au niveau module : un composant ne doit
 * jamais être *créé* pendant le rendu (react-hooks/static-components).
 */
const STAGE_ICONS: Record<'success' | 'danger' | 'terminal' | 'progress', LucideIcon> = {
    success: CheckCircle2,
    danger: XCircle,
    terminal: Archive,
    progress: Clock,
};

function iconKeyFor(tone: StageTone, terminal: boolean): keyof typeof STAGE_ICONS {
    if (tone === 'success') return 'success';
    if (tone === 'danger') return 'danger';
    return terminal ? 'terminal' : 'progress';
}

export interface InquiryStatusBadgeProps {
    /** Étape du dossier (résolue vers les valeurs héritées si nécessaire). */
    status: string;
    /** Pipeline du dossier — détermine le libellé et le ton. Défaut : formation. */
    pipeline?: string;
}

/**
 * Pastille d'étape d'un dossier.
 *
 * Le libellé, le ton et l'icône viennent du catalogue canonique
 * (`@/lib/inquiries/pipelines`) : aucune liste de statuts codée en dur ici, donc
 * plus de dérive entre l'affichage et les parcours réels.
 */
export const InquiryStatusBadge: React.FC<InquiryStatusBadgeProps> = ({ status, pipeline }) => {
    const resolved = getPipeline(pipeline);
    const stage = resolveStage(resolved, status);
    const Icon = STAGE_ICONS[iconKeyFor(stage.tone, stage.terminal === true)];

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold ${TONE_CLASSES[stage.tone]}`}
        >
            <Icon className="w-3 h-3" /> {stage.label}
        </span>
    );
};
