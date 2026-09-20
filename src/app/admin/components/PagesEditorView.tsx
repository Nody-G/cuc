'use client';

import React, { useCallback, useState } from 'react';
import {
  Save,
  Globe,
  Sliders,
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
  Rocket,
  Image as ImageIcon,
  Columns2,
} from 'lucide-react';
import { SitePageContent, DEFAULT_PAGE_CONTENTS, normalizeSlug } from '@/lib/data/site-service';
import { upsertPageContent, resetPageContentToDefault, setPagePublishState } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';
import { PageLayoutManager } from './PageLayoutManager';
import { HeroSeoEditor } from './pages-editor/HeroSeoEditor';
import { HomePageEditor } from './pages-editor/HomePageEditor';
import { TeamBuildingPageEditor } from './pages-editor/TeamBuildingPageEditor';
import { FormationPageEditor } from './pages-editor/FormationPageEditor';
import { StagesPageEditor } from './pages-editor/StagesPageEditor';
import { ContactPageEditor } from './pages-editor/ContactPageEditor';
import { KeyStatsEditor } from './pages-editor/KeyStatsEditor';
import { PageRevisionsPanel } from './PageRevisionsPanel';
import { LivePreviewPane } from './pages-editor/LivePreviewPane';

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isSplitView, setIsSplitView] = useState(false);
  // Origine résolue côté client uniquement : évite un `src=""` au premier rendu
  // (qui ferait charger la page courante dans l'iframe → « This page couldn't load »).
  // Initialiseur paresseux : aucune écriture d'état dans un effet (pas de rendu en cascade).
  const [previewOrigin] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.origin : '',
  );

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

  const handleTogglePublish = async () => {
    const nextState = !formData.is_published;
    setIsPublishing(true);
    const res = await setPagePublishState(formData.slug, nextState);
    setIsPublishing(false);

    if (res.success) {
      const updated = { ...formData, is_published: nextState };
      setFormData(updated);
      onPageSaved(updated);
      setPreviewKey((prev) => prev + 1);
      showToast(
        nextState
          ? `Page "${formData.title}" publiée sur la vitrine.`
          : `Page "${formData.title}" repassée en brouillon (non visible publiquement).`
      );
    } else {
      showToast(`Erreur : ${res.error || 'Changement de statut impossible'}`);
    }
  };

  const handleResetToDefault = async () => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir rétablir les textes et la disposition d'origine pour "${formData.title}" ? Vos modifications personnalisées sur cette page seront réinitialisées.`
    );
    if (!confirmed) return;

    setIsResetting(true);
    const res = await resetPageContentToDefault(formData.slug);
    setIsResetting(false);

    if (res.success) {
      const defaultData = DEFAULT_PAGE_CONTENTS[formData.slug];
      if (defaultData) {
        setFormData({ ...defaultData });
        onPageSaved(defaultData);
        setPreviewKey((prev) => prev + 1);
        showToast(`Page "${formData.title}" rétablie aux réglages d'origine CUC.`);
      }
    } else {
      showToast(`Erreur lors de la réinitialisation : ${res.error}`);
    }
  };

  // Handlers pour Team Building
  const handleUpdateWorkshop = (index: number, updates: any) => {
    const currentList = Array.isArray(formData.sections_data?.workshops)
      ? [...formData.sections_data.workshops]
      : [];
    currentList[index] = { ...currentList[index], ...updates };
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        workshops: currentList,
      },
    }));
  };

  const handleAddWorkshop = () => {
    const currentList = Array.isArray(formData.sections_data?.workshops)
      ? [...formData.sections_data.workshops]
      : [];
    currentList.push({
      id: `workshop_${Date.now()}`,
      title: 'Nouvel Atelier Cascade',
      category: 'Initiation & Action',
      desc: 'Description des exercices et sensations proposées aux équipes.',
      img: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg',
    });
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        workshops: currentList,
      },
    }));
  };

  const handleRemoveWorkshop = (index: number) => {
    const currentList = Array.isArray(formData.sections_data?.workshops)
      ? formData.sections_data.workshops.filter((_: any, i: number) => i !== index)
      : [];
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        workshops: currentList,
      },
    }));
  };

  // Handlers pour Formules
  const handleUpdateFormule = (index: number, updates: any) => {
    const current = formData.sections_data?.formules || {};
    const items = Array.isArray(current.items) ? [...current.items] : [];
    items[index] = { ...items[index], ...updates };
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        formules: {
          ...current,
          items,
        },
      },
    }));
  };

  // Handlers pour Stages
  const handleUpdateStageItem = (index: number, updates: any) => {
    const current = formData.sections_data?.stages_catalogue || {};
    const items = Array.isArray(current.items) ? [...current.items] : [];
    items[index] = { ...items[index], ...updates };
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        stages_catalogue: {
          ...current,
          items,
        },
      },
    }));
  };

  const handleAddStageItem = () => {
    const current = formData.sections_data?.stages_catalogue || {};
    const items = Array.isArray(current.items) ? [...current.items] : [];
    items.push({
      id: `stage_${Date.now()}`,
      title: 'Nouveau Stage Thématique',
      duration: '3 Jours (21h)',
      desc: 'Description des disciplines enseignées et du niveau requis.',
    });
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        stages_catalogue: {
          ...current,
          items,
        },
      },
    }));
  };

  const handleRemoveStageItem = (index: number) => {
    const current = formData.sections_data?.stages_catalogue || {};
    const items = Array.isArray(current.items)
      ? current.items.filter((_: any, i: number) => i !== index)
      : [];
    setFormData((prev) => ({
      ...prev,
      sections_data: {
        ...(prev.sections_data || {}),
        stages_catalogue: {
          ...current,
          items,
        },
      },
    }));
  };

  // Handlers pour Chiffres Clés
  const handleAddKeyStat = () => {
    const currentList = Array.isArray(formData.sections) ? [...formData.sections] : [];
    currentList.push({
      id: `stat_${Date.now()}`,
      title: 'Nouvelle Statistique',
      value: '100%',
      description: 'Précision sur la métrique',
    });
    setFormData((prev) => ({ ...prev, sections: currentList }));
  };

  const handleRemoveKeyStat = (id: string) => {
    const currentList = (formData.sections || []).filter((s) => s.id !== id);
    setFormData((prev) => ({ ...prev, sections: currentList }));
  };

  const handleUpdateKeyStat = (id: string, updates: Partial<{ title: string; value: string; description: string }>) => {
    const currentList = (formData.sections || []).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setFormData((prev) => ({ ...prev, sections: currentList }));
  };

  // URL d'aperçu construite à partir de l'origine résolue côté client.
  // Tant que `previewOrigin` est vide (rendu serveur / premier rendu), on ne
  // produit pas d'URL : l'iframe n'est pas montée, ce qui évite un `src=""`
  // qui chargerait la page courante dans l'iframe (« This page couldn't load »).
  //
  // On encadre la route dédiée `/admin/preview` (même origine que le Cockpit)
  // plutôt que la page vitrine réelle : l'encadrement est ainsi toujours
  // autorisé, quel que soit le domaine d'accès (déploiement de prévisualisation
  // Vercel, `www` vs apex, domaine personnalisé). Encadrer l'URL publique
  // échouait dès que les origines différaient (« This page couldn't load »).
  const previewUrl = previewOrigin
    ? `${previewOrigin}/admin/preview?slug=${encodeURIComponent(formData.slug)}`
    : '';

  /**
   * Édition inline : lorsqu'un champ est cliqué dans l'aperçu, on retrouve
   * l'input correspondant (marqué `data-cuc-field="<clé>"`) dans l'éditeur,
   * on le fait défiler en vue et on lui donne le focus.
   */
  const handlePreviewFieldFocus = useCallback((field: string) => {
    if (typeof document === 'undefined') return;
    const selector = `[data-cuc-field="${CSS.escape(field)}"]`;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus({ preventScroll: true });
      el.select();
    } else if (el instanceof HTMLSelectElement) {
      el.focus({ preventScroll: true });
    } else {
      el.focus?.({ preventScroll: true });
    }
    el.setAttribute('data-cuc-field-active', '');
    window.setTimeout(() => el.removeAttribute('data-cuc-field-active'), 1600);
  }, []);

  /**
   * Éditeurs de contenu de la page courante. Extrait dans une fonction pour
   * pouvoir être rendu soit seul (onglet « Contenu »), soit côte à côte avec
   * l'aperçu live (vue partagée).
   */
  const renderContentEditors = () => (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Bloc A & B1 : Hero & Référencement */}
      <HeroSeoEditor
        formData={formData}
        setFormData={setFormData}
        setMediaPickerTarget={setMediaPickerTarget}
      />

      {/* Bloc B1 : Accueil (6 blocs de contenu) */}
      {formData.slug === '/' && (
        <HomePageEditor
          formData={formData}
          setFormData={setFormData}
          setMediaPickerTarget={setMediaPickerTarget}
        />
      )}

      {/* Bloc B2 : Team Building */}
      {formData.slug === 'team-building-cascades' && (
        <TeamBuildingPageEditor
          formData={formData}
          setFormData={setFormData}
          setMediaPickerTarget={setMediaPickerTarget}
          handleUpdateWorkshop={handleUpdateWorkshop}
          handleAddWorkshop={handleAddWorkshop}
          handleRemoveWorkshop={handleRemoveWorkshop}
        />
      )}

      {/* Bloc B3 : Formation Pro 2 Ans */}
      {formData.slug === 'formation-de-cascadeur' && (
        <FormationPageEditor
          formData={formData}
          setFormData={setFormData}
          handleUpdateFormule={handleUpdateFormule}
        />
      )}

      {/* Bloc B4 : Stages & Parkour */}
      {formData.slug === 'stages-cascades-parkour-2' && (
        <StagesPageEditor
          formData={formData}
          handleUpdateStageItem={handleUpdateStageItem}
          handleAddStageItem={handleAddStageItem}
          handleRemoveStageItem={handleRemoveStageItem}
        />
      )}

      {/* Bloc B5 : Contact & Accès */}
      {formData.slug === 'contact-cuc' && (
        <ContactPageEditor formData={formData} setFormData={setFormData} />
      )}

      {/* Bloc C : Chiffres Clés & Statistiques */}
      <KeyStatsEditor
        formData={formData}
        handleAddKeyStat={handleAddKeyStat}
        handleRemoveKeyStat={handleRemoveKeyStat}
        handleUpdateKeyStat={handleUpdateKeyStat}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Barre Supérieure : Sélecteur de Page & Enregistrement */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D0D12] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-mono uppercase text-gray-400">Page Vitrine à éditer :</label>
          <select
            value={selectedSlug}
            onChange={(e) => handleSelectPage(e.target.value)}
            className="bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white font-medium focus:border-[#FFE500] focus:outline-none min-w-[280px]"
          >
            {SITE_PAGES_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Statut de publication (workflow brouillon → publié) */}
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${formData.is_published
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            title={
              formData.is_published
                ? 'La page est visible sur la vitrine publique.'
                : 'La page est en brouillon : elle n’est pas visible publiquement.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${formData.is_published ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
            />
            {formData.is_published ? 'Publiée' : 'Brouillon'}
          </span>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
            title="Ouvrir la page dans un nouvel onglet"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu</span>
          </a>

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={isPublishing}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors disabled:opacity-50 ${formData.is_published
              ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
              : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
              }`}
            title={
              formData.is_published
                ? 'Repasser la page en brouillon'
                : 'Publier la page sur la vitrine'
            }
          >
            {formData.is_published ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Rocket className="w-3.5 h-3.5" />
            )}
            <span>
              {isPublishing
                ? '…'
                : formData.is_published
                  ? 'Dépublier'
                  : 'Publier'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors disabled:opacity-50"
            title="Rétablir la version officielle d'origine CUC"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50 transition-transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Onglets de contrôle */}
      <div className="flex border-b border-white/10 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'content'
            ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Contenu &amp; Textes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'layout'
            ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Mise en Page ({formData.layout_sections?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'preview'
            ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Aperçu en Direct</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'seo'
            ? 'border-[#FFE500] text-[#FFE500] bg-white/5'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Référencement (SEO)</span>
        </button>
      </div>

      {/* 1. ONGLET STRUCTURE & EMPLACEMENTS (PageLayoutManager) */}
      {activeTab === 'layout' && (
        <div className="animate-in fade-in duration-150">
          <PageLayoutManager
            layoutSections={formData.layout_sections || []}
            onChange={(updatedSections) =>
              setFormData((prev) => ({
                ...prev,
                layout_sections: updatedSections,
              }))
            }
            onReset={() => {
              const defaultData = DEFAULT_PAGE_CONTENTS[formData.slug];
              if (defaultData?.layout_sections) {
                setFormData((prev) => ({
                  ...prev,
                  layout_sections: defaultData.layout_sections,
                }));
                showToast('Disposition des blocs réinitialisée à sa configuration d’origine.');
              }
            }}
          />
        </div>
      )}

      {/* 2. ONGLET CONTENU & TEXTES */}
      {activeTab === 'content' && renderContentEditors()}

      {/* 3. ONGLET STUDIO LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-[#0D0D12] border border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-300 min-w-0">
              <Eye className="w-4 h-4 text-[#FFE500] shrink-0" />
              <span className="font-bold uppercase tracking-wider shrink-0">Aperçu Live :</span>
              <span className="font-mono text-[#FFE500] truncate">{previewUrl}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSplitView((prev) => !prev)}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors shrink-0 ${isSplitView
                ? 'bg-[#FFE500] text-black border-[#FFE500]'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
                }`}
              title="Afficher l’éditeur et l’aperçu côte à côte"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Vue partagée</span>
            </button>
          </div>

          {isSplitView ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
              <div className="min-w-0">{renderContentEditors()}</div>
              <div className="min-w-0 xl:sticky xl:top-4">
                <LivePreviewPane
                  draft={formData}
                  previewUrl={previewUrl}
                  reloadKey={previewKey}
                  onFieldFocus={handlePreviewFieldFocus}
                />
              </div>
            </div>
          ) : (
            <LivePreviewPane
              draft={formData}
              previewUrl={previewUrl}
              reloadKey={previewKey}
              onFieldFocus={handlePreviewFieldFocus}
            />
          )}
        </div>
      )}

      {/* 4. ONGLET RÉFÉRENCEMENT & SEO GOOGLE */}
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
                  className={`text-[11px] font-mono ${(formData.meta_title?.length || 0) > 65 ? 'text-yellow-400' : 'text-gray-400'
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
                  className={`text-[11px] font-mono ${(formData.meta_description?.length || 0) > 160 ? 'text-yellow-400' : 'text-gray-400'
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
                  type="text"
                  placeholder="https://... ou /images/..."
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

      {/* 5. HISTORIQUE DES VERSIONS (site_page_revisions) */}
      <PageRevisionsPanel
        slug={cleanSelectedSlug}
        currentContent={currentPage}
        showToast={showToast}
        onRestored={(restored) => {
          setFormData(restored);
          onPageSaved(restored);
          setPreviewKey((prev) => prev + 1);
        }}
      />

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
            } else if (mediaPickerTarget.startsWith('workshop_img_')) {
              const idx = parseInt(mediaPickerTarget.replace('workshop_img_', ''), 10);
              handleUpdateWorkshop(idx, { img: url });
            } else if (mediaPickerTarget.startsWith('sections_data.')) {
              // Cible générique `sections_data.<bloc>.<champ>` : écrit la valeur
              // dans le bloc correspondant sans dupliquer la logique par page.
              const [, block, field] = mediaPickerTarget.split('.');
              if (block && field) {
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    [block]: {
                      ...((prev.sections_data || {})[block] || {}),
                      [field]: url,
                    },
                  },
                }));
              }
            }
            setMediaPickerTarget(null);
          }}
        />
      )}
    </div>
  );
};
