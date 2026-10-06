'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { getMediaReferences, listMediaFiles, listMediaFolder, listMediaTree } from '@/app/(admin)/admin/actions';
import {
    filterMedia,
    type MediaFolderStat,
    type MediaKind,
    type MediaObject,
    type MediaSortCriterion,
} from '@/app/(admin)/admin/media-shared';
import { sortMediaByUsage, type MediaUsageIndex } from '@/lib/media-library/media-usage';
import { PAGE_SIZE, type ExplorerView } from './media-explorer-shared';

export interface UseMediaNavigationArgs {
    mode: 'manage' | 'pick';
    acceptKinds?: MediaKind[];
    hiddenPrefixes: string[];
    showToast: (message: string) => void;
}

/**
 * Navigation de la médiathèque : arborescence, parcours de dossier, recherche
 * globale différée, tri, filtres de nature et état d'affichage.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : le serveur fait le
 * travail lourd, ici on ne fait que piloter et dériver (`visibleFiles`).
 */
export function useMediaNavigation({
    mode,
    acceptKinds,
    hiddenPrefixes,
    showToast,
}: UseMediaNavigationArgs) {
    const [prefix, setPrefix] = useState('');
    const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
    const [files, setFiles] = useState<MediaObject[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [tree, setTree] = useState<MediaFolderStat[]>([]);
    const [total, setTotal] = useState({ files: 0, bytes: 0 });

    const [search, setSearch] = useState('');
    const deferredSearch = useDeferredValue(search);
    const [catalogue, setCatalogue] = useState<MediaObject[] | null>(null);
    const [catalogueLoading, setCatalogueLoading] = useState(false);

    const [kinds, setKinds] = useState<MediaKind[]>([]);
    const [sortBy, setSortBy] = useState<MediaSortCriterion>('name');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [view, setView] = useState<ExplorerView>('grid');

    const [usageIndex, setUsageIndex] = useState<MediaUsageIndex | null>(null);
    const [references, setReferences] = useState<Record<string, string[]> | null>(null);

    /** Fichier ouvert dans le panneau détail (état de navigation). */
    const [detail, setDetail] = useState<MediaObject | null>(null);

    const isHidden = useCallback(
        (path: string) => hiddenPrefixes.some((hidden) => path === hidden || path.startsWith(`${hidden}/`)),
        [hiddenPrefixes]
    );

    const refreshTree = useCallback(async () => {
        // `await` initial : aucun setState pendant la phase synchrone d'un effet
        // (règle `react-hooks/set-state-in-effect`), et rendu jamais bloqué.
        try {
            await Promise.resolve();
            const res = await listMediaTree();
            if (res.success) {
                setTree(res.tree.filter((folder) => folder.path && !isHidden(folder.path)));
                setTotal({ files: res.totalFiles, bytes: res.totalBytes });
            }
        } catch {
            /* tolérant aux incidents réseau passagers */
        }
    }, [isHidden]);

    const loadFolder = useCallback(
        async (
            targetPrefix: string,
            options: {
                append?: boolean;
                offset?: number;
                sortBy?: 'name' | 'created_at' | 'size';
                order?: 'asc' | 'desc';
            } = {}
        ) => {
            await Promise.resolve();
            const isAppend = options.append === true;
            if (isAppend) setLoadingMore(true);
            else setLoading(true);

            const activeSort = options.sortBy ?? sortBy;
            const storageSort = activeSort === 'usage' ? 'name' : activeSort;

            try {
                if (targetPrefix === '') {
                    // À la racine, s'il n'y a pas de fichiers directs (tous les médias sont rangés
                    // dans des sous-dossiers), on charge l'ensemble des fichiers via listMediaFiles()
                    // pour que l'utilisateur voie directement tous les médias disponibles au lieu
                    // d'un dossier vide déroutant.
                    const [folderRes, allFilesRes] = await Promise.all([
                        listMediaFolder({
                            prefix: '',
                            sortBy: storageSort,
                            order: options.order ?? order,
                            limit: PAGE_SIZE,
                            offset: options.offset ?? 0,
                        }),
                        listMediaFiles(),
                    ]);

                    if (folderRes.success) {
                        setFolders(folderRes.folders.filter((folder) => !isHidden(folder.path)));
                        const filesToShow = (
                            folderRes.files.length > 0
                                ? folderRes.files
                                : (allFilesRes.success ? allFilesRes.files : [])
                        ) as MediaObject[];
                        setFiles(filesToShow);
                        setOffset(filesToShow.length);
                        setHasMore(false);
                        if (!isAppend) setDetail(null);
                    } else {
                        showToast(folderRes.error || 'Erreur de chargement du dossier');
                    }
                } else {
                    const res = await listMediaFolder({
                        prefix: targetPrefix,
                        sortBy: storageSort,
                        order: options.order ?? order,
                        limit: PAGE_SIZE,
                        offset: options.offset ?? 0,
                    });

                    if (res.success) {
                        setFolders(res.folders.filter((folder) => !isHidden(folder.path)));
                        setFiles((prev) => (isAppend ? [...prev, ...res.files] : res.files));
                        setOffset(res.nextOffset);
                        setHasMore(res.hasMore);
                        if (!isAppend) setDetail(null);
                    } else {
                        showToast(res.error || 'Erreur de chargement du dossier');
                    }
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erreur de chargement';
                showToast(message);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [isHidden, order, showToast, sortBy]
    );

    const refreshUsage = useCallback(async () => {
        try {
            const res = await getMediaReferences();
            if (res.success) {
                setUsageIndex(res.usageIndex ?? null);
                setReferences(res.references ?? null);
            }
        } catch {
            /* tolérant aux pannes réseau */
        }
    }, []);

    // Chargement initial (arborescence + usage + dossier racine), une seule fois.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void refreshTree();
            void refreshUsage();
            void loadFolder('', { offset: 0 });
        }, 0);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Navigation : point d'entrée unique (arborescence, fil d'Ariane,
     * sous-dossiers). Les réinitialisations vivent ici plutôt que dans un
     * effet, pour ne pas re-rendre en cascade.
     */
    const navigateTo = useCallback(
        (target: string) => {
            setPrefix(target);
            setDetail(null);
            void loadFolder(target, { offset: 0 });
        },
        [loadFolder]
    );

    const changeSort = () => {
        const next: MediaSortCriterion =
            sortBy === 'name' ? 'created_at' : sortBy === 'created_at' ? 'size' : sortBy === 'size' ? 'usage' : 'name';
        setSortBy(next);
        if (next !== 'usage') {
            void loadFolder(prefix, { offset: 0, sortBy: next });
        }
    };

    const toggleOrder = () => {
        const next = order === 'asc' ? 'desc' : 'asc';
        setOrder(next);
        if (sortBy !== 'usage') {
            void loadFolder(prefix, { offset: 0, order: next });
        }
    };

    const refreshAll = () => {
        setCatalogue(null);
        void refreshTree();
        void refreshUsage();
        void loadFolder(prefix, { offset: 0 });
    };

    /** Recherche globale différée : catalogue plat chargé à la première frappe. */
    const loadCatalogue = useCallback(async () => {
        setCatalogueLoading(true);
        try {
            const res = await listMediaFiles();
            if (res.success) setCatalogue(res.files as MediaObject[]);
        } finally {
            setCatalogueLoading(false);
        }
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        if (value.trim().length >= 2 && !catalogue && !catalogueLoading) void loadCatalogue();
    };

    const searching = deferredSearch.trim().length >= 2;

    const visibleFiles = useMemo(() => {
        const source = searching ? catalogue ?? [] : files;
        let filtered = filterMedia(source, {
            query: searching ? deferredSearch : '',
            kinds: kinds.length ? kinds : acceptKinds,
        });
        // En mode sélecteur, on masque les non-images si aucun filtre explicite.
        if (mode === 'pick' && !kinds.length && !acceptKinds?.length) {
            filtered = filtered.filter((file) => file.kind === 'image');
        }
        if (sortBy === 'usage') {
            return sortMediaByUsage(filtered, usageIndex, order);
        }
        return filtered;
    }, [acceptKinds, catalogue, deferredSearch, files, kinds, mode, order, searching, sortBy, usageIndex]);

    const segmentation = useMemo(() => prefix.split('/').filter(Boolean), [prefix]);

    return {
        prefix,
        folders,
        files,
        offset,
        hasMore,
        loading,
        loadingMore,
        tree,
        total,
        search,
        setSearch,
        deferredSearch,
        catalogueLoading,
        kinds,
        setKinds,
        sortBy,
        order,
        view,
        setView,
        detail,
        setDetail,
        usageIndex,
        references,
        refreshUsage,
        navigateTo,
        changeSort,
        toggleOrder,
        refreshAll,
        handleSearchChange,
        loadFolder,
        refreshTree,
        resetCatalogue: () => setCatalogue(null),
        searching,
        visibleFiles,
        segmentation,
    };
}
