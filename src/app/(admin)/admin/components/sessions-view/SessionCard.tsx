import React from 'react';
import { Copy, Trash2, Users } from 'lucide-react';
import type { SiteInquiry } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import {
    STATUS_COLORS,
    countSessionCandidates,
    seatBarColor,
    type ProgramSession,
    type SessionStatus,
} from './session-form';

export interface SessionCardProps {
    session: ProgramSession;
    index: number;
    program: StuntProgram;
    inquiries?: SiteInquiry[];
    onStatusChange: (session: ProgramSession, status: SessionStatus) => void;
    onDuplicate: (session: ProgramSession) => void;
    onDelete: (dateDisplay: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    index,
    program,
    inquiries,
    onStatusChange,
    onDuplicate,
    onDelete,
}) => {
    const candidates = countSessionCandidates(inquiries, program, session.date);

    return (
        <div
            key={index}
            className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-4 group hover:border-white/20 transition-colors"
        >
            <div>
                <div className="text-sm font-bold text-white font-mono">{session.date}</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${STATUS_COLORS[session.status] || 'bg-white/10 text-gray-300'
                            }`}
                    >
                        {session.status}
                    </span>

                    {candidates.total > 0 && (
                        <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1"
                            title={`${candidates.total} dossier(s) déposé(s)`}
                        >
                            <Users className="w-3 h-3" />
                            {candidates.total} candidat{candidates.total > 1 ? 's' : ''}
                            {candidates.admitted > 0 && ` (${candidates.admitted} admis)`}
                        </span>
                    )}

                    {session.cuc_sign_formation_id && (
                        <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1"
                            title="Session connectée et synchronisée avec CUC Sign"
                        >
                            ✓ CUC Sign
                        </span>
                    )}
                </div>

                {session.booked_seats !== undefined && session.max_seats ? (
                    <div className="mt-2 text-[11px] font-mono text-zinc-400 max-w-xs">
                        <div className="flex items-center justify-between gap-2">
                            <span>Inscrits CUC Sign :</span>
                            <span className="font-bold text-white">
                                {session.booked_seats} / {session.max_seats} élèves
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/10">
                            <div
                                className={`h-full transition-all ${seatBarColor(session.booked_seats, session.max_seats)}`}
                                style={{
                                    width: `${Math.min(
                                        100,
                                        (session.booked_seats / session.max_seats) * 100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-1.5">
                <select
                    value={session.status}
                    onChange={(e) => onStatusChange(session, e.target.value as SessionStatus)}
                    className="bg-black/60 border border-white/20 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#FFE500] cursor-pointer"
                >
                    <option value="ouvert">🟢 Ouvert</option>
                    <option value="dernières places">🟡 Dernières places</option>
                    <option value="complet">🔴 Complet</option>
                    <option value="bientôt">🔵 Bientôt</option>
                </select>

                <button
                    type="button"
                    onClick={() => onDuplicate(session)}
                    title="Dupliquer cette date de session"
                    className="p-1.5 text-gray-400 hover:text-[#FFE500] hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                    <Copy className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onDelete(session.id || session.date)}
                    title="Supprimer la date"
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
