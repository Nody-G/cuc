/**
 * ==============================================================================
 * CUC — Édition bilingue EN PLACE : CONTRATS (types uniquement, zéro logique)
 * ==============================================================================
 * Couche « Types & Contrats » (`AGENTS.md` § 1.4) du socle partagé qui branche
 * les éditeurs d'entités sur `useEntityTranslation`.
 *
 * Un `EntityCodec` est la pièce maîtresse : il décrit **la surface traduisible**
 * d'une entité (allow-list `fields`) et projette le brouillon de l'éditeur vers
 * la ligne d'overlay `site_translations` (et inversement). La liste blanche EST
 * le contrat de traduction : tout champ absent de `fields` est réputé technique
 * et n'atteint jamais la base.
 *
 * Aucune dépendance runtime : seuls des `import type`. Ce fichier n'importe ni
 * React (hors types), ni Supabase, ni logique de fusion.
 */

import type React from 'react';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import type { TranslationCoverage } from '@/lib/i18n/localized-merge';

/**
 * Ligne d'overlay : objet clé/valeur libre, à l'image de
 * `site_translations.payload`. Volontairement lâche (`Record<string, unknown>`)
 * car une surcharge est un diff partiel, pas l'entité complète.
 */
export type TranslationRow = Record<string, unknown>;

export interface EntityCodec<TDraft extends object, TRow extends object> {
    /** Entité `site_translations` (`team`, `event`, `film`, `navigation`…). */
    readonly entity: string;
    /** Allow-list : seuls ces champs sont traduisibles (le reste est technique). */
    readonly fields: readonly string[];
    /** Projette le brouillon d'éditeur vers la ligne d'overlay. */
    toRow(draft: TDraft): TRow;
    /** Reconstruit un brouillon éditable à partir de la ligne et du français. */
    fromRow(row: TRow, draft: TDraft): TDraft;
}
export interface EntityEditorLocaleOptions<TDraft extends object, TRow extends object> {
    codec: EntityCodec<TDraft, TRow>;
    entityId: string;
    draft: TDraft;
    targetLocale?: string;
    /**
     * Setter du brouillon source français. Requis pour éditer en FR : le hook
     * ne possède pas le brouillon, il ne fait que l'orchestrer.
     */
    setDraft?: React.Dispatch<React.SetStateAction<TDraft>>;
}
export interface EntityEditorLocale<TDraft> {
    locale: EditorLocaleOption;
    setLocale(l: EditorLocaleOption): void;
    isEnglish: boolean;
    active: TDraft;
    setActive: React.Dispatch<React.SetStateAction<TDraft>>;
    ready: boolean;
    loading: boolean;
    dirty: boolean;
    saving: boolean;
    coverage: TranslationCoverage | null;
    updatedAt: string | null;
    error: string | null;
    saveTranslation(): Promise<{ success: boolean; error?: string }>;
    revertTranslation(): void;
    removeTranslation(): Promise<{ success: boolean; error?: string }>;
    reloadTranslation(): Promise<void>;
    isReadOnlyField(field: string): boolean;
}
