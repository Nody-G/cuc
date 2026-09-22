'use client';

import React from 'react';
import { GraduationCap, Mail, Phone } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { InquiryStatusBadge } from './InquiryStatusBadge';

export interface InquiryRowProps {
    inquiry: SiteInquiry;
    onOpen: (inquiry: SiteInquiry) => void;
    onStatusChange: (id: string, status: SiteInquiry['status']) => void;
}

/** Ligne de candidature : identité, contact, message et actions rapides. */
export const InquiryRow: React.FC<InquiryRowProps> = ({ inquiry, onOpen, onStatusChange }) => (
    <div
        className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => onOpen(inquiry)}
    >
        <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-bold text-white hover:text-[#FFE500] transition-colors">
                    {inquiry.full_name}
                </span>
                <InquiryStatusBadge status={inquiry.status} />
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

            <select
                value={inquiry.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                    onStatusChange(inquiry.id, e.target.value as SiteInquiry['status'])
                }
                className="bg-[#14141c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:border-[#FFE500] focus:outline-hidden cursor-pointer"
            >
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En examen</option>
                <option value="admis">Admis</option>
                <option value="refuse">Refusé</option>
                <option value="archive">Archivé</option>
            </select>
        </div>
    </div>
);
