import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cx } from './cockpit-classes';

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
