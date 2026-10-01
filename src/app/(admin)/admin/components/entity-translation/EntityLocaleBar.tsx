'use client';

/**
 * Barre d'édition bilingue (UI pure — `AGENTS.md` § 1.1). Elle réutilise le
 * design-system `LocaleToggle` (aucune duplication) et expose les trois gestes
 * anglais : enregistrer, abandonner, réinitialiser. Tout l'état vit dans
 * `useEntityEditorLocale`.
 */

import React from 'react';
import { cx } from '../ui/primitives';
import LocaleToggle, { type EditorLocaleOption } from '../ui/LocaleToggle';

export interface EntityLocaleBarProps {
    entityLabel: string;
    locale: EditorLocaleOption;
    onLocaleChange: (locale: EditorLocaleOption) => void;
    coverage: { percent: number; translated: number; total: number } | null;
    dirty: boolean;
    busy: boolean;
    ready: boolean;
    saving: boolean;
    onSaveTranslation: () => void;
    onRevertTranslation: () => void;
    onRemoveTranslation: () => void;
    className?: string;
}

const BASE =
    'px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export const EntityLocaleBar: React.FC<EntityLocaleBarProps> = (props) => {
    const {
        entityLabel, locale, onLocaleChange, coverage, dirty, busy, ready, saving,
        onSaveTranslation, onRevertTranslation, onRemoveTranslation, className,
    } = props;
    const isEnglish = locale === 'en';
    const locked = busy || !ready;
    const actions: Array<[() => void, string, boolean, string]> = [
        [onSaveTranslation, saving ? 'Enregistrement…' : 'Enregistrer EN', locked || !dirty, 'bg-[#FFE500] text-black border-transparent hover:bg-[#FFE500]/90'],
        [onRevertTranslation, 'Abandonner', locked, 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10'],
        [onRemoveTranslation, 'Réinitialiser l’anglais', locked, 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'],
    ];

    return (
        <div className={cx('flex flex-wrap items-center gap-3', className)}>
            <LocaleToggle
                locale={locale}
                onChange={onLocaleChange}
                coverage={coverage}
                dirty={dirty}
                busy={busy}
                disabled={saving}
            />
            <span className="text-[11px] text-gray-400">
                {isEnglish ? `Traduction de « ${entityLabel} »` : 'Édition du contenu source'}
            </span>
            {isEnglish &&
                actions.map(([onClick, label, disabled, tone]) => (
                    <button
                        key={label}
                        type="button"
                        onClick={onClick}
                        disabled={disabled}
                        className={cx(BASE, tone)}
                    >
                        {label}
                    </button>
                ))}
            {isEnglish && (
                <span className="text-[10px] text-gray-500">
                    Médias et champs techniques restent en lecture seule en anglais.
                </span>
            )}
        </div>
    );
};

export default EntityLocaleBar;
