'use client';

/**
 * Panneau de rétention du journal.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) — les décisions de purge vivent
 * dans `useLogHubRetention` et dans `src/lib/logging/retention.ts`.
 *
 * Deux exigences du §3 de `durability_health.md` se voient ici :
 *  - la croissance est **mesurée** (comptes par niveau, plus ancienne entrée) ;
 *  - la purge est **expliquée avant d'être appliquée** : la simulation affiche
 *    exactement ce qui partirait, et l'application demande confirmation. Effacer
 *    un journal est irréversible, or c'est lui qui permet de comprendre un
 *    incident passé.
 */

import React from 'react';
import { Clock, Eraser, Play, ShieldCheck } from 'lucide-react';
import { formatFullDate } from '@/lib/format/date';
import { LOG_LEVEL_LABELS } from '@/lib/logging/types';
import { CockpitButton, CockpitCard, CockpitSkeleton } from '../ui';
import type { UseLogHubRetentionResult } from './useLogHubRetention';

export const LogHubRetentionPanel: React.FC<UseLogHubRetentionResult> = ({
    retention,
    loading,
    simulating,
    applying,
    simulation,
    lastApplied,
    error,
    simulate,
    apply,
}) => {
    if (loading || !retention) {
        return (
            <CockpitCard padding="sm">
                <CockpitSkeleton className="h-40 w-full" />
            </CockpitCard>
        );
    }

    const { policy, byLevel, oldestAt } = retention;
    const purgeableTotal = byLevel.reduce((sum, row) => sum + row.purgeable, 0);
    const retainedTotal = byLevel.reduce((sum, row) => sum + row.total, 0);

    const durationFor = (level: string) =>
        level === 'critical' ? policy.criticalDays : level === 'info' ? policy.infoDays : policy.signalDays;

    return (
        <div className="space-y-4">
            <CockpitCard padding="sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                            Politique en vigueur
                        </p>
                        <ul className="text-xs text-gray-300 space-y-1">
                            <li>
                                Information (« {LOG_LEVEL_LABELS.info} ») — {policy.infoDays} jours
                            </li>
                            <li>
                                Signaux (« {LOG_LEVEL_LABELS.warning} », « {LOG_LEVEL_LABELS.error} ») —{' '}
                                {policy.signalDays} jours
                            </li>
                            <li>
                                Incidents critiques — {policy.criticalDays} jours
                            </li>
                            <li>
                                Plafond de volume — {policy.maxRows.toLocaleString('fr-FR')} lignes
                            </li>
                        </ul>
                        <p className="text-[11px] text-gray-500 inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            Plus ancien événement conservé :{' '}
                            {oldestAt ? formatFullDate(oldestAt) : 'aucun'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={Play}
                            loading={simulating}
                            onClick={() => void simulate()}
                        >
                            Simuler la purge
                        </CockpitButton>
                        <CockpitButton
                            variant="danger"
                            size="sm"
                            icon={Eraser}
                            loading={applying}
                            disabled={purgeableTotal === 0}
                            onClick={() => {
                                if (
                                    window.confirm(
                                        `Effacer définitivement ${purgeableTotal} événement(s) au-delà des durées de conservation ?\n\nCette action est irréversible.`,
                                    )
                                ) {
                                    void apply();
                                }
                            }}
                        >
                            Appliquer la purge
                        </CockpitButton>
                    </div>
                </div>
            </CockpitCard>

            <CockpitCard padding="none">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray-500 border-b border-white/10">
                            <th className="px-4 py-2.5">Gravité</th>
                            <th className="px-4 py-2.5">Conservation</th>
                            <th className="px-4 py-2.5 text-right">Conservés</th>
                            <th className="px-4 py-2.5 text-right">Purgeables</th>
                        </tr>
                    </thead>
                    <tbody>
                        {byLevel.map((row) => (
                            <tr key={row.level} className="border-b border-white/5 last:border-b-0">
                                <td className="px-4 py-2.5 text-gray-200">{LOG_LEVEL_LABELS[row.level]}</td>
                                <td className="px-4 py-2.5 text-gray-500">{durationFor(row.level)} jours</td>
                                <td className="px-4 py-2.5 text-right text-gray-300">{row.total}</td>
                                <td
                                    className={
                                        row.purgeable > 0
                                            ? 'px-4 py-2.5 text-right text-amber-300'
                                            : 'px-4 py-2.5 text-right text-gray-600'
                                    }
                                >
                                    {row.purgeable}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CockpitCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CockpitCard padding="sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                        Dernière simulation
                    </p>
                    {simulation ? (
                        <ul className="text-xs text-gray-300 space-y-1">
                            {simulation.deleted.map((row) => (
                                <li key={row.level}>
                                    {LOG_LEVEL_LABELS[row.level]} : {row.count} à effacer
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-gray-500">
                            Lancez une simulation pour mesurer ce qui partirait, sans rien effacer.
                        </p>
                    )}
                </CockpitCard>

                <CockpitCard padding="sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                        Dernière purge appliquée
                    </p>
                    {lastApplied ? (
                        <ul className="text-xs text-gray-300 space-y-1">
                            {lastApplied.deleted.map((row) => (
                                <li key={row.level}>
                                    {LOG_LEVEL_LABELS[row.level]} : {row.count} effacé(s)
                                </li>
                            ))}
                            <li className="text-gray-500">
                                Total conservé : {retainedTotal} événement(s)
                            </li>
                        </ul>
                    ) : (
                        <p className="text-[11px] text-gray-500">
                            Aucune purge appliquée depuis l’ouverture de cette page.
                        </p>
                    )}
                </CockpitCard>
            </div>

            {error && (
                <CockpitCard padding="sm">
                    <p className="text-xs text-red-300 inline-flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        {error}
                    </p>
                </CockpitCard>
            )}
        </div>
    );
};
