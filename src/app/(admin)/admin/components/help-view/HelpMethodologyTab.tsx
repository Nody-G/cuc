'use client';

/**
 * Volet « Méthodologie & Vibe Coding » du Cockpit.
 *
 * Démonstration pédagogique et visuelle pour Lucas du workflow de Niels :
 * réflexion pré-prompt, duo Gemini 3.8 Flash / DeepSeek v4.1 Flash,
 * estimation des coûts en tokens, protocole zéro casse et 3 cas réels.
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import {
    AlertCircle,
    ArrowRight,
    Brain,
    CheckCircle2,
    Coins,
    Cpu,
    Lightbulb,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import {
    CONCRETE_CASE_STUDIES,
    FLASH_MODELS,
    PRE_PROMPT_THOUGHTS,
    SAFETY_PROTOCOL_STEPS,
    TOKEN_COST_ESTIMATION,
} from './help-methodology-data';
import { MethodologyToolsGuide } from './MethodologyToolsGuide';

export const HelpMethodologyTab: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in duration-200">
            {/* En-tête : Définition du Vibe Coding */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-[#FFE500]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Les Coulisses du Projet
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Le « Vibe Coding » selon Niels : Intuition Créative & Rigueur Industrielle
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
                    Le Vibe Coding tel que Niels le pratique pour le CUC n’a rien à voir avec du bricolage de code jetable.
                    C’est la capacité de concevoir et piloter à haute vitesse un orchestre d’agents d’intelligence artificielle,
                    tout en imposant un niveau de rigueur digne d’un logiciel d’infrastructure (807 tests, zéro dette technique,
                    fichiers sous 300 lignes et traçabilité Git absolue).
                </p>
            </section>

            {/* Ce à quoi Niels pense AVANT de donner une instruction */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Brain className="w-4 h-4" /> La Matrice de Réflexion Pré-Prompt
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                        Ce à quoi Niels pense avant de donner une seule consigne à l’IA
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        L’IA sans cerveau humain produit du désordre. Voici les 4 étapes mentales systématiques :
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {PRE_PROMPT_THOUGHTS.map((thought) => (
                        <div
                            key={thought.category}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="text-xs font-bold text-[#FFE500] font-mono uppercase tracking-wider">
                                {thought.category}
                            </div>
                            <div className="text-sm font-bold text-white leading-snug">
                                {thought.question}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{thought.explanation}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Le Duo d'IA : Gemini 3.8 Flash & DeepSeek v4.1 Flash */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Cpu className="w-4 h-4" /> L’Arsenal des Modèles Flash
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                        Gemini 3.8 Flash & DeepSeek v4.1 Flash : Deux Rôles Très Précis
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FLASH_MODELS.map((model) => (
                        <div
                            key={model.name}
                            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#FFE500]">{model.name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                                    {model.provider}
                                </span>
                            </div>
                            <div className="text-xs font-bold text-white">{model.speciality}</div>
                            <p className="text-xs text-gray-400 leading-relaxed">{model.whyUsed}</p>
                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 shrink-0" />
                                <span>{model.stats}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Guide des outils avec analogies cinéma pour Lucas */}
            <MethodologyToolsGuide />

            {/* Estimation des Coûts Tokens & Euros : Comparatif Choc pour Lucas */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-5">
                <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                            <Coins className="w-4 h-4" /> Transparence Financière Totale
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                            Coût réel en tokens IA vs Facturation d’une agence web classique
                        </h3>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-xs text-gray-400 font-mono">Coût estimé des tokens IA :</div>
                        <div className="text-xl font-black text-emerald-400 font-mono">
                            {TOKEN_COST_ESTIMATION.estimatedCostEuros}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                            Tokens d’entrée (Lecture)
                        </span>
                        <div className="text-sm font-bold text-white font-mono">
                            {TOKEN_COST_ESTIMATION.tokensInput}
                        </div>
                        <p className="text-[10px] text-gray-500">Scan complet du projet & règles</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                            Tokens de sortie (Code généré)
                        </span>
                        <div className="text-sm font-bold text-white font-mono">
                            {TOKEN_COST_ESTIMATION.tokensOutput}
                        </div>
                        <p className="text-[10px] text-gray-500">TypeScript strict & 807 tests</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                            Volume de fichiers audités
                        </span>
                        <div className="text-sm font-bold text-white font-mono">
                            {TOKEN_COST_ESTIMATION.contextRead}
                        </div>
                        <p className="text-[10px] text-gray-500">Zéro composant orphelin</p>
                    </div>
                </div>

                {/* Tableau comparatif */}
                <div className="space-y-2 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold">
                        Le comparatif direct pour Lucas :
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {TOKEN_COST_ESTIMATION.comparisons.map((c) => (
                            <div
                                key={c.metric}
                                className="p-3.5 rounded-xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs"
                            >
                                <div className="font-bold text-white md:col-span-1">{c.metric}</div>
                                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{c.agencyTraditional}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span>{c.nielsVibeCoding}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protocole Zéro Casse en 4 Étapes */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" /> Filet de Sécurité
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                        Comment Niels s’assure que tout se passe bien SANS RIEN DÉTRUIRE
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {SAFETY_PROTOCOL_STEPS.map((step, idx) => (
                        <div
                            key={step.step}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2 relative"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFE500] text-black">
                                    Étape {step.step}
                                </span>
                                {idx < SAFETY_PROTOCOL_STEPS.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-600 hidden lg:block" />
                                )}
                            </div>
                            <div className="text-xs font-bold text-white">{step.name}</div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{step.action}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3 Études de Cas Concrètes */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4" /> Exemples Concrets du Terrain
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                        Trois cas concrets vécus et résolus sur le projet CUC
                    </h3>
                </div>
                <div className="space-y-3.5">
                    {CONCRETE_CASE_STUDIES.map((study) => (
                        <div
                            key={study.title}
                            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{study.title}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-[#FFE500]">
                                    {study.badge}
                                </span>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-gray-300">
                                    <span className="font-bold text-red-400 block mb-0.5">Le Défi :</span>
                                    {study.problem}
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-300">
                                    <span className="font-bold text-[#FFE500] block mb-0.5">La Solution conçue par Niels :</span>
                                    {study.solution}
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-gray-300">
                                    <span className="font-bold text-emerald-400 block mb-0.5">Le Résultat pour le CUC :</span>
                                    {study.result}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
