'use client';

import React from 'react';
import type { MediaKind } from '@/app/(admin)/admin/media-shared';
import { ORIGINALS_ROOT, TRASH_ROOT } from '@/lib/media-library/media-policy';
import { MediaBulkActions } from './MediaBulkActions';
import { MediaBrowser } from './MediaBrowser';
import { MediaDetailPanel } from './MediaDetailPanel';
import { MediaToolbar } from './MediaToolbar';
import { MediaTreeAside } from './MediaTreeAside';
import { useMediaCategoryFilter } from './useMediaCategoryFilter';
import { useMediaNavigation } from './useMediaNavigation';
import { useMediaSelection } from './useMediaSelection';

interface MediaExplorerProps {
    /** `manage` = médiathèque complète ; `pick` = sélection d'une URL. */
    mode?: 'manage' | 'pick';
    showToast: (message: string) => void;
    onSelect?: (url: string) => void;
    /** Types acceptés en mode `pick` (les autres sont masqués). */
    acceptKinds?: MediaKind[];
    /** Dossiers exclus de la navigation (ex. la corbeille). */
    hiddenPrefixes?: string[];
}

/**
 * Explorateur de la médiathèque Storage (bucket public `cuc-vitrine-assets`).
 *
 * Façade de composition (`AGENTS.md` § 1) : la navigation vit dans
 * `useMediaNavigation`, la sélection et les actions dans `useMediaSelection`,
 * le rendu dans `MediaTreeAside` / `MediaToolbar` / `MediaBrowser` /
 * `MediaDetailPanel`. Le serveur fait le travail lourd (parcours récursif,
 * agrégats, index d'usage).
 */
export const MediaExplorer: React.FC<MediaExplorerProps> = ({
    mode = 'manage',
    showToast,
    onSelect,
    acceptKinds,
    hiddenPrefixes = [TRASH_ROOT, ORIGINALS_ROOT],
}) => {
    const nav = useMediaNavigation({ mode, acceptKinds, hiddenPrefixes, showToast });
    const cat = useMediaCategoryFilter({
        files: nav.visibleFiles,
        usageIndex: nav.usageIndex,
        showToast,
    });
    const sel = useMediaSelection({
        visibleFiles: cat.categorizedFiles,
        prefix: nav.prefix,
        detail: nav.detail,
        setDetail: nav.setDetail,
        loadFolder: nav.loadFolder,
        refreshTree: nav.refreshTree,
        resetCatalogue: nav.resetCatalogue,
        externalReferences: nav.references,
        showToast,
    });

    /** Navigation : réinitialise aussi sélection et destination de déplacement. */
    const navigateTo = (target: string) => {
        nav.navigateTo(target);
        sel.setSelection([]);
        sel.setMoveTarget('');
    };

    const toggleKind = (kind: MediaKind) =>
        nav.setKinds((prev) =>
            prev.includes(kind) ? prev.filter((item) => item !== kind) : [...prev, kind]
        );

    const togglePath = (path: string) =>
        sel.setSelection((prev) =>
            prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
        );

    const pickUrl = (url: string) => onSelect?.(url);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-5">
            <MediaTreeAside
                tree={nav.tree}
                total={nav.total}
                prefix={nav.prefix}
                onNavigate={navigateTo}
                selectedCategory={cat.selectedCategory}
                onSelectCategory={cat.setSelectedCategory}
                categoryCounts={cat.categoryCounts}
            />

            <section className="min-w-0 space-y-4">
                <MediaToolbar
                    mode={mode}
                    search={nav.search}
                    onSearchChange={nav.handleSearchChange}
                    onClearSearch={() => nav.setSearch('')}
                    sortBy={nav.sortBy}
                    order={nav.order}
                    onChangeSort={nav.changeSort}
                    onToggleOrder={nav.toggleOrder}
                    view={nav.view}
                    onViewChange={nav.setView}
                    loading={nav.loading}
                    onRefresh={nav.refreshAll}
                    kinds={nav.kinds}
                    onToggleKind={toggleKind}
                    newFolder={sel.newFolder}
                    onNewFolderChange={sel.setNewFolder}
                    onCreateFolder={sel.handleCreateFolder}
                    segmentation={nav.segmentation}
                    searching={nav.searching}
                    resultCount={cat.categorizedFiles.length}
                    onNavigate={navigateTo}
                    selectedCategory={cat.selectedCategory}
                    onSelectCategory={cat.setSelectedCategory}
                    categoryCounts={cat.categoryCounts}
                    groupByCategory={cat.groupByCategory}
                    onToggleGroupBy={() => cat.setGroupByCategory((prev) => !prev)}
                />

                {sel.selection.length > 0 && (
                    <MediaBulkActions
                        mode={mode}
                        selectionCount={sel.selection.length}
                        onCopyUrls={() =>
                            sel.copyToClipboard(
                                sel.selectedObjects.map((file) => file.url).join('\n'),
                                'URLs'
                            )
                        }
                        onCopyPaths={() =>
                            sel.copyToClipboard(
                                sel.selectedObjects.map((file) => file.path).join('\n'),
                                'Chemins'
                            )
                        }
                        moveTarget={sel.moveTarget}
                        onMoveTargetChange={sel.setMoveTarget}
                        onMove={sel.handleMove}
                        onTrash={() => sel.handleDelete(false)}
                        onDeletePermanent={() => sel.handleDelete(true)}
                        selectedReferences={sel.selectedReferences}
                        onClearSelection={() => sel.setSelection([])}
                    />
                )}

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
                    <MediaBrowser
                        mode={mode}
                        prefix={nav.prefix}
                        folders={nav.folders}
                        onNavigate={navigateTo}
                        searching={nav.searching}
                        loading={nav.loading}
                        visibleFiles={cat.categorizedFiles}
                        view={nav.view}
                        selectionSet={sel.selectionSet}
                        onToggleSelect={sel.toggleSelect}
                        onTogglePath={togglePath}
                        onOpenDetail={(file) => void sel.openDetail(file)}
                        references={sel.references}
                        usageIndex={nav.usageIndex}
                        onPick={pickUrl}
                        kindsCount={nav.kinds.length}
                        catalogueLoading={nav.catalogueLoading}
                        uploading={sel.uploading}
                        uploadCount={sel.uploadCount}
                        dragActive={sel.dragActive}
                        onDragActiveChange={sel.setDragActive}
                        onUpload={(files) => void sel.handleUpload(files)}
                        upload={sel.upload}
                        hasMore={nav.hasMore}
                        loadingMore={nav.loadingMore}
                        onLoadMore={() =>
                            void nav.loadFolder(nav.prefix, { append: true, offset: nav.offset })
                        }
                        groupByCategory={cat.groupByCategory}
                        groups={cat.groups}
                        categoryOf={cat.getFileCategory}
                    />
                    <MediaDetailPanel
                        detail={nav.detail}
                        references={sel.references}
                        detailReferences={sel.detailReferences}
                        usageItem={nav.detail && nav.usageIndex ? nav.usageIndex[nav.detail.path] : null}
                        mode={mode}
                        onCopy={sel.copyToClipboard}
                        onPick={pickUrl}
                        category={nav.detail ? cat.getFileCategory(nav.detail) : undefined}
                        onUpdateCategory={(newCat) =>
                            nav.detail && void cat.updateCategory(nav.detail.path, newCat)
                        }
                        onTrash={() => {
                            const file = nav.detail;
                            if (!file) return;
                            void sel.handleDelete(false, [file.path]);
                        }}
                    />
                </div>
            </section>
        </div>
    );
};
