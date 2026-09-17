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
  MoveVertical,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { SitePageContent, SitePageSection, LayoutSection, DEFAULT_PAGE_CONTENTS, normalizeSlug } from '@/lib/data/site-service';
import { upsertPageContent, resetPageContentToDefault } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';
import { PageLayoutManager } from './PageLayoutManager';

interface PagesEditorViewProps {
  pages: SitePageContent[];
  onPageSaved: (updatedPage: SitePageContent) => void;
  showToast: (msg: string) => void;
}

const SITE_PAGES_OPTIONS = [
  { label: 'Accueil (/)', value: '/' },
  { label: 'Formation Pro 2 Ans (/formation-de-cascadeur)', value: 'formation-de-cascadeur' },
  { label: 'Stages & Initiations (/stages-cascades-parkour-2)', value: 'stages-cascades-parkour-2' },
  { label: 'Stunt Workshops Masterclass (/stunt-workshop-cuc)', value: 'stunt-workshop-cuc' },
  { label: 'Équipe & Instructeurs (/equipe-cascadeurs-pro)', value: 'equipe-cascadeurs-pro' },
  { label: 'CUC Team & Action Design (/cuc-team-cascadeur)', value: 'cuc-team-cascadeur' },
  { label: 'CUC Events Agence (/cuc-events-agence)', value: 'cuc-events-agence' },
  { label: 'Team Building (/team-building-cascades)', value: 'team-building-cascades' },
  { label: 'Spectacles Yamakasi (/spectacles-cascadeurs-yamakasi)', value: 'spectacles-cascadeurs-yamakasi' },
  { label: 'Animations Airbag (/animations-airbag-parkour)', value: 'animations-airbag-parkour' },
  { label: 'Visite Virtuelle 360° (/visite-virtuelle)', value: 'visite-virtuelle' },
  { label: 'Visite Guidée Campus (/visite-guidee)', value: 'visite-guidee' },
  { label: 'Vidéos & Démos (/videos-cascadeur)', value: 'videos-cascadeur' },
  { label: 'Partenaires & Studios (/partenaires)', value: 'partenaires' },
  { label: 'Contact & Accès (/contact-cuc)', value: 'contact-cuc' },
];

