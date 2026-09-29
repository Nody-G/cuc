'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { CockpitButton, CockpitField, CockpitInput, CockpitSelect } from '../ui';
import { ROLE_CATALOG, type CockpitRole, type InviteUserResult } from './users-model';
import { ModalShell } from './ModalShell';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (input: { email: string; fullName: string; role: CockpitRole }) => Promise<InviteUserResult>;
    /** Résultat transmis au parent (affichage du lien de repli, toast). */
    onResult: (result: InviteUserResult) => void;
}

/** Formulaire d'invitation d'un collaborateur (email, nom, rôle). */
export const InviteUserModal: React.FC<InviteUserModalProps> = ({
    isOpen,
    onClose,
    onInvite,
    onResult,
}) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<CockpitRole>('secretaire');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const close = () => {
        setEmail('');
        setFullName('');
        setRole('secretaire');
        setError(null);
        setSubmitting(false);
        onClose();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        const result = await onInvite({ email, fullName, role });
        setSubmitting(false);
        if (!result.success) {
            setError(result.error ?? 'Invitation impossible.');
            return;
        }
        onResult(result);
        close();
    };

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={close}
            title="Inviter un collaborateur"
            description="Un email d’invitation est envoyé si le SMTP est configuré ; sinon un lien copiable est généré."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <CockpitField label="Adresse email" hint="Un identifiant sans @ est complété en @cuc.fr.">
                    <CockpitInput
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="prenom.nom@cuc.fr"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </CockpitField>

                <CockpitField label="Nom complet">
                    <CockpitInput
                        type="text"
                        placeholder="Prénom Nom"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                    />
                </CockpitField>

                <CockpitField label="Rôle accordé">
                    <CockpitSelect value={role} onChange={(event) => setRole(event.target.value as CockpitRole)}>
                        {ROLE_CATALOG.map((descriptor) => (
                            <option key={descriptor.value} value={descriptor.value}>
                                {descriptor.label}
                            </option>
                        ))}
                    </CockpitSelect>
                </CockpitField>

                {error && (
                    <p className="text-[11px] text-red-400" role="alert">
                        {error}
                    </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                    <CockpitButton type="button" variant="ghost" size="sm" onClick={close}>
                        Annuler
                    </CockpitButton>
                    <CockpitButton type="submit" size="sm" icon={Send} loading={submitting}>
                        Envoyer l’invitation
                    </CockpitButton>
                </div>
            </form>
        </ModalShell>
    );
};
