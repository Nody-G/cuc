'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
    Share2,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Save,
    RotateCcw,
    Eye,
    EyeOff,
    ExternalLink,
    Palette,
} from 'lucide-react';
import {
    DEFAULT_SOCIAL_LINKS,
    type SiteSocialLink,
    type SocialPlatform,
} from '@/data/navigation';
import { getSocialLinks, upsertSocialLink, deleteSocialLink } from '@/lib/data/site-service';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { CockpitSkeletonList } from './ui';

interface SocialLinksViewProps {
    showToast: (msg: string) => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; defaultColor: string }[] = [
    { id: 'instagram', label: 'Instagram', defaultColor: '#E1306C' },
    { id: 'youtube', label: 'YouTube', defaultColor: '#FF0000' },
    { id: 'tiktok', label: 'TikTok', defaultColor: '#25F4EE' },
    { id: 'facebook', label: 'Facebook', defaultColor: '#1877F2' },
    { id: 'whatsapp', label: 'WhatsApp', defaultColor: '#25D366' },
    { id: 'linkedin', label: 'LinkedIn', defaultColor: '#0A66C2' },
];

/**
 * Éditeur des réseaux sociaux officiels.
 *
 * Source unique de vérité partagée par la Navbar, le drawer mobile et le Footer.
 * Chaque réseau peut être activé/désactivé globalement et affiché sélectivement
 * dans la navbar, le footer et le menu mobile. Persistance dans `site_social_links`.
 */
