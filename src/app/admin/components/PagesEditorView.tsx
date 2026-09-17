'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  FileText,
  Save,
  Globe,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SitePageContent, SitePageSection } from '@/lib/data/site-service';
import { upsertPageContent } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface PagesEditorViewProps {
  pages: SitePageContent[];
  onPageSaved: (updatedPage: SitePageContent) => void;
  showToast: (msg: string) => void;
}

export const PagesEditorView: React.FC<PagesEditorViewProps> = ({
  pages,
  onPageSaved,
  showToast,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(pages[0]?.slug || '/');
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'seo'>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'hero_bg' | 'og_image' | null>(null);

  // Page active en cours d'édition
  const currentPage = pages.find((p) => p.slug === selectedSlug) || pages[0];

  // État local du formulaire de la page active
  const [formData, setFormData] = useState<SitePageContent>(currentPage);

  // Synchronisation lors du changement de page
  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const target = pages.find((p) => p.slug === slug);
    if (target) {
      setFormData(target);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await upsertPageContent(formData.slug, {
      title: formData.title,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      og_image: formData.og_image,
      hero: formData.hero,
      sections: formData.sections || [],
      is_published: formData.is_published,
    });

    setIsSaving(false);
    if (res.success) {
      onPageSaved(formData);
      showToast(`Page "${formData.title}" enregistrée en direct !`);
    } else {
      showToast(`Erreur : ${res.error || 'Sauvegarde impossible'}`);
    }
  };

  // Gestion des sections dynamiques
  const handleAddSection = () => {
    const newSec: SitePageSection = {
      id: `sec_${Date.now()}`,
      title: 'Nouvel élément clé',
      value: 'Valeur / Chiffre',
      description: 'Courte description ou argument',
    };
    setFormData({
      ...formData,
      sections: [...(formData.sections || []), newSec],
    });
  };

  const handleRemoveSection = (id: string) => {
    setFormData({
      ...formData,
      sections: (formData.sections || []).filter((s) => s.id !== id),
    });
  };

  const handleUpdateSection = (id: string, updates: Partial<SitePageSection>) => {
    setFormData({
      ...formData,
      sections: (formData.sections || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" /> CMS Intégral — Personnalisation Détaillée
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Éditeur de Pages & Contenus
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Modifiez les titres H1, textes d&apos;accroche, boutons, sections clés et métadonnées SEO de chaque page.
          </p>
        </div>

        {currentPage && (
          <a
            href={currentPage.slug === '/' ? '/' : `/${currentPage.slug.replace(/^\//, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <span>Voir la page en ligne</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
          </a>
        )}
      </div>

      {/* Sélecteur de page horizontal défilable */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-3">
        <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 px-2">
          Sélectionner la page à modifier ({pages.length} pages disponibles) :
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {pages.map((p) => {
            const isSelected = p.slug === selectedSlug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPage(p.slug)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{p.title}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-black/40 text-gray-400'
                  }`}
                >
                  {p.slug}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulaire d'édition de la page sélectionnée */}
      {formData && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Sous-onglets : Hero, Contenu, SEO */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('hero')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'hero'
                  ? 'border-[#FFE500] text-[#FFE500]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              1. Hero & En-tête de page
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'sections'
                  ? 'border-[#FFE500] text-[#FFE500]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              2. Textes & Chiffres clés ({formData.sections?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'seo'
                  ? 'border-[#FFE500] text-[#FFE500]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              3. Référencement & SEO Google
            </button>
          </div>

          {/* 1. ONGLET HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Prévisualisation dynamique du Hero */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[#FFE500]" /> Aperçu visuel en direct
                </div>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black p-8 sm:p-12 text-center min-h-[260px] flex flex-col items-center justify-center">
                  {formData.hero.bg_image && (
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={formData.hero.bg_image}
                        alt="Background"
                        fill
                        className="object-cover brightness-25 contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="relative z-10 max-w-2xl mx-auto space-y-3">
                    {formData.hero.badge && (
                      <span className="inline-block px-3 py-1 rounded bg-[#FFE500] text-black text-[10px] font-black uppercase tracking-wider">
                        {formData.hero.badge}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                      {formData.hero.title || 'Titre de la page'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
                      {formData.hero.subtitle || 'Sous-titre explicatif et accroche de la page.'}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      {formData.hero.cta_primary_text && (
                        <span className="px-4 py-2 rounded bg-[#FFE500] text-black text-xs font-bold uppercase tracking-wider">
                          {formData.hero.cta_primary_text}
                        </span>
                      )}
                      {formData.hero.cta_secondary_text && (
                        <span className="px-4 py-2 rounded bg-white/10 text-white text-xs font-semibold">
                          {formData.hero.cta_secondary_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire des champs du Hero */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                      Titre Principal H1
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hero.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, title: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Badge Surtitre</label>
                    <input
                      type="text"
                      value={formData.hero.badge || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, badge: e.target.value },
                        })
                      }
                      className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Sous-titre / Paragraphe d&apos;accroche
                  </label>
                  <textarea
                    rows={3}
                    value={formData.hero.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>

                {/* Image d'arrière-plan */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Image d&apos;arrière-plan (URL ou Médiathèque)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.hero.bg_image || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, bg_image: e.target.value },
                        })
                      }
                      className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('hero_bg')}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                      Médiathèque
                    </button>
                  </div>
                </div>

                {/* Boutons d'action CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/10">
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-[#FFE500] uppercase">Bouton Principal (Jaune)</div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        value={formData.hero.cta_primary_text || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, cta_primary_text: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={formData.hero.cta_primary_link || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, cta_primary_link: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-mono text-gray-400 uppercase">Bouton Secondaire (Gris)</div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Texte du bouton</label>
                      <input
                        type="text"
                        value={formData.hero.cta_secondary_text || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, cta_secondary_text: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Lien de redirection</label>
                      <input
                        type="text"
                        value={formData.hero.cta_secondary_link || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, cta_secondary_link: e.target.value },
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ONGLET SECTIONS & CHIFFRES CLÉS */}
          {activeTab === 'sections' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">Éléments de contenu & Chiffres clés</h3>
                  <p className="text-xs text-gray-400">
                    Ces blocs alimentent les statistiques, arguments et descriptions spécifiques de la page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ffe600e6]"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un bloc
                </button>
              </div>

              {(!formData.sections || formData.sections.length === 0) ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-xl space-y-3">
                  <p className="text-sm text-gray-400">Aucun bloc additionnel sur cette page.</p>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Créer un premier bloc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.sections.map((section, idx) => (
                    <div
                      key={section.id || idx}
                      className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-[10px] font-mono text-[#FFE500] uppercase">
                          Bloc #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(section.id)}
                          title="Supprimer ce bloc"
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Titre / Label</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              handleUpdateSection(section.id, { title: e.target.value })
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-gray-400 mb-1">Valeur / Chiffre</label>
                          <input
                            type="text"
                            value={section.value || ''}
                            onChange={(e) =>
                              handleUpdateSection(section.id, { value: e.target.value })
                            }
                            className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-[#FFE500] font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 mb-1">Description / Argument</label>
                        <textarea
                          rows={2}
                          value={section.description || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, { description: e.target.value })
                          }
                          className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ONGLET SEO & RÉFÉRENCEMENT */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Simulateur Google SERP en direct */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Aperçu dans les résultats Google
                </div>
                <div className="bg-[#202124] border border-white/10 rounded-xl p-5 max-w-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[#8ab4f8]">https://cuc.fr</span>
                    <span>›</span>
                    <span className="text-gray-300 font-mono">{formData.slug}</span>
                  </div>
                  <h4 className="text-lg text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                    {formData.meta_title || formData.title}
                  </h4>
                  <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {formData.meta_description ||
                      'Découvrez le Campus Univers Cascades, référence européenne de la formation de cascadeurs pour le cinéma.'}
                  </p>
                </div>
              </div>

              {/* Formulaire SEO */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">
                      Balise &lt;title&gt; Google (Recommandé : 50-65 caractères)
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        (formData.meta_title?.length || 0) > 65 ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      {formData.meta_title?.length || 0} / 65 car.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">
                      Meta Description (Recommandé : 120-160 caractères)
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        (formData.meta_description?.length || 0) > 160 ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      {formData.meta_description?.length || 0} / 160 car.
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.meta_description || ''}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Image OpenGraph pour les partages réseaux (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.og_image || ''}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget('og_image')}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                      Médiathèque
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde global */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Dernière mise à jour :{' '}
              <span className="text-white font-mono">
                {formData.updated_at ? new Date(formData.updated_at).toLocaleString('fr-FR') : 'Non modifiée'}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer la page'}
            </button>
          </div>
        </form>
      )}

      {/* Modal Médiathèque intégrée */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelectUrl={(url) => {
            if (mediaPickerTarget === 'hero_bg') {
              setFormData({
                ...formData,
                hero: { ...formData.hero, bg_image: url },
              });
            } else if (mediaPickerTarget === 'og_image') {
              setFormData({ ...formData, og_image: url });
            }
            setMediaPickerTarget(null);
          }}
        />
      )}
    </div>
  );
};