export const PagesEditorView: React.FC<PagesEditorViewProps> = ({
  pages,
  onPageSaved,
  showToast,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(pages[0]?.slug || '/');
  const [activeTab, setActiveTab] = useState<'layout' | 'content' | 'preview' | 'seo'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Page active
  const cleanSelectedSlug = normalizeSlug(selectedSlug);
  const currentPage = pages.find((p) => normalizeSlug(p.slug) === cleanSelectedSlug) || pages[0] || DEFAULT_PAGE_CONTENTS['/'];

  // État local du formulaire avec initialisation sécurisée
  const [formData, setFormData] = useState<SitePageContent>(() => {
    const defaultData = DEFAULT_PAGE_CONTENTS[cleanSelectedSlug] || {};
    return {
      ...defaultData,
      ...currentPage,
      slug: cleanSelectedSlug,
      hero: { ...(defaultData.hero || {}), ...(currentPage?.hero || {}) },
      layout_sections:
        currentPage?.layout_sections && currentPage.layout_sections.length > 0
          ? currentPage.layout_sections
          : defaultData.layout_sections || [],
      sections_data: {
        ...(defaultData.sections_data || {}),
        ...(currentPage?.sections_data || {}),
      },
    };
  });

  // Synchronisation lors du changement de page
  const handleSelectPage = (slug: string) => {
    const clean = normalizeSlug(slug);
    setSelectedSlug(clean);
    const target = pages.find((p) => normalizeSlug(p.slug) === clean);
    const defaultData = DEFAULT_PAGE_CONTENTS[clean] || {};
    setFormData({
      ...defaultData,
      ...(target || {}),
      slug: clean,
      hero: { ...(defaultData.hero || {}), ...(target?.hero || {}) },
      layout_sections:
        target?.layout_sections && target.layout_sections.length > 0
          ? target.layout_sections
          : defaultData.layout_sections || [],
      sections_data: {
        ...(defaultData.sections_data || {}),
        ...(target?.sections_data || {}),
      },
    });
    setPreviewKey((prev) => prev + 1);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const clean = normalizeSlug(formData.slug);
    const res = await upsertPageContent(clean, {
      title: formData.title,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      og_image: formData.og_image,
      hero: formData.hero,
      sections: formData.sections || [],
      layout_sections: formData.layout_sections || [],
      sections_data: formData.sections_data || {},
      is_published: formData.is_published,
    });

    setIsSaving(false);
    if (res.success) {
      onPageSaved(formData);
      setPreviewKey((prev) => prev + 1);
      showToast(`Page "${formData.title}" enregistrée avec succès !`);
    } else {
      showToast(`Erreur : ${res.error || 'Sauvegarde impossible'}`);
    }
  };

  // Restauration d'origine avec confirmation
  const handleResetToDefault = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir rétablir les textes et la disposition d'origine pour "${formData.title}" ? Vos modifications personnalisées sur cette page seront réinitialisées.`
    );
    if (!confirmed) return;

    setIsResetting(true);
    const res = await resetPageContentToDefault(formData.slug);
    setIsResetting(false);

    if (res.success && res.defaultData) {
      setFormData(res.defaultData);
      onPageSaved(res.defaultData);
      setPreviewKey((prev) => prev + 1);
      showToast(`Textes d'origine rétablis pour "${formData.title}".`);
    } else {
      showToast(`Erreur lors du rétablissement : ${res.error}`);
    }
  };

  // Mise à jour de layout_sections
  const handleLayoutChange = (newLayout: LayoutSection[]) => {
    setFormData((prev) => ({
      ...prev,
      layout_sections: newLayout,
    }));
  };

  // Mise à jour de sections_data
  const handleUpdateSectionData = (sectionKey: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        [sectionKey]: {
          ...(prev.sections_data?.[sectionKey] || {}),
          [field]: value,
        },
      },
    }));
  };

  // Gestion des blocs de chiffres clés
  const handleAddKeyStat = () => {
    const newSec: SitePageSection = {
      id: `stat_${Date.now()}`,
      title: 'Nouvelle statistique',
      value: '100%',
      description: 'Précision ou indication',
    };
    setFormData({
      ...formData,
      sections: [...(formData.sections || []), newSec],
    });
  };

  const handleRemoveKeyStat = (id: string) => {
    setFormData({
      ...formData,
      sections: (formData.sections || []).filter((s) => s.id !== id),
    });
  };

  const handleUpdateKeyStat = (id: string, updates: Partial<SitePageSection>) => {
    setFormData({
      ...formData,
      sections: (formData.sections || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const previewUrl = formData.slug === '/' ? '/' : `/${formData.slug.replace(/^\//, '')}`;

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" /> Pilotage Intégral du Site Vitrine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Gestion des Pages, Textes &amp; Emplacements
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Modifiez chaque texte, image, ordre des sections et boutons. Vos changements s&apos;appliquent en direct sans toucher au code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isResetting}
            title="Rétablir les textes et dispositions officielles du campus"
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-gray-300 hover:text-red-300 text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Rétablissement...' : 'Rétablir origine'}</span>
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors"
          >
            <span>Voir en direct</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50 transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Sélecteur de page horizontal défilable */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-3">
        <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
          <span>Sélectionner la page à piloter ({pages.length} pages disponibles) :</span>
          <span className="text-[#FFE500] font-bold">Page active : {formData.title}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {pages.map((p) => {
            const isSelected = p.slug === selectedSlug;
            return (
              <button
                key={p.slug}
                type="button"
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

      {/* 4 Onglets Principaux : Structure, Textes, Studio Preview, SEO */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'layout'
              ? 'border-[#FFE500] text-[#FFE500]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <MoveVertical className="w-4 h-4" />
          1. Structure &amp; Emplacements ({formData.layout_sections?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-[#FFE500] text-[#FFE500]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          2. Textes, Médias &amp; Boutons
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-[#FFE500] text-[#FFE500]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          3. Studio Live Preview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'seo'
              ? 'border-[#FFE500] text-[#FFE500]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          4. Référencement Google (SEO)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ONGLET STRUCTURE & EMPLACEMENTS (PageLayoutManager)                    */}
      {/* ========================================================================= */}
      {activeTab === 'layout' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <PageLayoutManager
            layoutSections={formData.layout_sections || []}
            onChange={handleLayoutChange}
            onEditSection={(secId) => {
              setActiveTab('content');
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ONGLET TEXTES, MÉDIAS & BOUTONS                                       */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* BLOC A : EN-TÊTE & HÉROS PARALLAXE */}
          <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FFE500]/10 text-[#FFE500]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    En-tête &amp; Section Héros (H1)
                  </h3>
                  <p className="text-xs text-gray-400">
                    Grand titre principal, surtitre et boutons d&apos;accroche au sommet de la page.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Titre Principal H1 (affiché en grand)
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
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#FFE500]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Badge Surtitre (au-dessus du titre)
                </label>
                <input
                  type="text"
                  value={formData.hero.badge || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, badge: e.target.value },
                    })
                  }
                  placeholder="ex: FORMATION DIPLÔMANTE • 2 ANS"
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-[#FFE500] font-mono focus:outline-none focus:border-[#FFE500]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Sous-titre explicatif &amp; Texte d&apos;accroche
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

            {/* Photo d'arrière-plan avec accès direct à la médiathèque */}
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Photo d&apos;arrière-plan de l&apos;en-tête
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

            {/* Boutons d'action avec sélecteur de lien ergonomique */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-white/10">
              {/* Bouton 1 */}
              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-xs font-mono text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFE500]" /> Bouton Principal (Jaune)
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Texte du bouton</label>
                  <input
                    type="text"
                    value={formData.hero.cta_primary_text || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, cta_primary_text: e.target.value },
                      })
                    }
                    placeholder="ex: Découvrir la formation"
                    className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Destination du clic</label>
                  <div className="space-y-1.5">
                    <select
                      value={formData.hero.cta_primary_link || '/formation-de-cascadeur'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, cta_primary_link: e.target.value },
                        })
                      }
                      className="w-full bg-black/80 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      {SITE_PAGES_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bouton 2 */}
              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="text-xs font-mono text-gray-300 uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-500" /> Bouton Secondaire (Contour)
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Texte du bouton</label>
                  <input
                    type="text"
                    value={formData.hero.cta_secondary_text || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, cta_secondary_text: e.target.value },
                      })
                    }
                    placeholder="ex: Visiter le campus"
                    className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Destination du clic</label>
                  <select
                    value={formData.hero.cta_secondary_link || '/visite-guidee'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, cta_secondary_link: e.target.value },
                      })
                    }
                    className="w-full bg-black/80 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    {SITE_PAGES_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BLOC B : CONTENUS SPÉCIFIQUES DE LA PAGE ACCUEIL (Si page '/') */}
          {formData.slug === '/' && (
            <div className="space-y-6">
              {/* 1. Dossier Présentation & Piliers (About) */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Dossier Présentation &amp; Piliers (Qui Sommes-Nous)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Titre de la section, citation du fondateur Lucas Dollfus et arguments d&apos;excellence.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Section id: about
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Titre de section</label>
                    <input
                      type="text"
                      value={formData.sections_data?.about?.title || 'LE CENTRE DE FORMATION DE RÉFÉRENCE EN CASCADE DE CINÉMA'}
                      onChange={(e) => handleUpdateSectionData('about', 'title', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Badge Surtitre</label>
                    <input
                      type="text"
                      value={formData.sections_data?.about?.tag || 'PRÉSENTATION'}
                      onChange={(e) => handleUpdateSectionData('about', 'tag', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-[#FFE500]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Description principale</label>
                  <textarea
                    rows={3}
                    value={formData.sections_data?.about?.description || ''}
                    onChange={(e) => handleUpdateSectionData('about', 'description', e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="text-xs font-mono text-[#FFE500] uppercase font-bold">
                    Citation du Fondateur (Lucas Dollfus)
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-gray-400 mb-1">Texte de la citation</label>
                    <textarea
                      rows={2}
                      value={formData.sections_data?.about?.founder_quote || ''}
                      onChange={(e) => handleUpdateSectionData('about', 'founder_quote', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white italic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Nom du signataire</label>
                      <input
                        type="text"
                        value={formData.sections_data?.about?.founder_name || 'LUCAS DOLLFUS'}
                        onChange={(e) => handleUpdateSectionData('about', 'founder_name', e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Rôle / Titre</label>
                      <input
                        type="text"
                        value={formData.sections_data?.about?.founder_role || 'FONDATEUR & RÉGLEUR'}
                        onChange={(e) => handleUpdateSectionData('about', 'founder_role', e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-[#FFE500]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Certification Qualiopi & Financements */}
              <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Agrément Qualiopi &amp; Prise en Charge
                    </h3>
                    <p className="text-xs text-gray-400">
                      Informations sur les financements AFDAS, France Travail et OPCO.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Section id: qualiopi
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Titre de la section</label>
                  <input
                    type="text"
                    value={formData.sections_data?.qualiopi?.title || 'CERTIFICATION QUALIOPI & FINANCEMENTS'}
                    onChange={(e) => handleUpdateSectionData('qualiopi', 'title', e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Sous-titre explicatif</label>
                  <textarea
                    rows={2}
                    value={formData.sections_data?.qualiopi?.subtitle || ''}
                    onChange={(e) => handleUpdateSectionData('qualiopi', 'subtitle', e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BLOC C : CHIFFRES CLÉS & STATISTIQUES */}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ONGLET STUDIO LIVE PREVIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-[#0D0D12] border border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Eye className="w-4 h-4 text-[#FFE500]" />
              <span className="font-bold uppercase tracking-wider">Aperçu Visuel en Direct :</span>
              <span className="font-mono text-[#FFE500]">{previewUrl}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bascule Desktop / Tablet / Mobile */}
              <div className="flex items-center bg-black/60 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === 'desktop' ? 'bg-[#FFE500] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Format Ordinateur (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === 'tablet' ? 'bg-[#FFE500] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Format Tablette (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === 'mobile' ? 'bg-[#FFE500] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Format Smartphone (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bouton Recharger */}
              <button
                type="button"
                onClick={() => setPreviewKey((prev) => prev + 1)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                title="Actualiser l'aperçu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cadre de simulation avec centrage adaptatif */}
          <div className="bg-[#050508] border border-white/10 rounded-2xl p-4 overflow-hidden flex justify-center min-h-[640px]">
            <div
              className={`transition-all duration-300 w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black ${
                previewDevice === 'desktop'
                  ? 'max-w-full h-[720px]'
                  : previewDevice === 'tablet'
                  ? 'max-w-[768px] h-[720px]'
                  : 'max-w-[375px] h-[700px]'
              }`}
            >
              <iframe
                key={previewKey}
                src={previewUrl}
                title="Studio Live Preview"
                className="w-full h-full border-0 bg-[#060608]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ONGLET RÉFÉRENCEMENT & SEO GOOGLE                                     */}
      {/* ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="space-y-2">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Aperçu dans les résultats Google
            </div>
            <div className="bg-[#202124] border border-white/10 rounded-xl p-5 max-w-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-[#8ab4f8]">https://campus-universcascades.com</span>
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
                  Meta Description Google (Recommandé : 120-160 caractères)
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
                Image de partage OpenGraph pour réseaux sociaux (Facebook, LinkedIn, X)
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

      {/* Barre d'enregistrement basse persistante */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Dernière mise à jour :{' '}
          <span className="text-white font-mono">
            {formData.updated_at ? new Date(formData.updated_at).toLocaleString('fr-FR') : 'Non modifiée'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50 transition-transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer la page'}</span>
        </button>
      </div>

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
