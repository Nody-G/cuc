'use client';

import React from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';

/** Forme minimale d'un atelier : celle écrite par le formulaire et la vitrine. */
interface WorkshopItem {
  id?: string;
  title?: string;
  category?: string;
  desc?: string;
  img?: string;
}

interface TeamBuildingPageEditorProps {
  formData: SitePageContent;
  setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
  setMediaPickerTarget: (target: string) => void;
  handleUpdateWorkshop: (index: number, updates: Record<string, unknown>) => void;
  handleAddWorkshop: () => void;
  handleRemoveWorkshop: (index: number) => void;
}

export const TeamBuildingPageEditor: React.FC<TeamBuildingPageEditorProps> = ({
  formData,
  setFormData,
  setMediaPickerTarget,
  handleUpdateWorkshop,
  handleAddWorkshop,
  handleRemoveWorkshop,
}) => {
  return (
    <div className="space-y-6">
      {/* Présentation & Jauge */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Présentation &amp; Jauge des Séminaires
            </h3>
            <p className="text-xs text-gray-400">
              Titre de présentation, jauge de participants et cadre d&apos;accueil.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            overview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Titre de section</label>
            <input
              type="text"
              value={formData.sections_data?.overview?.title || 'LES ATELIERS DU CINÉMA'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    overview: {
                      ...(prev.sections_data?.overview || {}),
                      title: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Badge Surtitre</label>
            <input
              type="text"
              value={formData.sections_data?.overview?.badge || 'CUC EVENTS • IMMERSION ENTREPRISE'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    overview: {
                      ...(prev.sections_data?.overview || {}),
                      badge: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-[#FFE500] focus:border-[#FFE500] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-1">Description des activités</label>
          <textarea
            rows={3}
            value={formData.sections_data?.overview?.description || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sections_data: {
                  ...(prev.sections_data || {}),
                  overview: {
                    ...(prev.sections_data?.overview || {}),
                    description: e.target.value,
                  },
                },
              }))
            }
            className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
          />
        </div>
      </div>

      {/* Ateliers de Team Building */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ateliers Pratiques de Team Building ({formData.sections_data?.workshops?.length || 0})
            </h3>
            <p className="text-xs text-gray-400">
              Chaque atelier s&apos;affiche sous forme de carte interactive sur la page vitrine.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddWorkshop}
            className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffe600e6]"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un atelier
          </button>
        </div>

        <div className="space-y-4">
          {(formData.sections_data?.workshops || []).map(
            (ws: WorkshopItem, idx: number) => (
              <div
                key={ws.id || idx}
                className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-[#FFE500] uppercase font-bold">
                    Atelier #{idx + 1} : {ws.title || 'Sans titre'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkshop(idx)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Supprimer cet atelier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Titre de l&apos;atelier</label>
                    <input
                      type="text"
                      value={ws.title || ''}
                      onChange={(e) => handleUpdateWorkshop(idx, { title: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Catégorie / Thématique</label>
                    <input
                      type="text"
                      value={ws.category || ''}
                      onChange={(e) => handleUpdateWorkshop(idx, { category: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-[#FFE500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Description de l&apos;atelier</label>
                  <textarea
                    rows={2}
                    value={ws.desc || ''}
                    onChange={(e) => handleUpdateWorkshop(idx, { desc: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Photo de l&apos;atelier</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ws.img || ''}
                      onChange={(e) => handleUpdateWorkshop(idx, { img: e.target.value })}
                      className="flex-1 bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget(`workshop_img_${idx}`)}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                      title="Choisir dans la médiathèque"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
