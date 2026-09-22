'use client';

import React from 'react';
import { SitePageContent } from '@/lib/data/site-service';

/** Forme minimale d'une formule : celle écrite par le formulaire et la vitrine. */
interface FormuleItem {
  id?: string;
  title?: string;
  step_badge?: string;
  description?: string;
  duration_text?: string;
  cta_text?: string;
}

interface FormationPageEditorProps {
  formData: SitePageContent;
  setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
  handleUpdateFormule: (index: number, updates: Record<string, unknown>) => void;
}

export const FormationPageEditor: React.FC<FormationPageEditorProps> = ({
  formData,
  setFormData,
  handleUpdateFormule,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Les 2 Formules du Cursus Professionnel
            </h3>
            <p className="text-xs text-gray-400">
              Stage Découverte &amp; Sélection préalable, et Formation Longue Durée 2 Ans.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            formules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Titre de section</label>
            <input
              type="text"
              value={formData.sections_data?.formules?.title || 'DU STAGE DÉCOUVERTE AU DIPLÔME PRO'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    formules: {
                      ...(prev.sections_data?.formules || {}),
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
              value={formData.sections_data?.formules?.badge || "PARCOURS D'ADMISSION & CURSUS"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    formules: {
                      ...(prev.sections_data?.formules || {}),
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
          <label className="block text-xs font-mono text-gray-400 mb-1">Sous-titre explicatif</label>
          <textarea
            rows={2}
            value={formData.sections_data?.formules?.subtitle || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sections_data: {
                  ...(prev.sections_data || {}),
                  formules: {
                    ...(prev.sections_data?.formules || {}),
                    subtitle: e.target.value,
                  },
                },
              }))
            }
            className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
          />
        </div>

        <div className="space-y-4 pt-2">
          {(formData.sections_data?.formules?.items || []).map(
            (formule: FormuleItem, idx: number) => (
              <div
                key={formule.id || idx}
                className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3"
              >
                <div className="text-xs font-mono text-[#FFE500] uppercase font-bold">
                  Formule #{idx + 1} : {formule.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Titre de la formule</label>
                    <input
                      type="text"
                      value={formule.title || ''}
                      onChange={(e) => handleUpdateFormule(idx, { title: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Badge étape</label>
                    <input
                      type="text"
                      value={formule.step_badge || ''}
                      onChange={(e) => handleUpdateFormule(idx, { step_badge: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-[#FFE500]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formule.description || ''}
                    onChange={(e) => handleUpdateFormule(idx, { description: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Volume horaire / Durée</label>
                    <input
                      type="text"
                      value={formule.duration_text || ''}
                      onChange={(e) => handleUpdateFormule(idx, { duration_text: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Texte du bouton CTA</label>
                    <input
                      type="text"
                      value={formule.cta_text || ''}
                      onChange={(e) => handleUpdateFormule(idx, { cta_text: e.target.value })}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    />
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
