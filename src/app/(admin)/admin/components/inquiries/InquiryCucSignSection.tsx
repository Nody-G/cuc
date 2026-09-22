'use client';

import React from 'react';
import { CheckCircle2, GraduationCap, UserPlus } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';

export interface InquiryCucSignSectionProps {
    inquiry: SiteInquiry;
    converting: boolean;
    onConvert: () => void;
}

/** Passerelle admissions CUC Sign : création de compte élève en 1 clic. */
export const InquiryCucSignSection: React.FC<InquiryCucSignSectionProps> = ({
    inquiry,
    converting,
    onConvert,
}) => (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#FFE500]/20 text-[#FFE500]">
                    <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wide">
                        Passerelle Admissions CUC Sign
                    </div>
                    <div className="text-[11px] text-zinc-400">
                        Générer le compte élève, le dossier administratif et l'affecter à la session dans CUC Sign.
                    </div>
                </div>
            </div>
            {inquiry.metadata?.cuc_sign_student_id ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Élève CUC Sign Créé
                </span>
            ) : null}
        </div>

        {inquiry.metadata?.cuc_sign_student_id ? (
            <div className="p-2.5 rounded-lg bg-black/60 border border-emerald-500/20 text-xs font-mono text-zinc-300 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500">ID Profil CUC Sign :</span>
                    <span className="text-emerald-400 select-all">{inquiry.metadata.cuc_sign_student_id}</span>
                </div>
                {inquiry.metadata.cuc_sign_formation_id && (
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500">ID Promotion CUC Sign :</span>
                        <span className="text-[#FFE500] select-all">{inquiry.metadata.cuc_sign_formation_id}</span>
                    </div>
                )}
                {inquiry.metadata.converted_at && (
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span>Date d'admission :</span>
                        <span>{new Date(inquiry.metadata.converted_at).toLocaleString('fr-FR')}</span>
                    </div>
                )}
            </div>
        ) : (
            <button
                type="button"
                disabled={converting}
                onClick={onConvert}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
            >
                <UserPlus className="w-4 h-4" />
                <span>{converting ? 'Création du compte en cours...' : 'Valider l\'admission & Créer le compte CUC Sign'}</span>
            </button>
        )}
    </div>
);
