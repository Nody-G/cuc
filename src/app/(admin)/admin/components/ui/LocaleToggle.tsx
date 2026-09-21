'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cx } from './primitives';

/**
 * Bascule de langue éditoriale du Cockpit (`FR | EN`).
 *
 * Le français reste la source : passer en anglais n'ouvre pas un autre contenu,
 * cela affiche le **même formulaire** rempli avec le contenu localisé (donc le
 * français là où la traduction n'existe pas encore). La pastille indique la
 * couverture réelle de la traduction, et un point signale une saisie non
 * enregistrée.
 *
 * Composant du design system : aucune logique de données, uniquement l'état.
 */

export type EditorLocaleOption = 'fr' | 'en';

export interface LocaleToggleProps {
    /** Locale active. */
    locale: EditorLocaleOption;
    /** Demande de changement de locale (la confirmation éventuelle est au parent). */
    onChange: (locale: EditorLocaleOption) => void;
    /** Couverture de la traduction anglaise (`null` si non mesurée). */
    coverage?: { percent: number; translated: number; total: number } | null;
    /** Modifications non enregistrées dans la locale traduite. */
    dirty?: boolean;
    /** Échange en cours avec la base. */
    busy?: boolean;
    /** Bascule désactivée (enregistrement en cours). */
    disabled?: boolean;
    className?: string;
}

const OPTIONS: Array<{ value: EditorLocaleOption; code: string; label: string; title: string }> = [
    {
        value: 'fr',
        code: 'FR',
        label: 'Français',
        title: 'Éditer le contenu source français',
    },
    {
        value: 'en',
        code: 'EN',
        label: 'English',
        title: 'Éditer la traduction anglaise, dans le même formulaire',
    },
];

export const LocaleToggle: React.FC<LocaleToggleProps> = ({
    locale,
    onChange,
    coverage = null,
    dirty = false,
    busy = false,
    disabled = false,
    className,
}) => (
    <div className={cx('flex items-center gap-2', className)}>
        <div
            role="group"
            aria-label="Langue d’édition"
            className="inline-flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5"
        >
            {OPTIONS.map((option) => {
                const active = option.value === locale;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        disabled={disabled}
                        aria-pressed={active}
                        title={option.title}
                        className={cx(
                            'px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50',
                            active
                                ? 'bg-[#FFE500] text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <span className="font-mono">{option.code}</span>
                        <span className="ml-1.5 font-sans normal-case tracking-normal font-medium">
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>

        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" aria-label="Chargement" />}

        {coverage && (
            <span
                className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-300"
                title={`${coverage.translated} champ(s) traduit(s) sur ${coverage.total}. Les champs non traduits affichent le texte français et restent servis en français sur la vitrine.`}
            >
                EN {coverage.percent} % · {coverage.translated}/{coverage.total}
            </span>
        )}

        {dirty && (
            <span
                className="text-[10px] font-mono px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300"
                title="Des modifications anglaises ne sont pas enregistrées."
            >
                non enregistré
            </span>
        )}
    </div>
);

export default LocaleToggle;
