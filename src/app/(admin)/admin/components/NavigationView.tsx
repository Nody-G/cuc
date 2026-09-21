'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
    Menu,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    ExternalLink,
    Save,
    RotateCcw,
    Link2,
    ChevronRight,
    CornerDownRight,
} from 'lucide-react';
import {
    DEFAULT_NAVIGATION,
    type NavItem,
    type NavChildItem,
    type NavItemType,
    type NavigationStructure,
} from '@/data/navigation';
import { getNavigation, upsertNavigation } from '@/lib/data/site-service';
import { CockpitSkeletonList } from './ui';

interface NavigationViewProps {
    showToast: (msg: string) => void;
}

const TYPE_LABELS: Record<NavItemType, string> = {
    link: 'Lien simple',
    dropdown: 'Menu déroulant',
    external: 'Lien externe',
};

/**
 * Éditeur de la navigation principale (Navbar).
 *
 * Permet de réordonner, renommer, masquer, ajouter et supprimer les entrées
 * de premier niveau ainsi que leurs sous-entrées (menus déroulants), et de
 * régler le CTA principal. Persistance dans `site_navigation` (id = 'main').
 */
export const NavigationView: React.FC<NavigationViewProps> = ({ showToast }) => {
    const [structure, setStructure] = useState<NavigationStructure>(DEFAULT_NAVIGATION.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getNavigation('main')
            .then((nav) => {
                if (cancelled) return;
                setStructure(nav.structure);
                setIsPublished(nav.is_published);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const sortedItems = [...structure.items].sort((a, b) => a.order - b.order);

    const commit = (next: NavigationStructure) => {
        setStructure(next);
    };

    const reindex = (items: NavItem[]): NavItem[] =>
        items.map((item, idx) => ({ ...item, order: idx + 1 }));

    const moveItem = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sortedItems.length) return;
        const next = [...sortedItems];
        [next[index], next[target]] = [next[target], next[index]];
        commit({ ...structure, items: reindex(next) });
    };

    const updateItem = (id: string, updates: Partial<NavItem>) => {
        commit({
            ...structure,
            items: structure.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        });
    };

    const removeItem = (id: string) => {
        if (!confirm('Supprimer cette entrée de navigation ?')) return;
        commit({ ...structure, items: reindex(structure.items.filter((item) => item.id !== id)) });
    };

    const addItem = () => {
        const id = `nav-${Date.now()}`;
        commit({
            ...structure,
            items: reindex([
                ...structure.items,
                { id, label: 'Nouvelle entrée', href: '/', type: 'link', order: 999, is_visible: true },
            ]),
        });
        setExpandedId(id);
    };

    // --- Sous-entrées (enfants de dropdown) ---

    const sortedChildren = (item: NavItem): NavChildItem[] =>
        [...(item.children || [])].sort((a, b) => a.order - b.order);

    const updateChild = (parentId: string, childId: string, updates: Partial<NavChildItem>) => {
        commit({
            ...structure,
            items: structure.items.map((item) =>
                item.id === parentId
                    ? {
                        ...item,
                        children: (item.children || []).map((child) =>
                            child.id === childId ? { ...child, ...updates } : child
                        ),
                    }
                    : item
            ),
        });
    };

    const moveChild = (parentId: string, index: number, direction: -1 | 1) => {
        const parent = structure.items.find((item) => item.id === parentId);
        if (!parent) return;
        const children = sortedChildren(parent);
        const target = index + direction;
        if (target < 0 || target >= children.length) return;
        [children[index], children[target]] = [children[target], children[index]];
        commit({
            ...structure,
            items: structure.items.map((item) =>
                item.id === parentId
                    ? { ...item, children: children.map((child, idx) => ({ ...child, order: idx + 1 })) }
                    : item
            ),
        });
    };

    const removeChild = (parentId: string, childId: string) => {
        commit({
            ...structure,
            items: structure.items.map((item) =>
                item.id === parentId
                    ? {
                        ...item,
                        children: (item.children || [])
                            .filter((child) => child.id !== childId)
                            .map((child, idx) => ({ ...child, order: idx + 1 })),
                    }
                    : item
            ),
        });
    };

    const addChild = (parentId: string) => {
        const parent = structure.items.find((item) => item.id === parentId);
        if (!parent) return;
        const children = parent.children || [];
        commit({
            ...structure,
            items: structure.items.map((item) =>
                item.id === parentId
                    ? {
                        ...item,
                        children: [
                            ...children,
                            {
                                id: `child-${Date.now()}`,
                                label: 'Nouvelle sous-entrée',
                                description: '',
                                href: '/',
                                order: children.length + 1,
                                is_visible: true,
                            },
                        ],
                    }
                    : item
            ),
        });
    };

    const handleSave = () => {
        startTransition(async () => {
            const ok = await upsertNavigation(structure, { id: 'main', isPublished });
            showToast(
                ok
                    ? 'Navigation enregistrée — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement de la navigation.'
            );
        });
    };

    const handleReset = () => {
        if (!confirm('Réinitialiser la navigation aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_NAVIGATION.structure);
        showToast('Navigation réinitialisée (pensez à enregistrer).');
    };

    const inputClass =
        'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête */}
            <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                        <Menu className="w-3.5 h-3.5" /> Structure du site
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                        Navigation principale
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Réorganisez les entrées de la barre de navigation, leurs menus déroulants et le bouton
                        d'appel à l'action.
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
                    <div className="text-sm font-bold text-white">Publier cette navigation</div>
                    <div className="text-xs text-gray-400">
                        Si désactivé, la vitrine conserve la navigation par défaut.
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

            {isLoading ? (
                <CockpitSkeletonList rows={5} />
            ) : (
                <div className="space-y-3">
                    {sortedItems.map((item, index) => {
                        const children = sortedChildren(item);
                        const isExpanded = expandedId === item.id;
                        return (
                            <div
                                key={item.id}
                                className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden"
                            >
                                {/* Ligne principale */}
                                <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => moveItem(index, -1)}
                                            disabled={index === 0}
                                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                            title="Monter"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => moveItem(index, 1)}
                                            disabled={index === sortedItems.length - 1}
                                            className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                            title="Descendre"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center text-[10px] font-mono text-gray-500">
                                            {item.order}
                                        </span>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                Libellé
                                            </label>
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={(e) => updateItem(item.id, { label: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                Type
                                            </label>
                                            <select
                                                value={item.type}
                                                onChange={(e) =>
                                                    updateItem(item.id, {
                                                        type: e.target.value as NavItemType,
                                                        is_external: e.target.value === 'external',
                                                    })
                                                }
                                                className={inputClass}
                                            >
                                                {(Object.keys(TYPE_LABELS) as NavItemType[]).map((type) => (
                                                    <option key={type} value={type}>
                                                        {TYPE_LABELS[type]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="sm:col-span-5">
                                            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                                {item.type === 'dropdown' ? 'URL (optionnelle)' : 'URL'}
                                            </label>
                                            <div className="relative">
                                                <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={item.href || ''}
                                                    placeholder="/formation-de-cascadeur"
                                                    onChange={(e) => updateItem(item.id, { href: e.target.value })}
                                                    className={`${inputClass} pl-9`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                                        <button
                                            onClick={() => updateItem(item.id, { is_visible: !item.is_visible })}
                                            className={`p-2 rounded-md transition-colors ${item.is_visible
                                                ? 'text-[#FFE500] hover:bg-white/10'
                                                : 'text-gray-600 hover:bg-white/10'
                                                }`}
                                            title={item.is_visible ? 'Visible' : 'Masqué'}
                                        >
                                            {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        {item.type === 'dropdown' && (
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                                className="p-2 rounded-md hover:bg-white/10 text-gray-400 flex items-center gap-1 text-[10px] font-mono"
                                                title="Gérer les sous-entrées"
                                            >
                                                <ChevronRight
                                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                />
                                                {children.length}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 rounded-md hover:bg-red-500/20 text-red-400"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Sous-entrées */}
                                {item.type === 'dropdown' && isExpanded && (
                                    <div className="border-t border-white/10 bg-black/30 p-4 space-y-3">
                                        {children.map((child, childIndex) => (
                                            <div
                                                key={child.id}
                                                className="flex flex-col lg:flex-row lg:items-center gap-3 pl-4 border-l-2 border-[#FFE500]/30"
                                            >
                                                <CornerDownRight className="w-4 h-4 text-gray-600 shrink-0 hidden lg:block" />
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => moveChild(item.id, childIndex, -1)}
                                                        disabled={childIndex === 0}
                                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
                                                    >
                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveChild(item.id, childIndex, 1)}
                                                        disabled={childIndex === children.length - 1}
                                                        className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
                                                    >
                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="text"
                                                            value={child.label}
                                                            placeholder="Libellé"
                                                            onChange={(e) =>
                                                                updateChild(item.id, child.id, { label: e.target.value })
                                                            }
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="text"
                                                            value={child.description || ''}
                                                            placeholder="Description (optionnelle)"
                                                            onChange={(e) =>
                                                                updateChild(item.id, child.id, { description: e.target.value })
                                                            }
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-4">
                                                        <input
                                                            type="text"
                                                            value={child.href}
                                                            placeholder="/url"
                                                            onChange={(e) =>
                                                                updateChild(item.id, child.id, { href: e.target.value })
                                                            }
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                                                    <button
                                                        onClick={() =>
                                                            updateChild(item.id, child.id, { is_visible: !child.is_visible })
                                                        }
                                                        className={`p-1.5 rounded-md ${child.is_visible ? 'text-[#FFE500]' : 'text-gray-600'
                                                            } hover:bg-white/10`}
                                                    >
                                                        {child.is_visible ? (
                                                            <Eye className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => removeChild(item.id, child.id)}
                                                        className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => addChild(item.id)}
                                            className="ml-4 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Ajouter une sous-entrée
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={addItem}
                        className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une entrée de navigation
                    </button>
                </div>
            )}

            {/* CTA principal */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" /> Bouton d'appel à l'action
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Libellé du bouton</label>
                        <input
                            type="text"
                            value={structure.cta.label}
                            onChange={(e) =>
                                commit({ ...structure, cta: { ...structure.cta, label: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">URL du bouton</label>
                        <input
                            type="text"
                            value={structure.cta.href}
                            onChange={(e) =>
                                commit({ ...structure, cta: { ...structure.cta, href: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
