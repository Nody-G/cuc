'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { listMediaFiles, listMediaFolder, listMediaTree } from '@/app/(admin)/admin/actions';
import {
    filterMedia,
    type MediaFolderStat,
    type MediaKind,
    type MediaObject,
} from '@/app/(admin)/admin/media-shared';
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
    const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'size'>('name');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [view, setView] = useState<ExplorerView>('grid');

    /** Fichier ouvert dans le panneau détail (état de navigation). */
    const [detail, setDetail] = useState<MediaObject | null>(null);

    const isHidden = useCallback(
        (path: string) => hiddenPrefixes.some((hidden) => path === hidden || path.startsWith(`${hidden}/`)),
        [hiddenPrefixes]
    );

    const refreshTree = useCallback(async () => {
        // `await` initial : aucun setState pendant la phase synchrone d'un effet
        // (règle `react-hooks/set-state-in-effect`), et rendu jamais bloqué.
        await Promise.resolve();
        const res = await listMediaTree();
        if (res.success) {
            setTree(res.tree.filter((folder) => folder.path && !isHidden(folder.path)));
            setTotal({ files: res.totalFiles, bytes: res.totalBytes });
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

            const res = await listMediaFolder({
                prefix: targetPrefix,
                sortBy: options.sortBy ?? sortBy,
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

            setLoading(false);
            setLoadingMore(false);
        },
        [isHidden, order, showToast, sortBy]
    );

    // Chargement initial (arborescence + dossier racine), une seule fois.
    // Différé d'une tâche : les chargements posent un état d'attente, ce que
    // `react-hooks/set-state-in-effect` interdit pendant la phase synchrone.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void refreshTree();
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
        const next = sortBy === 'name' ? 'created_at' : sortBy === 'created_at' ? 'size' : 'name';
        setSortBy(next);
        void loadFolder(prefix, { offset: 0, sortBy: next });
    };

    const toggleOrder = () => {
        const next = order === 'asc' ? 'desc' : 'asc';
        setOrder(next);
        void loadFolder(prefix, { offset: 0, order: next });
    };

    const refreshAll = () => {
        setCatalogue(null);
        void refreshTree();
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
        const filtered = filterMedia(source, {
            query: searching ? deferredSearch : '',
            kinds: kinds.length ? kinds : acceptKinds,
        });
        // En mode sélecteur, on masque les non-images si aucun filtre explicite.
        if (mode === 'pick' && !kinds.length && !acceptKinds?.length) {
            return filtered.filter((file) => file.kind === 'image');
        }
        return filtered;
    }, [acceptKinds, catalogue, deferredSearch, files, kinds, mode, searching]);

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
