'use server';

/**
 * Authentification & comptes Cockpit — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeCockpitLoginIdentifier } from '@/lib/auth/admin-guard';

/**
 * Vérifie si l'utilisateur actuellement connecté a accès au Cockpit (admin, directeur, secretaire, coach).
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return ['admin', 'directeur', 'secretaire'].includes(profile?.role || '');
  } catch {
    return false;
  }
}

/**
 * Vérifie que l'utilisateur connecté peut administrer les comptes du Cockpit.
 *
 * Distinct de `checkIsAdmin()` : celui-ci ouvre le Cockpit aux secrétaires et
 * coachs, mais la gestion des comptes (rôles, invitations, désactivation,
 * suppression) est réservée à la Direction et aux administrateurs système.
 */
export async function checkIsUserManager(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return ['admin', 'directeur'].includes(profile?.role || '');
}

/**
 * Récupère le profil et rôle de l'utilisateur connecté dans le Cockpit.
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, role, avatar_url')
      .eq('id', user.id)
      .single();

    return profile;
  } catch {
    return null;
  }
}

/**
 * Action serveur d'authentification robuste pour le Cockpit.
 * Permet de contourner tout blocage de cookies tiers ou de réseau côté client.
 */
export async function loginAdminAction(identifier: string, pass: string) {
  try {
    const supabase = await createClient();
    const email = normalizeCockpitLoginIdentifier(identifier);
    const cleanPassword = pass.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: cleanPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (!['admin', 'directeur', 'secretaire'].includes(profile?.role || '')) {
        await supabase.auth.signOut();
        return { success: false, error: 'Accès refusé : ce compte ne possède pas les autorisations nécessaires pour accéder au Cockpit.' };
      }

      return { success: true, userId: data.user.id, role: profile?.role };
    }

    return { success: false, error: 'Identifiant introuvable.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur d\'authentification serveur';
    return { success: false, error: message };
  }
}

/**
 * Demande de réinitialisation de mot de passe depuis la page de connexion.
 * Ouvert à tous (sans session préalable), sécurisé contre l'énumération de comptes.
 */
export async function requestPasswordResetAction(identifier: string): Promise<{
  success: boolean;
  emailSent: boolean;
  error?: string;
  devRecoveryLink?: string;
}> {
  try {
    const email = normalizeCockpitLoginIdentifier(identifier);

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .maybeSingle();

    // Règle de sécurité : si le compte n'est pas un profil administratif du Cockpit,
    // on feint le succès sans rien envoyer pour éviter l'énumération de comptes.
    if (!profile || !['admin', 'directeur', 'secretaire'].includes(profile.role)) {
      return { success: true, emailSent: true };
    }

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cuc-new.vercel.app';
    const redirectTo = `${siteOrigin.replace(/\/+$/, '')}/admin/reset-password`;

    const supabase = await createClient();
    const { error: mailError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (!mailError) {
      return { success: true, emailSent: true };
    }

    // Repli : génération directe du lien via l'API Admin si le SMTP échoue
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return { success: false, emailSent: false, error: linkError?.message || mailError.message };
    }

    const devRecoveryLink = process.env.NODE_ENV === 'development'
      ? linkData.properties.action_link
      : undefined;

    return {
      success: true,
      emailSent: false,
      devRecoveryLink,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
    return { success: false, emailSent: false, error: message };
  }
}

/**
 * Modifie le mot de passe de l'utilisateur actuellement connecté.
 */
export async function changeCurrentUserPasswordAction(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Session invalide ou expirée.' };
    }

    if (!newPassword || newPassword.trim().length < 8) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 8 caractères.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mot de passe';
    return { success: false, error: message };
  }
}

