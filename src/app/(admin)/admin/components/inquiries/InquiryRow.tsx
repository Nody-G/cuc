'use client';

import React from 'react';
import { GraduationCap, Mail, Phone } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { pipelineOfMetadata, stageLabel } from '@/lib/inquiries/pipeline-read';
import { InquiryStatusBadge } from './InquiryStatusBadge';

export interface InquiryRowProps {
    inquiry: SiteInquiry;
    onOpen: (inquiry: SiteInquiry) => void;
    /** Changement d'étape, validé côté serveur (verrou Découverte compris). */
    onStageChange: (id: string, stage: string) => void;
    /** Nombre total de dossiers déposés par cette personne (re-candidatures). */
    applicantDossierCount?: number;
}

/** Ligne d'un dossier Contact : identité, contact, étape et actions rapides. */
export const InquiryRow: React.FC<InquiryRowProps> = ({
    inquiry,
    onOpen,
    onStageChange,
    applicantDossierCount = 1,
}) => {
    const pipeline = pipelineOfMetadata(inquiry.metadata);

    return (
        <div
            className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
            onClick={() => onOpen(inquiry)}
        >
            <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-white hover:text-[#FFE500] transition-colors">
                        {inquiry.full_name}
                    </span>
                    <InquiryStatusBadge
                        status={inquiry.status}
                        pipeline={pipeline.id}
                    />
                    {pipeline.id !== 'formation' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/10">
                            {pipeline.label}
                        </span>
                    )}
                    {applicantDossierCount > 1 && (
                        <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/30"
                            title="Cette personne a déjà candidaté : voir les candidatures antérieures dans la fiche."
                        >
                            Ancien candidat · {applicantDossierCount} dossiers
                        </span>
                    )}
                    {inquiry.metadata?.cuc_sign_student_id && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> CUC Sign
                        </span>
                    )}
                    <span className="text-[11px] font-mono text-gray-500">
                        {new Date(inquiry.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="font-medium text-gray-300">
                        {inquiry.program_title || inquiry.program_id}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                        <Mail className="w-3 h-3 text-[#FFE500]" /> {inquiry.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                        <Phone className="w-3 h-3 text-[#FFE500]" /> {inquiry.phone}
                    </span>
                </div>

                {inquiry.message && (
                    <p className="text-xs text-gray-400 line-clamp-1 italic mt-0.5">
                        "{inquiry.message}"
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen(inquiry);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10 transition-colors cursor-pointer"
                >
                    Détails du profil
                </button>

                {/* Étapes du pipeline du dossier — jamais « admis » pour un tournage */}
                <select
                    value={inquiry.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onStageChange(inquiry.id, e.target.value)}
                    aria-label="Étape du dossier"
                    className="bg-[#14141c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:border-[#FFE500] focus:outline-hidden cursor-pointer"
                >
                    {pipeline.stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                            {stage.label}
                        </option>
                    ))}
                    {/* Étape héritée non reconnue par le pipeline : on ne la perd pas de vue. */}
                    {!pipeline.stages.some((stage) => stage.id === inquiry.status) && (
                        <option value={inquiry.status}>
                            {stageLabel(pipeline, inquiry.status)} (hérité)
                        </option>
                    )}
                </select>
            </div>
        </div>
    );
};
