import React from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import type { FooterColumn, FooterLink } from '@/data/navigation';
import { FOOTER_INPUT_CLASS } from './footer-ui';
import { sortedLinks } from './footer-form';
import { FooterLinkRow } from './FooterLinkRow';

export interface FooterColumnCardProps {
    column: FooterColumn;
    index: number;
    totalColumns: number;
    isExpanded: boolean;
    onMoveColumn: (index: number, direction: -1 | 1) => void;
    onUpdateColumn: (id: string, updates: Partial<FooterColumn>) => void;
    onRemoveColumn: (id: string) => void;
    onToggleExpanded: (id: string) => void;
    onMoveLink: (columnId: string, index: number, direction: -1 | 1) => void;
    onUpdateLink: (columnId: string, linkId: string, updates: Partial<FooterLink>) => void;
    onRemoveLink: (columnId: string, linkId: string) => void;
    onAddLink: (columnId: string) => void;
}

export const FooterColumnCard: React.FC<FooterColumnCardProps> = ({
    column,
    index,
    totalColumns,
    isExpanded,
    onMoveColumn,
    onUpdateColumn,
    onRemoveColumn,
    onToggleExpanded,
    onMoveLink,
    onUpdateLink,
    onRemoveLink,
    onAddLink,
}) => {
    const links = sortedLinks(column);

    return (
        <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onMoveColumn(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMoveColumn(index, 1)}
                        disabled={index === totalColumns - 1}
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
                        onChange={(e) => onUpdateColumn(column.id, { title: e.target.value })}
                        className={FOOTER_INPUT_CLASS}
                    />
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                    <button
                        onClick={() => onUpdateColumn(column.id, { is_visible: !column.is_visible })}
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
                        onClick={() => onToggleExpanded(column.id)}
                        className="p-2 rounded-md hover:bg-white/10 text-gray-400 flex items-center gap-1 text-[10px] font-mono"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                        {links.length}
                    </button>
                    <button
                        onClick={() => onRemoveColumn(column.id)}
                        className="p-2 rounded-md hover:bg-red-500/20 text-red-400"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-white/10 bg-black/30 p-4 space-y-3">
                    {links.map((link, linkIndex) => (
                        <FooterLinkRow
                            key={link.id}
                            columnId={column.id}
                            link={link}
                            index={linkIndex}
                            total={links.length}
                            onMoveLink={onMoveLink}
                            onUpdateLink={onUpdateLink}
                            onRemoveLink={onRemoveLink}
                        />
                    ))}

                    <button
                        onClick={() => onAddLink(column.id)}
                        className="ml-4 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter un lien
                    </button>
                </div>
            )}
        </div>
    );
};
