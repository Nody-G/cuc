'use server';

/**
 * Invitation et changement de rôle des comptes du Cockpit — Server Actions.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Mutations gardées par `requireManager()`,
 * journalisées par `logAuditEvent()`, et explicites sur leurs erreurs.
 */

import { logAuditEvent } from './audit';
import {
    evaluateRoleChange,
    isCockpitRole,
    normalizeCockpitEmail,
    type InviteUserResult,
    type UserMutationResult,
} from '../components/users-view/users-model';
import { adminClient, applyProfile, authRedirectTo, countManagers, requireManager } from './user-guards';

/** Invite un nouveau collaborateur : email d'invitation, repli lien copiable. */
export async function inviteCockpitUser(input: {
    email: string;
    fullName: string;
    role: string;
}): Promise<InviteUserResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error };

    const email = normalizeCockpitEmail(input.email);
    if (!email || !email.includes('@')) {
        return { success: false, error: 'Adresse email invalide.' };
    }
    if (!isCockpitRole(input.role)) {
        return { success: false, error: 'Rôle invalide.' };
    }
    const role = input.role;
    const fullName = input.fullName.trim() || null;
    const redirectTo = authRedirectTo();

    const admin = adminClient();

    // 1. Invitation avec envoi d'email par Supabase (si SMTP configuré).
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName ?? email, role },
        ...(redirectTo ? { redirectTo } : {}),
    });

    if (!inviteError && invited?.user) {
        const profileError = await applyProfile(admin, invited.user.id, email, role, fullName);
        await logAuditEvent('user.invite', email, `role=${role} · invitation envoyée`);
        if (profileError) {
            return {
                success: true,
                emailSent: true,
                warning: `Invitation envoyée, mais le profil n’a pas pu être enregistré : ${profileError}`,
            };
        }
        return { success: true, emailSent: true };
    }

    // 2. Repli : lien d'invitation copiable (SMTP indisponible ou envoi refusé).
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: {
            data: { full_name: fullName ?? email, role },
            ...(redirectTo ? { redirectTo } : {}),
        },
    });

    if (linkError || !link?.properties?.action_link) {
        const raw = linkError?.message || inviteError?.message || 'Invitation impossible.';
        const message = /already|registered|exists/i.test(raw)
            ? 'Ce compte existe déjà. Utilisez « Réinitialiser le mot de passe ».'
            : raw;
        return { success: false, error: message };
    }

    const createdId = link.user?.id;
    if (createdId) {
        await applyProfile(admin, createdId, email, role, fullName);
    }
    await logAuditEvent('user.invite', email, `role=${role} · lien généré (SMTP indisponible)`);
    return { success: true, emailSent: false, inviteLink: link.properties.action_link };
}

/** Modifie le rôle d'un collaborateur, garde-fous de direction compris. */
export async function updateUserRole(userId: string, newRole: string): Promise<UserMutationResult> {
    const guard = await requireManager();
    if (!guard.ok) return { success: false, error: guard.error };
    if (!isCockpitRole(newRole)) return { success: false, error: 'Rôle non autorisé.' };

    const admin = adminClient();
    const { data: target, error: readError } = await admin
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .maybeSingle();
    if (readError) return { success: false, error: readError.message };
    if (!target) return { success: false, error: 'Compte introuvable.' };
    if (!isCockpitRole(target.role)) return { success: false, error: 'Rôle actuel inconnu.' };

    const managerCount = await countManagers(admin);
    if (managerCount === null) {
        return { success: false, error: 'Impossible de vérifier les comptes de direction.' };
    }

    const decision = evaluateRoleChange({
        actorId: guard.actorId,
        targetId: userId,
        targetRole: target.role,
        nextRole: newRole,
        managerCount,
    });
    if (!decision.allowed) return { success: false, error: decision.reason };

    const { error } = await admin
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
    if (error) return { success: false, error: error.message };

    await logAuditEvent('user.role.update', target.email ?? userId, `${target.role} → ${newRole}`);
    return { success: true };
}
