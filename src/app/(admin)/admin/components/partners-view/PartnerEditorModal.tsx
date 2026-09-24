'use client';

import React from 'react';
import { Image as ImageIcon, Save } from 'lucide-react';
import type { SitePartner } from '@/lib/data/site-service';
import { PARTNER_CATEGORY_OPTIONS } from './partners-model';

interface PartnerEditorModalProps {
    partner: SitePartner;
    onChange: (patch: Partial<SitePartner>) => void;
    onClose: () => void;
    onSubmit: (event: React.FormEvent) => void;
    onOpenMediaPicker: () => void;
}

const FIELD_CLASS =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

/** Formulaire d'édition d'un partenaire (modale). */
export const PartnerEditorModal: React.FC<PartnerEditorModalProps> = ({
    partner,
    onChange,
    onClose,
    onSubmit,
    onOpenMediaPicker,
}) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
                {partner.name ? `Modifier : ${partner.name}` : 'Nouveau partenaire'}
            </h3>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Nom du partenaire</label>
                    <input
                        type="text"
                        required
                        value={partner.name}
                        onChange={(e) => onChange({ name: e.target.value })}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Catégorie</label>
                    <select
                        value={partner.category}
                        onChange={(e) => onChange({ category: e.target.value as SitePartner['category'] })}
                        className={FIELD_CLASS}
                    >
                        {PARTNER_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">URL du Logo</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            required
                            placeholder="/images/... ou https://..."
                            value={partner.logo_url}
                            onChange={(e) => onChange({ logo_url: e.target.value })}
                            className={`flex-1 ${FIELD_CLASS}`}
                        />
                        <button
                            type="button"
                            onClick={onOpenMediaPicker}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                        >
                            <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">Lien vers le site web</label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={partner.website_url || ''}
                        onChange={(e) => onChange({ website_url: e.target.value })}
                        className={FIELD_CLASS}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
);
