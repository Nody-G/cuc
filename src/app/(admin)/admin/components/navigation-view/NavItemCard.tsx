import React from 'react';
import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Eye,
    EyeOff,
    Plus,
    Trash2,
} from 'lucide-react';
import type { NavChildItem, NavItem, NavItemType } from '@/data/navigation';
import { NAV_INPUT_CLASS } from './navigation-ui';
import { LinkField } from '../pages-editor/LinkField';
import { TYPE_LABELS } from './navigation-form';
import { NavChildRow } from './NavChildRow';

export interface NavItemCardProps {
    item: NavItem;
    index: number;
    totalItems: number;
    isExpanded: boolean;
    childItems: NavChildItem[];
    onMoveItem: (index: number, direction: -1 | 1) => void;
    onUpdateItem: (id: string, updates: Partial<NavItem>) => void;
    onRemoveItem: (id: string) => void;
    onToggleExpanded: (id: string) => void;
    onMoveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    onUpdateChild: (parentId: string, childId: string, updates: Partial<NavChildItem>) => void;
    onRemoveChild: (parentId: string, childId: string) => void;
    onAddChild: (parentId: string) => void;
}

export const NavItemCard: React.FC<NavItemCardProps> = ({
    item,
    index,
    totalItems,
    isExpanded,
    childItems,
    onMoveItem,
    onUpdateItem,
    onRemoveItem,
    onToggleExpanded,
    onMoveChild,
    onUpdateChild,
    onRemoveChild,
    onAddChild,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden">
        {/* Ligne principale */}
        <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={() => onMoveItem(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                    title="Monter"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onMoveItem(index, 1)}
                    disabled={index === totalItems - 1}
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
                        onChange={(e) => onUpdateItem(item.id, { label: e.target.value })}
                        className={NAV_INPUT_CLASS}
                    />
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                        Type
                    </label>
                    <select
                        value={item.type}
                        onChange={(e) =>
                            onUpdateItem(item.id, {
                                type: e.target.value as NavItemType,
                                is_external: e.target.value === 'external',
                            })
                        }
                        className={NAV_INPUT_CLASS}
                    >
                        {(Object.keys(TYPE_LABELS) as NavItemType[]).map((type) => (
                            <option key={type} value={type}>
                                {TYPE_LABELS[type]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-5">
                    <LinkField
                        label={item.type === 'dropdown' ? 'URL (optionnelle)' : 'URL'}
                        value={item.href || ''}
                        onChange={(href) => onUpdateItem(item.id, { href })}
                    />
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                <button
                    onClick={() => onUpdateItem(item.id, { is_visible: !item.is_visible })}
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
                        onClick={() => onToggleExpanded(item.id)}
                        className="p-2 rounded-md hover:bg-white/10 text-gray-400 flex items-center gap-1 text-[10px] font-mono"
                        title="Gérer les sous-entrées"
                    >
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        {childItems.length}
                    </button>
                )}

                <button
                    onClick={() => onRemoveItem(item.id)}
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
                {childItems.map((child, childIndex) => (
                    <NavChildRow
                        key={child.id}
                        parentId={item.id}
                        child={child}
                        index={childIndex}
                        total={childItems.length}
                        onMoveChild={onMoveChild}
                        onUpdateChild={onUpdateChild}
                        onRemoveChild={onRemoveChild}
                    />
                ))}

                <button
                    onClick={() => onAddChild(item.id)}
                    className="ml-4 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une sous-entrée
                </button>
            </div>
        )}
    </div>
);
