'use client';

/**
 * Orchestration de la vue « Comptes & Accès ».
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : la vue ne fait que
 * consommer ce contrat — plus aucun appel réseau ni Supabase dans le composant,
 * et plus de double chargement (l'ancienne vue appelait `listCockpitUsers()`
 * deux fois au montage).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    deleteCockpitUser,
    inviteCockpitUser,
    listCockpitUsers,
    sendUserPasswordReset,
    setCockpitUserActive,
    updateUserRole,
} from '@/app/(admin)/admin/actions';
import {
    COCKPIT_ACCESS_ROLES,
    COCKPIT_ROLES,
    roleDescriptor,
    type CockpitRole,
    type CockpitUser,
    type InviteUserResult,
    type UsersListResult,
} from './users-model';

export interface UseUsersRolesEditorArgs {
    showToast: (msg: string) => void;
    /** `false` : la session n'a pas les droits — aucune requête n'est émise. */
    canManage: boolean;
}

export interface UsersRolesEditor {
    users: CockpitUser[];
    visibleUsers: CockpitUser[];
    counts: Record<CockpitRole, number>;
    query: string;
    setQuery: (value: string) => void;
    loading: boolean;
    error: string | null;
    mutatingId: string | null;
    refresh: () => void;
    changeRole: (user: CockpitUser, role: CockpitRole) => Promise<void>;
    toggleActive: (user: CockpitUser) => Promise<void>;
    remove: (user: CockpitUser) => Promise<void>;
    /** Retourne le lien de repli à afficher, ou `null`. */
    resetPassword: (user: CockpitUser) => Promise<string | null>;
    invite: (input: { email: string; fullName: string; role: CockpitRole }) => Promise<InviteUserResult>;
}

const ACCESS_ROLES = COCKPIT_ACCESS_ROLES as readonly string[];

function emptyCounts(): Record<CockpitRole, number> {
    return COCKPIT_ROLES.reduce(
        (acc, role) => ({ ...acc, [role]: 0 }),
        {} as Record<CockpitRole, number>,
    );
}

export function useUsersRolesEditor({
    showToast,
    canManage,
}: UseUsersRolesEditorArgs): UsersRolesEditor {
    const [users, setUsers] = useState<CockpitUser[]>([]);
    const [loading, setLoading] = useState(canManage);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [mutatingId, setMutatingId] = useState<string | null>(null);

    const applyResult = useCallback((result: UsersListResult) => {
        if (!result.success) {
            setError(result.error ?? 'Erreur de chargement des comptes.');
            setUsers([]);
            return;
        }
        setError(null);
        setUsers(result.users);
    }, []);

    const load = useCallback(async () => {
        if (!canManage) {
            setLoading(false);
            return;
        }
        setLoading(true);
        applyResult(await listCockpitUsers());
        setLoading(false);
    }, [applyResult, canManage]);

    // Chargement initial : l'état est posé dans le callback de la promesse, jamais
    // synchroniquement dans le corps de l'effet (react-hooks/set-state-in-effect).
    useEffect(() => {
        if (!canManage) return;
        let cancelled = false;
        listCockpitUsers().then((result) => {
            if (cancelled) return;
            applyResult(result);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [applyResult, canManage]);

    const counts = useMemo(
        () =>
            users.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] ?? 0) + 1;
                return acc;
            }, emptyCounts()),
        [users],
    );

    const visibleUsers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return users;
        return users.filter((user) => {
            const roleLabel = roleDescriptor(user.role).label.toLowerCase();
            return (
                user.email.toLowerCase().includes(needle) ||
                (user.fullName ?? '').toLowerCase().includes(needle) ||
                roleLabel.includes(needle)
            );
        });
    }, [query, users]);

    const replaceUser = useCallback((id: string, patch: Partial<CockpitUser>) => {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...patch } : user)));
    }, []);

    const changeRole = useCallback(
        async (user: CockpitUser, role: CockpitRole) => {
            if (user.role === role) return;
            setMutatingId(user.id);
            const result = await updateUserRole(user.id, role);
            setMutatingId(null);
            if (!result.success) {
                showToast(`Erreur : ${result.error}`);
                return;
            }
            if (ACCESS_ROLES.includes(role)) {
                replaceUser(user.id, { role });
            } else {
                // Le rôle perd l'accès Cockpit : la ligne quitte la liste.
                setUsers((prev) => prev.filter((item) => item.id !== user.id));
            }
            showToast(`Rôle mis à jour : ${roleDescriptor(role).label}`);
        },
        [replaceUser, showToast],
    );

    const toggleActive = useCallback(
        async (user: CockpitUser) => {
            const nextActive = !user.isActive;
            setMutatingId(user.id);
            const result = await setCockpitUserActive(user.id, nextActive);
            setMutatingId(null);
            if (!result.success) {
                showToast(`Erreur : ${result.error}`);
                return;
            }
            replaceUser(user.id, { isActive: nextActive });
            showToast(nextActive ? 'Accès rétabli' : 'Accès révoqué');
        },
        [replaceUser, showToast],
    );

    const remove = useCallback(
        async (user: CockpitUser) => {
            setMutatingId(user.id);
            const result = await deleteCockpitUser(user.id);
            setMutatingId(null);
            if (!result.success) {
                showToast(`Erreur : ${result.error}`);
                return;
            }
            setUsers((prev) => prev.filter((item) => item.id !== user.id));
            showToast(result.warning ? `Supprimé — ${result.warning}` : 'Compte supprimé');
        },
        [showToast],
    );

    const resetPassword = useCallback(
        async (user: CockpitUser) => {
            setMutatingId(user.id);
            const result = await sendUserPasswordReset(user.id);
            setMutatingId(null);
            if (!result.success) {
                showToast(`Erreur : ${result.error}`);
                return null;
            }
            if (result.emailSent) {
                showToast(`Email de réinitialisation envoyé à ${user.email}`);
                return null;
            }
            showToast('SMTP indisponible : copiez le lien de réinitialisation.');
            return result.resetLink ?? null;
        },
        [showToast],
    );

    const invite = useCallback(
        async (input: { email: string; fullName: string; role: CockpitRole }) => {
            const result = await inviteCockpitUser(input);
            if (!result.success) return result;
            await load();
            return result;
        },
        [load],
    );

    return {
        users,
        visibleUsers,
        counts,
        query,
        setQuery,
        loading,
        error,
        mutatingId,
        refresh: () => void load(),
        changeRole,
        toggleActive,
        remove,
        resetPassword,
        invite,
    };
}
