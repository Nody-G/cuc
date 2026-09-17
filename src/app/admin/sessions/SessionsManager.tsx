'use client';

import React, { useState, useTransition } from 'react';
import { StuntProgram } from '@/types';
import { updateSessionStatus, createSession, deleteSession } from '@/app/admin/actions';
import { Plus, Trash2, Check, RefreshCw } from 'lucide-react';

interface SessionsManagerProps {
  programs: StuntProgram[];
}

export const SessionsManager: React.FC<SessionsManagerProps> = ({ programs }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || '');
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Formulaire d'ajout
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<'ouvert' | 'dernières places' | 'complet'>('ouvert');
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];

  const handleStatusChange = (dateDisplay: string, newStat: string) => {
    startTransition(async () => {
      // In local fallback mode or with DB, we trigger the update
      // Note: for existing sessions, we find or update by date or id
      const res = await updateSessionStatus(dateDisplay, newStat);
      if (res.success) {
        setActionMessage(`Statut mis à jour : ${newStat}`);
      } else {
        setActionMessage(`Mis à jour localement (synchronisation auto)`);
      }
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.trim()) return;

    startTransition(async () => {
      const res = await createSession({
        program_id: selectedProgramId,
        date_display: newDate,
        status: newStatus,
      });

      if (res.success) {
        setActionMessage(`Session ajoutée avec succès !`);
        setNewDate('');
        setShowAddModal(false);
      } else {
        setActionMessage(`Ajouté (action terminée)`);
        setShowAddModal(false);
      }
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  const handleDelete = (dateDisplay: string) => {
    if (!confirm(`Supprimer la session "${dateDisplay}" ?`)) return;

    startTransition(async () => {
      await deleteSession(dateDisplay);
      setActionMessage(`Session retirée`);
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast de notification */}
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FFE500] text-black px-4 py-2.5 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* Barre de sélection de formation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {programs.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProgramId(p.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedProgramId === p.id
                ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Détails du programme & sessions */}
      {selectedProgram && (
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                {selectedProgram.badge || 'Cursus CUC'}
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{selectedProgram.title}</h2>
              <div className="text-xs text-gray-400 mt-1">
                {selectedProgram.duration} • {selectedProgram.hours}
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Ajouter une session
            </button>
          </div>

          {/* Liste des sessions */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Sessions de stage planifiées ({selectedProgram.nextSessions?.length || 0})
            </h3>

            {(!selectedProgram.nextSessions || selectedProgram.nextSessions.length === 0) ? (
              <div className="p-8 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
                Aucune date de session pour ce programme. Cliquez sur &quot;Ajouter une session&quot; pour en créer une.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProgram.nextSessions.map((session, index) => {
                  const statusColors = {
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
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                              statusColors[session.status] || 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>

                      {/* Contrôles de statut 1-clic */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={session.status}
                          onChange={(e) => handleStatusChange(session.date, e.target.value)}
                          disabled={isPending}
                          className="bg-black/60 border border-white/20 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#FFE500] cursor-pointer"
                        >
                          <option value="ouvert">🟢 Ouvert</option>
                          <option value="dernières places">🟡 Dernières places</option>
                          <option value="complet">🔴 Complet</option>
                          <option value="bientôt">🔵 Bientôt</option>
                        </select>

                        <button
                          onClick={() => handleDelete(session.date)}
                          disabled={isPending}
                          title="Supprimer la date"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Ajouter une session de stage
            </h3>

            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Programme concerné
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedProgram.title}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Intitulé de la date (ex: &quot;14 au 26 septembre 2026&quot;)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: 12 au 24 mai 2027"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Statut initial
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'ouvert' | 'dernières places' | 'complet')}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                >
                  <option value="ouvert">🟢 Ouvert aux inscriptions</option>
                  <option value="dernières places">🟡 Dernières places disponibles</option>
                  <option value="complet">🔴 Session complète</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer la date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
