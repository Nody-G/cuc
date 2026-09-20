'use client';

import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
    History,
    RotateCcw,
    Trash2,
    GitCompare,
    ChevronDown,
    ChevronRight,
    Clock,
    User,
    FileText,
    X,
} from 'lucide-react';
import {
    getPageRevisions,
    restorePageRevision,
    deletePageRevision,
    diffPageSnapshots,
    type SitePageRevision,
    type SitePageContent,
    type PageRevisionDiffEntry,
} from '@/lib/data/site-service';
import {
    CockpitCard,
    CockpitButton,
    CockpitBadge,
    CockpitEmptyState,
    CockpitSkeletonList,
    CockpitIconButton,
    cx,
} from './ui';

export interface PageRevisionsPanelProps {
    /** Slug de la page dont on affiche l'historique. */
    slug: string;
    /** Contenu courant de la page (pour le diff avec la version sélectionnée). */
    currentContent?: SitePageContent | null;
    /** Callback appelé après une restauration réussie. */
    onRestored?: (content: SitePageContent) => void;
    /** Notifications Cockpit. */
    showToast: (msg: string) => void;
    /** Panneau replié par défaut ? */
    defaultCollapsed?: boolean;
}

const STATUS_LABELS: Record<SitePageRevision['status'], string> = {
    draft: 'Brouillon',
    published: 'Publiée',
    archived: 'Archivée',
};

const STATUS_TONES: Record<SitePageRevision['status'], 'neutral' | 'success' | 'warning'> = {
    draft: 'warning',
    published: 'success',
    archived: 'neutral',
};

function formatDate(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function summarizeValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'string') {
        return value.length > 80 ? `${value.slice(0, 80)}…` : value || '—';
    }
    if (Array.isArray(value)) return `${value.length} élément(s)`;
    if (typeof value === 'object') return 'Objet modifié';
    return String(value);
}

const FIELD_LABELS: Record<string, string> = {
    title: 'Titre',
    meta_title: 'Meta titre',
    meta_description: 'Meta description',
    og_image: 'Image OG',
    hero: 'Hero',
    sections: 'Sections',
    is_published: 'Publiée',
};

export const PageRevisionsPanel: React.FC<PageRevisionsPanelProps> = ({
    slug,
    currentContent,
    onRestored,
    showToast,
    defaultCollapsed = false,
}) => {
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

    return (
        <CockpitCard className="overflow-hidden">
            <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
                <span className="flex items-center gap-2.5 min-w-0">
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <History className="w-4 h-4 text-[#FFE500] shrink-0" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gray-300">
                        Historique des versions
                    </span>
                    {!loading && revisions.length > 0 && (
                        <span className="text-[10px] font-mono text-gray-500">
                            ({revisions.length})
                        </span>
                    )}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 shrink-0">
                    {collapsed ? 'Afficher' : 'Masquer'}
                </span>
            </button>

            {!collapsed && (
                <div className="border-t border-white/10">
                    {loading ? (
                        <div className="p-4">
                            <CockpitSkeletonList rows={3} />
                        </div>
                    ) : revisions.length === 0 ? (
                        <div className="p-4">
                            <CockpitEmptyState
                                icon={History}
                                title="Aucune version enregistrée"
                                description="Un instantané est créé automatiquement avant chaque modification de la page. Publiez une première modification pour amorcer l'historique."
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                            {/* Liste des révisions */}
                            <ul className="max-h-[26rem] overflow-y-auto divide-y divide-white/5">
                                {revisions.map((rev) => {
                                    const isSelected = rev.id === selectedId;
                                    const isCompared = rev.id === compareId;
                                    return (
                                        <li
                                            key={rev.id}
                                            className={cx(
                                                'px-4 py-3 transition-colors',
                                                isSelected ? 'bg-[#FFE500]/5' : 'hover:bg-white/[0.03]'
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedId(isSelected ? null : rev.id)}
                                                    className="flex-1 min-w-0 text-left cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-bold text-white">
                                                            n°{rev.revision_number}
                                                        </span>
                                                        <CockpitBadge tone={STATUS_TONES[rev.status]}>
                                                            {STATUS_LABELS[rev.status]}
                                                        </CockpitBadge>
                                                    </div>
                                                    {rev.label && (
                                                        <p className="mt-1 text-[11px] text-gray-300 truncate">{rev.label}</p>
                                                    )}
                                                    <div className="mt-1.5 flex items-center gap-3 text-[10px] font-mono text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(rev.created_at)}
                                                        </span>
                                                        {rev.author_name && (
                                                            <span className="flex items-center gap-1 truncate">
                                                                <User className="w-3 h-3" />
                                                                {rev.author_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <CockpitIconButton
                                                        icon={GitCompare}
                                                        label="Comparer avec la version courante"
                                                        tone={isCompared ? 'accent' : 'default'}
                                                        onClick={() => {
                                                            setSelectedId(rev.id);
                                                            setCompareId(isCompared ? null : rev.id);
                                                        }}
                                                    />
                                                    <CockpitIconButton
                                                        icon={RotateCcw}
                                                        label="Restaurer cette version"
                                                        onClick={() => handleRestore(rev)}
                                                    />
                                                    <CockpitIconButton
                                                        icon={Trash2}
                                                        label="Supprimer cette version"
                                                        tone="danger"
                                                        onClick={() => handleDelete(rev)}
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Détail / diff */}
                            <div className="p-4 max-h-[26rem] overflow-y-auto">
                                {!selected ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                        <FileText className="w-8 h-8 text-gray-600 mb-3" />
                                        <p className="text-xs text-gray-400">
                                            Sélectionnez une version pour afficher son contenu et les différences.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-300">
                                                Version n°{selected.revision_number}
                                            </h4>
                                            {compared && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCompareId(null)}
                                                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Comparaison active
                                                </button>
                                            )}
                                        </div>

                                        {diff.length === 0 ? (
                                            <p className="text-xs text-gray-500">
                                                Aucune différence détectée avec la version de référence.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {diff.map((entry) => (
                                                    <li
                                                        key={entry.field}
                                                        className="rounded-lg border border-white/10 bg-black/40 p-3"
                                                    >
                                                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#FFE500] mb-2">
                                                            {FIELD_LABELS[entry.field] ?? entry.field}
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="rounded border border-red-500/20 bg-red-500/5 p-2">
                                                                <p className="text-[9px] font-mono uppercase tracking-wider text-red-400/80 mb-1">
                                                                    Avant
                                                                </p>
                                                                <p className="text-[11px] text-gray-300 break-words">
                                                                    {summarizeValue(entry.before)}
                                                                </p>
                                                            </div>
                                                            <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
                                                                <p className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/80 mb-1">
                                                                    Après
                                                                </p>
                                                                <p className="text-[11px] text-gray-300 break-words">
                                                                    {summarizeValue(entry.after)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <CockpitButton
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleRestore(selected)}
                                            className="w-full"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Restaurer cette version
                                        </CockpitButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </CockpitCard>
    );
};
