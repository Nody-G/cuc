'use client';

import React from 'react';
import { Calendar, Mail, Phone, Trash2, X } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import type { ApplicantHistory } from '@/lib/inquiries/applicant-history';
import { pipelineOfMetadata } from '@/lib/inquiries/pipeline-read';
import {
    InquiryApplicantHistorySection,
    type PreviousDossierView,
} from './InquiryApplicantHistorySection';
import { InquiryChecklistSection } from './InquiryChecklistSection';
import { InquiryCucSignSection } from './InquiryCucSignSection';
import { InquiryDiscoverySection, type DiscoveryVerdict } from './InquiryDiscoverySection';
import { InquiryNotesSection } from './InquiryNotesSection';
import { InquiryReclassifySection } from './InquiryReclassifySection';
import { InquiryStatusBadge } from './InquiryStatusBadge';
import { InquiryTemplatesSection } from './InquiryTemplatesSection';

export type { DiscoveryVerdict };

export interface InquiryDetailModalProps {
    inquiry: SiteInquiry;
    programs: StuntProgram[];
    checklist: Record<string, boolean>;
    onToggleChecklist: (stepId: string) => void;
    selectedTemplateId: string;
    onSelectTemplate: (id: string) => void;
    copiedTemplate: boolean;
    onCopyTemplate: (subject: string, body: string) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    onSaveNotes: () => void;
    isSavingNotes: boolean;
    onSessionDateChange: (date: string) => void;
    isConverting: boolean;
    onConvert: () => void;
    onClose: () => void;
    onDelete: () => void;
    /** Changement d'étape, validé côté serveur (verrou Découverte compris). */
    onStageChange: (stage: string) => void;
    /** Verdict de la session Découverte — pipeline Formation uniquement. */
    onDiscoveryVerdict: (verdict: DiscoveryVerdict) => void;
    /** Correction d'une erreur de catégorie. */
    onReclassify: (targetPipeline: string, reason: string) => void;
    /** Historique dérivé de la personne (tous ses dossiers confondus). */
    applicantHistory?: ApplicantHistory | null;
    /** Dossiers antérieurs de la même personne, du plus récent au plus ancien. */
    previousApplicants?: readonly PreviousDossierView[];
}

/**
 * Modale fiche dossier : identité, contact, suivi opérationnel, modèles email,
 * notes internes, passerelle CUC Sign et re-catégorisation.
 *
 * Les sections se règlent sur le **pipeline du dossier** : la session assignée et
 * la conversion CUC Sign n'ont de sens que pour la Formation, un tournage étant
 * suivi par sa checklist de production.
 */
