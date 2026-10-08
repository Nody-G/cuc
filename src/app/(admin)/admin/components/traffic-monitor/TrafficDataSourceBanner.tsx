'use client';

import React from 'react';
import { Activity, Sparkles, ShieldCheck, Info } from 'lucide-react';

interface TrafficDataSourceBannerProps {
    sourceMode: 'measured' | 'modelled';
    onChangeSourceMode: (mode: 'measured' | 'modelled') => void;
}

/**
 * Sélecteur transparent de la source de données :
 * Distingue formellement les « Mesures Réelles Observées » (sessions réelles sur Vercel)
 * des « Projections & Historique Campus » (modèle calibré à ~114k visites).
 */
export const TrafficDataSourceBanner: React.FC<TrafficDataSourceBannerProps> = ({
    sourceMode,
    onChangeSourceMode,
}) => {
    const isMeasured = sourceMode === 'measured';

    return (
        <div className="rounded-2xl border border-white/10 bg-[#0b0b10] p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Information et statut */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {isMeasured ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Mesures Réelles du Site
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/20">
                                <Sparkles className="w-3 h-3 text-[#FFE500]" />
                                Modèle Annuel de Référence CUC
                            </span>
                        )}
                        <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
                        <span className="text-xs text-zinc-400 hidden sm:inline">
                            {isMeasured
                                ? 'Télémétrie en direct sur cette instance Vercel'
                                : 'Simulation basée sur la fréquentation cible du Campus'}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                        {isMeasured ? (
                            <span>
                                Comptabilise <strong>uniquement</strong> les vraies consultations enregistrées sur cette URL. Les chiffres reflètent l&apos;activité réelle sans extrapolation.
                            </span>
                        ) : (
                            <span>
                                Ordres de grandeur représentatifs d&apos;une pleine saison (~114k visites mensuelles) pour visualiser la répartition type des canaux et tunnels.
                            </span>
                        )}
                    </p>
                </div>

                {/* Commutateur interactif */}
                <div className="flex items-center self-start md:self-auto bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        type="button"
                        onClick={() => onChangeSourceMode('measured')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${isMeasured
                            ? 'bg-emerald-500 text-black font-bold shadow-md'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Mesures Réelles
                    </button>
                    <button
                        type="button"
                        onClick={() => onChangeSourceMode('modelled')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${!isMeasured
                            ? 'bg-[#FFE500] text-black font-bold shadow-md'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Projection CUC
                    </button>
                </div>
            </div>

            {/* Note explicative sur le nom de domaine et la bascule DNS */}
            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                    <span>
                        <strong>Pourquoi le trafic grand public n&apos;est pas encore massif ?</strong> L&apos;ancien site est toujours en ligne sur{' '}
                        <code className="text-zinc-300 bg-white/5 px-1 py-0.5 rounded">campus-universcascades.com</code>. Dès que la redirection DNS pointera ici, les milliers de visiteurs quotidiens alimenteront ces métriques réelles.
                    </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-emerald-400/90 font-mono text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero cookie tiers · RGPD 2026
                </div>
            </div>
        </div>
    );
};
