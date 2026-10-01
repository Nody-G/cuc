'use client';

/**
 * Volet « FAQ & Réponses Clés » du Cockpit (dédié à Lucas).
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { LUCAS_FAQ_ITEMS } from './help-faq-data';

export const HelpFaqTab: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (idx: number) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* En-tête */}
            <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5" /> En toute clarté & transparence
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Questions Clés & Réponses Directes pour Lucas
                </h2>
                <p className="text-xs text-gray-400">
                    Les réponses indispensables sur les coûts réels, la propriété, la maintenance et l’autonomie du CUC.
                </p>
            </section>

            {/* Questions fréquentes */}
            <div className="space-y-3">
                {LUCAS_FAQ_ITEMS.map((item, idx) => {
                    const isOpen = openIndex === idx;

                    return (
                        <div
                            key={item.question}
                            className={`rounded-xl border transition-colors ${isOpen
                                ? 'border-[#FFE500]/40 bg-[#0F0F14]'
                                : 'border-white/10 bg-[#0D0D12] hover:border-white/20'
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => toggle(idx)}
                                aria-expanded={isOpen}
                                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-white/5 text-gray-400">
                                            {item.category}
                                        </span>
                                        {item.highlight && (
                                            <span className="text-[11px] font-bold text-[#FFE500] font-mono">
                                                {item.highlight}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-white leading-snug">
                                        {item.question}
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#FFE500]' : ''
                                        }`}
                                />
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 pt-1 text-xs text-gray-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Récapitulatif de réassurance */}
            <section className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                    <div className="font-bold text-white">Le mot de la fin pour Lucas</div>
                    <p className="text-gray-400 leading-relaxed">
                        Ce site n’est pas une boîte noire ni un thème générique. C’est un outil industriel
                        conçu sur-mesure pour durer des années, valoriser la filmographie et les coachs du
                        CUC au plus haut niveau mondial, tout en garantissant des coûts d’exploitation dérisoires
                        et une indépendance absolue.
                    </p>
                </div>
            </section>
        </div>
    );
};
