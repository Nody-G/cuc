'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';
import { LinkField } from './LinkField';

interface HeroSeoEditorProps {
  formData: SitePageContent;
  setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
  setMediaPickerTarget: (target: string) => void;
}

export const HeroSeoEditor: React.FC<HeroSeoEditorProps> = ({
  formData,
  setFormData,
  setMediaPickerTarget,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. MÉTADONNÉES DE LA PAGE & RÉFÉRENCEMENT (SEO) */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Référencement Naturel &amp; Indexation (SEO)
            </h3>
            <p className="text-xs text-gray-400">
              Balises meta de la page générées dynamiquement dans le HTML source.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Head &amp; Meta
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Titre SEO &amp; Onglet Navigateur (Meta Title)
            </label>
            <input
              type="text"
              value={formData.meta_title || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_title: e.target.value,
                }))
              }
              placeholder="ex: CUC - Campus Univers Cascades | Le Plus Grand Centre au Monde"
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Description Moteur de Recherche (Meta Description)
            </label>
            <textarea
              rows={2}
              value={formData.meta_description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              placeholder="Résumé de la page affiché dans Google (150-160 caractères recommandés)..."
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Image OpenGraph / Réseaux Sociaux (Partage Facebook, LinkedIn, X)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.og_image || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    og_image: e.target.value,
                  }))
                }
                placeholder="https://... ou /images/..."
                className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setMediaPickerTarget('og_image')}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                title="Sélectionner dans la médiathèque"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                <span>Médiathèque</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION HÉRO (HAUT DE PAGE) */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Bannière d&apos;Accroche (Hero Principal)
            </h3>
            <p className="text-xs text-gray-400">
              Premier bloc vu par l&apos;utilisateur lors de son arrivée sur la page.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Haut de Page
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Badge Surtitre (Capsule Dorée)
              </label>
              <input
                type="text"
                value={formData.hero.badge || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, badge: e.target.value },
                  }))
                }
                placeholder="ex: CERTIFIÉ QUALIOPI • N°1 MONDIAL"
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-[#FFE500] font-mono focus:border-[#FFE500] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Titre Principal (H1)
              </label>
              <input
                type="text"
                value={formData.hero.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value },
                  }))
                }
                placeholder="ex: FORMATION DE CASCADEUR PROFESSIONNEL"
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white uppercase font-bold focus:border-[#FFE500] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Sous-titre / Paragraphe d&apos;Accroche
            </label>
            <textarea
              rows={3}
              value={formData.hero.subtitle || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value },
                }))
              }
              placeholder="Texte introductif détaillé affiché sous le grand titre..."
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          {/* Boutons d'action (CTA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-[#FFE500] uppercase font-bold block">
                Bouton d&apos;Action Principal (CTA Jaune)
              </span>
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-0.5">Libellé</label>
                <input
                  type="text"
                  value={formData.hero.cta_primary_text || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta_primary_text: e.target.value },
                    }))
                  }
                  placeholder="ex: Découvrir le cursus"
                  className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <LinkField
                label="Lien de destination"
                field="hero.cta_primary_link"
                value={formData.hero.cta_primary_link || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, cta_primary_link: value },
                  }))
                }
              />
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-gray-300 uppercase font-bold block">
                Bouton d&apos;Action Secondaire (Contour)
              </span>
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-0.5">Libellé</label>
                <input
                  type="text"
                  value={formData.hero.cta_secondary_text || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta_secondary_text: e.target.value },
                    }))
                  }
                  placeholder="ex: Visite Virtuelle 3D"
                  className="w-full bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <LinkField
                label="Lien de destination"
                field="hero.cta_secondary_link"
                value={formData.hero.cta_secondary_link || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, cta_secondary_link: value },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
