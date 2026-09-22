'use client';

import React from 'react';
import { Calendar, Mail, Phone, Trash2, X } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import { InquiryChecklistSection } from './InquiryChecklistSection';
import { InquiryCucSignSection } from './InquiryCucSignSection';
import { InquiryNotesSection } from './InquiryNotesSection';
import { InquiryStatusBadge } from './InquiryStatusBadge';
import { InquiryTemplatesSection } from './InquiryTemplatesSection';

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
    onStatusChange: (status: SiteInquiry['status']) => void;
}

/**
 * Modale fiche candidat : identité, contact, session assignée, suivi
 * opérationnel, modèles email, notes internes et passerelle CUC Sign.
 * Coquille de composition — chaque section est un composant dédié.
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
    onStatusChange,
}) => (
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
                    <div className="flex items-center gap-2 mb-1">
                        <InquiryStatusBadge status={inquiry.status} />
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
                    className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                    <div className="text-gray-400 font-mono">Email de contact</div>
                    <a href={`mailto:${inquiry.email}`} className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#FFE500]" /> {inquiry.email}
                    </a>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                    <div className="text-gray-400 font-mono">Téléphone</div>
                    <a href={`tel:${inquiry.phone}`} className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5">
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
                {/* Session CUC Assignée */}
                <div className="p-3.5 rounded-xl bg-white/5 space-y-2 col-span-full">
                    <div className="flex items-center justify-between text-gray-400 font-mono">
                        <span className="flex items-center gap-1.5 text-[#FFE500]">
                            <Calendar className="w-3.5 h-3.5" /> Session & Cursus Assigné
                        </span>
                        <span className="text-[11px] text-zinc-300 font-semibold">{inquiry.session_date || 'Non assignée'}</span>
                    </div>
                    {programs && programs.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                            <select
                                value={inquiry.session_date || ''}
                                onChange={(e) => onSessionDateChange(e.target.value)}
                                className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                            >
                                <option value="">Sélectionner ou réassigner à une date de session...</option>
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

            <InquiryChecklistSection checklist={checklist} onToggle={onToggleChecklist} />

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

            <InquiryCucSignSection inquiry={inquiry} converting={isConverting} onConvert={onConvert} />

            {/* Actions de clôture */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <button
                    type="button"
                    onClick={onDelete}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-2 py-1 cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer la fiche</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onStatusChange('en_cours')}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-200 border border-white/10 cursor-pointer"
                    >
                        Marquer "En examen"
                    </button>
                    <button
                        type="button"
                        onClick={() => onStatusChange('admis')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"
                    >
                        Valider / Admis
                    </button>
                </div>
            </div>
        </div>
    </div>
);
