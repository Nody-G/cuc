'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';

/** Forme minimale d'un stage : celle écrite par le formulaire et lue par la vitrine. */
interface StageItem {
  id?: string;
  title?: string;
  duration?: string;
  description?: string;
}

interface StagesPageEditorProps {
  formData: SitePageContent;
  handleUpdateStageItem: (index: number, updates: Record<string, unknown>) => void;
  handleAddStageItem: () => void;
  handleRemoveStageItem: (index: number) => void;
}

export const StagesPageEditor: React.FC<StagesPageEditorProps> = ({
  formData,
  handleUpdateStageItem,
  handleAddStageItem,
  handleRemoveStageItem,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Catalogue des Stages Thématiques ({formData.sections_data?.stages_catalogue?.items?.length || 0})
            </h3>
            <p className="text-xs text-gray-400">
              Gérez les cartes des formats de stages affichés dans le catalogue.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddStageItem}
            className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffe600e6]"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un stage
          </button>
        </div>

        <div className="space-y-4">
          {(formData.sections_data?.stages_catalogue?.items || []).map(
            (stg: StageItem, idx: number) => (
              <div
                key={stg.id || idx}
                className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-[#FFE500] uppercase font-bold">
                    Stage #{idx + 1} : {stg.title || 'Sans titre'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStageItem(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Supprimer ce stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Titre du stage</label>
                    <input
                      type="text"
                      value={stg.title || ''}
                      onChange={(e) => handleUpdateStageItem(idx, { title: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Durée &amp; Heures</label>
                    <input
                      type="text"
                      value={stg.duration || ''}
                      onChange={(e) => handleUpdateStageItem(idx, { duration: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-[#FFE500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Description</label>
                  {/* Clé canonique `description` : la vitrine lit ce champ
                    (`desc` était écrit mais jamais affiché — corrigé ici). */}
                  <textarea
                    rows={2}
                    value={stg.description || ''}
                    onChange={(e) => handleUpdateStageItem(idx, { description: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
