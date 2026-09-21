'use client';

import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

/**
 * Design system du Cockpit CUC.
 *
 * Ces primitives encapsulent les motifs Tailwind répétés dans les vues admin
 * (champs, boutons, interrupteurs, en-têtes de section, états vides, squelettes)
 * afin de garantir une cohérence visuelle stricte et de réduire la duplication.
 *
 * Palette : accent #FFE500, fonds #060608 / #070709 / #0D0D12.
 */

/* -------------------------------------------------------------------------- */
/*  Utilitaires de classes                                                     */
/* -------------------------------------------------------------------------- */

export function cx(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}

export const COCKPIT_INPUT_CLASS =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FFE500] transition-colors';

export const COCKPIT_LABEL_CLASS = 'block text-xs font-mono text-gray-400 mb-1';

/* -------------------------------------------------------------------------- */
/*  En-tête de vue                                                             */
/* -------------------------------------------------------------------------- */

export interface CockpitViewHeaderProps {
    /** Libellé mono en majuscules affiché au-dessus du titre. */
    eyebrow: string;
    /** Icône lucide affichée à gauche de l'eyebrow. */
    icon?: LucideIcon;
    /** Titre principal de la vue. */
    title: string;
    /** Description courte sous le titre. */
    description?: string;
    /** Actions alignées à droite (boutons, filtres…). */
    actions?: React.ReactNode;
}

export const CockpitViewHeader: React.FC<CockpitViewHeaderProps> = ({
    eyebrow,
    icon: Icon,
    title,
    description,
    actions,
}) => (
    <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{eyebrow}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                {title}
            </h1>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Carte / panneau                                                            */
/* -------------------------------------------------------------------------- */

export interface CockpitCardProps {
    children: React.ReactNode;
    className?: string;
    /** Padding interne. `none` laisse la carte gérer ses propres zones. */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Rend la carte interactive (survol accentué). */
    interactive?: boolean;
}

const CARD_PADDING: Record<NonNullable<CockpitCardProps['padding']>, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
};

export const CockpitCard: React.FC<CockpitCardProps> = ({
    children,
    className,
    padding = 'md',
    interactive = false,
}) => (
    <div
        className={cx(
            'bg-[#0D0D12] border border-white/10 rounded-xl',
            CARD_PADDING[padding],
            interactive && 'transition-colors hover:border-[#FFE500]/50',
            className,
        )}
    >
        {children}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Bouton                                                                     */
/* -------------------------------------------------------------------------- */

export type CockpitButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type CockpitButtonSize = 'sm' | 'md';

export interface CockpitButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: CockpitButtonVariant;
    size?: CockpitButtonSize;
    icon?: LucideIcon;
    /** Affiche un spinner et désactive le bouton. */
    loading?: boolean;
}

const BUTTON_VARIANTS: Record<CockpitButtonVariant, string> = {
    primary: 'bg-[#FFE500] hover:bg-[#ffe600e6] text-black border border-transparent',
    secondary:
        'bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-white/30',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-transparent',
    danger: 'bg-red-600/90 hover:bg-red-600 text-white border border-transparent',
};

const BUTTON_SIZES: Record<CockpitButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
};

export const CockpitButton: React.FC<CockpitButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    disabled,
    className,
    children,
    ...rest
}) => (
    <button
        {...rest}
        disabled={disabled || loading}
        className={cx(
            'inline-flex items-center justify-center rounded-lg font-black uppercase tracking-wider transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE500]/60',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            BUTTON_VARIANTS[variant],
            BUTTON_SIZES[size],
            className,
        )}
    >
        {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
            Icon && <Icon className="w-3.5 h-3.5" />
        )}
        {children}
    </button>
);

/* -------------------------------------------------------------------------- */
/*  Bouton icône                                                               */
/* -------------------------------------------------------------------------- */

export interface CockpitIconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    /** Libellé accessible obligatoire (a11y). */
    label: string;
    tone?: 'default' | 'accent' | 'danger';
}

const ICON_TONES: Record<NonNullable<CockpitIconButtonProps['tone']>, string> = {
    default: 'text-gray-400 hover:text-white hover:bg-white/10',
    accent: 'text-[#FFE500] hover:bg-[#FFE500]/15',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/15',
};

export const CockpitIconButton: React.FC<CockpitIconButtonProps> = ({
    icon: Icon,
    label,
    tone = 'default',
    className,
    ...rest
}) => (
    <button
        {...rest}
        aria-label={label}
        title={label}
        className={cx(
            'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE500]/60',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            ICON_TONES[tone],
            className,
        )}
    >
        <Icon className="w-4 h-4" />
    </button>
);

/* -------------------------------------------------------------------------- */
/*  Champ texte / zone de texte                                                */
/* -------------------------------------------------------------------------- */

export interface CockpitFieldProps {
    label?: string;
    /** Aide contextuelle sous le champ. */
    hint?: string;
    /** Message d'erreur (prioritaire sur le hint). */
    error?: string;
    /** Identifiant du champ (généré si absent). */
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}

export const CockpitField: React.FC<CockpitFieldProps> = ({
    label,
    hint,
    error,
    htmlFor,
    children,
    className,
}) => (
    <div className={className}>
        {label && (
            <label htmlFor={htmlFor} className={COCKPIT_LABEL_CLASS}>
                {label}
            </label>
        )}
        {children}
        {error ? (
            <p className="mt-1 text-[11px] text-red-400">{error}</p>
        ) : (
            hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
        )}
    </div>
);

