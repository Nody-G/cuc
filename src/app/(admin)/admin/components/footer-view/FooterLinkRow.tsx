import React from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Link2, Trash2 } from 'lucide-react';
import type { FooterLink } from '@/data/navigation';
import { FOOTER_INPUT_CLASS } from './footer-ui';

export interface FooterLinkRowProps {
    columnId: string;
    link: FooterLink;
    index: number;
    total: number;
    onMoveLink: (columnId: string, index: number, direction: -1 | 1) => void;
    onUpdateLink: (columnId: string, linkId: string, updates: Partial<FooterLink>) => void;
    onRemoveLink: (columnId: string, linkId: string) => void;
}

export const FooterLinkRow: React.FC<FooterLinkRowProps> = ({
    columnId,
    link,
    index,
    total,
    onMoveLink,
    onUpdateLink,
    onRemoveLink,
}) => (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 pl-4 border-l-2 border-[#FFE500]/30">
        <div className="flex items-center gap-1 shrink-0">
            <button
                onClick={() => onMoveLink(columnId, index, -1)}
                disabled={index === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-gray-500"
            >
                <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => onMoveLink(columnId, index, 1)}
                disabled={index === total - 1}
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
                onChange={(e) => onUpdateLink(columnId, link.id, { label: e.target.value })}
                className={FOOTER_INPUT_CLASS}
            />
            <div className="relative">
                <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={link.href}
                    placeholder="/url"
                    onChange={(e) => onUpdateLink(columnId, link.id, { href: e.target.value })}
                    className={`${FOOTER_INPUT_CLASS} pl-9`}
                />
            </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
            <button
                onClick={() => onUpdateLink(columnId, link.id, { is_visible: !link.is_visible })}
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
                onClick={() => onRemoveLink(columnId, link.id)}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
);
