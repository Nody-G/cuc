'use client';

import React, { useId, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import {
    INTERNAL_LINK_OPTIONS,
    describeLink,
    isKnownInternalLink,
} from './link-options';

/**
 * Champ de lien du Cockpit — on **choisit** une page, on ne tape plus un chemin.
 *
 * - liste groupée : pages du site (source `SITE_PAGES_OPTIONS`) puis ancres ;
 * - « Lien personnalisé » n'apparaît que pour le cas réellement libre
 *   (externe, e-mail, téléphone) et ouvre alors une saisie dédiée ;
 * - la cible courante est affichée en clair (infobulle + bouton d'ouverture).
 *
 * Composant de présentation : la valeur reste portée par l'éditeur appelant.
 */

const INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#FFE500] focus:outline-none';

/** Valeur sentinelle : jamais un chemin réel, donc aucun risque de collision. */
const CUSTOM_VALUE = '__custom_link__';

export interface LinkFieldProps {
    value: string;
    onChange: (value: string) => void;
    /** Étiquette du champ (facultative si l'appelant en affiche déjà une). */
    label?: string;
    /** Chemin du champ (`hero.cta_primary_link`) : le clic dans l'aperçu le retrouve. */
    field?: string;
    /** Texte d'aide de la saisie libre. */
    placeholder?: string;
    disabled?: boolean;
}

export const LinkField: React.FC<LinkFieldProps> = ({
    value,
    onChange,
    label,
    field,
    placeholder = 'https://… , mailto:… , tel:…',
    disabled = false,
}) => {
    const selectId = useId();
    const known = isKnownInternalLink(value);
    const selectValue = known ? value : CUSTOM_VALUE;

    const groups = useMemo(
        () => ({
            pages: INTERNAL_LINK_OPTIONS.filter((option) => option.group === 'page'),
            intents: INTERNAL_LINK_OPTIONS.filter((option) => option.group === 'intention'),
            anchors: INTERNAL_LINK_OPTIONS.filter((option) => option.group === 'ancre'),
        }),
        []
    );

    const fieldAttr = field ? { 'data-cuc-field': field } : {};
    /** L'aperçu d'une ancre dépend de la page : on n'ouvre que les cibles absolues. */
    const canOpen = value.length > 0 && !value.startsWith('#');

    const handleSelect = (next: string) => {
        if (next === CUSTOM_VALUE) {
            // Une page connue cède la place à la saisie libre : champ vidé, le
            // placeholder guide (aucune valeur détournée en douce).
            if (known) onChange('');
            return;
        }
        onChange(next);
    };

    return (
        <div>
            {label && (
                <label htmlFor={selectId} className="block text-xs font-mono text-gray-400 mb-1">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-2">
                <select
                    id={selectId}
                    value={selectValue}
                    disabled={disabled}
                    onChange={(event) => handleSelect(event.target.value)}
                    className={INPUT_CLASS}
                    title={value ? `Cible actuelle : ${describeLink(value)}` : 'Choisir une page du site'}
                    {...(known ? fieldAttr : {})}
                >
                    <optgroup label="Pages du site">
                        {groups.pages.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Formulaires de contact (intention)">
                        {groups.intents.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                    <optgroup label="Ancres de page">
                        {groups.anchors.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                    <option value={CUSTOM_VALUE}>Lien personnalisé (externe, e-mail…)…</option>
                </select>

                {canOpen && (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={`Ouvrir dans un nouvel onglet — ${describeLink(value)}`}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>

            {selectValue === CUSTOM_VALUE && (
                <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className={`${INPUT_CLASS} mt-2 font-mono`}
                    {...fieldAttr}
                />
            )}
        </div>
    );
};

export default LinkField;
