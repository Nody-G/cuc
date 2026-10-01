'use client';

/**
 * Section « Autopsie des Failles & Risques de l'Ancien Site » pour Lucas.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { OLD_SITE_VULNERABILITIES } from './help-application-data';

export const AppVulnerabilitiesSection: React.FC = () => {
    return (
        <section className="space-y-4 pt-2">
            <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-red-400" /> Sécurité & Diagnostic Historique
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                    Autopsie de l’Ancien Site : Les 6 Failles Critiques et Risques qui Menaçaient le CUC
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                    Pourquoi rester sur WordPress était devenu un danger immédiat pour la réputation,
                    la sécurité juridique et le chiffre d’affaires de l’école.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OLD_SITE_VULNERABILITIES.map((vuln) => (
                    <div
                        key={vuln.title}
                        className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3 hover:border-red-500/30 transition-colors"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white leading-snug">
                                {vuln.title}
                            </span>
                            <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${vuln.riskLevel === 'Critique'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}
                            >
                                Risque {vuln.riskLevel}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-gray-300">
                                <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                                    <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                    <span>Ce qui risquait d’arriver :</span>
                                </div>
                                <p className="leading-relaxed">{vuln.concreteRisk}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-gray-300">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>Ce que le nouveau site garantit :</span>
                                </div>
                                <p className="leading-relaxed">{vuln.newResolution}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
