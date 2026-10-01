'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import type { SiteSocialLink, SocialPlatform } from '@/data/navigation';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import { SOCIAL_INPUT_CLASS, SOCIAL_PLATFORMS } from './social-links-form';
import { SocialLinkDetailsRow } from './SocialLinkDetailsRow';
import { useSocialLinkRowEditor } from './useSocialLinkRowEditor';
import type { SocialLinkEnglishSaver } from './useSocialLinksEditor';

interface SocialLinkRowProps {
    link: SiteSocialLink;
    index: number;
    total: number;
    onMove: (index: number, direction: -1 | 1) => void;
    onUpdate: (id: string, updates: Partial<SiteSocialLink>) => void;
    onDelete: (link: SiteSocialLink) => void;
    showToast: (msg: string) => void;
    /** Déclare la sauvegarde d'overlay de la ligne pendant son édition anglaise. */
    onRegisterEnglishSave: (id: string, save: SocialLinkEnglishSaver | null) => void;
}

/**
 * Carte d'un réseau : ordre + aperçu + identité (ligne 1), détails (ligne 2) et
 * **barre bilingue propre à la ligne**.
 *
 * Un réseau = une entité `social_link` = une ligne `site_translations` : l'édition
 * anglaise est donc par ligne (aucun agrégateur d'écran nécessaire). Le français
 * reste la source et continue d'être enregistré en lot par l'écran parent ; en
 * anglais, seuls `label` et `display_hint` sont éditables — le reste est verrouillé.
 */
export const SocialLinkRow: React.FC<SocialLinkRowProps> = ({
    link,
    index,
    total,
    onMove,
    onUpdate,
    onDelete,
    showToast,
    onRegisterEnglishSave,
}) => {
    const editor = useSocialLinkRowEditor({ link, onUpdate });
    const locked = editor.isEnglish;
    const active = editor.active;

    const updateActive = (updates: Partial<SiteSocialLink>) =>
        editor.setActive((prev) => ({ ...prev, ...updates }));

    /**
     * Tant que la ligne est en anglais, sa sauvegarde d'overlay est confiée à
     * l'écran : son bouton principal écrit alors la traduction, jamais la ligne
     * française. Le ref maintient la référence à jour sans ré-abonner à chaque
     * rendu (`saveTranslation` change d'identité à chaque rendu).
     */
    const saveTranslationRef = React.useRef(editor.editor.saveTranslation);
    React.useEffect(() => {
        saveTranslationRef.current = editor.editor.saveTranslation;
    });

    React.useEffect(() => {
        if (!editor.isEnglish) return;
        onRegisterEnglishSave(link.id, () => saveTranslationRef.current());
        return () => onRegisterEnglishSave(link.id, null);
    }, [editor.isEnglish, link.id, onRegisterEnglishSave]);

    const handleSaveTranslation = () => {
        void editor.editor.saveTranslation().then((result) => {
            if (result.success) showToast(`Traduction anglaise de « ${link.label} » enregistrée.`);
        });
    };

    const handleRemoveTranslation = () => {
        void editor.editor.removeTranslation().then((result) => {
            if (result.success) showToast(`Traduction anglaise de « ${link.label} » réinitialisée.`);
        });
    };

    return (
        <div
            className={`bg-[#0D0D12] border rounded-xl p-4 space-y-4 transition-opacity ${link.is_active ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
        >
            {/* Ligne 1 : ordre, aperçu, plateforme, actions */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => onMove(index, -1)}
                        disabled={locked || index === 0}
                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 text-gray-400"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMove(index, 1)}
                        disabled={locked || index === total - 1}
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
                            disabled={locked}
                            onChange={(e) => {
                                const platform = e.target.value as SocialPlatform;
                                const preset = SOCIAL_PLATFORMS.find((p) => p.id === platform);
                                onUpdate(link.id, {
                                    platform,
                                    brand_color: preset?.defaultColor || link.brand_color,
                                });
                            }}
                            className={SOCIAL_INPUT_CLASS}
                        >
                            {SOCIAL_PLATFORMS.map((p) => (
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
                            value={active.label}
                            onChange={(e) => updateActive({ label: e.target.value })}
                            className={SOCIAL_INPUT_CLASS}
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
                                disabled={locked}
                                onChange={(e) => onUpdate(link.id, { url: e.target.value })}
                                className={`${SOCIAL_INPUT_CLASS} pl-9`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end lg:self-center">
                    <button
                        onClick={() => onUpdate(link.id, { is_active: !link.is_active })}
                        disabled={locked}
                        className={`p-2 rounded-md transition-colors disabled:opacity-40 ${link.is_active
                            ? 'text-[#FFE500] hover:bg-white/10'
                            : 'text-gray-600 hover:bg-white/10'
                            }`}
                        title={link.is_active ? 'Actif' : 'Inactif'}
                    >
                        {link.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onDelete(link)}
                        disabled={locked}
                        className="p-2 rounded-md hover:bg-red-500/20 text-red-400 disabled:opacity-40"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Ligne 2 : handle, hint, couleur, surfaces */}
            <SocialLinkDetailsRow
                link={link}
                activeLink={active}
                onUpdate={onUpdate}
                onUpdateActive={updateActive}
                isEnglish={locked}
            />

            {/* Barre bilingue propre à la ligne : une entité, un overlay. */}
            <EntityLocaleBar
                entityLabel={link.label || link.platform}
                locale={editor.locale}
                onLocaleChange={editor.changeLocale}
                coverage={editor.editor.coverage}
                dirty={locked && editor.editor.dirty}
                busy={editor.editor.loading}
                ready={editor.editor.ready}
                saving={editor.editor.saving}
                onSaveTranslation={handleSaveTranslation}
                onRevertTranslation={editor.editor.revertTranslation}
                onRemoveTranslation={handleRemoveTranslation}
            />

            {editor.editor.error && (
                <p role="alert" className="text-[11px] text-red-400">
                    {editor.editor.error}
                </p>
            )}
        </div>
    );
};
