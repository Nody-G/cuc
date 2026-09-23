'use server';

/**
 * Sessions & programmes de formation — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Met à jour le statut d'une session de stage en 1 clic (avec liaison CUC Sign optionnelle).
 */
export async function updateSessionStatus(
  sessionId: string,
  newStatus: string,
  cucSignFormationId?: string | null
) {
  try {
    const adminClient = createAdminClient();
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (cucSignFormationId !== undefined) {
      updateData.cuc_sign_formation_id = cucSignFormationId;
    }

    const { error } = await adminClient
      .from('site_sessions')
      .update(updateData)
      .or(`id.eq.${sessionId},date_display.eq.${sessionId}`);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Crée une nouvelle session de stage (recherche automatique de correspondance CUC Sign).
 */
export async function createSession(data: {
  program_id: string;
  date_display: string;
  status: string;
  order_index?: number;
  cuc_sign_formation_id?: string | null;
}) {
  try {
    const adminClient = createAdminClient();
    let formationId = data.cuc_sign_formation_id || null;

    if (!formationId) {
      const { data: formations } = await adminClient.from('formations').select('id, name');
      const matched = (formations || []).find((f: { id: string; name: string }) =>
        f.name.toLowerCase().includes(data.date_display.toLowerCase()) ||
        data.date_display.toLowerCase().includes(f.name.toLowerCase())
      );
      if (matched) formationId = matched.id;
    }

    const { error } = await adminClient
      .from('site_sessions')
      .insert({
        program_id: data.program_id,
        date_display: data.date_display,
        status: data.status,
        cuc_sign_formation_id: formationId,
        order_index: data.order_index ?? 0,
        is_published: true,
      });

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une session de stage.
 */
export async function deleteSession(sessionIdentifier: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_sessions')
      .delete()
      .or(`id.eq.${sessionIdentifier},date_display.eq.${sessionIdentifier}`);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère un programme de formation CUC (site_programs).
 */
export async function upsertProgram(program: {
  id: string;
  category?: string;
  title: string;
  badge?: string;
  highlight?: boolean;
  tagline?: string;
  duration?: string;
  hours?: string;
  location?: string;
  price?: string;
  price_note?: string;
  age_requirement?: string;
  eligibility?: string[];
  description?: string;
  objectives?: string[];
  key_modules?: string[];
  certification?: string;
  cta_text?: string;
  cta_link?: string;
  brochure_url?: string;
  image_url?: string;
  order_index?: number;
  is_published?: boolean;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_programs')
      .upsert({
        ...program,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/stunt-workshop-cuc']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour programme';
    return { success: false, error: message };
  }
}

/**
 * Supprime un programme de formation CUC.
 */
export async function deleteProgram(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_programs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression programme';
    return { success: false, error: message };
  }
}
