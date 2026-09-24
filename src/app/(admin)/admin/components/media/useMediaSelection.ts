'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    createMediaFolder,
    deleteMediaObjects,
    getMediaReferences,
    moveMediaObjects,
    uploadMediaFile,
} from '@/app/(admin)/admin/actions';
import { type MediaObject } from '@/app/(admin)/admin/media-shared';
import {
    countReferences,
    removePaths,
    resolveDeleteTargets,
    summarizeDeleteTargets,
} from '@/lib/media-library/media-selection';

export interface UseMediaSelectionArgs {
    /** Fichiers réellement affichés (recherche et filtres appliqués). */
    visibleFiles: MediaObject[];
    prefix: string;
    detail: MediaObject | null;
    setDetail: (file: MediaObject | null) => void;
    loadFolder: (
        targetPrefix: string,
        options?: {
            append?: boolean;
            offset?: number;
            sortBy?: 'name' | 'created_at' | 'size';
            order?: 'asc' | 'desc';
        }
    ) => Promise<void>;
    refreshTree: () => Promise<void>;
    resetCatalogue: () => void;
    showToast: (message: string) => void;
}

/**
 * Sélection multiple et actions de la médiathèque : téléversement, création de
 * dossier, déplacement, corbeille/suppression définitive, usage en base.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — chaque action persiste
 * via les Server Actions puis recharge dossier et arborescence.
 */
export function useMediaSelection({
    visibleFiles,
    prefix,
    detail,
    setDetail,
    loadFolder,
    refreshTree,
    resetCatalogue,
    showToast,
}: UseMediaSelectionArgs) {
    const [selection, setSelection] = useState<string[]>([]);
    const lastClickedRef = useRef<string | null>(null);

    const [references, setReferences] = useState<Record<string, string[]> | null>(null);
    const [moveTarget, setMoveTarget] = useState('');
    const [newFolder, setNewFolder] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
    const [dragActive, setDragActive] = useState(false);

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
        resetCatalogue();
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
            resetCatalogue();
            await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
        } else {
            showToast(res.error || 'Déplacement impossible');
        }
    };

    /**
     * Suppression (corbeille ou définitive).
     *
     * `explicitPaths` permet au panneau détail de viser **sa** fiche sans
     * dépendre de `setSelection` : la sélection du rendu précédent était vide au
     * premier clic, donc la corbeille du détail ne supprimait qu'au second
     * (défaut corrigé le 2026-09-24).
     */
    const handleDelete = async (permanent: boolean, explicitPaths?: string[]) => {
        const targets = resolveDeleteTargets(selection, explicitPaths);
        if (targets.length === 0) return;

        const { count, names, suffix } = summarizeDeleteTargets(targets);
        const referencesToDelete = countReferences(targets, references);

        const message = permanent
            ? `Supprimer DÉFINITIVEMENT ${count} fichier(s) : ${names}${suffix} ?`
            : `Mettre ${count} fichier(s) à la corbeille (_trash) : ${names}${suffix} ?`;
        const warning =
            referencesToDelete > 0
                ? `\n\n⚠️ ${referencesToDelete} référence(s) en base pointent vers ces fichiers : le site affichera une image cassée.`
                : '';
        if (!confirm(`${message}${warning}`)) return;

        const res = await deleteMediaObjects(targets, { permanent });
        if (res.success) {
            showToast(
                permanent
                    ? `${res.deleted ?? 0} fichier(s) supprimé(s) définitivement`
                    : `${res.trashed ?? 0} fichier(s) déplacé(s) dans ${res.trashFolder}`
            );
            setSelection((prev) => removePaths(prev, targets));
            setDetail(null);
            resetCatalogue();
            await Promise.all([loadFolder(prefix, { offset: 0 }), refreshTree()]);
        } else {
            showToast(res.error || 'Suppression impossible');
        }
    };

    /** Panneau détail : l'index d'usage est résolu à la première ouverture. */
    const openDetail = useCallback(
        async (file: MediaObject) => {
            setDetail(file);
            if (references) return;
            const res = await getMediaReferences();
            setReferences(res.success ? res.references : {});
        },
        [references, setDetail]
    );

    const detailReferences = detail ? references?.[detail.path] ?? [] : [];

    return {
        selection,
        setSelection,
        selectionSet,
        toggleSelect,
        selectedObjects,
        selectedReferences,
        references,
        copyToClipboard,
        moveTarget,
        setMoveTarget,
        newFolder,
        setNewFolder,
        handleCreateFolder,
        handleMove,
        handleDelete,
        uploading,
        uploadCount,
        dragActive,
        setDragActive,
        handleUpload,
        openDetail,
        detailReferences,
    };
}
