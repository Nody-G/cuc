'use client';

/**
 * Volet « CUC Sign & Vision d'Avenir » du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import {
    ArrowRight,
    PenTool,
    Shield,
    Smartphone,
    Users,
    Workflow,
    Zap,
} from 'lucide-react';
import {
    CUC_SIGN_CHALLENGES,
    CUC_SIGN_FEATURES,
    VITRINE_TO_SIGN_BRIDGE,
} from './help-cuc-sign-data';

export const HelpCucSignTab: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in duration-200">
            {/* En-tête CUC Sign */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Workflow className="w-4 h-4" /> La Seconde Jambe de l’Écosystème
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    CUC Sign : La Plateforme École & Terrain du Campus
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
                    Le site vitrine attire, qualifie et reçoit les candidatures. CUC Sign prend le relais
                    immédiatement pour orchestrer la vie réelle de l’école : émargements sur smartphone,
                    suivi des modules techniques, espace coachs et attestations officielles.
                </p>
            </section>

            {/* Les 4 Piliers CUC Sign */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Ce que CUC Sign apporte au quotidien
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {CUC_SIGN_FEATURES.map((feat) => {
                        const IconComponent =
                            feat.icon === 'pen'
                                ? PenTool
                                : feat.icon === 'users'
                                    ? Users
                                    : feat.icon === 'smartphone'
                                        ? Smartphone
                                        : Shield;

                        return (
                            <div
                                key={feat.title}
                                className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2 hover:border-[#FFE500]/30 transition-colors"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500]">
                                    <IconComponent className="w-4 h-4 shrink-0" />
                                    <span>{feat.title}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{feat.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Passerelle vitrine ↔ CUC Sign */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-[#FFE500]" /> Base de données unifiée
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                        Le parcours fluide du candidat jusqu’à la certification
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {VITRINE_TO_SIGN_BRIDGE.map((step, idx) => (
                        <div
                            key={step.step}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 relative"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFE500] text-black">
                                    Étape {step.step}
                                </span>
                                {idx < VITRINE_TO_SIGN_BRIDGE.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 hidden lg:block" />
                                )}
                            </div>
                            <div className="text-xs font-bold text-white">{step.title}</div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Défis stratégiques relevés */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Défis techniques & organisationnels maîtrisés
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {CUC_SIGN_CHALLENGES.map((ch) => (
                        <div
                            key={ch.title}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{ch.title}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#FFE500]">
                                    {ch.category}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{ch.solution}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