export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
    inquiry,
    programs,
    checklist,
    onToggleChecklist,
    selectedTemplateId,
    onSelectTemplate,
    copiedTemplate,
    onCopyTemplate,
    notes,
    onNotesChange,
    onSaveNotes,
    isSavingNotes,
    onSessionDateChange,
    isConverting,
    onConvert,
    onClose,
    onDelete,
    onStageChange,
    onDiscoveryVerdict,
    onReclassify,
    applicantHistory = null,
    previousApplicants = [],
}) => {
    const pipeline = pipelineOfMetadata(inquiry.metadata);
    const isFormation = pipeline.id === 'formation';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            onClick={onClose}
        >
            <div
                className="bg-[#0D0D12] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <InquiryStatusBadge status={inquiry.status} pipeline={pipeline.id} />
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/10">
                                {pipeline.label}
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                                Reçu le {new Date(inquiry.created_at).toLocaleString('fr-FR')}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-white">{inquiry.full_name}</h2>
                        <div className="text-xs text-[#FFE500] font-mono mt-0.5">
                            {inquiry.program_title || inquiry.program_id}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                        <div className="text-gray-400 font-mono">Email de contact</div>
                        <a
                            href={`mailto:${inquiry.email}`}
                            className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5"
                        >
                            <Mail className="w-3.5 h-3.5 text-[#FFE500]" /> {inquiry.email}
                        </a>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                        <div className="text-gray-400 font-mono">Téléphone</div>
                        <a
                            href={`tel:${inquiry.phone}`}
                            className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#FFE500]" /> {inquiry.phone}
                        </a>
                    </div>
                    {inquiry.age && (
                        <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                            <div className="text-gray-400 font-mono">Âge</div>
                            <div className="text-white font-medium">{inquiry.age}</div>
                        </div>
                    )}
                    {inquiry.afdas_status && (
                        <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                            <div className="text-gray-400 font-mono">Statut Financement / AFDAS</div>
                            <div className="text-white font-medium">{inquiry.afdas_status}</div>
                        </div>
                    )}

                    {/* Session & cursus : vocabulaire de la Formation uniquement. */}
                    {isFormation && (
                        <div className="p-3.5 rounded-xl bg-white/5 space-y-2 col-span-full">
                            <div className="flex items-center justify-between text-gray-400 font-mono">
                                <span className="flex items-center gap-1.5 text-[#FFE500]">
                                    <Calendar className="w-3.5 h-3.5" /> Session & Cursus assigné
                                </span>
                                <span className="text-[11px] text-zinc-300 font-semibold">
                                    {inquiry.session_date || 'Non assignée'}
                                </span>
                            </div>
                            {programs && programs.length > 0 && (
                                <div className="flex items-center gap-2 pt-1">
                                    <select
                                        value={inquiry.session_date || ''}
                                        onChange={(e) => onSessionDateChange(e.target.value)}
                                        aria-label="Session assignée"
                                        className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                                    >
                                        <option value="">
                                            Sélectionner ou réassigner à une date de session...
                                        </option>
                                        {programs.flatMap((prog) =>
                                            (prog.nextSessions || []).map((s, idx) => (
                                                <option key={`${prog.id}-${idx}`} value={s.date}>
                                                    {prog.title} — {s.date} ({s.status})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {inquiry.sport_background && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-mono text-gray-400 uppercase">
                            Passé Sportif & Artistique
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/5 text-xs text-gray-200">
                            {inquiry.sport_background}
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <div className="text-xs font-mono text-gray-400 uppercase">
                        Message / Motivations
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/5 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {inquiry.message || 'Aucun message particulier fourni.'}
                    </div>
                </div>

                <InquiryChecklistSection
                    checklist={checklist}
                    onToggle={onToggleChecklist}
                    steps={pipeline.checklist}
                    title={
                        isFormation
                            ? 'Suivi opérationnel du candidat'
                            : 'Suivi opérationnel de la demande'
                    }
                />

                <InquiryTemplatesSection
                    inquiry={inquiry}
                    selectedTemplateId={selectedTemplateId}
                    onSelectTemplate={onSelectTemplate}
                    copied={copiedTemplate}
                    onCopy={onCopyTemplate}
                />

                <InquiryNotesSection
                    notes={notes}
                    onNotesChange={onNotesChange}
                    onSave={onSaveNotes}
                    saving={isSavingNotes}
                />

                {/* Passerelle CUC Sign : un dossier d'admission, pas un tournage. */}
                {isFormation && (
                    <InquiryCucSignSection
                        inquiry={inquiry}
                        converting={isConverting}
                        onConvert={onConvert}
                    />
                )}

                <InquiryReclassifySection
                    currentPipeline={pipeline.id}
                    onReclassify={onReclassify}
                />

                {isFormation && (
                    <InquiryDiscoverySection inquiry={inquiry} onVerdict={onDiscoveryVerdict} />
                )}

                {/* Mémoire de la personne : une candidature recalée n'efface rien. */}
                {applicantHistory && applicantHistory.applications > 1 && (
                    <InquiryApplicantHistorySection
                        history={applicantHistory}
                        previous={previousApplicants}
                    />
                )}

                {/* Progression dans le pipeline */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-2 py-1 cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer la fiche</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-gray-400">Étape :</span>
                        <select
                            value={inquiry.status}
                            onChange={(e) => onStageChange(e.target.value)}
                            aria-label="Étape du dossier"
                            className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                        >
                            {pipeline.stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.label}
                                </option>
                            ))}
                            {!pipeline.stages.some((stage) => stage.id === inquiry.status) && (
                                <option value={inquiry.status}>
                                    Étape héritée : {inquiry.status}
                                </option>
                            )}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
