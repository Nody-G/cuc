'use client';

import React from 'react';
import { Globe, Image as ImageIcon } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface SeoTabPanelProps {
    slug: string;
    activeData: SitePageContent;
    setActiveData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    editorLocale: EditorLocaleOption;
    onMediaRequest: (target: string) => void;
}

/** Onglet référencement : aperçu Google, title/description et image OpenGraph. */
export const SeoTabPanel: React.FC<SeoTabPanelProps> = ({
    slug,
    activeData,
    setActiveData,
    formData,
    setFormData,
    editorLocale,
    onMediaRequest,
}) => (
    <div className="space-y-6 animate-in fade-in duration-150">
        <div className="space-y-2">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Aperçu dans les résultats Google
            </div>
            <div className="bg-[#202124] border border-white/10 rounded-xl p-5 max-w-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[#8ab4f8]">https://campus-universcascades.com</span>
                    <span>›</span>
                    <span className="text-gray-300 font-mono">{slug}</span>
                </div>
                <h4 className="text-lg text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
                    {activeData.meta_title || activeData.title}
                </h4>
                <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                    {activeData.meta_description ||
                        'Découvrez le Campus Univers Cascades, référence européenne de la formation de cascadeurs pour le cinéma.'}
                </p>
            </div>
        </div>

        <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-5">
            {editorLocale === 'en' && (
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                        Titre éditorial de la page (vitrine et partage)
                    </label>
                    <input
                        type="text"
                        value={activeData.title || ''}
                        onChange={(e) => setActiveData((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">
                        {'Balise <title> Google (Recommandé : 50-65 caractères)'}
                    </label>
                    <span
                        className={`text-[11px] font-mono ${(activeData.meta_title?.length || 0) > 65 ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                    >
                        {activeData.meta_title?.length || 0} / 65 car.
                    </span>
                </div>
                <input
                    type="text"
                    value={activeData.meta_title || ''}
                    onChange={(e) => setActiveData((prev) => ({ ...prev, meta_title: e.target.value }))}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400">
                        Meta Description Google (Recommandé : 120-160 caractères)
                    </label>
                    <span
                        className={`text-[11px] font-mono ${(activeData.meta_description?.length || 0) > 160 ? 'text-yellow-400' : 'text-gray-400'
                            }`}
                    >
                        {activeData.meta_description?.length || 0} / 160 car.
                    </span>
                </div>
                <textarea
                    rows={3}
                    value={activeData.meta_description || ''}
                    onChange={(e) =>
                        setActiveData((prev) => ({ ...prev, meta_description: e.target.value }))
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>

            <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                    Image de partage OpenGraph pour réseaux sociaux (Facebook, LinkedIn, X)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="https://... ou /images/..."
                        value={formData.og_image || ''}
                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                        disabled={editorLocale === 'en'}
                        className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500] disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={() => onMediaRequest('og_image')}
                        disabled={editorLocale === 'en'}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        Médiathèque
                    </button>
                </div>
                {editorLocale === 'en' && (
                    <p className="mt-1.5 text-[11px] text-gray-500">
                        Média partagé entre les langues : il se modifie en français. La traduction ne réécrit
                        jamais une image ni une URL.
                    </p>
                )}
            </div>
        </div>
    </div>
);
