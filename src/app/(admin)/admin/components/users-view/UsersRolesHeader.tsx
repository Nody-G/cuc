'use client';

import React from 'react';
import { RefreshCw, Search, Shield, UserPlus } from 'lucide-react';
import { CockpitButton, CockpitIconButton, CockpitInput, CockpitViewHeader } from '../ui';

interface UsersRolesHeaderProps {
    total: number;
    search: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onInvite: () => void;
    loading: boolean;
}

/** En-tête de la vue « Comptes & Accès » : recherche, rafraîchissement, invitation. */
export const UsersRolesHeader: React.FC<UsersRolesHeaderProps> = ({
    total,
    search,
    onSearchChange,
    onRefresh,
    onInvite,
    loading,
}) => (
    <CockpitViewHeader
        eyebrow="Sécurité & Droits d’Accès"
        icon={Shield}
        title="Comptes & Accès"
        description={`${total} collaborateur(s) disposant d’un accès au Cockpit.`}
        actions={
            <>
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <CockpitInput
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Rechercher…"
                        aria-label="Rechercher un collaborateur"
                        className="pl-8 w-44"
                    />
                </div>
                <CockpitIconButton
                    icon={RefreshCw}
                    label="Rafraîchir"
                    disabled={loading}
                    onClick={onRefresh}
                />
                <CockpitButton icon={UserPlus} size="sm" onClick={onInvite}>
                    Inviter
                </CockpitButton>
            </>
        }
    />
);
