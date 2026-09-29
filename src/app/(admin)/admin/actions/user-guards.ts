/**
 * Gardes & utilitaires partagés de la gestion des comptes du Cockpit.
 *
 * Module serveur **sans** directive `'use server'` : ses fonctions ne sont pas
 * exposées comme Server Actions — elles sont importées par `user-accounts.ts`
 * et `user-roles.ts`, qui portent seuls la directive et la surface publique.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from './auth';
import {
    COCKPIT_ACCESS_ROLES,
    USER_MANAGER_ROLES,
    isUserManagerRole,
} from '../components/users-view/users-model';

export type AdminClient = ReturnType<typeof createAdminClient>;

export const COCKPIT_ACCESS_ROLE_LIST: string[] = [...COCKPIT_ACCESS_ROLES];
export const MANAGER_ROLE_LIST: string[] = [...USER_MANAGER_ROLES];

/** Durée de bannissement d'un compte désactivé (≈ 100 ans, réversible). */
export const BAN_DURATION = '876000h';

export type ManagerGuard = { ok: true; actorId: string } | { ok: false; error: string };

/** Vérifie que la session courante a le droit d'administrer les comptes. */
export async function requireManager(): Promise<ManagerGuard> {
    const profile = await getCurrentUserProfile();
    if (!profile?.id) {
        return { ok: false, error: 'Session expirée — reconnectez-vous au Cockpit.' };
    }
    if (!isUserManagerRole(profile.role)) {
        return {
            ok: false,
            error: 'Accès refusé : la gestion des comptes est réservée à la Direction.',
        };
    }
    return { ok: true, actorId: profile.id };
}

/** Compte les rôles de direction (`excludeId` retranché si fourni). */
export async function countManagers(
    admin: AdminClient,
    excludeId?: string,
): Promise<number | null> {
    const { data, error } = await admin.from('profiles').select('id').in('role', MANAGER_ROLE_LIST);
    if (error) return null;
    return (data ?? []).filter((row) => row.id !== excludeId).length;
}

/**
 * Lit le statut de connexion depuis Supabase Auth (`banned_until`).
 *
 * Ne touche jamais la table `profiles`, partagée avec CUC Sign.
 */
export async function readAccountStatus(
    admin: AdminClient,
): Promise<Map<string, { isActive: boolean; lastSignInAt: string | null }>> {
    const status = new Map<string, { isActive: boolean; lastSignInAt: string | null }>();
    try {
        const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const now = Date.now();
        for (const account of data?.users ?? []) {
            const bannedUntil = (account as { banned_until?: string | null }).banned_until ?? null;
            const isBanned = bannedUntil ? new Date(bannedUntil).getTime() > now : false;
            status.set(account.id, {
                isActive: !isBanned,
                lastSignInAt: account.last_sign_in_at ?? null,
            });
        }
    } catch (err: unknown) {
        console.warn('[users] Statut de connexion indisponible :', err);
    }
    return status;
}

/** Renseigne (ou crée) la ligne `profiles` d'un compte, sans écrasement profond. */
export async function applyProfile(
    admin: AdminClient,
    targetId: string,
    email: string,
    role: string,
    fullName: string | null,
): Promise<string | null> {
    const { data: existing, error: readError } = await admin
        .from('profiles')
        .select('id')
        .eq('id', targetId)
        .maybeSingle();
    if (readError) return readError.message;

    if (existing) {
        const { error } = await admin
            .from('profiles')
            .update({
                role,
                updated_at: new Date().toISOString(),
                ...(fullName ? { full_name: fullName } : {}),
            })
            .eq('id', targetId);
        return error?.message ?? null;
    }

    const { error } = await admin
        .from('profiles')
        .insert({ id: targetId, email, role, full_name: fullName });
    return error?.message ?? null;
}

/** URL de retour des liens d'invitation / réinitialisation (si configurée). */
export function authRedirectTo(): string | undefined {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) return undefined;
    return `${origin.replace(/\/+$/, '')}/admin/login`;
}

/** Client service role du Cockpit (raccourci local). */
export function adminClient(): AdminClient {
    return createAdminClient();
}