export const CockpitInput: React.FC<
    React.InputHTMLAttributes<HTMLInputElement>
> = ({ className, ...rest }) => (
    <input {...rest} className={cx(COCKPIT_INPUT_CLASS, className)} />
);

export const CockpitTextarea: React.FC<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ...rest }) => (
    <textarea {...rest} className={cx(COCKPIT_INPUT_CLASS, 'resize-y', className)} />
);

export const CockpitSelect: React.FC<
    React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ className, children, ...rest }) => (
    <select {...rest} className={cx(COCKPIT_INPUT_CLASS, className)}>
        {children}
    </select>
);

/* -------------------------------------------------------------------------- */
/*  Interrupteur                                                               */
/* -------------------------------------------------------------------------- */

export interface CockpitToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Libellé principal. */
    label?: string;
    /** Description sous le libellé. */
    description?: string;
    disabled?: boolean;
    /** Encapsule le tout dans une ligne encadrée (motif « réglage »). */
    boxed?: boolean;
    className?: string;
}

export const CockpitToggle: React.FC<CockpitToggleProps> = ({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    boxed = false,
    className,
}) => {
    const describedById = React.useId();
    const control = (
        <label
            className={cx(
                'relative inline-flex items-center cursor-pointer shrink-0',
                disabled && 'opacity-50 cursor-not-allowed',
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                aria-label={label || undefined}
                aria-describedby={description ? describedById : undefined}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFE500] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FFE500]/60" />
        </label>
    );

    if (!boxed && !label && !description) return control;

    return (
        <div
            className={cx(
                boxed && 'p-4 rounded-lg bg-white/5 border border-white/10',
                'flex items-center justify-between gap-4',
                className,
            )}
        >
            {(label || description) && (
                <div className="min-w-0">
                    {label && <div className="text-sm font-bold text-white">{label}</div>}
                    {description && (
                        <div id={describedById} className="text-xs text-gray-400">
                            {description}
                        </div>
                    )}
                </div>
            )}
            {control}
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  Badge                                                                      */
/* -------------------------------------------------------------------------- */

export type CockpitBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const BADGE_TONES: Record<CockpitBadgeTone, string> = {
    neutral: 'bg-white/10 text-gray-300 border-white/15',
    accent: 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export interface CockpitBadgeProps {
    children: React.ReactNode;
    tone?: CockpitBadgeTone;
    className?: string;
}

export const CockpitBadge: React.FC<CockpitBadgeProps> = ({
    children,
    tone = 'neutral',
    className,
}) => (
    <span
        className={cx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border',
            BADGE_TONES[tone],
            className,
        )}
    >
        {children}
    </span>
);

/* -------------------------------------------------------------------------- */
/*  État vide                                                                  */
/* -------------------------------------------------------------------------- */

export interface CockpitEmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const CockpitEmptyState: React.FC<CockpitEmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}) => (
    <div
        className={cx(
            'flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02]',
            className,
        )}
    >
        {Icon && (
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gray-500" />
            </div>
        )}
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {description && (
            <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Squelette de chargement                                                    */
/* -------------------------------------------------------------------------- */

export interface CockpitSkeletonProps {
    className?: string;
}

export const CockpitSkeleton: React.FC<CockpitSkeletonProps> = ({ className }) => (
    <div className={cx('animate-pulse rounded-lg bg-white/5', className)} />
);

export interface CockpitSkeletonListProps {
    /** Nombre de lignes à afficher. */
    rows?: number;
    className?: string;
}

export const CockpitSkeletonList: React.FC<CockpitSkeletonListProps> = ({
    rows = 4,
    className,
}) => (
    <div className={cx('space-y-3', className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, idx) => (
            <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#0D0D12] border border-white/10"
            >
                <CockpitSkeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <CockpitSkeleton className="h-3 w-1/3" />
                    <CockpitSkeleton className="h-3 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Barre d'actions de bas de formulaire                                       */
/* -------------------------------------------------------------------------- */

export interface CockpitFormActionsProps {
    children: React.ReactNode;
    className?: string;
}

export const CockpitFormActions: React.FC<CockpitFormActionsProps> = ({
    children,
    className,
}) => (
    <div
        className={cx(
            'pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2',
            className,
        )}
    >
        {children}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Rendu progressif de longues listes                                         */
/* -------------------------------------------------------------------------- */

export interface CockpitLoadMoreProps {
    /** Nombre d'éléments actuellement montés. */
    visibleCount: number;
    /** Nombre total d'éléments dans la liste source. */
    total: number;
    /** Étend la fenêtre de rendu. */
    onLoadMore: () => void;
    /** Libellé du bouton (défaut : « Afficher plus »). */
    label?: string;
    className?: string;
}

/**
 * Pied de liste pour le rendu progressif (`useProgressiveList`).
 *
 * Affiche un compteur sobre « X sur Y » et un bouton d'extension. Ne rend rien
 * lorsque tous les éléments sont déjà montés, afin de ne pas ajouter de bruit
 * visuel sur les listes courtes.
 */
export const CockpitLoadMore: React.FC<CockpitLoadMoreProps> = ({
    visibleCount,
    total,
    onLoadMore,
    label = 'Afficher plus',
    className,
}) => {
    if (visibleCount >= total) return null;
    return (
        <div className={cx('flex flex-col items-center gap-2 pt-2', className)}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                {visibleCount} sur {total} affichés
            </span>
            <button
                type="button"
                onClick={onLoadMore}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
                {label}
            </button>
        </div>
    );
};
