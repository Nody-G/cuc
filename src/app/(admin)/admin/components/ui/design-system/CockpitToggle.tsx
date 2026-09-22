import React from 'react';
import { cx } from './cockpit-classes';

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
