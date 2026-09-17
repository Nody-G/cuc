'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';

interface KeyStatsEditorProps {
  formData: SitePageContent;
  handleAddKeyStat: () => void;
  handleRemoveKeyStat: (id: string) => void;
  handleUpdateKeyStat: (id: string, updates: Partial<{ title: string; value: string; description: string }>) => void;
}

export const KeyStatsEditor: React.FC<KeyStatsEditorProps> = ({
  formData,
  handleAddKeyStat,
  handleRemoveKeyStat,
  handleUpdateKeyStat,
}) => {
  return (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Chiffres Clés &amp; Statistiques ({formData.sections?.length || 0})
          </h3>
          <p className="text-xs text-gray-400">
            Capsules numériques affichées sur cette page (ex: 18 Ans, 1200+ Diplômés, 11 000 m²).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddKeyStat}
          className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffe600e6]"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un chiffre
        </button>
      </div>

      {(!formData.sections || formData.sections.length === 0) ? (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl space-y-2">
          <p className="text-xs text-gray-400">Aucun chiffre clé configuré.</p>
          <button
            type="button"
            onClick={handleAddKeyStat}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Créer un premier indicateur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {formData.sections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2.5 relative group"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[10px] font-mono text-[#FFE500] uppercase font-bold">
                  Indicateur #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyStat(sec.id)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Chiffre / Valeur</label>
                  <input
                    type="text"
                    value={sec.value || ''}
                    onChange={(e) => handleUpdateKeyStat(sec.id, { value: e.target.value })}
                    placeholder="ex: 18 Ans"
                    className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-[#FFE500] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Intitulé</label>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleUpdateKeyStat(sec.id, { title: e.target.value })}
                    placeholder="ex: Expérience"
                    className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">Sous-texte descriptif</label>
                <input
                  type="text"
                  value={sec.description || ''}
                  onChange={(e) => handleUpdateKeyStat(sec.id, { description: e.target.value })}
                  placeholder="ex: Fondé en 2008 par Lucas Dollfus"
                  className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-zinc-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
