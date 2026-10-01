import React from 'react';
import { Plus, Scale, Trash2 } from 'lucide-react';
import type { FooterLegal, FooterLink } from '@/data/navigation';
import { FOOTER_INPUT_CLASS } from './footer-ui';
import { PageUrlSelect } from '../ui/PageUrlSelect';

export interface FooterLegalCardProps {
    legal: FooterLegal;
    links: FooterLink[];
    /** Édition anglaise : URLs, ordre et suppression sont verrouillés. */
    locked: boolean;
    /** Overlay chargé : copyright et libellés légaux restent éditables. */
    ready: boolean;
    onUpdateCopyright: (value: string) => void;
    onUpdateLink: (linkId: string, updates: Partial<FooterLink>) => void;
    onRemoveLink: (linkId: string) => void;
    onAddLink: () => void;
}

export const FooterLegalCard: React.FC<FooterLegalCardProps> = ({
    legal,
    links,
    locked,
    ready,
    onUpdateCopyright,
    onUpdateLink,
    onRemoveLink,
    onAddLink,
}) => (
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
                value={legal.copyright}
                disabled={locked && !ready}
                onChange={(e) => onUpdateCopyright(e.target.value)}
                className={FOOTER_INPUT_CLASS}
            />
        </div>

        <div className="space-y-3">
            {links.map((link) => (
                <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                        type="text"
                        value={link.label}
                        placeholder="Libellé"
                        disabled={locked && !ready}
                        onChange={(e) => onUpdateLink(link.id, { label: e.target.value })}
                        className={FOOTER_INPUT_CLASS}
                    />
                    <div className="flex-1">
                        <PageUrlSelect
                            value={link.href}
                            disabled={locked}
                            onChange={(href) => onUpdateLink(link.id, { href })}
                            placeholder="/mentions-legales..."
                        />
                    </div>
                    <button
                        onClick={() => onRemoveLink(link.id)}
                        disabled={locked}
                        className="p-2 rounded-md hover:bg-red-500/20 text-red-400 shrink-0 self-end sm:self-center disabled:opacity-40"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                onClick={onAddLink}
                disabled={locked}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40"
            >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un lien légal
            </button>
        </div>
    </div>
);
