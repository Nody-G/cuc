import React from 'react';
import { COCKPIT_INPUT_CLASS, COCKPIT_LABEL_CLASS, cx } from './cockpit-classes';

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