export const SocialLinksView: React.FC<SocialLinksViewProps> = ({ showToast }) => {
    const [links, setLinks] = useState<SiteSocialLink[]>(DEFAULT_SOCIAL_LINKS);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getSocialLinks()
            .then((data) => {
                if (!cancelled && data.length > 0) setLinks(data);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const sorted = [...links].sort((a, b) => a.order_index - b.order_index);

    const inputClass =
        'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';

    const reindex = (items: SiteSocialLink[]): SiteSocialLink[] =>
        items.map((item, idx) => ({ ...item, order_index: idx + 1 }));

    const update = (id: string, updates: Partial<SiteSocialLink>) => {
        setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...updates } : link)));
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sorted.length) return;
        const next = [...sorted];
        [next[index], next[target]] = [next[target], next[index]];
        setLinks(reindex(next));
    };

    const addLink = () => {
        const used = new Set(links.map((l) => l.platform));
        const available = PLATFORMS.find((p) => !used.has(p.id)) || PLATFORMS[0];
        setLinks(
            reindex([
                ...links,
                {
                    id: `${available.id}-${Date.now()}`,
                    platform: available.id,
                    label: available.label,
                    handle: '',
                    url: '',
                    display_hint: '',
                    brand_color: available.defaultColor,
                    order_index: links.length + 1,
                    is_active: true,
                    show_in_navbar: true,
                    show_in_footer: true,
                    show_in_drawer: true,
                },
            ])
        );
    };

    const handleSave = () => {
        startTransition(async () => {
            const results = await Promise.all(sorted.map((link) => upsertSocialLink(link)));
            const ok = results.every(Boolean);
            showToast(
                ok
                    ? 'Réseaux sociaux enregistrés — la vitrine est mise à jour en direct.'
                    : 'Certains réseaux n\'ont pas pu être enregistrés.'
            );
        });
    };

    const handleDelete = (link: SiteSocialLink) => {
        if (!confirm(`Supprimer le réseau « ${link.label} » ?`)) return;
        setLinks((prev) => reindex(prev.filter((l) => l.id !== link.id)));
        startTransition(async () => {
            await deleteSocialLink(link.id);
            showToast(`Réseau « ${link.label} » supprimé.`);
        });
    };

    const handleReset = () => {
        if (!confirm('Réinitialiser les réseaux sociaux aux valeurs par défaut ?')) return;
        setLinks(DEFAULT_SOCIAL_LINKS);
        showToast('Réseaux sociaux réinitialisés (pensez à enregistrer).');
    };

    const Toggle: React.FC<{
        checked: boolean;
        onChange: (v: boolean) => void;
        label: string;
    }> = ({ checked, onChange, label }) => (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${checked
                ? 'bg-[#FFE500] text-black'
                : 'bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                }`}
            title={label}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête */}
            <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                        <Share2 className="w-3.5 h-3.5" /> Présence en ligne
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                        Réseaux sociaux
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Source unique partagée par la barre de navigation, le menu mobile et le pied de page.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réinitialiser
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <CockpitSkeletonList rows={4} />
            ) : (
                <div className="space-y-3">
                    {sorted.map((link, index) => (
                        <div
                            key={link.id}
                            className={`bg-[#0D0D12] border rounded-xl p-4 space-y-4 transition-opacity ${link.is_active ? 'border-white/10' : 'border-white/5 opacity-60'
                                }`}
                        >
                            {/* Ligne 1 : ordre, aperçu, plateforme, actions */}
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => move(index, 1)}
                                        disabled={index === sorted.length - 1}
                                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-mono text-gray-500">
                                        {link.order_index}
                                    </span>
                                </div>

                                {/* Aperçu de l'icône */}
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                                    style={{ backgroundColor: `${link.brand_color || '#333'}1a` }}
                                >
                                    <SocialIcon platform={link.platform} variant="color" className="w-5 h-5" />
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                            Plateforme
                                        </label>
                                        <select
                                            value={link.platform}
                                            onChange={(e) => {
                                                const platform = e.target.value as SocialPlatform;
                                                const preset = PLATFORMS.find((p) => p.id === platform);
                                                update(link.id, {
                                                    platform,
                                                    brand_color: preset?.defaultColor || link.brand_color,
                                                });
                                            }}
                                            className={inputClass}
                                        >
                                            {PLATFORMS.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                            Libellé
                                        </label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => update(link.id, { label: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                            URL du profil
                                        </label>
                                        <div className="relative">
                                            <ExternalLink className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="text"
                                                value={link.url}
                                                placeholder="https://…"
                                                onChange={(e) => update(link.id, { url: e.target.value })}
                                                className={`${inputClass} pl-9`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                                    <button
                                        onClick={() => update(link.id, { is_active: !link.is_active })}
                                        className={`p-2 rounded-md transition-colors ${link.is_active
                                            ? 'text-[#FFE500] hover:bg-white/10'
                                            : 'text-gray-600 hover:bg-white/10'
                                            }`}
                                        title={link.is_active ? 'Actif' : 'Inactif'}
                                    >
                                        {link.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link)}
                                        className="p-2 rounded-md hover:bg-red-500/20 text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Ligne 2 : handle, hint, couleur, surfaces */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pl-0 lg:pl-[104px]">
                                <div className="lg:col-span-3">
                                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                        Identifiant / handle
                                    </label>
                                    <input
                                        type="text"
                                        value={link.handle || ''}
                                        placeholder="@campusuniverscascades"
                                        onChange={(e) => update(link.id, { handle: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                        Texte d'indice
                                    </label>
                                    <input
                                        type="text"
                                        value={link.display_hint || ''}
                                        placeholder="Chaîne Stunt Team"
                                        onChange={(e) => update(link.id, { display_hint: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                        Couleur
                                    </label>
                                    <div className="relative flex items-center gap-2">
                                        <Palette className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                        <input
                                            type="color"
                                            value={link.brand_color || '#FFE500'}
                                            onChange={(e) => update(link.id, { brand_color: e.target.value })}
                                            className="w-9 h-9 rounded-md bg-black/60 border border-white/20 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={link.brand_color || ''}
                                            onChange={(e) => update(link.id, { brand_color: e.target.value })}
                                            className={`${inputClass} font-mono text-xs`}
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-4">
                                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                                        Emplacements d'affichage
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <Toggle
                                            checked={link.show_in_navbar}
                                            onChange={(v) => update(link.id, { show_in_navbar: v })}
                                            label="Navbar"
                                        />
                                        <Toggle
                                            checked={link.show_in_drawer}
                                            onChange={(v) => update(link.id, { show_in_drawer: v })}
                                            label="Menu mobile"
                                        />
                                        <Toggle
                                            checked={link.show_in_footer}
                                            onChange={(v) => update(link.id, { show_in_footer: v })}
                                            label="Footer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addLink}
                        className="w-full py-3 border border-dashed border-white/20 hover:border-[#FFE500]/60 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter un réseau social
                    </button>
                </div>
            )}
        </div>
    );
};
