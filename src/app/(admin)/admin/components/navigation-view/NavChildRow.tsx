import React from 'react';
import { ChevronDown, ChevronUp, CornerDownRight, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { NavChildItem } from '@/data/navigation';
import { NAV_INPUT_CLASS } from './navigation-ui';
import { LinkField } from '../pages-editor/LinkField';

export interface NavChildRowProps {
    parentId: string;
    child: NavChildItem;
    index: number;
    total: number;
    onMoveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    onUpdateChild: (parentId: string, childId: string, updates: Partial<NavChildItem>) => void;
    onRemoveChild: (parentId: string, childId: string) => void;
}

export const NavChildRow: React.FC<NavChildRowProps> = ({
    parentId,
    child,
    index,
    total,
    onMoveChild,
    onUpdateChild,
    onRemoveChild,
}) => (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 pl-4 border-l-2 border-[#FFE500]/30">
        <CornerDownRight className="w-4 h-4 text-gray-600 shrink-0 hidden lg:block" />
        <div className="flex items-center gap-1 shrink-0">
            <button
                onClick={() => onMoveChild(parentId, index, -1)}
                disabled={index === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
            >
                <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => onMoveChild(parentId, index, 1)}
                disabled={index === total - 1}
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
                    onChange={(e) => onUpdateChild(parentId, child.id, { label: e.target.value })}
                    className={NAV_INPUT_CLASS}
                />
            </div>
            <div className="sm:col-span-4">
                <input
                    type="text"
                    value={child.description || ''}
                    placeholder="Description (optionnelle)"
                    onChange={(e) =>
                        onUpdateChild(parentId, child.id, { description: e.target.value })
                    }
                    className={NAV_INPUT_CLASS}
                />
            </div>
            <div className="sm:col-span-4">
                <LinkField
                    value={child.href}
                    onChange={(href) => onUpdateChild(parentId, child.id, { href })}
                />
            </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
            <button
                onClick={() =>
                    onUpdateChild(parentId, child.id, { is_visible: !child.is_visible })
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
                onClick={() => onRemoveChild(parentId, child.id)}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);
