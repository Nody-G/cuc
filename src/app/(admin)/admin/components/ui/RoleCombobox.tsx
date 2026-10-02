'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { filterRoleGroups, isRecognizedRole } from '@/lib/credit-role-options';
import { cx } from './design-system/cockpit-classes';

export interface RoleComboboxProps {
    /** Valeur persistée. Le parent garantit un repli d'affichage jamais vide. */
    value: string;
    /** Remonte chaque saisie **non vide** : le libellé libre est conservé tel quel. */
    onChange: (role: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    /** Libellé accessible du champ (le label parent n'est pas relié par `for`). */
    ariaLabel?: string;
}

/**
 * Combobox de rôle de plateau : liste déroulante des rôles canoniques **et**
 * saisie libre. Composant contrôlé et accessible (motif ARIA combobox/listbox).
 *
 * Modèle d'affichage : `draft ?? value`. Tant que l'utilisateur saisit, un
 * brouillon local prime ; au blur il est abandonné, ce qui restaure la valeur
 * persistée. Garde-fou : une chaîne vide n'est **jamais** propagée via
 * `onChange` (sinon l'anomalie « rôle manquant » réapparaîtrait alors que l'UI
 * affiche un repli).
 */
export const RoleCombobox: React.FC<RoleComboboxProps> = ({
    value,
    onChange,
    placeholder,
    className,
    disabled = false,
    ariaLabel,
}) => {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    /** Saisie locale en cours ; `null` = suivre la valeur persistée. */
    const [draft, setDraft] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);

    const query = draft ?? value;
    const groups = useMemo(() => filterRoleGroups(query), [query]);

    /** Rôles à plat + index global, pour la navigation clavier. */
    const { rows, options } = useMemo(() => {
        let index = 0;
        const nextRows = groups.map((group) => ({
            label: group.label,
            options: group.roles.map((role) => ({ role, index: index++ })),
        }));
        return { rows: nextRows, options: nextRows.flatMap((row) => row.options) };
    }, [groups]);

    const unrecognized = query.trim().length > 0 && !isRecognizedRole(query);

    const commit = (role: string) => {
        setDraft(role);
        setOpen(false);
        setHighlight(-1);
        if (role.trim().length > 0) onChange(role);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        setDraft(next);
        setOpen(true);
        setHighlight(-1);
        if (next.trim().length > 0) onChange(next);
    };

    const handleBlur = () => {
        setOpen(false);
        setHighlight(-1);
        // Abandon du brouillon : si le champ a été vidé, la valeur persistée
        // (jamais vide) est restaurée ; sinon l'affichage reste identique.
        setDraft(null);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setHighlight((h) => (options.length === 0 ? -1 : Math.min(h + 1, options.length - 1)));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setHighlight((h) => (h <= 0 ? 0 : h - 1));
        } else if (event.key === 'Enter') {
            if (open && highlight >= 0 && highlight < options.length) {
                event.preventDefault();
                commit(options[highlight].role);
            }
        } else if (event.key === 'Escape') {
            if (open) {
                event.preventDefault();
                setOpen(false);
                setHighlight(-1);
            }
        } else if (event.key === 'Tab') {
            setOpen(false);
        }
    };

    const activeOption = open && highlight >= 0 ? options[highlight] : undefined;

    return (
        <div className={cx('relative flex-1', className)}>
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeOption ? `${listId}-opt-${activeOption.index}` : undefined}
                aria-label={ariaLabel}
                autoComplete="off"
                disabled={disabled}
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
                className={cx(
                    'w-full bg-black/80 border rounded px-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FFE500] transition-colors',
                    unrecognized ? 'border-amber-500/60' : 'border-white/20'
                )}
            />

            {unrecognized && (
                <span className="absolute -bottom-3.5 left-0 text-[9px] font-mono uppercase tracking-wider text-amber-400/80">
                    hors nomenclature — conservé tel quel
                </span>
            )}

            {open && options.length > 0 && (
                <div
                    role="listbox"
                    id={listId}
                    aria-label="Rôles canoniques"
                    className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-zinc-950 border border-white/20 rounded-lg shadow-xl shadow-black/50 py-1"
                >
                    {rows.map((row) => (
                        <div key={row.label} role="group" aria-label={row.label}>
                            <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                                {row.label}
                            </div>
                            <ul role="presentation">
                                {row.options.map((option) => (
                                    <li
                                        key={option.role}
                                        id={`${listId}-opt-${option.index}`}
                                        role="option"
                                        aria-selected={option.index === highlight}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => commit(option.role)}
                                        onMouseEnter={() => setHighlight(option.index)}
                                        className={cx(
                                            'px-3 py-1.5 text-xs cursor-pointer',
                                            option.index === highlight
                                                ? 'bg-[#FFE500]/15 text-[#FFE500]'
                                                : 'text-zinc-300 hover:bg-white/5'
                                        )}
                                    >
                                        {option.role}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
