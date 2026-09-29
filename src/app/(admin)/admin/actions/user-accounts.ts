'use server';

/**
 * Lecture et cycle de vie des comptes du Cockpit — Server Actions.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Chaque mutation est gardée par
 * `requireManager()` et journalisée via `logAuditEvent()`. Les erreurs sont
 * remontées explicitement — `supabase-js` ne lève pas (cf. `durability_health.md` § 8).
 */

import { writeActivityLog } from '@/lib/logging/write';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from './audit';
import {
    evaluateAccountRemoval,
    isCockpitRole,
    type CockpitUser,
    type PasswordResetResult,
    type UserMutationResult,
    type UsersListResult,
} from '../components/users-view/users-model';
import {
    BAN_DURATION,
    COCKPIT_ACCESS_ROLE_LIST,
    adminClient,
    countManagers,
    readAccountStatus,
    requireManager,
} from './user-guards';

/** Liste les collaborateurs disposant d'un accès Cockpit, statut compris. */
export async function listCockpitUsers(): Promise<UsersListResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error, users: [] };

    const admin = adminClient();
    const { data, error } = await admin
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .in('role', COCKPIT_ACCESS_ROLE_LIST)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message, users: [] };

    const status = await readAccountStatus(admin);

    const users: CockpitUser[] = (data ?? []).flatMap((row) => {
        if (!isCockpitRole(row.role)) return [];
        const account = status.get(row.id);
        return [
            {
                id: row.id,
                email: row.email ?? '',
                fullName: row.full_name ?? null,
                role: row.role,
                isActive: account?.isActive ?? true,
                lastSignInAt: account?.lastSignInAt ?? null,
                createdAt: row.created_at ?? '',
            },
        ];
    });

    return { success: true, users };
}

/** Active ou désactive l'accès au Cockpit (bannissement Supabase Auth réversible). */
export async function setCockpitUserActive(
    userId: string,
    active: boolean,
): Promise<UserMutationResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = adminClient();
    const { data: target, error: readError } = await admin
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();
    if (readError) return { success: false, error: readError.message };
    if (!target) return { success: false, error: 'Compte introuvable.' };

    if (!active) {
        const remaining = await countManagers(admin, userId);
        if (remaining === null) {
            return { success: false, error: 'Impossible de vérifier les comptes de direction.' };
        }
        const decision = evaluateAccountRemoval({
            actorId: guard.actorId,
            targetId: userId,
            targetRole: isCockpitRole(target.role) ? target.role : 'student',
            remainingManagerCount: remaining,
        });
        if (!decision.allowed) return { success: false, error: decision.reason };
    }

    const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: active ? 'none' : BAN_DURATION,
    });
    if (error) {
        return {
            success: false,
            error: `${error.message} (la clé service role Supabase est-elle configurée ?)`,
        };
    }

    await logAuditEvent(
        active ? 'user.activate' : 'user.deactivate',
        target.email ?? userId,
        active ? 'accès rétabli' : 'accès révoqué',
    );
    return { success: true };
}

/** Envoie un lien de réinitialisation de mot de passe (email, repli lien copiable). */
export async function sendUserPasswordReset(userId: string): Promise<PasswordResetResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = adminClient();
    const { data: target, error: readError } = await admin
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();
    if (readError) return { success: false, error: readError.message };
    if (!target?.email) return { success: false, error: 'Adresse email introuvable pour ce compte.' };

    const supabase = await createClient();
    const redirectTo = authRedirectToSafe();
    const { error: mailError } = await supabase.auth.resetPasswordForEmail(
        target.email,
        redirectTo ? { redirectTo } : undefined,
    );

    if (!mailError) {
        await logAuditEvent('user.password.reset', target.email, 'email envoyé');
        return { success: true, emailSent: true };
    }

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: target.email,
        ...(redirectTo ? { options: { redirectTo } } : {}),
    });
    if (linkError || !link?.properties?.action_link) {
        return { success: false, error: linkError?.message || mailError.message };
    }

    /**
     * Repli assumé mais **visible** : l'e-mail n'est pas parti, l'utilisateur
     * devra être prévenu autrement. Ce cas n'existait nulle part hors des
     * journaux serveur, alors qu'il change ce que l'exploitant doit faire.
     */
    void writeActivityLog({
        level: 'warning',
        source: 'email',
        category: 'email.smtp_failed',
        message: 'Réinitialisation de mot de passe sans envoi d’e-mail : lien copiable généré en repli.',
        target: target.email,
        origin: 'sendUserPasswordReset',
        actorId: guard.actorId,
    });

    await logAuditEvent('user.password.reset', target.email, 'lien généré (SMTP indisponible)');
    return { success: true, emailSent: false, resetLink: link.properties.action_link };
}

/** Supprime définitivement un compte — refusé si le profil est relié à des données métier. */
export async function deleteCockpitUser(userId: string): Promise<UserMutationResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = adminClient();
    const { data: target, error: readError } = await admin
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();
    if (readError) return { success: false, error: readError.message };
    if (!target) return { success: false, error: 'Compte introuvable.' };

    const remaining = await countManagers(admin, userId);
    if (remaining === null) {
        return { success: false, error: 'Impossible de vérifier les comptes de direction.' };
    }
    const decision = evaluateAccountRemoval({
        actorId: guard.actorId,
        targetId: userId,
        targetRole: isCockpitRole(target.role) ? target.role : 'student',
        remainingManagerCount: remaining,
    });
    if (!decision.allowed) return { success: false, error: decision.reason };

    // 1. Le profil d'abord : s'il est relié à des données protégées (CUC Sign),
    //    la suppression échoue et **rien** n'a été détruit.
    const { error: profileError } = await admin.from('profiles').delete().eq('id', userId);
    if (profileError) {
        return {
            success: false,
            error: `Suppression refusée : ce profil est relié à des données protégées (${profileError.message}). Utilisez la désactivation.`,
        };
    }

    // 2. Le compte d'authentification ensuite.
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
        return {
            success: true,
            warning: `Profil supprimé, mais le compte d’authentification subsiste : ${authError.message}`,
        };
    }

    await logAuditEvent('user.delete', target.email ?? userId, `rôle=${target.role}`);
    return { success: true };
}

/** Raccourci local vers la construction d'URL de retour. */
function authRedirectToSafe(): string | undefined {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) return undefined;
    return `${origin.replace(/\/+$/, '')}/admin/login`;
}
