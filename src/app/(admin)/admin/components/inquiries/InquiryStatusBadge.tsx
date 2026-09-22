'use client';

import React from 'react';
import { Archive, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';

export interface InquiryStatusBadgeProps {
    status: SiteInquiry['status'];
}

/** Pastille de statut d'une candidature (5 états, couleurs dédiées). */
export const InquiryStatusBadge: React.FC<InquiryStatusBadgeProps> = ({ status }) => {
    switch (status) {
        case 'nouveau':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-[#FFE500] text-black shadow-xs">
                    Nouveau
                </span>
            );
        case 'en_cours':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3 h-3" /> En examen
                </span>
            );
        case 'admis':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Admis / Conclu
                </span>
            );
        case 'refuse':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    <XCircle className="w-3 h-3" /> Refusé
                </span>
            );
        case 'archive':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-white/10 text-gray-400 border border-white/10">
                    <Archive className="w-3 h-3" /> Archivé
                </span>
            );
    }
};
