'use client';

/**
 * Schémas interactifs et animés d'architecture (Écosystème global, Mode Studio
 * et Cascade de Résilience à 4 niveaux) pour le Dossier Application du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { Eye, ShieldCheck, Workflow } from 'lucide-react';
import { RESILIENCE_CASCADE_LEVELS } from './help-application-data';

export const AppArchitectureDiagram: React.FC = () => {
    return (
        <section id="dossier-architecture" className="space-y-6">
            <style>{`
                @keyframes cucFlowDash {
                    to { stroke-dashoffset: -24; }
                }
                .cuc-flow-line {
                    stroke-dasharray: 5 7;
                    animation: cucFlowDash 1.4s linear infinite;
                }
            `}</style>

            {/* En-tête de section */}
            <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Workflow className="w-4 h-4" /> Architecture & Flux de Données en Direct
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                    Comment les 6 briques de l’application communiquent entre elles
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                    Les visiteurs reçoivent des pages pré-calculées ultra-légères (sans connexion permanente inutile),
                    tandis que le Cockpit pilote la base Supabase, synchronise Instagram Meta et prépare la passerelle CUC Sign.
                </p>
            </div>

            {/* Schéma SVG 1 : Écosystème global animé */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0A0A0F] border border-white/10 space-y-4 overflow-x-auto">
                <svg
                    viewBox="0 0 920 330"
                    className="w-full h-auto min-w-[680px]"
                    role="img"
                    aria-label="Schéma d'architecture : Visiteur, Site Vitrine en cache, Cockpit et Mode Studio, Base Supabase, API Meta Instagram et plateforme CUC Sign"
                >
                    {/* Lignes de fond */}
                    <path d="M155 110 H 230" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M155 110 H 230" fill="none" stroke="#4ade80" strokeWidth="2.2" />

                    <path d="M440 95 C 485 95, 495 140, 535 150" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M535 150 C 495 140, 485 95, 440 95" fill="none" stroke="#4ade80" strokeWidth="2.4" />

                    <path d="M440 240 C 485 240, 495 195, 535 185" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M440 240 C 485 240, 495 195, 535 185" fill="none" stroke="#FFE500" strokeWidth="2.4" />

                    <path d="M630 82 V 120" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M630 82 V 120" fill="none" stroke="#f472b6" strokeWidth="2.2" />

                    <path d="M725 155 H 780" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M725 155 H 780" fill="none" stroke="#38bdf8" strokeWidth="2.4" />
                    <path d="M780 185 H 725" fill="none" stroke="#2d2d3d" strokeWidth="2" />
                    <path className="cuc-flow-line" d="M780 185 H 725" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.65" />

                    {/* Nœud 1 : Visiteur */}
                    <rect x="20" y="68" width="135" height="84" rx="12" fill="#111119" stroke="#3a3a4c" strokeWidth="1.5" />
                    <text x="87" y="104" textAnchor="middle" fill="#ffffff" fontSize="13.5" fontWeight="700">Visiteur</text>
                    <text x="87" y="123" textAnchor="middle" fill="#9ca3af" fontSize="10.5">Web & Mobile · FR/EN</text>

                    {/* Nœud 2 : Site Vitrine (Cache) */}
                    <rect x="230" y="50" width="210" height="88" rx="12" fill="#111119" stroke="#4ade80" strokeWidth="1.6" />
                    <text x="335" y="74" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700">CACHE CDN MONDIAL</text>
                    <text x="335" y="96" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">Site Vitrine (Next.js 16)</text>
                    <text x="335" y="116" textAnchor="middle" fill="#9ca3af" fontSize="10.5">15 pages + fiches · 0 WebSocket public</text>

                    {/* Nœud 3 : Cockpit & Mode Studio */}
                    <rect x="230" y="192" width="210" height="92" rx="12" fill="#111119" stroke="#FFE500" strokeWidth="1.6" />
                    <text x="335" y="216" textAnchor="middle" fill="#FFE500" fontSize="10" fontWeight="700">PILOTAGE SANS CODE</text>
                    <text x="335" y="238" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">Cockpit & Mode Studio</text>
                    <text x="335" y="258" textAnchor="middle" fill="#9ca3af" fontSize="10.5">27 écrans · édition sur la page · 3D</text>

                    {/* Nœud 4 : API Meta Instagram */}
                    <rect x="540" y="18" width="180" height="64" rx="12" fill="#111119" stroke="#f472b6" strokeWidth="1.5" />
                    <text x="630" y="45" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700">API Meta Instagram</text>
                    <text x="630" y="64" textAnchor="middle" fill="#f472b6" fontSize="10.5">Abonnés & Reels en direct</text>

                    {/* Nœud 5 : Base Supabase */}
                    <rect x="535" y="120" width="190" height="100" rx="14" fill="#13131f" stroke="#FFE500" strokeWidth="1.8" />
                    <text x="630" y="148" textAnchor="middle" fill="#FFE500" fontSize="10" fontWeight="700">COFFRE CENTRAL</text>
                    <text x="630" y="170" textAnchor="middle" fill="#ffffff" fontSize="14.5" fontWeight="700">Supabase PostgreSQL</text>
                    <text x="630" y="190" textAnchor="middle" fill="#9ca3af" fontSize="10.5">20 tables RLS · 569 films · WebP</text>

                    {/* Nœud 6 : CUC Sign */}
                    <rect x="780" y="120" width="124" height="100" rx="12" fill="#111119" stroke="#38bdf8" strokeWidth="1.6" />
                    <text x="842" y="148" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700">ÉCOLE & TERRAIN</text>
                    <text x="842" y="170" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700">CUC Sign</text>
                    <text x="842" y="190" textAnchor="middle" fill="#9ca3af" fontSize="10.5">Même base partagée</text>

                    <text x="460" y="314" textAnchor="middle" fill="#9ca3af" fontSize="11">
                        Dès que vous cliquez sur « Enregistrer » au Cockpit, le cache français (/fr) et anglais (/en) est rafraîchi instantanément.
                    </text>
                </svg>

                {/* Légende des flux */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#FFE500]" /> Cockpit → Base : publications & Mode Studio
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Base → Vitrine : diffusion en cache ultra-rapide
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-pink-400" /> API Meta → Base : métriques & Reels Instagram
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> Passerelle CUC Sign (formations, coachs, lieux, admissions)
                    </span>
                </div>
            </div>

            {/* Schéma 2 : Fonctionnement visuel du Mode Studio + Cascade à 4 niveaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Circuit Mode Studio */}
                <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                            <Eye className="w-4 h-4" /> Circuit du Mode Studio (?cuc-preview=1)
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            442 textes cliquables
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Comment une modification visuelle sur la page traverse le Cockpit sans jamais risquer d’écrire un brouillon incomplet en base :
                    </p>
                    <div className="space-y-2.5">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-[#FFE500]/30 flex items-start gap-3">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FFE500] text-black shrink-0 mt-0.5">
                                1
                            </span>
                            <div className="text-xs space-y-0.5">
                                <div className="font-bold text-white">Clic sur la page & Typographie Miroir</div>
                                <p className="text-gray-400 leading-relaxed">
                                    Le champ de saisie prend exactement la police, la taille et la couleur du titre édité. Touche <code className="text-[#FFE500]">Tab</code> pour passer au texte suivant.
                                </p>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-sky-400/30 flex items-start gap-3">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-400 text-black shrink-0 mt-0.5">
                                2
                            </span>
                            <div className="text-xs space-y-0.5">
                                <div className="font-bold text-white">Brouillon en Mémoire Locale (Filet 7 jours)</div>
                                <p className="text-gray-400 leading-relaxed">
                                    Vos essais restent isolés dans votre navigateur (<code className="text-sky-300">Ctrl+Z / Ctrl+Y</code> et comparateur de différences). La base publique n’est jamais touchée pendant vos tests.
                                </p>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-400/30 flex items-start gap-3">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-400 text-black shrink-0 mt-0.5">
                                3
                            </span>
                            <div className="text-xs space-y-0.5">
                                <div className="font-bold text-white">Publication Atomique & Révision Restaurable</div>
                                <p className="text-gray-400 leading-relaxed">
                                    Au clic sur « Enregistrer », le serveur vérifie l’absence de conflit entre 2 onglets, crée une version dans l’historique et rafraîchit le site FR et EN.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cascade de résilience à 4 niveaux */}
                <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" /> Cascade « Zéro Page Morte »
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE500]/10 text-[#FFE500]">
                            4 filets de repli
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Si un texte est vidé ou non traduit, l’application descend automatiquement cette cascade de 4 niveaux pour ne jamais afficher un bouton vide :
                    </p>
                    <div className="space-y-2">
                        {RESILIENCE_CASCADE_LEVELS.map((step) => (
                            <div
                                key={step.level}
                                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
                            >
                                <span
                                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 text-black"
                                    style={{ backgroundColor: step.accentColor }}
                                >
                                    {step.level}
                                </span>
                                <div className="text-xs space-y-0.5">
                                    <div className="font-bold text-white flex flex-wrap items-center gap-2">
                                        <span>{step.title}</span>
                                        <span className="text-[10px] font-mono text-gray-400">({step.source})</span>
                                    </div>
                                    <p className="text-gray-400 text-[11px] leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
