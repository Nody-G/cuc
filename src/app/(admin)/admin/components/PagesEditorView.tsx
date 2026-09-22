'use client';

import React, { useState } from 'react';
import { DEFAULT_PAGE_CONTENTS, normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import { buildPreviewUrl } from '@/lib/preview/preview-url';
import { setFieldValue } from '@/lib/preview/field-path';
import type { PreviewMode } from '@/lib/preview/preview-protocol';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { MediaPickerModal } from './MediaPickerModal';
import { ContentEditorsSwitch } from './pages-editor/ContentEditorsSwitch';
import { EditorTabsBar } from './pages-editor/EditorTabsBar';
import { focusCucField } from './pages-editor/focus-field';
import { LayoutTabPanel } from './pages-editor/LayoutTabPanel';
import { composePageDraft } from './pages-editor/page-draft';
import type { PageEditorTab } from './pages-editor/pages-options';
import { PageEditorTopBar } from './pages-editor/PageEditorTopBar';
import { PreviewTabPanel } from './pages-editor/PreviewTabPanel';
import { RevisionsSection } from './pages-editor/RevisionsSection';
import { SeoTabPanel } from './pages-editor/SeoTabPanel';
import { usePageEditorDraft } from './pages-editor/usePageEditorDraft';
import { usePageSaveActions } from './pages-editor/usePageSaveActions';
import { useSectionHandlers } from './pages-editor/useSectionHandlers';

interface PagesEditorViewProps {
  pages: SitePageContent[];
  onPageSaved: (updatedPage: SitePageContent) => void;
  showToast: (msg: string) => void;
}

/**
 * Éditeur de pages vitrine — façade de composition (`AGENTS.md` § 1).
 *
 * Brouillon, historique undo/redo et overlay anglais dans `usePageEditorDraft` ;
 * écritures en base dans `usePageSaveActions` ; mutations de blocs dans
 * `useSectionHandlers`. Le rendu est réparti dans `pages-editor/**`.
 */
export const PagesEditorView: React.FC<PagesEditorViewProps> = ({
  pages,
  onPageSaved,
  showToast,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(pages[0]?.slug || '/');
  const [activeTab, setActiveTab] = useState<PageEditorTab>('content');
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isSplitView, setIsSplitView] = useState(false);
  // Origine résolue côté client uniquement : évite un `src=""` au premier rendu
  // (qui ferait charger la page courante dans l'iframe → « This page couldn't load »).
  // Initialiseur paresseux : aucune écriture d'état dans un effet (pas de rendu en cascade).
  const [previewOrigin] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  const [editorLocale, setEditorLocale] = useState<EditorLocaleOption>('fr');
  // Édition directe par défaut : dans l'aperçu, un clic sur un texte annoté ouvre
  // la saisie en place. Le mode `inspect` (clic = champ du formulaire) reste
  // accessible dans la barre de l'aperçu.
  const [previewMode, setPreviewMode] = useState<PreviewMode>('edit');

  const cleanSelectedSlug = normalizeSlug(selectedSlug);
  const draft = usePageEditorDraft({ pages, selectedSlug: cleanSelectedSlug, editorLocale });

  const bumpPreview = () => setPreviewKey((prev) => prev + 1);

  const save = usePageSaveActions({
    formData: draft.formData,
    savedData: draft.savedData,
    setFormData: draft.setFormData,
    editorLocale,
    translation: draft.translation,
    onPageSaved,
    showToast,
    bumpPreview,
    clearSnapshot: draft.clearCurrentSnapshot,
  });

  /**
   * Confirme l'abandon d'une saisie anglaise non enregistrée.
   * Le brouillon est conservé tant qu'on reste sur la page, mais changer de page
   * le remplace : mieux vaut prévenir que perdre un travail de traduction.
   */
  const confirmLeaveEnglishDraft = (action: string): boolean => {
    if (editorLocale !== 'en' || !draft.translation.dirty) return true;
    return window.confirm(
      `Des modifications anglaises ne sont pas enregistrées. ${action} les abandonnera.\n\nContinuer sans enregistrer ?`
    );
  };

  /** Bascule de langue, avec garde-fou si l'anglais n'est pas enregistré. */
  const handleLocaleChange = (next: EditorLocaleOption) => {
    if (next === editorLocale) return;
    if (!confirmLeaveEnglishDraft('Changer de langue')) return;
    setEditorLocale(next);
    // FR et EN sont deux brouillons distincts : l'historique ne les mélange pas.
    draft.resetDraftHistory();
  };

  // Synchronisation lors du changement de page.
  const handleSelectPage = (slug: string) => {
    if (!confirmLeaveEnglishDraft('Changer de page')) return;
    const clean = normalizeSlug(slug);
    setSelectedSlug(clean);
    const target = pages.find((p) => normalizeSlug(p.slug) === clean);
    draft.setFormData(composePageDraft(clean, target));
    bumpPreview();
    // Nouvelle page = nouveau brouillon : l'historique repart de zéro.
    draft.resetDraftHistory();
  };

  /** La structure (ajouter ou retirer un bloc) appartient à la source française. */
  const blockStructureChangeInEnglish = (what: string): boolean => {
    if (editorLocale !== 'en') return false;
    showToast(`${what} se structure en français : modifiez la liste en FR, puis traduisez-la ici.`);
    return true;
  };

  const handlers = useSectionHandlers({
    setActiveData: draft.setActiveData,
    blockStructureChangeInEnglish,
  });

  /**
   * Les médias sont partagés entre les langues : en anglais, on l'annonce au
   * lieu d'écrire une valeur qui serait ignorée à l'enregistrement.
   */
  const handleMediaPickerRequest = (target: string) => {
    if (editorLocale === 'en') {
      showToast('Les images sont partagées entre les langues : modifiez-les en français (FR).');
      return;
    }
    setMediaPickerTarget(target);
  };

  const handleMediaSelected = (url: string) => {
    const target = mediaPickerTarget;
    if (target === 'hero_bg') {
      draft.applyDraftChange((prev) => ({ ...prev, hero: { ...prev.hero, bg_image: url } }));
    } else if (target === 'og_image') {
      draft.applyDraftChange((prev) => ({ ...prev, og_image: url }));
    } else if (target && target.startsWith('workshop_img_')) {
      const idx = parseInt(target.replace('workshop_img_', ''), 10);
      handlers.handleUpdateWorkshop(idx, { img: url });
    } else if (target) {
      // Cible générique : chemin complet (`hero.bg_image`,
      // `sections_data.<bloc>.<champ>`, `sections_data.<bloc>.items.<i>.<champ>`),
      // écrit dans la langue active (brouillon FR ou overlay EN).
      draft.applyDraftChange((prev) => setFieldValue(prev, target, url));
    }
    setMediaPickerTarget(null);
  };

  const handleResetLayout = () => {
    const defaultData = DEFAULT_PAGE_CONTENTS[draft.formData.slug];
    if (defaultData?.layout_sections) {
      draft.setFormData((prev) => ({
        ...prev,
        layout_sections: defaultData.layout_sections,
      }));
      showToast('Disposition des blocs réinitialisée à sa configuration d’origine.');
    }
  };

  const handleRestored = (restored: SitePageContent) => {
    draft.setFormData(restored);
    onPageSaved(restored);
    bumpPreview();
  };

  // URL d'aperçu construite à partir de l'origine résolue côté client.
  // Tant que `previewOrigin` est vide (rendu serveur / premier rendu), on ne
  // produit pas d'URL : l'iframe n'est pas montée, ce qui évite un `src=""`.
  const previewUrl = buildPreviewUrl(previewOrigin, draft.formData.slug, editorLocale, {
    quiet: true,
  });

  const contentEditors = (
    <ContentEditorsSwitch
      slug={draft.formData.slug}
      activeData={draft.activeData}
      setActiveData={draft.setActiveData}
      isTranslationLoading={draft.isTranslationLoading}
      editorLocale={editorLocale}
      coverageMissing={draft.translation.coverage.missing}
      coverageStale={draft.translation.coverage.staleArrays.map((s) => s.path)}
      onMediaRequest={handleMediaPickerRequest}
      handlers={handlers}
    />
  );

  return (
    <div className="space-y-6">
      <PageEditorTopBar
        selectedSlug={selectedSlug}
        onSelectPage={handleSelectPage}
        editorLocale={editorLocale}
        onLocaleChange={handleLocaleChange}
        localeCoverage={
          editorLocale === 'en' && draft.translation.ready ? draft.translation.coverage : null
        }
        translationDirty={draft.translation.dirty}
        translationBusy={draft.translation.loading || draft.translation.saving}
        translationSaving={draft.translation.saving}
        translationReady={draft.translation.ready}
        isPublished={draft.formData.is_published}
        isPublishing={save.isPublishing}
        onTogglePublish={save.handleTogglePublish}
        isResetting={save.isResetting}
        onResetDefault={save.handleResetToDefault}
        onRemoveTranslation={save.handleRemoveTranslation}
        isSaving={save.isSaving}
        onSave={() => void save.handleSave()}
        previewUrl={previewUrl}
      />

      <EditorTabsBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        layoutCount={draft.formData.layout_sections?.length || 0}
      />

      {activeTab === 'layout' && (
        <LayoutTabPanel
          editorLocale={editorLocale}
          layoutSections={draft.formData.layout_sections || []}
          onChange={(updatedSections) =>
            draft.setFormData((prev) => ({
              ...prev,
              layout_sections: updatedSections,
            }))
          }
          onReset={handleResetLayout}
        />
      )}

      {activeTab === 'content' && contentEditors}

      {activeTab === 'preview' && (
        <PreviewTabPanel
          previewUrl={previewUrl}
          isSplitView={isSplitView}
          onToggleSplitView={() => setIsSplitView((prev) => !prev)}
          historyState={draft.historyState}
          onUndo={draft.handleUndo}
          onRedo={draft.handleRedo}
          previewKey={previewKey}
          activeData={draft.activeData}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          onFieldCommit={draft.handlePreviewFieldCommit}
          onFieldSelect={focusCucField}
          locale={editorLocale}
          onLocaleChange={handleLocaleChange}
          onMediaRequest={setMediaPickerTarget}
          onListCommand={draft.handlePreviewListCommand}
          draftChanges={draft.draftChanges}
          isInspectorEnabled={draft.isInspectorEnabled}
          onRevertChange={draft.handleRevertChange}
          onRevertAllChanges={draft.handleRevertAllChanges}
          contentEditors={contentEditors}
        />
      )}

      {activeTab === 'seo' && (
        <SeoTabPanel
          slug={draft.formData.slug}
          activeData={draft.activeData}
          setActiveData={draft.setActiveData}
          formData={draft.formData}
          setFormData={draft.setFormData}
          editorLocale={editorLocale}
          onMediaRequest={handleMediaPickerRequest}
        />
      )}

      <RevisionsSection
        editorLocale={editorLocale}
        slug={cleanSelectedSlug}
        currentPage={draft.currentPage}
        showToast={showToast}
        onRestored={handleRestored}
        translationUpdatedAt={draft.translation.updatedAt}
      />

      {/* Modal Médiathèque intégrée */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelectUrl={handleMediaSelected}
        />
      )}
    </div>
  );
};
