'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
    PanelBottom,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    Save,
    RotateCcw,
    Link2,
    Building2,
    Scale,
} from 'lucide-react';
import {
    DEFAULT_FOOTER,
    type FooterColumn,
    type FooterLink,
    type FooterStructure,
} from '@/data/navigation';
import { getFooter, upsertFooter } from '@/lib/data/site-service';
import { CockpitSkeletonList } from './ui';

interface FooterViewProps {
    showToast: (msg: string) => void;
}

/**
 * Éditeur du pied de page.
 *
 * Gère les colonnes de liens, l'identité de marque (nom, accroche, description)
 * et la mention légale + liens légaux. Persistance dans `site_footer` (id = 'main').
 */
export const FooterView: React.FC<FooterViewProps> = ({ showToast }) => {
    const [structure, setStructure] = useState<FooterStructure>(DEFAULT_FOOTER.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getFooter('main')
            .then((footer) => {
                if (cancelled) return;
                setStructure(footer.structure);
                setIsPublished(footer.is_published);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const sortedColumns = [...structure.columns].sort((a, b) => a.order - b.order);
    const sortedLegalLinks = [...structure.legal.links].sort((a, b) => a.order - b.order);

    const inputClass =
        'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

    // --- Colonnes ---

    const reindexColumns = (columns: FooterColumn[]): FooterColumn[] =>
        columns.map((column, idx) => ({ ...column, order: idx + 1 }));

    const moveColumn = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sortedColumns.length) return;
        const next = [...sortedColumns];
        [next[index], next[target]] = [next[target], next[index]];
        setStructure({ ...structure, columns: reindexColumns(next) });
    };

    const updateColumn = (id: string, updates: Partial<FooterColumn>) => {
        setStructure({
            ...structure,
            columns: structure.columns.map((column) =>
                column.id === id ? { ...column, ...updates } : column
            ),
        });
    };

    const removeColumn = (id: string) => {
        if (!confirm('Supprimer cette colonne du pied de page ?')) return;
        setStructure({
            ...structure,
            columns: reindexColumns(structure.columns.filter((column) => column.id !== id)),
        });
    };

    const addColumn = () => {
        const id = `col-${Date.now()}`;
        setStructure({
            ...structure,
            columns: reindexColumns([
                ...structure.columns,
                { id, title: 'Nouvelle colonne', order: 999, is_visible: true, links: [] },
            ]),
        });
        setExpandedColumn(id);
    };

    // --- Liens d'une colonne ---

    const sortedLinks = (column: FooterColumn): FooterLink[] =>
        [...column.links].sort((a, b) => a.order - b.order);

    const updateLink = (columnId: string, linkId: string, updates: Partial<FooterLink>) => {
        setStructure({
            ...structure,
            columns: structure.columns.map((column) =>
                column.id === columnId
                    ? {
                        ...column,
                        links: column.links.map((link) =>
                            link.id === linkId ? { ...link, ...updates } : link
                        ),
                    }
                    : column
            ),
        });
    };

    const moveLink = (columnId: string, index: number, direction: -1 | 1) => {
        const column = structure.columns.find((c) => c.id === columnId);
        if (!column) return;
        const links = sortedLinks(column);
        const target = index + direction;
        if (target < 0 || target >= links.length) return;
        [links[index], links[target]] = [links[target], links[index]];
        setStructure({
            ...structure,
            columns: structure.columns.map((c) =>
                c.id === columnId
                    ? { ...c, links: links.map((link, idx) => ({ ...link, order: idx + 1 })) }
                    : c
            ),
        });
    };

    const removeLink = (columnId: string, linkId: string) => {
        setStructure({
            ...structure,
            columns: structure.columns.map((column) =>
                column.id === columnId
                    ? {
                        ...column,
                        links: column.links
                            .filter((link) => link.id !== linkId)
                            .map((link, idx) => ({ ...link, order: idx + 1 })),
                    }
                    : column
            ),
        });
    };

    const addLink = (columnId: string) => {
        const column = structure.columns.find((c) => c.id === columnId);
        if (!column) return;
        setStructure({
            ...structure,
            columns: structure.columns.map((c) =>
                c.id === columnId
                    ? {
                        ...c,
                        links: [
                            ...c.links,
                            {
                                id: `link-${Date.now()}`,
                                label: 'Nouveau lien',
                                href: '/',
                                order: c.links.length + 1,
                                is_visible: true,
                            },
                        ],
                    }
                    : c
            ),
        });
    };

    // --- Liens légaux ---

    const updateLegalLink = (linkId: string, updates: Partial<FooterLink>) => {
        setStructure({
            ...structure,
            legal: {
                ...structure.legal,
                links: structure.legal.links.map((link) =>
                    link.id === linkId ? { ...link, ...updates } : link
                ),
            },
        });
    };

    const removeLegalLink = (linkId: string) => {
        setStructure({
            ...structure,
            legal: {
                ...structure.legal,
                links: structure.legal.links
                    .filter((link) => link.id !== linkId)
                    .map((link, idx) => ({ ...link, order: idx + 1 })),
            },
        });
    };

    const addLegalLink = () => {
        setStructure({
            ...structure,
            legal: {
                ...structure.legal,
                links: [
                    ...structure.legal.links,
                    {
                        id: `legal-${Date.now()}`,
                        label: 'Nouveau lien légal',
                        href: '/',
                        order: structure.legal.links.length + 1,
                        is_visible: true,
                    },
                ],
            },
        });
    };

    const handleSave = () => {
        startTransition(async () => {
            const ok = await upsertFooter(structure, { id: 'main', isPublished });
            showToast(
                ok
                    ? 'Pied de page enregistré — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement du pied de page.'
            );
        });
    };

    const handleReset = () => {
        if (!confirm('Réinitialiser le pied de page aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_FOOTER.structure);
        showToast('Pied de page réinitialisé (pensez à enregistrer).');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête */}
            <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                        <PanelBottom className="w-3.5 h-3.5" /> Structure du site
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                        Pied de page
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Colonnes de liens, identité de marque et mentions légales affichées en bas de chaque page.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réinitialiser
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {/* Publication */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0D0D12] border border-white/10">
                <div>
                    <div className="text-sm font-bold text-white">Publier ce pied de page</div>
                    <div className="text-xs text-gray-400">
                        Si désactivé, la vitrine conserve le pied de page par défaut.
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500]"></div>
                </label>
            </div>

            {/* Identité de marque */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" /> Identité de marque
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Nom affiché</label>
                        <input
                            type="text"
                            value={structure.brand.name}
                            onChange={(e) =>
                                setStructure({
                                    ...structure,
                                    brand: { ...structure.brand, name: e.target.value },
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Accroche</label>
                        <input
                            type="text"
                            value={structure.brand.tagline}
                            onChange={(e) =>
                                setStructure({
                                    ...structure,
                                    brand: { ...structure.brand, tagline: e.target.value },
                                })
                            }
                            className={inputClass}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Description</label>
                    <textarea
                        rows={3}
                        value={structure.brand.description}
                        onChange={(e) =>
                            setStructure({
                                ...structure,
                                brand: { ...structure.brand, description: e.target.value },
                            })
                        }
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Colonnes */}
            {isLoading ? (
                <CockpitSkeletonList rows={4} />
            ) : (
                <div className="space-y-3">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        Colonnes de liens
                    </div>

                    {sortedColumns.map((column, index) => {
                        const links = sortedLinks(column);
                        const isExpanded = expandedColumn === column.id;
                        return (
                            <div
                                key={column.id}
                                className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden"
                            >
                                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => moveColumn(index, -1)}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveColumn(index, 1)}
                                            disabled={index === sortedColumns.length - 1}
                                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center text-[10px] font-mono text-gray-500">
                                            {column.order}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                            Titre de la colonne
                                        </label>
                                        <input
                                            type="text"
                                            value={column.title}
                                            onChange={(e) => updateColumn(column.id, { title: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                                        <button
                                            onClick={() => updateColumn(column.id, { is_visible: !column.is_visible })}
                                            className={`p-2 rounded-md transition-colors ${column.is_visible
                                                ? 'text-[#FFE500] hover:bg-white/10'
                                                : 'text-gray-600 hover:bg-white/10'
                                                }`}
                                        >
                                            {column.is_visible ? (
                                                <Eye className="w-4 h-4" />
                                            ) : (
                                                <EyeOff className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setExpandedColumn(isExpanded ? null : column.id)}
                                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 flex items-center gap-1 text-[10px] font-mono"
                                        >
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                            {links.length}
                                        </button>
                                        <button
                                            onClick={() => removeColumn(column.id)}
                                            className="p-2 rounded-md hover:bg-red-500/20 text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-white/10 bg-black/30 p-4 space-y-3">
                                        {links.map((link, linkIndex) => (
                                            <div
                                                key={link.id}
                                                className="flex flex-col lg:flex-row lg:items-center gap-3 pl-4 border-l-2 border-[#FFE500]/30"
                                            >
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => moveLink(column.id, linkIndex, -1)}
                                                        disabled={linkIndex === 0}
                                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
                                                    >
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveLink(column.id, linkIndex, 1)}
                                                        disabled={linkIndex === links.length - 1}
                                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
                                                    >
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={link.label}
                                                        placeholder="Libellé"
                                                        onChange={(e) => updateLink(column.id, link.id, { label: e.target.value })}
                                                        className={inputClass}
                                                    />
                                                    <div className="relative">
                                                        <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                        <input
                                                            type="text"
                                                            value={link.href}
                                                            placeholder="/url"
                                                            onChange={(e) => updateLink(column.id, link.id, { href: e.target.value })}
                                                            className={`${inputClass} pl-9`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                                                    <button
                                                        onClick={() => updateLink(column.id, link.id, { is_visible: !link.is_visible })}
                                                        className={`p-1.5 rounded-md ${link.is_visible ? 'text-[#FFE500]' : 'text-gray-600'
                                                            } hover:bg-white/10`}
                                                    >
                                                        {link.is_visible ? (
                                                            <Eye className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => removeLink(column.id, link.id)}
                                                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => addLink(column.id)}
                                            className="ml-4 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Ajouter un lien
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={addColumn}
                        className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une colonne
                    </button>
                </div>
            )}

            {/* Mentions légales */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5" /> Mentions légales
                </div>
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                        Copyright (utilisez {'{year}'} pour l'année dynamique)
                    </label>
                    <input
                        type="text"
                        value={structure.legal.copyright}
                        onChange={(e) =>
                            setStructure({
                                ...structure,
                                legal: { ...structure.legal, copyright: e.target.value },
                            })
                        }
                        className={inputClass}
                    />
                </div>

                <div className="space-y-3">
                    {sortedLegalLinks.map((link) => (
                        <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <input
                                type="text"
                                value={link.label}
                                placeholder="Libellé"
                                onChange={(e) => updateLegalLink(link.id, { label: e.target.value })}
                                className={inputClass}
                            />
                            <input
                                type="text"
                                value={link.href}
                                placeholder="/url"
                                onChange={(e) => updateLegalLink(link.id, { href: e.target.value })}
                                className={inputClass}
                            />
                            <button
                                onClick={() => removeLegalLink(link.id)}
                                className="p-2 rounded-md hover:bg-red-500/20 text-red-400 shrink-0 self-end sm:self-center"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addLegalLink}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter un lien légal
                    </button>
                </div>
            </div>
        </div>
    );
};
