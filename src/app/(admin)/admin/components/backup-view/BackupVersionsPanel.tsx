'use client';

/**
 * Panneau « Versions & restauration » — présentation pure (`AGENTS.md` § 1).
 *
 * Affiche l'état **réel** du dispositif : configuration (variable manquante
 * nommée), âge et statut du dernier instantané, catalogue des versions, constats
 * de santé. Aucun appel réseau : tout passe par `useBackupVersions`.
 */

import React from 'react';
import { AlertTriangle, Clock, History, RefreshCw, ShieldCheck } from 'lucide-react';
import {
    formatAgeHours,
    formatBytes,
    formatDateTime,
    isStale,
    severityLabel,
    severityRank,
    severityToneClasses,
    statusLabel,
} from './backup-format';
import { RestoreConfirmDialog } from './RestoreConfirmDialog';
import { useBackupVersions } from './useBackupVersions';

export const BackupVersionsPanel: React.FC = () => {
    const {
        status,
        isLoading,
        statusError,
        reload,
        plan,
        planError,
        isSimulating,
        simulate,
        clearPlan,
        isRestoring,
        submit,
    } = useBackupVersions();

    // Le constat « config-incomplete » est rendu par l'encart dédié ci-dessous :
    // le réafficher en rouge ferait passer un choix assumé pour une panne.
    const findings = status === null
        ? []
        : [...status.findings]
            .filter((finding) => finding.code !== 'config-incomplete')
            .sort((left, right) => severityRank(right.severity) - severityRank(left.severity));

    return (
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="text-xs font-mono text-white font-bold uppercase flex items-center gap-2">
                    <History className="w-4 h-4 text-[#FFE500]" /> Versions & Restauration
                </div>
                <button
                    type="button"
                    onClick={() => void reload()}
                    className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} /> Rafraîchir
                </button>
            </div>

            {statusError !== null && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{statusError}</span>
                </div>
            )}

            {isLoading && <p className="text-xs text-gray-400">Lecture du catalogue de sauvegardes…</p>}

            {status !== null && status.config.kind === 'incomplete' && (
                <div className="p-3 bg-sky-950/30 border border-sky-500/40 rounded-xl text-sky-200 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-2"><History className="w-4 h-4" /> Sauvegardes versionnées désactivées par choix</div>
                    <p className="text-[11px]">
                        Aucune sauvegarde automatique n’est active : ce n’est pas une panne. Le geste de
                        sauvegarde est l’export/import JSON du tableau de bord (fichier téléchargé à la demande).
                    </p>
                    <p className="text-[11px] text-sky-300/80">
                        Si le dispositif doit être activé plus tard, il attend encore :
                        {' '}{status.config.missingVariables.join(', ')}.
                    </p>
                    <p className="text-[11px] text-sky-300/80">Aucune version n’est listée tant que le moteur n’est pas activé.</p>
                </div>
            )}

            {status !== null && status.config.kind === 'ready' && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] font-mono text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Dépôt : {status.config.storageKind}</span>
                    <span>Préfixe : {status.config.prefix}</span>
                    <span>Rétention : {status.config.retention.daily}/{status.config.retention.weekly}/{status.config.retention.monthly}</span>
                    <span>{status.versions.length} version(s) au catalogue</span>
                </div>
            )}

            {status !== null && status.lastSnapshot !== null && (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${isStale(status.lastSnapshot.ageHours) ? 'bg-red-950/30 border-red-500/40 text-red-200' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'}`}>
                    <div className="font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Dernier instantané : {formatAgeHours(status.lastSnapshot.ageHours)}
                    </div>
                    <div className="text-[11px] font-mono">
                        {status.lastSnapshot.id ?? '—'} · {formatDateTime(status.lastSnapshot.createdAt)} · {status.lastSnapshot.rows === null ? '—' : `${status.lastSnapshot.rows} ligne(s)`} · {formatBytes(status.lastSnapshot.bytes)}
                    </div>
                    {status.lastSnapshot.status !== null && status.lastSnapshot.status !== 'complete' && (
                        <div className="text-[11px] font-mono">Statut : {statusLabel(status.lastSnapshot.status)}</div>
                    )}
                </div>
            )}

            {status !== null && status.lastSnapshot === null && status.config.kind === 'ready' && (
                <p className="text-xs text-gray-400">Aucun instantané connu — le dispositif n’a encore rien produit.</p>
            )}

            {status !== null && status.versions.length > 0 && (
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-[1.6fr_0.6fr_1fr_0.6fr_0.7fr_1.1fr] gap-2 px-3 py-2 text-[10px] font-mono text-gray-400 uppercase border-b border-white/10">
                        <span>Date</span><span>Tier</span><span>Statut</span><span>Lignes</span><span>Taille</span><span>Action</span>
                    </div>
                    <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                        {status.versions.map((version) => (
                            <div key={version.id} className="grid grid-cols-[1.6fr_0.6fr_1fr_0.6fr_0.7fr_1.1fr] gap-2 px-3 py-2 text-[11px] font-mono items-center">
                                <span className="text-white truncate">{formatDateTime(version.createdAt)}</span>
                                <span className="text-gray-400">{version.tier}</span>
                                <span className={version.status === 'complete' ? 'text-emerald-300' : version.status === 'degraded' ? 'text-amber-300' : 'text-red-300'}>
                                    {statusLabel(version.status)}
                                    {version.missingTables.length > 0 && <span className="block text-[10px] text-amber-400/80">manque : {version.missingTables.join(', ')}</span>}
                                </span>
                                <span className="text-gray-400">{version.rows === null ? '—' : version.rows}</span>
                                <span className="text-gray-400">{formatBytes(version.bytes)}</span>
                                <span>
                                    <button
                                        type="button"
                                        disabled={version.status === 'incomplete' || isSimulating}
                                        onClick={() => void simulate(version.id)}
                                        className="px-2 py-1 rounded-lg bg-[#FFE500]/10 hover:bg-[#FFE500]/20 text-[#FFE500] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Simuler
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {findings.length > 0 && (
                <div className="space-y-1.5">
                    {findings.map((finding) => (
                        <div key={finding.code} className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 ${severityToneClasses(finding.severity)}`}>
                            <span className="font-mono uppercase shrink-0">{severityLabel(finding.severity)}</span>
                            <span>{finding.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {planError !== null && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Simulation refusée — {planError}</span>
                </div>
            )}

            <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> La simulation est en lecture seule. Une restauration réelle exige un rôle admin/directeur, votre mot de passe et la phrase exacte.
            </p>

            {plan !== null && (
                <RestoreConfirmDialog
                    plan={plan}
                    submitting={isRestoring}
                    onCancel={clearPlan}
                    onConfirm={submit}
                />
            )}
        </div>
    );
};
