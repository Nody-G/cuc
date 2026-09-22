'use server';

/**
 * Équipe (coachs) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Met à jour ou insère un membre de l'équipe.
 */
export async function upsertTeamMember(member: {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  specialties: string[];
  avatar_url?: string;
  instagram?: string;
  imdb?: string;
  external_url?: string;
  doubled_actors?: string[];
  notable_credits?: string[];
  featured_credits?: string[];
  credits_display_limit?: number;
  profile_id?: string | null;
  metadata?: any;
}) {
  try {
    const adminClient = createAdminClient();
    const payload: Record<string, any> = {
      ...member,
      profile_id: member.profile_id || null,
      featured_credits: member.featured_credits || [],
      credits_display_limit:
        typeof member.credits_display_limit === 'number' && member.credits_display_limit > 0
          ? member.credits_display_limit
          : 8,
      metadata: member.metadata || {},
      updated_at: new Date().toISOString(),
    };

    let { error } = await adminClient.from('site_team').upsert(payload);

    // Repli si la migration `featured_credits` / `credits_display_limit`
    // n'a pas encore été appliquée : on enregistre le reste de la fiche.
    if (error && /featured_credits|credits_display_limit/.test(error.message)) {
      const { featured_credits: _f, credits_display_limit: _c, ...legacyPayload } = payload;
      const retry = await adminClient.from('site_team').upsert(legacyPayload);
      error = retry.error;
    }

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un membre de l'équipe.
 */
export async function deleteTeamMember(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_team')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
