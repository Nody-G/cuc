'use client';

import React from 'react';
import Image from 'next/image';
import {
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Loader2,
    Image as ImageIcon,
    ExternalLink,
} from 'lucide-react';
import { InstagramLogo } from '@/components/ui/logos/SocialLogos';
import type { SitePageContent } from '@/lib/data/site-service';
import {
    ALL_INSTAGRAM_REELS,
    type InstagramReel,
} from '@/app/(site)/[locale]/videos-cascadeur/sections/instagram-reels.data';
import { fetchInstagramMetadata } from '@/app/(admin)/admin/actions/instagram';

interface VideosPageEditorProps {
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    setMediaPickerTarget: (target: string) => void;
}

/**
 * Éditeur Cockpit de la page Vidéos (/videos-cascadeur).
 * Permet de gérer la liste des Reels Instagram avec import automatique des légendes réelles.
 */
export const VideosPageEditor: React.FC<VideosPageEditorProps> = ({
    formData,
    setFormData,
    setMediaPickerTarget,
}) => {
    const [newUrl, setNewUrl] = React.useState('');
    const [isImporting, setIsImporting] = React.useState(false);
    const [importError, setImportError] = React.useState<string | null>(null);

    const reelsSection = formData.sections_data?.reels || {};
    const reelsList: InstagramReel[] = Array.isArray(reelsSection.items)
        ? reelsSection.items
        : ALL_INSTAGRAM_REELS;

    const updateReelsSection = (patch: Record<string, unknown>) => {
        setFormData((prev) => ({
            ...prev,
            sections_data: {
                ...(prev.sections_data || {}),
                reels: { ...(prev.sections_data?.reels || {}), ...patch },
            },
        }));
    };

    const updateReels = (newItems: InstagramReel[]) => updateReelsSection({ items: newItems });

    const handleImportReel = async () => {
        if (!newUrl.trim()) return;
        setIsImporting(true);
        setImportError(null);

        const res = await fetchInstagramMetadata(newUrl.trim());
        setIsImporting(false);

        if (!res.success || !res.data) {
            setImportError(res.error || "Impossible d'importer ce Reel.");
            return;
        }

        const newReel: InstagramReel = {
            id: `reel-${Date.now()}`,
            shortcode: res.data.shortcode,
            url: res.data.url,
            title: res.data.title,
            description: res.data.description,
            coverImage: res.data.coverImage,
            views: 0,
            viewsFormatted: '',
            date: new Date().toISOString().split('T')[0],
            isFeatured: true,
        };

        updateReels([...reelsList, newReel]);
        setNewUrl('');
    };

    const handleRemoveReel = (index: number) => {
        updateReels(reelsList.filter((_, i) => i !== index));
    };

    const handleMoveReel = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= reelsList.length) return;
        const copy = [...reelsList];
        const temp = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = temp;
        updateReels(copy);
    };

    const handleUpdateReelField = (
        index: number,
        field: keyof InstagramReel,
        value: InstagramReel[keyof InstagramReel],
    ) => {
        const copy = [...reelsList];
        copy[index] = { ...copy[index], [field]: value };
        updateReels(copy);
    };

    const totalViews = React.useMemo(() => {
        return reelsList.reduce((sum, r) => sum + (r.views || 0), 0);
    }, [reelsList]);

    return (
        <div className="space-y-6">
            {/* Section Header Editor */}
            <div className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-sm font-semibold text-white">
                    <div className="flex items-center gap-2">
                        <InstagramLogo className="w-4 h-4 text-[#FFE500]" />
                        <span>Configuration des Vidéos Instagram Reels ({reelsList.length})</span>
                    </div>
                    {totalViews > 0 && (
                        <span className="text-xs font-mono-tech text-[#FFE500] font-normal">
                            {(totalViews / 1000000).toFixed(1).replace('.', ',')} M vues cumulées
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-mono-tech text-gray-400 mb-1">Titre de la section</label>
                        <input
                            type="text"
                            value={reelsSection.title || "SESSIONS D'ACTION EN FORMAT COURT"}
                            onChange={(e) => updateReelsSection({ title: e.target.value })}
                            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:border-[#FFE500] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono-tech text-gray-400 mb-1">Sous-titre / Introduction</label>
                        <input
                            type="text"
                            value={reelsSection.intro || ''}
                            placeholder="Description courte de la section..."
                            onChange={(e) => updateReelsSection({ intro: e.target.value })}
                            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:border-[#FFE500] outline-none"
                        />
                    </div>
                </div>

                {/* Sélecteur de colonnes (2 à 6) */}
                <div className="pt-2 border-t border-white/5">
                    <label className="block text-xs font-mono-tech text-gray-400 mb-1.5">
                        Disposition de la grille sur grand écran (2 à 6 colonnes) :
                    </label>
                    <div className="flex items-center gap-2">
                        {[2, 3, 4, 5, 6].map((cols) => (
                            <button
                                key={cols}
                                type="button"
                                onClick={() => updateReelsSection({ columns: cols })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer ${(reelsSection.columns || 6) === cols
                                    ? 'bg-[#FFE500] text-black shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                                    : 'bg-black/50 border border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {cols} cols
                            </button>
                        ))}
                    </div>
                </div>

                {/* Import rapide depuis Instagram */}
                <div className="pt-3 border-t border-white/5">
                    <label className="block text-xs font-mono-tech text-[#FFE500] mb-1.5">
                        Ajouter un Reel par son lien Instagram (récupération automatique de la légende réelle)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="https://www.instagram.com/reel/DJW5wq0MIzt/..."
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleImportReel()}
                            className="flex-1 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-white focus:border-[#FFE500] outline-none font-mono"
                        />
                        <button
                            type="button"
                            onClick={handleImportReel}
                            disabled={isImporting || !newUrl.trim()}
                            className="px-4 py-2 bg-[#FFE500] hover:bg-yellow-400 text-black text-xs font-bold font-mono-tech rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            <span>Importer</span>
                        </button>
                    </div>
                    {importError && <p className="text-xs text-rose-400 mt-1 font-mono-tech">{importError}</p>}
                </div>
            </div>

            {/* Liste des Reels enregistrés */}
            <div className="space-y-4">
                {reelsList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#0D0D12] border border-dashed border-white/10 text-gray-500 text-xs">
                        Aucun Reel Instagram configuré. La section sera automatiquement masquée sur la vitrine.
                    </div>
                ) : (
                    reelsList.map((reel, idx) => (
                        <div key={reel.id || idx} className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <span className="text-xs font-mono-tech text-[#FFE500]">REEL #{idx + 1} • {reel.shortcode}</span>
                                <div className="flex items-center gap-1">
                                    <button type="button" disabled={idx === 0} onClick={() => handleMoveReel(idx, 'up')} className="p-1 text-gray-400 hover:text-white disabled:opacity-30" title="Monter">
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button type="button" disabled={idx === reelsList.length - 1} onClick={() => handleMoveReel(idx, 'down')} className="p-1 text-gray-400 hover:text-white disabled:opacity-30" title="Descendre">
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => handleRemoveReel(idx)} className="p-1 text-rose-400 hover:text-rose-300 ml-2" title="Supprimer ce Reel">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-24 h-36 bg-black rounded-lg border border-white/10 overflow-hidden shrink-0">
                                    {reel.coverImage ? (
                                        <Image src={reel.coverImage} alt={reel.title} fill className="object-cover" sizes="96px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2.5">
                                    <div>
                                        <label className="block text-[11px] font-mono-tech text-gray-400 mb-0.5">Titre</label>
                                        <input
                                            type="text"
                                            value={reel.title}
                                            onChange={(e) => handleUpdateReelField(idx, 'title', e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#FFE500] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-mono-tech text-gray-400 mb-0.5">Légende réelle Instagram</label>
                                        <textarea
                                            rows={2}
                                            value={reel.description}
                                            placeholder="Légende officielle (ou laisser vide pour n'afficher aucun texte)..."
                                            onChange={(e) => handleUpdateReelField(idx, 'description', e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#FFE500] outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setMediaPickerTarget(`sections_data.reels.items.${idx}.coverImage`)}
                                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono-tech"
                                        >
                                            <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                                            <span>Changer l'image</span>
                                        </button>
                                        <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#FFE500] flex items-center gap-1 font-mono-tech ml-auto">
                                            <span>Voir sur Instagram</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
