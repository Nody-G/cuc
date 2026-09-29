'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../ui';

interface ModalShellProps {
    isOpen: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

/**
 * Coquille de modale du Cockpit : superposition, dialogue ARIA, piège de focus
 * (`useFocusTrap`) et fermeture sur `Échap`. Mutualise la structure partagée par
 * les dialogues « Comptes & Accès ».
 */
export const ModalShell: React.FC<ModalShellProps> = ({
    isOpen,
    title,
    description,
    onClose,
    children,
    footer,
    maxWidth = 'max-w-lg',
}) => {
    const trapRef = useFocusTrap(isOpen, onClose);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={trapRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`relative w-full ${maxWidth} bg-[#0D0D12] border border-white/10 rounded-2xl shadow-2xl`}
            >
                <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">{title}</h2>
                        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5 space-y-4">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 p-5 border-t border-white/10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
