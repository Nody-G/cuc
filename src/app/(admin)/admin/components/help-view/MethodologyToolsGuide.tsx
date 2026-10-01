'use client';

/**
 * Guide pédagogique des outils pour Lucas (avec analogies du cinéma et de la cascade).
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { Clapperboard, Compass } from 'lucide-react';
import { TOOL_CINEMA_ANALOGIES } from './help-methodology-data';

export const MethodologyToolsGuide: React.FC = () => {
    return (
        <section className="space-y-4 pt-2">
            <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Clapperboard className="w-4 h-4 text-[#FFE500]" /> Comprendre les Outils Sans Jargon Technique
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                    À Quoi Servent Réellement les Outils Utilisés par Niels (Vu des Coulisses)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                    Lucas n’étant pas développeur, voici les analogies concrètes issues du cinéma
                    et de la cascade pour visualiser instantanément le rôle de chaque application.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TOOL_CINEMA_ANALOGIES.map((tool) => (
                    <div
                        key={tool.name}
                        className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3 hover:border-[#FFE500]/30 transition-colors"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <span className="text-sm font-bold text-white block">
                                    {tool.name}
                                </span>
                                <span className="text-xs font-mono text-[#FFE500] flex items-center gap-1.5 mt-0.5">
                                    <Clapperboard className="w-3.5 h-3.5 shrink-0" />
                                    <span>{tool.cinemaAnalogy}</span>
                                </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300 shrink-0">
                                {tool.category}
                            </span>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                            {tool.plainExplanation}
                        </p>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 leading-relaxed">
                            <span className="font-bold text-[#FFE500] block mb-0.5 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1">
                                <Compass className="w-3 h-3 text-[#FFE500]" />
                                Comment Niels s’en sert :
                            </span>
                            <span>{tool.concreteUsage}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
