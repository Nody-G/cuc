'use client';

import React from 'react';
import { Check, Copy, Send, Sparkles } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { RESPONSE_TEMPLATES } from './templates';

export interface InquiryTemplatesSectionProps {
    inquiry: SiteInquiry;
    selectedTemplateId: string;
    onSelectTemplate: (id: string) => void;
    copied: boolean;
    /** Copie le sujet + corps générés (presse-papier géré par l'orchestration). */
    onCopy: (subject: string, body: string) => void;
}

/** Modèles de réponse officielle : choix, aperçu et envoi via client email. */
export const InquiryTemplatesSection: React.FC<InquiryTemplatesSectionProps> = ({
    inquiry,
    selectedTemplateId,
    onSelectTemplate,
    copied,
    onCopy,
}) => {
    const currentTemplate =
        RESPONSE_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESPONSE_TEMPLATES[0];
    const subject = currentTemplate.subject(inquiry);
    const body = currentTemplate.body(inquiry);
    const mailtoUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(
        subject
    )}&body=${encodeURIComponent(body)}`;

    return (
        <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Modèles de Réponses Officielles
                </span>
                <span className="text-gray-500">Génération automatique</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {RESPONSE_TEMPLATES.map((tmpl) => (
                    <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => onSelectTemplate(tmpl.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${selectedTemplateId === tmpl.id
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                            }`}
                    >
                        <span>{tmpl.name}</span>
                    </button>
                ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/10 space-y-2.5">
                <div className="text-[11px] font-mono text-gray-400">
                    <span className="text-gray-500 font-semibold">Objet :</span> {subject}
                </div>
                <div className="text-xs text-gray-300 whitespace-pre-wrap font-mono text-[11px] bg-black/40 p-3 rounded-lg max-h-36 overflow-y-auto border border-white/5">
                    {body}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => onCopy(subject, body)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copié !</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-[#FFE500]" />
                                <span>Copier le texte</span>
                            </>
                        )}
                    </button>
                    <a
                        href={mailtoUrl}
                        className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ouvrir client email</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
