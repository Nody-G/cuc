'use client';

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
    ArrowUpDown,
    Check,
    ChevronRight,
    Copy,
    Download,
    ExternalLink,
    FileText,
    Film,
    FolderPlus,
    FolderTree,
    Grid2X2,
    HardDrive,
    Image as ImageIcon,
    Info,
    List as ListIcon,
    RefreshCw,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import {
    createMediaFolder,
    deleteMediaObjects,
    getMediaReferences,
    listMediaFolder,
    listMediaFiles,
    listMediaTree,
    moveMediaObjects,
    uploadMediaFile,
} from '@/app/(admin)/admin/actions';
import {
    basename,
    filterMedia,
    formatBytes,
    folderLabel,
    type MediaFolderStat,
    type MediaKind,
    type MediaObject,
} from '@/app/(admin)/admin/media-shared';

const PAGE_SIZE = 60;
const CATALOGUE_LIMIT = 400;

type ExplorerView = 'grid' | 'list';

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

const KIND_ICON: Record<MediaKind, React.ComponentType<{ className?: string }>> = {
    image: ImageIcon,
    video: Film,
    document: FileText,
    other: HardDrive,
};

const KIND_LABEL: Record<MediaKind, string> = {
    image: 'Images',
    video: 'Vidéos',
    document: 'Documents',
    other: 'Autres',
};

/**
 * Explorateur de la médiathèque Storage (bucket public `cuc-vitrine-assets`).
 *
 * Un seul composant pour deux usages : l'onglet Médiathèque du Cockpit et le
 * sélecteur d'image des vues éditoriales. Le serveur fait le travail lourd
 * (parcours récursif, agrégats, index d'usage) ; ici on gère la navigation, la
 * sélection et les actions groupées.
 */
