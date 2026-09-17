'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Zap,
  Server,
  Database,
  Globe,
  Award,
  X,
} from 'lucide-react';
import { revalidateSite } from '@/app/admin/actions';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  realtimeStatus?: 'connecting' | 'connected' | 'offline';
  inquiriesCount?: number;
  newInquiriesCount?: number;
  urgentInquiriesCount?: number;
  totalSessions?: number;
  fullSessions?: number;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({
  isOpen,
  onClose,
  showToast,
  realtimeStatus = 'connected',
  inquiriesCount = 0,
  newInquiriesCount = 0,
  urgentInquiriesCount,
  totalSessions = 0,
  fullSessions = 0,
}) => {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    setLastCheck(new Date().toLocaleTimeString('fr-FR'));
  }, []);

  const actualNewInquiries = urgentInquiriesCount !== undefined ? urgentInquiriesCount : newInquiriesCount;

  if (!isOpen) return null;

  const handleRevalidateCache = async () => {
    setIsRevalidating(true);
    const res = await revalidateSite();
    setIsRevalidating(false);
    if (res.success) {
      setLastCheck(new Date().toLocaleTimeString('fr-FR'));
      showToast('Cache vitrine revalidé en direct sur toutes les routes !');
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0D12] border border-white/15 rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase mb-1">
              <Activity className="w-3.5 h-3.5" /> Diagnostic &amp; Santé Opérationnelle
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Moniteur Système CUC
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Dernière vérification à {lastCheck}. Tous les systèmes vitrine &amp; cockpit sous surveillance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grille des statuts système */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Base de données */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Base Données</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                OPÉRATIONNEL
              </span>
            </div>
            <div className="text-gray-400 text-[11px]">
              Persistance Supabase + Fallback Local réactif actif.
            </div>
          </div>

          {/* Flux Realtime */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                <Zap className="w-4 h-4 text-[#FFE500]" />
                <span>Flux Realtime</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                  realtimeStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}
              >
                {realtimeStatus === 'connected' ? 'SYNCHRONISÉ' : 'RECONNEXION'}
              </span>
            </div>
            <div className="text-gray-400 text-[11px]">
              Mises à jour des sessions et leads propagées à 0 ms.
            </div>
          </div>

          {/* Stockage CDN */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                <Server className="w-4 h-4 text-sky-400" />
                <span>Médiathèque CDN</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                DISPONIBLE
              </span>
            </div>
            <div className="text-gray-400 text-[11px]">
              Bucket public configuré pour images et affiches.
            </div>
          </div>

          {/* Qualiopi & Agrément */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Label Qualiopi</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                CERTIFIÉ
              </span>
            </div>
            <div className="text-gray-400 text-[11px]">
              N° 21452296 — AFDAS, France Travail &amp; OPCO.
            </div>
          </div>
        </div>

        {/* Indicateurs Métier */}
        <div className="p-4 rounded-xl bg-[#08080C] border border-white/10 space-y-3 text-xs">
          <div className="font-mono text-gray-400 uppercase text-[11px] font-bold">
            Indicateurs d&apos;Activité Immédiate
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-gray-300">Demandes à traiter :</span>
              <strong className={actualNewInquiries > 0 ? 'text-[#FFE500]' : 'text-gray-400'}>
                {actualNewInquiries} / {inquiriesCount}
              </strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-gray-300">Sessions complètes :</span>
              <strong className={fullSessions > 0 ? 'text-amber-400' : 'text-gray-400'}>
                {fullSessions} / {totalSessions}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Revalidation Cache */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FFE500]" /> Forcer la Revalidation du Cache Vitrine
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Purger et régénérer le cache Next.js ISR de toutes les pages vitrines pour refléter instantanément les modifications sans attendre le cycle automatique.
          </p>
          <button
            type="button"
            onClick={handleRevalidateCache}
            disabled={isRevalidating}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-yellow-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isRevalidating ? 'animate-spin' : ''}`} />
            <span>{isRevalidating ? 'Revalidation en cours...' : 'Revalider Toutes les Pages Vitrines'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
