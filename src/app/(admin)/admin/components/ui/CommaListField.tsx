'use client';

import React, { useCallback, useRef } from 'react';
import { formatCommaList, parseCommaList } from '@/lib/comma-list';

export interface CommaListFieldProps {
    /** Liste affichée au montage. Le champ est **non contrôlé** ensuite. */
    value: readonly string[];
    /** Reçoit la liste analysée à chaque frappe (jamais reformatée en retour). */
    onChange: (items: string[]) => void;
    id?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    'aria-label'?: string;
}

/**
 * Champ d'édition d'une liste séparée par des virgules.
 *
 * **Le texte tapé n'est jamais réécrit pendant la frappe.** Un champ contrôlé
 * qui re-normalise (`split` → `trim` → `join`) à chaque `onChange` produit une
 * valeur différente de la saisie : React la réinjecte et replace le curseur en
 * fin de champ, ce qui interdit de corriger le milieu d'une ligne. Ici :
 *
 * - la saisie met à jour le parent (`onChange`) mais l'`<input>` reste non
 *   contrôlé — React n'écrit donc jamais dans le champ pendant la frappe ;
 * - la forme canonique (`a, b, c`) n'est appliquée qu'au **blur**.
 *
 * Si l'enregistrement sous-jacent change sans que le composant soit remonté,
 * passer un `key` (par exemple l'`id` de la fiche) pour réinitialiser le texte.
 */
export const CommaListField: React.FC<CommaListFieldProps> = ({
    value,
    onChange,
    id,
    placeholder,
    className,
    disabled,
    'aria-label': ariaLabel,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(parseCommaList(event.target.value));
        },
        [onChange]
    );

    const handleBlur = useCallback(() => {
        const input = inputRef.current;
        if (!input) return;
        const canonical = formatCommaList(parseCommaList(input.value));
        if (input.value !== canonical) input.value = canonical;
    }, []);

    return (
        <input
            ref={inputRef}
            id={id}
            type="text"
            defaultValue={formatCommaList(value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
        />
    );
};
