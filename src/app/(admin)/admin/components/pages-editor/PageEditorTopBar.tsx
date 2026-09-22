'use client';

import React from 'react';
import { Eye, EyeOff, Rocket, RotateCcw, Save } from 'lucide-react';
import { LocaleToggle, type EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import type { TranslationCoverage } from '@/lib/i18n/localized-merge';
import { SITE_PAGES_OPTIONS } from './pages-options';

export interface PageEditorTopBarProps {
    selectedSlug: string;
    onSelectPage: (slug: string) => void;
    editorLocale: EditorLocaleOption;
    onLocaleChange: (locale: EditorLocaleOption) => void;
    /** Couverture EN affichée (`null` si non mesurée ou hors anglais). */
    localeCoverage: TranslationCoverage | null;
    translationDirty: boolean;
    translationBusy: boolean;
    translationSaving: boolean;
    translationReady: boolean;
    isPublished: boolean;
    isPublishing: boolean;
    onTogglePublish: () => void;
    isResetting: boolean;
    onResetDefault: () => void;
    onRemoveTranslation: () => void;
    isSaving: boolean;
    onSave: () => void;
    previewUrl: string;
}

/** Barre supérieure : sélecteur de page, langue, publication, réinitialisation et enregistrement. */
export const PageEditorTopBar: React.FC<PageEditorTopBarProps> = ({
    selectedSlug,
    onSelectPage,
    editorLocale,
    onLocaleChange,
    localeCoverage,
    translationDirty,
    translationBusy,
    translationSaving,
    translationReady,
    isPublished,
    isPublishing,
    onTogglePublish,
    isResetting,
    onResetDefault,
    onRemoveTranslation,
    isSaving,
    onSave,
    previewUrl,
}) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D0D12] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-mono uppercase text-gray-400">Page Vitrine à éditer :</label>
            <select
                value={selectedSlug}
                onChange={(e) => onSelectPage(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white font-medium focus:border-[#FFE500] focus:outline-none min-w-[280px]"
            >
                {SITE_PAGES_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
            {/* Bascule de langue : la traduction anglaise s'édite dans ce même
          formulaire, sans quitter la page. */}
            <LocaleToggle
                locale={editorLocale}
                onChange={onLocaleChange}
                coverage={localeCoverage}
                dirty={translationDirty}
                busy={translationBusy}
            />

            {/* Statut de publication (workflow brouillon → publié) */}
            <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                title={
                    isPublished
                        ? 'La page est visible sur la vitrine publique.'
                        : 'Page en brouillon : exclue du sitemap, mais encore joignable par URL directe (garde de diffusion à venir).'
                }
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                />
                {isPublished ? 'Publiée' : 'Brouillon'}
            </span>

            {/*
        État dit franchement : tant que la garde de diffusion n'est pas posée
        (route d'aperçu admin + 404 public, cf. plans/revue-diffusion-brouillons.md),
        dépublier retire la page du sitemap sans la fermer. Le dire ici évite de
        croire à un contrôle qui n'existe pas encore.
      */}
            {!isPublished && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono leading-tight max-w-[24rem] border border-amber-500/30 bg-amber-500/5 text-amber-300">
                    Brouillon : retirée du sitemap, encore joignable par URL directe — garde de
                    diffusion à venir.
                </span>
            )}

            <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Ouvrir la page dans un nouvel onglet"
            >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu</span>
            </a>

            <button
                type="button"
                onClick={onTogglePublish}
                disabled={isPublishing}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors disabled:opacity-50 ${isPublished
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                    }`}
                title={
                    isPublished
                        ? 'Repasser la page en brouillon'
                        : 'Publier la page sur la vitrine'
                }
            >
                {isPublished ? (
                    <EyeOff className="w-3.5 h-3.5" />
                ) : (
                    <Rocket className="w-3.5 h-3.5" />
                )}
                <span>
                    {isPublishing
                        ? '…'
                        : isPublished
                            ? 'Dépublier'
                            : 'Publier'}
                </span>
            </button>

            {editorLocale === 'fr' ? (
                <button
                    type="button"
                    onClick={onResetDefault}
                    disabled={isResetting}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors disabled:opacity-50"
                    title="Rétablir la version officielle d'origine CUC"
                >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Réinitialiser</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onRemoveTranslation}
                    disabled={translationSaving || !translationReady}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors disabled:opacity-50"
                    title="Supprimer la traduction anglaise : la page repasse intégralement en français"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser l'anglais</span>
                </button>
            )}

            <button
                type="button"
                onClick={onSave}
                disabled={isSaving || translationSaving || (editorLocale === 'en' && !translationReady)}
                className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50 transition-transform active:scale-95"
                title={
                    editorLocale === 'en'
                        ? 'Enregistrer la traduction anglaise (seules les différences avec le français sont écrites)'
                        : 'Enregistrer le contenu français de la page'
                }
            >
                <Save className="w-3.5 h-3.5" />
                <span>
                    {editorLocale === 'en'
                        ? translationSaving
                            ? 'Enregistrement…'
                            : 'Enregistrer EN'
                        : isSaving
                            ? 'Enregistrement...'
                            : 'Enregistrer FR'}
                </span>
            </button>
        </div>
    </div>
);
