import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import type { StuntProgram } from '@/types';
import type { SiteInquiry } from '@/lib/data/site-service';
import { SessionCard } from './SessionCard';
import type { ProgramSession, SessionStatus } from './session-form';

export interface ProgramSessionsPanelProps {
    program: StuntProgram;
    inquiries?: SiteInquiry[];
    isSyncingSeats: boolean;
    onSyncSeats: () => void;
    onAddSession: () => void;
    onStatusChange: (session: ProgramSession, status: SessionStatus) => void;
    onDuplicate: (session: ProgramSession) => void;
    onDelete: (dateDisplay: string) => void;
}

export const ProgramSessionsPanel: React.FC<ProgramSessionsPanelProps> = ({
    program,
    inquiries,
    isSyncingSeats,
    onSyncSeats,
    onAddSession,
    onStatusChange,
    onDuplicate,
    onDelete,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
                <div className="text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    {program.badge || 'Cursus CUC'}
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">{program.title}</h2>
                <div className="text-xs text-gray-400 mt-1">
                    {program.duration} • {program.hours}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold">CUC Sign Realtime</span>
                </div>

                <button
                    type="button"
                    onClick={onSyncSeats}
                    disabled={isSyncingSeats}
                    className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                    title="Met à jour les places restantes depuis les effectifs réels CUC Sign"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#FFE500] ${isSyncingSeats ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSeats ? 'Sync en cours...' : 'Sync Manuel'}</span>
                </button>

                <button
                    type="button"
                    onClick={onAddSession}
                    className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une session
                </button>
            </div>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Sessions planifiées ({program.nextSessions?.length || 0})
            </h3>

            {(!program.nextSessions || program.nextSessions.length === 0) ? (
                <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
                    Aucune session pour ce programme.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {program.nextSessions.map((session, index) => (
                        <SessionCard
                            key={index}
                            session={session}
                            index={index}
                            program={program}
                            inquiries={inquiries}
                            onStatusChange={onStatusChange}
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
);
