'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
    getPageRevisions,
    restorePageRevision,
    deletePageRevision,
    diffPageSnapshots,
    type SitePageRevision,
    type SitePageContent,
    type PageRevisionDiffEntry,
} from '@/lib/data/site-service';

interface UsePageRevisionsArgs {
    slug: string;
    currentContent?: SitePageContent | null;
    onRestored?: (content: SitePageContent) => void;
    showToast: (msg: string) => void;
    defaultCollapsed: boolean;
}

export interface PageRevisionsController {
    collapsed: boolean;
    toggleCollapsed: () => void;
    revisions: SitePageRevision[];
    loading: boolean;
    selectedId: string | null;
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
    compareId: string | null;
    setCompareId: React.Dispatch<React.SetStateAction<string | null>>;
    selected: SitePageRevision | null;
    compared: SitePageRevision | null;
    diff: PageRevisionDiffEntry[];
    handleRestore: (revision: SitePageRevision) => void;
    handleDelete: (revision: SitePageRevision) => void;
}

/**
 * Orchestration de l'historique : chargement par slug, sélection / comparaison
 * et restauration ou suppression d'un instantané.
 */
export function usePageRevisions({
    slug,
    currentContent,
    onRestored,
    showToast,
    defaultCollapsed,
}: UsePageRevisionsArgs): PageRevisionsController {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [revisions, setRevisions] = useState<SitePageRevision[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [compareId, setCompareId] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const load = useCallback(async () => {
        setLoading(true);
        const data = await getPageRevisions(slug);
        setRevisions(data);
        setLoading(false);
    }, [slug]);

    useEffect(() => {
        // Chargement des révisions à chaque changement de slug (synchronisation
        // avec la source distante : le setState est intentionnel).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const selected = useMemo(
        () => revisions.find((r) => r.id === selectedId) ?? null,
        [revisions, selectedId]
    );

    const compared = useMemo(
        () => revisions.find((r) => r.id === compareId) ?? null,
        [revisions, compareId]
    );

    const diff: PageRevisionDiffEntry[] = useMemo(() => {
        if (!selected) return [];
        const before = compared ? compared.snapshot : currentContent ?? null;
        return diffPageSnapshots(before, selected.snapshot);
    }, [selected, compared, currentContent]);

    const handleRestore = (revision: SitePageRevision) => {
        if (
            !window.confirm(
                `Restaurer la révision n°${revision.revision_number} ? L'état actuel sera sauvegardé automatiquement avant l'écrasement.`
            )
        ) {
            return;
        }
        startTransition(async () => {
            const restored = await restorePageRevision(revision.id);
            if (restored) {
                showToast(`Révision n°${revision.revision_number} restaurée.`);
                onRestored?.(restored);
                await load();
            } else {
                showToast('Échec de la restauration de la révision.');
            }
        });
    };

    const handleDelete = (revision: SitePageRevision) => {
        if (!window.confirm(`Supprimer définitivement la révision n°${revision.revision_number} ?`)) {
            return;
        }
        startTransition(async () => {
            const ok = await deletePageRevision(revision.id);
            if (ok) {
                showToast('Révision supprimée.');
                if (selectedId === revision.id) setSelectedId(null);
                if (compareId === revision.id) setCompareId(null);
                await load();
            } else {
                showToast('Échec de la suppression de la révision.');
            }
        });
    };

    return {
        collapsed,
        toggleCollapsed: () => setCollapsed((v) => !v),
        revisions,
        loading,
        selectedId,
        setSelectedId,
        compareId,
        setCompareId,
        selected,
        compared,
        diff,
        handleRestore,
        handleDelete,
    };
}
