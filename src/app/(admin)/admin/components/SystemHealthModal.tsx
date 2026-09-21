'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Zap,
  Server,
  Database,
  Globe,
  Award,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  revalidateSite,
  getSystemHealth,
  type SystemHealthReport,
  type HealthState,
} from '@/app/(admin)/admin/actions';

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

const STATE_STYLES: Record<HealthState, { badge: string; icon: React.ReactNode; label: string }> = {
  ok: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'OPÉRATIONNEL',
  },
  degraded: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    label: 'DÉGRADÉ',
  },
  down: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: 'INDISPONIBLE',
  },
};

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
  const [isProbing, setIsProbing] = useState(false);
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  const actualNewInquiries =
    urgentInquiriesCount !== undefined ? urgentInquiriesCount : newInquiriesCount;

  const runProbe = useCallback(
    async (notify = false) => {
      setIsProbing(true);
      setProbeError(null);
      try {
        const result = await getSystemHealth();
        setReport(result);
        if (notify) {
          showToast(
            result.overall === 'ok'
              ? 'Sonde système exécutée : tous les services répondent.'
              : `Sonde système exécutée : état ${result.overall}.`
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setProbeError(message);
        if (notify) showToast(`Erreur de sonde : ${message}`);
      } finally {
        setIsProbing(false);
      }
    },
    [showToast]
  );

  // Sonde automatique à l'ouverture.
  // `runProbe` appelle `setIsProbing(true)` de façon synchrone : on diffère donc
  // l'appel hors du corps de l'effet pour éviter les rendus en cascade
  // (règle react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      void runProbe(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, runProbe]);

  if (!isOpen) return null;

  const handleRevalidateCache = async () => {
    setIsRevalidating(true);
    const res = await revalidateSite();
    setIsRevalidating(false);
    if (res.success) {
      showToast('Cache vitrine revalidé en direct sur toutes les routes !');
      void runProbe(false);
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  const overallState: HealthState = probeError ? 'down' : (report?.overall ?? 'degraded');
  const overallStyle = STATE_STYLES[overallState];
  const measuredLabel = report
    ? new Date(report.measuredAt).toLocaleTimeString('fr-FR')
    : 'Mesure en cours…';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0D12] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase mb-1">
              <Activity className="w-3.5 h-3.5" /> Diagnostic & Santé Opérationnelle
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Moniteur Système CUC
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Mesure réelle effectuée à {measuredLabel}
              {report?.latencyMs !== null && report?.latencyMs !== undefined
                ? ` — latence Supabase ${report.latencyMs} ms`
                : ''}
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void runProbe(true)}
              disabled={isProbing}
              title="Relancer la sonde"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* État global */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 font-mono text-gray-300 text-xs">
            <Database className="w-4 h-4 text-[#FFE500]" />
            <span>État global du système</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${overallStyle.badge}`}
          >
            {overallStyle.icon}
            {overallStyle.label}
          </span>
        </div>

        {probeError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
            Sonde en échec : {probeError}
          </div>
        )}

        {/* Métriques réelles */}
        <div className="space-y-2">
          <div className="font-mono text-gray-400 uppercase text-[11px] font-bold">
            Mesures réelles
          </div>
          {report ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {report.metrics.map((metric) => {
                const style = STATE_STYLES[metric.state];
                return (
                  <div
                    key={metric.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono text-gray-300 truncate">
                        <Server className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="truncate">{metric.label}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border shrink-0 ${style.badge}`}
                      >
                        {metric.value}
                      </span>
                    </div>
                    <div className="text-gray-400 text-[11px]">{metric.detail}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
              {isProbing ? 'Sonde en cours…' : 'Aucune mesure disponible.'}
            </div>
          )}
        </div>

        {/* Flux Realtime */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-gray-300">
              <Zap className="w-4 h-4 text-[#FFE500]" />
              <span>Flux Realtime</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${realtimeStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : realtimeStatus === 'connecting'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
            >
              {realtimeStatus === 'connected'
                ? 'SYNCHRONISÉ'
                : realtimeStatus === 'connecting'
                  ? 'CONNEXION'
                  : 'HORS LIGNE'}
            </span>
          </div>
          <div className="text-gray-400 text-[11px]">
            Canal Supabase Realtime du Cockpit (sessions, leads, contenus).
          </div>
        </div>

        {/* Label Qualiopi */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs">
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
            N° 21452296 — AFDAS, France Travail & OPCO.
          </div>
        </div>

        {/* Indicateurs Métier */}
        <div className="p-4 rounded-xl bg-[#08080C] border border-white/10 space-y-3 text-xs">
          <div className="font-mono text-gray-400 uppercase text-[11px] font-bold">
            Indicateurs d'Activité Immédiate
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
            Purger et régénérer le cache Next.js ISR de toutes les pages vitrines pour refléter
            instantanément les modifications sans attendre le cycle automatique.
          </p>
          <button
            type="button"
            onClick={handleRevalidateCache}
            disabled={isRevalidating}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-yellow-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isRevalidating ? 'animate-spin' : ''}`} />
            <span>
              {isRevalidating ? 'Revalidation en cours...' : 'Revalider Toutes les Pages Vitrines'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
