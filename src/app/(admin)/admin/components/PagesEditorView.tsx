'use client';

import React, { useCallback, useState } from 'react';
import { normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import { findPageTreeEntry } from '@/lib/data/site/page-tree';
import { buildPreviewUrl } from '@/lib/preview/preview-url';
import { clearChromeDraftSnapshot } from '@/lib/preview/chrome-draft-storage';
import type { PreviewMode } from '@/lib/preview/preview-protocol';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { MediaPickerModal } from './MediaPickerModal';
import { ContentEditorsSwitch } from './pages-editor/ContentEditorsSwitch';
import { EditorTabsBar } from './pages-editor/EditorTabsBar';
import { focusCucField } from './pages-editor/focus-field';
import { LayoutTabPanel } from './pages-editor/LayoutTabPanel';
import type { PageEditorTab } from './pages-editor/pages-options';
import { PageEditorSaveBar } from './pages-editor/PageEditorSaveBar';
import { PageEditorTopBar } from './pages-editor/PageEditorTopBar';
import { PreviewTabPanel } from './pages-editor/PreviewTabPanel';
import { RevisionsSection } from './pages-editor/RevisionsSection';
import { SeoTabPanel } from './pages-editor/SeoTabPanel';
import { useChromeDraftState } from './pages-editor/useChromeDraftState';
import { useEditorNavigation } from './pages-editor/useEditorNavigation';
import { usePageEditorDraft } from './pages-editor/usePageEditorDraft';
import { usePageEditorCommitHandlers } from './pages-editor/usePageEditorCommitHandlers';
import { usePageEditorDirtyState } from './pages-editor/usePageEditorDirtyState';
import { usePageSaveActions } from './pages-editor/usePageSaveActions';
import { usePreviewMediaPicker } from './pages-editor/usePreviewMediaPicker';
import { usePageEditorCatalog } from './pages-editor/usePageEditorCatalog';
import { useSectionHandlers } from './pages-editor/useSectionHandlers';
import { PageContextBanner } from './site-tree/PageContextBanner';
import { usePageTree } from './site-tree/usePageTree';

interface PagesEditorViewProps {
  pages: SitePageContent[];
  onPageSaved: (updatedPage: SitePageContent) => void;
  showToast: (msg: string) => void;
  initialSlug?: string | null;
  onOpenMenu?: (pageKey: string) => void;
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
  initialSlug,
  onOpenMenu,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || pages[0]?.slug || '/');
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
  /** Brouillon « chrome » (réglages + micro-textes), segmenté par locale. */
  const chrome = useChromeDraftState(editorLocale);

  const cleanSelectedSlug = normalizeSlug(selectedSlug);
  const draft = usePageEditorDraft({ pages, selectedSlug: cleanSelectedSlug, editorLocale });

  /**
   * Arborescence canonique : navigation **publiée** + pied de page publié +
   * pages réellement en base. Le sélecteur et le bandeau d'identité en dérivent.
   */
  const { tree, isLoading: isTreeLoading } = usePageTree(pages);
  /** Blocs que cette page peut réellement porter. */
  const { defaultLayoutSections, blockStructureSupported } =
    usePageEditorCatalog(cleanSelectedSlug);
  const currentPageEntry = findPageTreeEntry(tree, cleanSelectedSlug);

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
    settingDraft: chrome.settings,
    clearSettingDraft: chrome.clearSettings,
    microcopyDraft: chrome.microcopy,
    clearMicrocopyDraft: chrome.clearMicrocopy,
    entityDraft: chrome.entities,
    clearEntityDraft: chrome.clearEntities,
  });
  /** Abandon : purge explicite des deux filets locaux (page + chrome). */
  const { clearCurrentSnapshot } = draft;
  const purgeLocalSnapshots = useCallback(() => {
    clearCurrentSnapshot();
    clearChromeDraftSnapshot(editorLocale);
  }, [clearCurrentSnapshot, editorLocale]);

  const saveBar = usePageEditorDirtyState(draft, chrome, editorLocale, purgeLocalSnapshots);

  /** Garde-fous de navigation : langue, page, structure (voir le hook). */
  const navigation = useEditorNavigation({
    editorLocale,
    translationDirty: draft.translation.dirty,
    pages,
    showToast,
    setEditorLocale,
    setSelectedSlug,
    setFormData: draft.setFormData,
    resetDraftHistory: draft.resetDraftHistory,
    bumpPreview,
  });

  const handlers = useSectionHandlers({
    setActiveData: draft.setActiveData,
    blockStructureChangeInEnglish: navigation.blockStructureChangeInEnglish,
  });

  /** Médiathèque : médias partagés entre les langues (écriture FR uniquement). */
  const mediaPicker = usePreviewMediaPicker({
    editorLocale,
    mediaPickerTarget,
    setMediaPickerTarget,
    showToast,
    applyDraftChange: draft.applyDraftChange,
    onWorkshopImage: (index, url) => handlers.handleUpdateWorkshop(index, { img: url }),
  });

  /** Gestes de validation (entités, disposition, restauration) — voir le hook. */
  const commits = usePageEditorCommitHandlers({
    editorLocale,
    showToast,
    slug: draft.formData.slug,
    setFormData: draft.setFormData,
    commitEntity: chrome.commitEntity,
    onPageSaved,
    bumpPreview,
  });

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
      onMediaRequest={mediaPicker.request}
      handlers={handlers}
    />
  );

  return (
    <div className="space-y-6">
      <PageEditorTopBar
        selectedSlug={selectedSlug}
        onSelectPage={navigation.handleSelectPage}
        tree={tree}
        isTreeLoading={isTreeLoading}
        editorLocale={editorLocale}
        onLocaleChange={navigation.handleLocaleChange}
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

      <PageContextBanner
        entry={currentPageEntry}
        blockCount={draft.formData.layout_sections?.length || 0}
        blockStructureSupported={blockStructureSupported}
        onOpenMenu={onOpenMenu}
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
          onReset={commits.handleResetLayout}
          structureSupported={blockStructureSupported}
          availableSections={defaultLayoutSections}
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
          settings={chrome.settings}
          onSettingCommit={chrome.commitSetting}
          microcopy={chrome.microcopy}
          onMicrocopyCommit={chrome.commitMicrocopy}
          entities={chrome.entities}
          onEntityCommit={commits.handleEntityCommit}
          onFieldSelect={focusCucField}
          locale={editorLocale}
          onLocaleChange={navigation.handleLocaleChange}
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
          onMediaRequest={mediaPicker.request}
        />
      )}

      <RevisionsSection
        editorLocale={editorLocale}
        slug={cleanSelectedSlug}
        currentContent={draft.formData}
        refreshKey={save.revisionRefreshKey}
        showToast={showToast}
        onRestored={commits.handleRestored}
        translationUpdatedAt={draft.translation.updatedAt}
      />

      {mediaPickerTarget && (
        <MediaPickerModal isOpen onClose={() => setMediaPickerTarget(null)} onSelectUrl={mediaPicker.applySelected} />
      )}
      <PageEditorSaveBar
        isDirty={saveBar.isDirty}
        isSaving={save.isSaving || draft.translation.saving}
        onSave={() => void save.handleSave()}
        onDiscard={saveBar.discardAll}
      />
    </div>
  );
};
