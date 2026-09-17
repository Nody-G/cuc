'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, Plus, Trash2, Copy, Users } from 'lucide-react';
import { StuntProgram } from '@/types';
import { SiteInquiry } from '@/lib/data/site-service';
import { updateSessionStatus, createSession, deleteSession } from '@/app/admin/actions';

interface SessionsViewProps {
  programs: StuntProgram[];
  setPrograms: React.Dispatch<React.SetStateAction<StuntProgram[]>>;
  inquiries?: SiteInquiry[];
  showToast: (msg: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  programs,
  setPrograms,
  inquiries = [],
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionStatus, setNewSessionStatus] = useState<'ouvert' | 'dernières places' | 'complet'>('ouvert');

  const currentProgram = programs.find((p) => p.id === (selectedProgramId || programs[0]?.id)) || programs[0];

  const handleStatusChange = (
    progId: string,
    dateDisplay: string,
    newStat: 'ouvert' | 'dernières places' | 'complet' | 'bientôt'
  ) => {
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: p.nextSessions.map((s) => (s.date === dateDisplay ? { ...s, status: newStat } : s)),
        };
      })
    );
    showToast(`Statut mis à jour : ${newStat}`);

    startTransition(async () => {
      await updateSessionStatus(dateDisplay, newStat);
    });
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionDate.trim() || !currentProgram) return;

    const progId = currentProgram.id;
    const dateText = newSessionDate.trim();
    const stat = newSessionStatus;

    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: [...(p.nextSessions || []), { date: dateText, status: stat }],
        };
      })
    );
    setNewSessionDate('');
    setShowAddSessionModal(false);
    showToast('Session ajoutée avec succès !');

    startTransition(async () => {
      await createSession({
        program_id: progId,
        date_display: dateText,
        status: stat,
      });
    });
  };

  const handleDeleteSession = (progId: string, dateDisplay: string) => {
    if (!confirm(`Supprimer définitivement la session "${dateDisplay}" ?`)) return;

    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== progId) return p;
        return {
          ...p,
          nextSessions: p.nextSessions.filter((s) => s.date !== dateDisplay),
        };
      })
    );
    showToast('Session supprimée.');

    startTransition(async () => {
      await deleteSession(dateDisplay);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Calendar className="w-3.5 h-3.5" /> Sessions &amp; Dates de stage
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Gestion des Dates &amp; Disponibilités
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Basculez une session en &quot;Complet&quot; en 1 clic ou ajoutez de nouvelles sessions.
        </p>
      </div>

      {/* Sélecteur de programme */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {programs.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProgramId(p.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              currentProgram?.id === p.id
                ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/20'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {currentProgram && (
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                {currentProgram.badge || 'Cursus CUC'}
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{currentProgram.title}</h2>
              <div className="text-xs text-gray-400 mt-1">
                {currentProgram.duration} • {currentProgram.hours}
              </div>
            </div>

            <button
              onClick={() => setShowAddSessionModal(true)}
              className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Ajouter une session
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Sessions planifiées ({currentProgram.nextSessions?.length || 0})
            </h3>

            {(!currentProgram.nextSessions || currentProgram.nextSessions.length === 0) ? (
              <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
                Aucune session pour ce programme.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentProgram.nextSessions.map((session, index) => {
                  const statusColors: Record<string, string> = {
                    complet: 'bg-red-500/10 text-red-400 border-red-500/20',
                    'dernières places': 'bg-yellow-500/10 text-[#FFE500] border-yellow-500/20',
                    ouvert: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    bientôt: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  };

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between gap-4 group hover:border-white/20 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-white font-mono">{session.date}</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                              statusColors[session.status] || 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {session.status}
                          </span>

                          {(() => {
                            const matchingCandidates = (inquiries || []).filter((i) => {
                              const matchesProg =
                                i.program_id === currentProgram.id ||
                                i.program_title?.toLowerCase().includes(currentProgram.title.toLowerCase());
                              const matchesDate =
                                !i.session_date ||
                                session.date.includes(i.session_date) ||
                                i.session_date.includes(session.date);
                              return matchesProg && matchesDate;
                            });

                            if (matchingCandidates.length === 0) return null;

                            const admitted = matchingCandidates.filter((c) => c.status === 'admis').length;

                            return (
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1"
                                title={`${matchingCandidates.length} dossier(s) déposé(s)`}
                              >
                                <Users className="w-3 h-3" />
                                {matchingCandidates.length} candidat{matchingCandidates.length > 1 ? 's' : ''}
                                {admitted > 0 && ` (${admitted} admis)`}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={session.status}
                          onChange={(e) =>
                            handleStatusChange(
                              currentProgram.id,
                              session.date,
                              e.target.value as 'ouvert' | 'dernières places' | 'complet' | 'bientôt'
                            )
                          }
                          className="bg-black/60 border border-white/20 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#FFE500] cursor-pointer"
                        >
                          <option value="ouvert">🟢 Ouvert</option>
                          <option value="dernières places">🟡 Dernières places</option>
                          <option value="complet">🔴 Complet</option>
                          <option value="bientôt">🔵 Bientôt</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setNewSessionDate(`${session.date} (Copie)`);
                            setNewSessionStatus(
                              session.status === 'bientôt' ? 'ouvert' : session.status
                            );
                            setShowAddSessionModal(true);
                          }}
                          title="Dupliquer cette date de session"
                          className="p-1.5 text-gray-400 hover:text-[#FFE500] hover:bg-white/10 rounded transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteSession(currentProgram.id, session.date)}
                          title="Supprimer la date"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal d'ajout de date */}
      {showAddSessionModal && currentProgram && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Ajouter une session de stage
            </h3>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Programme</label>
                <input
                  type="text"
                  disabled
                  value={currentProgram.title}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Intitulé de la date</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 12 au 24 mai 2027"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Statut initial</label>
                <select
                  value={newSessionStatus}
                  onChange={(e) => setNewSessionStatus(e.target.value as 'ouvert' | 'dernières places' | 'complet')}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                >
                  <option value="ouvert">🟢 Ouvert aux inscriptions</option>
                  <option value="dernières places">🟡 Dernières places</option>
                  <option value="complet">🔴 Complet</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
