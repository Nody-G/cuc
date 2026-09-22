'use client';

import React from 'react';
import { Database } from 'lucide-react';
import { useSystemHealthProbe } from './system-health/useSystemHealthProbe';
import { STATE_STYLES, type RealtimeStatus } from './system-health/health-state';
import { SystemHealthHeader } from './system-health/SystemHealthHeader';
import { SystemHealthMetricCard } from './system-health/SystemHealthMetricCard';
import {
  ActivityIndicatorsCard,
  QualiopiCard,
  RealtimeStatusCard,
} from './system-health/SystemHealthStatusCards';
import { CacheRevalidationCard } from './system-health/CacheRevalidationCard';

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  realtimeStatus?: RealtimeStatus;
  inquiriesCount?: number;
  newInquiriesCount?: number;
  urgentInquiriesCount?: number;
  totalSessions?: number;
  fullSessions?: number;
}

/**
 * Moniteur système du Cockpit : mesures réelles de la sonde, état global,
 * flux Realtime, label Qualiopi, indicateurs métier et revalidation du cache.
 * La logique vit dans `useSystemHealthProbe` ; les sous-vues sont déclaratives.
 */
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
  const {
    isProbing,
    isRevalidating,
    report,
    probeError,
    overallState,
    measuredLabel,
    runProbe,
    handleRevalidateCache,
  } = useSystemHealthProbe({ isOpen, showToast });

  if (!isOpen) return null;

  const actualNewInquiries =
    urgentInquiriesCount !== undefined ? urgentInquiriesCount : newInquiriesCount;
  const overallStyle = STATE_STYLES[overallState];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0D12] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <SystemHealthHeader
          measuredLabel={measuredLabel}
          latencyMs={report?.latencyMs}
          isProbing={isProbing}
          onProbe={() => void runProbe(true)}
          onClose={onClose}
        />

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
              {report.metrics.map((metric) => (
                <SystemHealthMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
              {isProbing ? 'Sonde en cours…' : 'Aucune mesure disponible.'}
            </div>
          )}
        </div>

        <RealtimeStatusCard status={realtimeStatus} />
        <QualiopiCard />
        <ActivityIndicatorsCard
          actualNewInquiries={actualNewInquiries}
          inquiriesCount={inquiriesCount}
          fullSessions={fullSessions}
          totalSessions={totalSessions}
        />
        <CacheRevalidationCard
          isRevalidating={isRevalidating}
          onRevalidate={() => void handleRevalidateCache()}
        />
      </div>
    </div>
  );
};
