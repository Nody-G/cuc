'use client';

import React from 'react';
import { Calendar, Mail, Phone } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';

export interface InquiryContactInfoSectionProps {
    inquiry: SiteInquiry;
    isFormation: boolean;
    programs: StuntProgram[];
    onSessionDateChange: (date: string) => void;
}

/**
 * Bloc de coordonnées et session assignée du candidat.
 * Règle SRP : extrait de `InquiryDetailModal` pour respecter le plafond de 300 lignes.
 */
export const InquiryContactInfoSection: React.FC<InquiryContactInfoSectionProps> = ({
    inquiry,
    isFormation,
    programs,
    onSessionDateChange,
}) => {
    return (
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
    );
};
