'use client';

import React from 'react';
import { History, TriangleAlert } from 'lucide-react';
import type { ApplicantHistory } from '@/lib/inquiries/applicant-history';

export interface PreviousDossierView {
    id: string;
    created_at: string;
    /** Nature de la demande telle qu'enregistrée (`program_title` sinon `program_id`). */
    label: string;
    /** Libellé de l'étape courante du dossier antérieur. */
    stageLabel: string;
}

export interface InquiryApplicantHistorySectionProps {
    history: ApplicantHistory;
    /** Dossiers antérieurs de la même personne, du plus récent au plus ancien. */
    previous: readonly PreviousDossierView[];
}

const DATE = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : DATE.format(date);
}

/** Stage d'entrée (« reçue ») : le dossier n'a pas encore de décision. */
const ENTRY_STAGE = 'recue';

/**
 * Mémoire d'une **personne** qui re-postule.
 *
 * Un dossier antérieur clos ne disparaît pas de l'écran : l'équipe voit combien
 * de fois la personne a candidaté, ce qui a été décidé, et — le cas échéant —
 * qu'une session Découverte a déjà eu lieu sans déboucher sur le cursus long.
 * Ces informations servent la décision, jamais de sanction automatique.
 */
export const InquiryApplicantHistorySection: React.FC<
    InquiryApplicantHistorySectionProps
> = ({ history, previous }) => {
    const hasPast = previous.length > 0 || history.decisions.length > 0;
    if (!hasPast && !history.discoveryNotRetained) return null;

    const lastDecision = history.decisions[0] ?? null;

    return (
        <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase">
                <History className="w-3.5 h-3.5 text-[#FFE500]" />
                Candidatures antérieures
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                    {history.applications} au total
                </span>
            </div>

            {previous.length > 0 && (
                <ul className="space-y-1.5">
                    {previous.map((dossier) => (
                        <li
                            key={dossier.id}
                            className="flex flex-wrap items-center gap-x-2 gap-y-0.5 p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px]"
                        >
                            <span className="font-mono text-gray-400">
                                {formatDate(dossier.created_at)}
                            </span>
                            <span className="text-gray-200 font-medium truncate">
                                {dossier.label}
                            </span>
                            <span className="text-gray-400">→ {dossier.stageLabel}</span>
                            {dossier.stageLabel.toLowerCase().includes('reçu') &&
                                dossier.stageLabel !== ENTRY_STAGE && (
                                    <span className="text-gray-500">(en cours)</span>
                                )}
                        </li>
                    ))}
                </ul>
            )}

            {lastDecision && (
                <p className="text-[11px] text-gray-400">
                    Dernière décision :{' '}
                    <span
                        className={
                            lastDecision.negative ? 'text-red-300' : 'text-emerald-300'
                        }
                    >
                        {lastDecision.label}
                    </span>{' '}
                    le {formatDate(lastDecision.at)}
                </p>
            )}

            {history.discoveryNotRetained && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/30 text-[11px] text-amber-200">
                    <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                        Cette personne a déjà suivi une session Découverte sans être retenue pour
                        le cursus long. L'information est conservée : elle reste disponible si
                        elle candidate à nouveau.
                    </span>
                </div>
            )}

            {history.longProgramAdmitted && (
                <p className="text-[11px] text-emerald-300">
                    A déjà été admise au cursus long.
                </p>
            )}
        </div>
    );
};
