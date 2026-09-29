'use client';

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { CockpitButton } from '../ui';
import { ModalShell } from './ModalShell';

interface ActionLinkModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    link: string;
    onClose: () => void;
}

/**
 * Affiche un lien de repli (invitation ou réinitialisation) à transmettre
 * manuellement quand l'email Supabase n'est pas parti.
 */
export const ActionLinkModal: React.FC<ActionLinkModalProps> = ({
    isOpen,
    title,
    description,
    link,
    onClose,
}) => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    return (
        <ModalShell isOpen={isOpen} onClose={onClose} title={title} description={description}>
            <div className="rounded-lg bg-black/50 border border-white/10 p-3 text-[11px] font-mono text-gray-300 break-all">
                {link}
            </div>
            <div className="flex items-center justify-end gap-2">
                <CockpitButton type="button" variant="ghost" size="sm" onClick={onClose}>
                    Fermer
                </CockpitButton>
                <CockpitButton type="button" size="sm" icon={Copy} onClick={() => void copy()}>
                    {copied ? 'Copié !' : 'Copier le lien'}
                </CockpitButton>
            </div>
        </ModalShell>
    );
};
