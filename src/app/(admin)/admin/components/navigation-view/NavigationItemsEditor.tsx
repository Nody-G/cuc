import React from 'react';
import { Plus } from 'lucide-react';
import type { NavChildItem, NavItem } from '@/data/navigation';
import { CockpitSkeletonList } from '../ui';
import { sortedChildren } from './navigation-form';
import { NavItemCard } from './NavItemCard';

export interface NavigationItemsEditorProps {
    isLoading: boolean;
    items: NavItem[];
    expandedId: string | null;
    onMoveItem: (index: number, direction: -1 | 1) => void;
    onUpdateItem: (id: string, updates: Partial<NavItem>) => void;
    onRemoveItem: (id: string) => void;
    onToggleExpanded: (id: string) => void;
    onMoveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    onUpdateChild: (parentId: string, childId: string, updates: Partial<NavChildItem>) => void;
    onRemoveChild: (parentId: string, childId: string) => void;
    onAddChild: (parentId: string) => void;
    onAddItem: () => void;
}

export const NavigationItemsEditor: React.FC<NavigationItemsEditorProps> = ({
    isLoading,
    items,
    expandedId,
    onMoveItem,
    onUpdateItem,
    onRemoveItem,
    onToggleExpanded,
    onMoveChild,
    onUpdateChild,
    onRemoveChild,
    onAddChild,
    onAddItem,
}) =>
    isLoading ? (
        <CockpitSkeletonList rows={5} />
    ) : (
        <div className="space-y-3">
            {items.map((item, index) => (
                <NavItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    totalItems={items.length}
                    isExpanded={expandedId === item.id}
                    childItems={sortedChildren(item)}
                    onMoveItem={onMoveItem}
                    onUpdateItem={onUpdateItem}
                    onRemoveItem={onRemoveItem}
                    onToggleExpanded={onToggleExpanded}
                    onMoveChild={onMoveChild}
                    onUpdateChild={onUpdateChild}
                    onRemoveChild={onRemoveChild}
                    onAddChild={onAddChild}
                />
            ))}

            <button
                onClick={onAddItem}
                className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Ajouter une entrée de navigation
            </button>
        </div>
    );
