'use client';

import React from 'react';
import { KeyRound, Trash2, UserCheck, UserX } from 'lucide-react';
import { CockpitIconButton, CockpitSelect } from '../ui';
import { ROLE_CATALOG, type CockpitRole, type CockpitUser } from './users-model';

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

function formatLastSignIn(value: string | null): string {
    if (!value) return 'Jamais connecté';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Jamais connecté' : DATE_FORMAT.format(date);
}

interface UserRoleRowProps {
    user: CockpitUser;
    /** Ligne de la session courante — actions destructives désactivées. */
    isSelf: boolean;
    busy: boolean;
    onChangeRole: (role: CockpitRole) => void;
    onToggleActive: () => void;
    onResetPassword: () => void;
    onDelete: () => void;
}

/** Ligne d'un collaborateur : identité, rôle, statut et actions. */
export const UserRoleRow: React.FC<UserRoleRowProps> = ({
    user,
    isSelf,
    busy,
    onChangeRole,
    onToggleActive,
    onResetPassword,
    onDelete,
}) => {
    const displayName = user.fullName || user.email || 'Utilisateur CUC';

    return (
        <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-sm font-black text-[#FFE500] uppercase shrink-0">
                    {displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white uppercase tracking-tight truncate">
                            {displayName}
                        </span>
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5 truncate">{user.email}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                        Dernière connexion : {formatLastSignIn(user.lastSignInAt)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 lg:shrink-0">
                <CockpitSelect
                    value={user.role}
                    disabled={busy}
                    aria-label={`Rôle de ${displayName}`}
                    onChange={(event) => onChangeRole(event.target.value as CockpitRole)}
                    className="min-w-[190px]"
                >
                    {ROLE_CATALOG.map((descriptor) => (
                        <option key={descriptor.value} value={descriptor.value}>
                            {descriptor.label}
                        </option>
                    ))}
                </CockpitSelect>

                <CockpitIconButton
                    icon={KeyRound}
                    label="Réinitialiser le mot de passe"
                    disabled={busy}
                    onClick={onResetPassword}
                />
                <CockpitIconButton
                    icon={user.isActive ? UserX : UserCheck}
                    label={user.isActive ? 'Désactiver l’accès' : 'Rétablir l’accès'}
                    tone={user.isActive ? 'danger' : 'accent'}
                    disabled={busy || isSelf}
                    onClick={onToggleActive}
                />
                <CockpitIconButton
                    icon={Trash2}
                    label="Supprimer le compte"
                    tone="danger"
                    disabled={busy || isSelf}
                    onClick={onDelete}
                />
            </div>
        </div>
    );
};