export const MediaExplorer: React.FC<MediaExplorerProps> = ({
    mode = 'manage',
    showToast,
    onSelect,
    acceptKinds,
    hiddenPrefixes = ['_trash'],
}) => {
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

    const [selection, setSelection] = useState<string[]>([]);
    const lastClickedRef = useRef<string | null>(null);
    const [detail, setDetail] = useState<MediaObject | null>(null);

    const [references, setReferences] = useState<Record<string, string[]> | null>(null);
    const [moveTarget, setMoveTarget] = useState('');
    const [newFolder, setNewFolder] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
    const [dragActive, setDragActive] = useState(false);

    const isHidden = useCallback(
        (path: string) => hiddenPrefixes.some((hidden) => path === hidden || path.startsWith(`${hidden}/`)),
        [hiddenPrefixes]
    );

    /* ------------------------------------------------------------------ *
     * Chargements
     * ------------------------------------------------------------------ */

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
    // `react-hooks/set-state-in-effect` interdit pendant la phase synchrone de
    // l'effet (rendu en cascade évité).
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
     * sous-dossiers). Les réinitialisations de sélection vivent ici plutôt que
     * dans un effet, pour ne pas re-rendre en cascade.
     */
    const navigateTo = useCallback(
        (target: string) => {
            setPrefix(target);
            setSelection([]);
            setMoveTarget('');
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

    /** Panneau détail : l'index d'usage est résolu à la première ouverture. */
    const openDetail = useCallback(
        async (file: MediaObject) => {
            setDetail(file);
            if (references) return;
            const res = await getMediaReferences();
            setReferences(res.success ? res.references : {});
        },
        [references]
    );

    /* ------------------------------------------------------------------ *
     * Sélection et actions
     * ------------------------------------------------------------------ */

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

    const selectionSet = useMemo(() => new Set(selection), [selection]);

    const toggleSelect = (file: MediaObject, event: React.MouseEvent) => {
        const list = visibleFiles;
        if (event.shiftKey && lastClickedRef.current) {
            const from = list.findIndex((item) => item.path === lastClickedRef.current);
            const to = list.findIndex((item) => item.path === file.path);
            if (from !== -1 && to !== -1) {
                const [start, end] = from < to ? [from, to] : [to, from];
                const range = list.slice(start, end + 1).map((item) => item.path);
                setSelection((prev) => [...new Set([...prev, ...range])]);
                return;
            }
        }
        lastClickedRef.current = file.path;
        if (event.metaKey || event.ctrlKey || selection.length === 0) {
            setSelection((prev) =>
                prev.includes(file.path) ? prev.filter((path) => path !== file.path) : [...prev, file.path]
            );
            return;
        }
        setSelection([file.path]);
    };

    const selectedObjects = useMemo(
        () => visibleFiles.filter((file) => selectionSet.has(file.path)),
        [visibleFiles, selectionSet]
    );

    const selectedReferences = useMemo(() => {
        if (!references) return 0;
        return selectedObjects.reduce((count, file) => count + (references[file.path]?.length ?? 0), 0);
    }, [references, selectedObjects]);

    const copyToClipboard = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            showToast(`${label} copié dans le presse-papier`);
        } catch {
            showToast('Copie impossible (navigateur)');
        }
    };

    const handleUpload = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        setUploadCount({ done: 0, total: fileList.length });

        let done = 0;
        for (const file of Array.from(fileList)) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', prefix || 'uploads');
            const res = await uploadMediaFile(formData);
            if (res.success) done += 1;
            setUploadCount({ done, total: fileList.length });
        }

        setUploading(false);
        showToast(`${done}/${fileList.length} fichier(s) téléversé(s) dans ${prefix || 'uploads'}`);
        setCatalogue(null);
        await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
    };

    const handleCreateFolder = async () => {
        const name = newFolder.trim();
        if (!name) return;
        const path = prefix ? `${prefix}/${name}` : name;
        const res = await createMediaFolder(path);
        if (res.success) {
            showToast(`Dossier « ${path} » créé`);
            setNewFolder('');
            await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
        } else {
            showToast(res.error || 'Création impossible');
        }
    };

    const handleMove = async () => {
        if (!selection.length) return;
        const target = moveTarget.trim();
        if (!target) {
            showToast('Indiquez un dossier de destination');
            return;
        }
        const res = await moveMediaObjects(selection, target);
        if (res.success) {
            showToast(`${res.moved ?? 0} fichier(s) déplacé(s) vers ${target}`);
            setSelection([]);
            setMoveTarget('');
            setCatalogue(null);
            await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
        } else {
            showToast(res.error || 'Déplacement impossible');
        }
    };

    const handleDelete = async (permanent: boolean) => {
        if (!selection.length) return;
        const names = selectedObjects.map((file) => basename(file.path)).slice(0, 3).join(', ');
        const suffix = selectedObjects.length > 3 ? ` (+${selectedObjects.length - 3})` : '';

        const message = permanent
            ? `Supprimer DÉFINITIVEMENT ${selection.length} fichier(s) : ${names}${suffix} ?`
            : `Mettre ${selection.length} fichier(s) à la corbeille (_trash) : ${names}${suffix} ?`;
        const warning =
            selectedReferences > 0
                ? `\n\n⚠️ ${selectedReferences} référence(s) en base pointent vers ces fichiers : le site affichera une image cassée.`
                : '';
        if (!confirm(`${message}${warning}`)) return;

        const res = await deleteMediaObjects(selection, { permanent });
        if (res.success) {
            showToast(
                permanent
                    ? `${res.deleted ?? 0} fichier(s) supprimé(s) définitivement`
                    : `${res.trashed ?? 0} fichier(s) déplacé(s) dans ${res.trashFolder}`
            );
            setSelection([]);
            setDetail(null);
            setCatalogue(null);
            await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
        } else {
            showToast(res.error || 'Suppression impossible');
        }
    };

    const segmentation = useMemo(() => prefix.split('/').filter(Boolean), [prefix]);

    const detailReferences = detail ? references?.[detail.path] ?? [] : [];

    /* ------------------------------------------------------------------ *
     * Rendu
     * ------------------------------------------------------------------ */

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-5">
            {/* Arborescence */}
            <aside className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 h-fit lg:sticky lg:top-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-3">
                    <FolderTree className="w-3.5 h-3.5" /> Dossiers
                </div>
                <button
                    type="button"
                    onClick={() => navigateTo('')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${prefix === '' ? 'bg-[#FFE500]/10 text-[#FFE500]' : 'text-gray-300 hover:bg-white/5'
                        }`}
                >
                    <span className="flex items-center justify-between gap-2">
                        <span className="font-bold">Racine</span>
                        <span className="text-[10px] text-gray-500 font-mono">{total.files}</span>
                    </span>
                </button>

                <div className="mt-1 space-y-0.5">
                    {tree.map((folder) => (
                        <button
                            key={folder.path}
                            type="button"
                            onClick={() => navigateTo(folder.path)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${prefix === folder.path
                                ? 'bg-[#FFE500]/10 text-[#FFE500]'
                                : 'text-gray-300 hover:bg-white/5'
                                }`}
                            title={folder.path}
                        >
                            <span className="flex items-center justify-between gap-2">
                                <span className="truncate">{folderLabel(folder.path)}</span>
                                <span className="text-[10px] text-gray-500 font-mono shrink-0">{folder.files}</span>
                            </span>
                            <span className="block text-[10px] text-gray-500 font-mono">
                                {formatBytes(folder.bytes)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400 space-y-1">
                    <div className="flex items-center justify-between">
                        <span>Objets</span>
                        <span className="text-gray-200">{total.files}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Poids</span>
                        <span className="text-gray-200">{formatBytes(total.bytes)}</span>
                    </div>
                </div>
            </aside>

            <section className="min-w-0 space-y-4">
                {/* Barre d'outils */}
                <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 space-y-3">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                        <div className="relative flex-1 min-w-0">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => handleSearchChange(event.target.value)}
                                placeholder="Rechercher dans tout le bucket (nom, dossier)…"
                                className="w-full bg-black/60 border border-white/15 rounded-lg pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    aria-label="Effacer la recherche"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={changeSort}
                                className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-200 flex items-center gap-1.5"
                                title="Changer le critère de tri"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {sortBy === 'name' ? 'Nom' : sortBy === 'created_at' ? 'Date' : 'Poids'}
                            </button>
                            <button
                                type="button"
                                onClick={toggleOrder}
                                className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-200"
                                title="Inverser l'ordre"
                            >
                                {order === 'asc' ? 'A→Z' : 'Z→A'}
                            </button>
                            <div className="flex items-center rounded-lg bg-white/5 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setView('grid')}
                                    className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#FFE500] text-black' : 'text-gray-300'}`}
                                    aria-label="Vue grille"
                                >
                                    <Grid2X2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className={`p-1.5 rounded ${view === 'list' ? 'bg-[#FFE500] text-black' : 'text-gray-300'}`}
                                    aria-label="Vue liste"
                                >
                                    <ListIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={refreshAll}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-[#FFE500]"
                                title="Rafraîchir"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filtres par type + actions de dossier */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {(Object.keys(KIND_LABEL) as MediaKind[]).map((kind) => {
                            const Icon = KIND_ICON[kind];
                            const active = kinds.includes(kind);
                            return (
                                <button
                                    key={kind}
                                    type="button"
                                    onClick={() =>
                                        setKinds((prev) =>
                                            prev.includes(kind) ? prev.filter((item) => item !== kind) : [...prev, kind]
                                        )
                                    }
                                    className={`px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors ${active
                                        ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10'
                                        : 'border-white/10 text-gray-300 hover:border-white/30'
                                        }`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {KIND_LABEL[kind]}
                                </button>
                            );
                        })}

                        {mode === 'manage' && (
                            <div className="flex items-center gap-2 ml-auto">
                                <input
                                    value={newFolder}
                                    onChange={(event) => setNewFolder(event.target.value)}
                                    placeholder="nouveau-dossier"
                                    className="w-36 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateFolder}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 flex items-center gap-1.5"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" /> Créer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Fil d'Ariane */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 flex-wrap">
                        <button type="button" onClick={() => navigateTo('')} className="hover:text-[#FFE500]">
                            cuc-vitrine-assets
                        </button>
                        {segmentation.map((segment, index) => {
                            const path = segmentation.slice(0, index + 1).join('/');
                            return (
                                <React.Fragment key={path}>
                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                    <button
                                        type="button"
                                        onClick={() => navigateTo(path)}
                                        className={index === segmentation.length - 1 ? 'text-gray-200' : 'hover:text-[#FFE500]'}
                                    >
                                        {segment}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                        {searching && (
                            <span className="ml-2 text-[#FFE500]">
                                · recherche globale ({visibleFiles.length} résultat(s))
                            </span>
                        )}
                    </div>
                </div>

                {/* Barre d'actions groupées */}
                {selection.length > 0 && (
                    <div className="bg-[#12121A] border border-[#FFE500]/40 rounded-xl p-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-mono text-[#FFE500] mr-1">{selection.length} sélectionné(s)</span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(selectedObjects.map((file) => file.url).join('\n'), 'URLs')}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 flex items-center gap-1.5"
                        >
                            <Copy className="w-3.5 h-3.5" /> URLs
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                copyToClipboard(selectedObjects.map((file) => file.path).join('\n'), 'Chemins')
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
                        >
                            Chemins
                        </button>
                        {mode === 'manage' && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        value={moveTarget}
                                        onChange={(event) => setMoveTarget(event.target.value)}
                                        placeholder="dossier/destination"
                                        className="w-40 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMove}
                                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200"
                                    >
                                        Déplacer
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(false)}
                                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Corbeille
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(true)}
                                    className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200"
                                >
                                    Effacer définitivement
                                </button>
                            </>
                        )}
                        {selectedReferences > 0 && (
                            <span className="text-amber-300 font-mono">
                                ⚠️ {selectedReferences} référence(s) en base
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => setSelection([])}
                            className="ml-auto px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                        >
                            Tout désélectionner
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
                    <div className="min-w-0 space-y-4">
                        {/* Zone de dépôt */}
                        {mode === 'manage' && (
                            <label
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setDragActive(false);
                                    void handleUpload(event.dataTransfer.files);
                                }}
                                className={`flex items-center justify-center gap-3 border border-dashed rounded-xl px-4 py-3 text-xs cursor-pointer transition-colors ${dragActive
                                    ? 'border-[#FFE500] bg-[#FFE500]/5 text-[#FFE500]'
                                    : 'border-white/15 text-gray-400 hover:border-white/30'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                {uploading ? (
                                    <span className="font-mono">
                                        Téléversement {uploadCount.done}/{uploadCount.total}…
                                    </span>
                                ) : (
                                    <span>
                                        Glissez vos fichiers ici pour les déposer dans{' '}
                                        <strong className="text-gray-200">{prefix || 'uploads'}</strong>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(event) => void handleUpload(event.target.files)}
                                />
                            </label>
                        )}

                        {/* Sous-dossiers */}
                        {!searching && folders.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.path}
                                        type="button"
                                        onClick={() => navigateTo(folder.path)}
                                        className="px-3 py-2 rounded-lg bg-[#0D0D12] border border-white/10 hover:border-[#FFE500]/60 text-xs text-gray-200 flex items-center gap-2"
                                    >
                                        <FolderTree className="w-3.5 h-3.5 text-[#FFE500]" />
                                        {folder.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Grille / liste */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div key={index} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : visibleFiles.length === 0 ? (
                            <div className="border border-white/10 rounded-xl p-10 text-center text-sm text-gray-400">
                                {searching || kinds.length || catalogueLoading
                                    ? 'Aucun média ne correspond à ces critères.'
                                    : 'Ce dossier est vide — déposez des fichiers ou créez un dossier.'}
                            </div>
                        ) : view === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {visibleFiles.map((file) => (
                                    <MediaTile
                                        key={file.path}
                                        file={file}
                                        selected={selectionSet.has(file.path)}
                                        onToggle={toggleSelect}
                                        onOpen={setDetail}
                                        referenceCount={references?.[file.path]?.length ?? 0}
                                        mode={mode}
                                        onPick={(url) => onSelect?.(url)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                                {visibleFiles.map((file) => {
                                    const Icon = KIND_ICON[file.kind];
                                    const selected = selectionSet.has(file.path);
                                    return (
                                        <div
                                            key={file.path}
                                            className={`flex items-center gap-3 px-3 py-2 text-xs ${selected ? 'bg-[#FFE500]/5' : 'hover:bg-white/[0.03]'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => {
                                                    setSelection((prev) =>
                                                        prev.includes(file.path)
                                                            ? prev.filter((path) => path !== file.path)
                                                            : [...prev, file.path]
                                                    );
                                                }}
                                                className="accent-[#FFE500]"
                                            />
                                            <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <button
                                                type="button"
                                                onClick={() => void openDetail(file)}
                                                className="flex-1 min-w-0 text-left"
                                            >
                                                <span className="block truncate text-gray-200">{file.name}</span>
                                                <span className="block truncate text-[10px] font-mono text-gray-500">
                                                    {file.folder || 'racine'}
                                                </span>
                                            </button>
                                            {(references?.[file.path]?.length ?? 0) > 0 && (
                                                <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                                                    utilisé · {references?.[file.path]?.length}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono text-gray-400 w-16 text-right shrink-0">
                                                {formatBytes(file.size)}
                                            </span>
                                            {mode === 'pick' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSelect?.(file.url)}
                                                    className="px-2 py-1 rounded bg-[#FFE500] text-black font-bold text-[10px] uppercase"
                                                >
                                                    Choisir
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {hasMore && !searching && (
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => void loadFolder(prefix, { append: true, offset })}
                                    disabled={loadingMore}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-200 disabled:opacity-50"
                                >
                                    {loadingMore ? 'Chargement…' : `Charger ${PAGE_SIZE} objets de plus`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Panneau détail */}
                    <aside className="bg-[#0D0D12] border border-white/10 rounded-xl p-3 h-fit xl:sticky xl:top-4">
                        {!detail ? (
                            <div className="text-xs text-gray-400 flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>
                                    Sélectionnez un média pour voir son aperçu, son poids, son chemin et les
                                    ressources qui l'utilisent.
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                                    {detail.kind === 'image' ? (
                                        <Image
                                            src={detail.url}
                                            alt={detail.name}
                                            fill
                                            sizes="300px"
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            {React.createElement(KIND_ICON[detail.kind], { className: 'w-8 h-8' })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-white break-all">{detail.name}</div>
                                    <div className="text-[10px] font-mono text-gray-400 break-all">{detail.path}</div>
                                </div>

                                <dl className="text-[11px] font-mono text-gray-300 space-y-1">
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-gray-500">Poids</dt>
                                        <dd>{formatBytes(detail.size)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-gray-500">Type</dt>
                                        <dd className="truncate">{detail.mimetype || detail.kind}</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="text-gray-500">Ajouté le</dt>
                                        <dd>
                                            {detail.createdAt
                                                ? new Date(detail.createdAt).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="text-[11px]">
                                    {references === null ? (
                                        <span className="text-gray-500 font-mono">Vérification de l'usage…</span>
                                    ) : detailReferences.length > 0 ? (
                                        <span className="text-emerald-300 font-mono">
                                            Utilisé par : {detailReferences.join(', ')}
                                        </span>
                                    ) : (
                                        <span className="text-amber-300 font-mono">Aucune référence en base</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(detail.url, 'URL publique')}
                                        className="w-full px-3 py-2 rounded-lg bg-[#FFE500] text-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Copier l'URL publique
                                    </button>
                                    {mode === 'pick' && (
                                        <button
                                            type="button"
                                            onClick={() => onSelect?.(detail.url)}
                                            className="w-full px-3 py-2 rounded-lg bg-emerald-500 text-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Utiliser cette image
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(detail.path, 'Chemin')}
                                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px]"
                                        >
                                            Chemin
                                        </button>
                                        <a
                                            href={detail.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] flex items-center justify-center gap-1.5"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
                                        </a>
                                        <a
                                            href={detail.url}
                                            download
                                            className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] flex items-center justify-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Télécharger
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelection([detail.path]);
                                                void handleDelete(false);
                                            }}
                                            className="px-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px]"
                                        >
                                            Corbeille
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </div>
    );
};

/* ------------------------------------------------------------------ *
 * Vignette
 * ------------------------------------------------------------------ */

interface MediaTileProps {
    file: MediaObject;
    selected: boolean;
    referenceCount: number;
    mode: 'manage' | 'pick';
    onToggle: (file: MediaObject, event: React.MouseEvent) => void;
    onOpen: (file: MediaObject) => void;
    onPick: (url: string) => void;
}

const MediaTile: React.FC<MediaTileProps> = ({
    file,
    selected,
    referenceCount,
    mode,
    onToggle,
    onOpen,
    onPick,
}) => {
    const Icon = KIND_ICON[file.kind];
    const [failed, setFailed] = useState(false);
    const showImage = file.kind === 'image' && !failed;

    return (
        <div
            className={`group bg-[#0D0D12] border rounded-xl overflow-hidden flex flex-col transition-colors ${selected ? 'border-[#FFE500]' : 'border-white/10 hover:border-white/30'
                }`}
        >
            <button
                type="button"
                onClick={(event) => onToggle(file, event)}
                onDoubleClick={() => onOpen(file)}
                className="relative aspect-square w-full bg-black/60 overflow-hidden"
                title={`${file.name} — clic : sélectionner · double-clic : détails`}
            >
                {showImage ? (
                    <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-500">
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-mono uppercase">{file.kind}</span>
                    </div>
                )}
                {selected && (
                    <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#FFE500] text-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                    </span>
                )}
                {referenceCount > 0 && (
                    <span
                        className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-300"
                        title={`Utilisé par ${referenceCount} ressource(s)`}
                    >
                        utilisé · {referenceCount}
                    </span>
                )}
            </button>

            <div className="p-2 space-y-1 min-w-0">
                <div className="text-[11px] text-gray-200 truncate" title={file.path}>
                    {file.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{formatBytes(file.size)}</span>
                    <button
                        type="button"
                        onClick={() => onOpen(file)}
                        className="hover:text-[#FFE500] flex items-center gap-1"
                    >
                        <Info className="w-3 h-3" /> détail
                    </button>
                </div>
                {mode === 'pick' && (
                    <button
                        type="button"
                        onClick={() => onPick(file.url)}
                        className="w-full mt-1 px-2 py-1.5 rounded bg-[#FFE500] text-black text-[10px] font-bold uppercase tracking-wider"
                    >
                        Choisir
                    </button>
                )}
            </div>
        </div>
    );
};
