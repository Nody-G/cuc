'use server';

/**
 * Authentification & comptes Cockpit — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
    let email = identifier.trim().toLowerCase();
    if (email === 'lucas' || email === 'lucas.dollfus' || email === 'lucas-dollfus') {
      email = 'cuc';
    }
    if (!email.includes('@')) {
      email = `${email}@cuc.fr`;
    }
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
 * La gestion des comptes (`listCockpitUsers`, `updateUserRole`, invitation,
 * réinitialisation, désactivation, suppression) vit désormais dans `./users`,
 * gardes d'autorisation et journal d'audit inclus.
 */
