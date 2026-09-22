import React from 'react';
import { Plus } from 'lucide-react';
import type { FooterColumn, FooterLink } from '@/data/navigation';
import { CockpitSkeletonList } from '../ui';
import { FooterColumnCard } from './FooterColumnCard';

export interface FooterColumnsEditorProps {
    isLoading: boolean;
    columns: FooterColumn[];
    expandedColumn: string | null;
    onMoveColumn: (index: number, direction: -1 | 1) => void;
    onUpdateColumn: (id: string, updates: Partial<FooterColumn>) => void;
    onRemoveColumn: (id: string) => void;
    onToggleColumnExpanded: (id: string) => void;
    onAddColumn: () => void;
    onMoveLink: (columnId: string, index: number, direction: -1 | 1) => void;
    onUpdateLink: (columnId: string, linkId: string, updates: Partial<FooterLink>) => void;
    onRemoveLink: (columnId: string, linkId: string) => void;
    onAddLink: (columnId: string) => void;
}

export const FooterColumnsEditor: React.FC<FooterColumnsEditorProps> = ({
    isLoading,
    columns,
    expandedColumn,
    onMoveColumn,
    onUpdateColumn,
    onRemoveColumn,
    onToggleColumnExpanded,
    onAddColumn,
    onMoveLink,
    onUpdateLink,
    onRemoveLink,
    onAddLink,
}) =>
    isLoading ? (
        <CockpitSkeletonList rows={4} />
    ) : (
        <div className="space-y-3">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Colonnes de liens
            </div>

            {columns.map((column, index) => (
                <FooterColumnCard
                    key={column.id}
                    column={column}
                    index={index}
                    totalColumns={columns.length}
                    isExpanded={expandedColumn === column.id}
                    onMoveColumn={onMoveColumn}
                    onUpdateColumn={onUpdateColumn}
                    onRemoveColumn={onRemoveColumn}
                    onToggleExpanded={onToggleColumnExpanded}
                    onMoveLink={onMoveLink}
                    onUpdateLink={onUpdateLink}
                    onRemoveLink={onRemoveLink}
                    onAddLink={onAddLink}
                />
            ))}

            <button
                onClick={onAddColumn}
                className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
                <Plus className="w-4 h-4" />
                Ajouter une colonne
            </button>
        </div>
    );
