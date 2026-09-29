'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import { isDiscoveryValidated } from '@/lib/inquiries/pipeline-read';

export type DiscoveryVerdict = 'en_attente' | 'favorable' | 'defavorable';

const VERDICT_OPTIONS: ReadonlyArray<{ id: DiscoveryVerdict; label: string }> = [
    { id: 'favorable', label: 'Découverte validée' },
    { id: 'defavorable', label: 'Non retenu' },
    { id: 'en_attente', label: 'En attente' },
];

export interface InquiryDiscoverySectionProps {
    inquiry: SiteInquiry;
    onVerdict: (verdict: DiscoveryVerdict) => void;
}

/**
 * Verrou Découverte (12 jours) → Cursus Pro.
 *
 * Le verdict favorable est la seule clé d'entrée du cursus long : tant qu'il
 * n'est pas enregistré, l'étape « Admis — Cursus Pro » est refusée par le
 * serveur (`canSelectStage`). Ce composant ne fait que l'enregistrer.
 */
export const InquiryDiscoverySection: React.FC<InquiryDiscoverySectionProps> = ({
    inquiry,
    onVerdict,
}) => {
    const validated = isDiscoveryValidated(inquiry.metadata);
    const current = inquiry.metadata?.discovery_verdict ?? 'en_attente';

    return (
        <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="text-xs font-mono text-gray-400 uppercase">
                Session Découverte (12 jours)
            </div>
            {validated ? (
                <div className="text-xs text-emerald-300">
                    Verdict favorable enregistré — le cursus long est déverrouillé.
                </div>
            ) : (
                <div className="flex items-start gap-2 text-[11px] text-amber-300">
                    <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                        Le cursus long reste verrouillé tant que le verdict favorable de la
                        Découverte n'est pas enregistré.
                    </span>
                </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
                {VERDICT_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onVerdict(option.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${current === option.id
                            ? 'bg-[#FFE500] text-black border-transparent'
                            : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
