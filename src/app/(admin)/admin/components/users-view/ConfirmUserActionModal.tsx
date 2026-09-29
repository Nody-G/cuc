'use client';

import React from 'react';
import { CockpitButton } from '../ui';
import { ModalShell } from './ModalShell';

interface ConfirmUserActionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    tone?: 'danger' | 'accent';
    busy?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

/** Confirmation d'une action sensible (désactivation, suppression). */
export const ConfirmUserActionModal: React.FC<ConfirmUserActionModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    tone = 'danger',
    busy = false,
    onConfirm,
    onClose,
}) => (
    <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={
            <>
                <CockpitButton type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
                    Annuler
                </CockpitButton>
                <CockpitButton
                    type="button"
                    size="sm"
                    variant={tone === 'danger' ? 'danger' : 'primary'}
                    loading={busy}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </CockpitButton>
            </>
        }
    >
        <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
    </ModalShell>
);
