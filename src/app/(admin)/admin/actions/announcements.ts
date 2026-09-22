'use server';

/**
 * Annonces du site — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Met à jour le bandeau d'alerte.
 */
export async function updateAnnouncement(data: {
  id?: string;
  title: string;
  message: string;
  badge?: string;
  link_url?: string;
  link_text?: string;
  style: 'gold' | 'info' | 'alert' | 'dark';
  is_active: boolean;
}) {
  try {
    const adminClient = createAdminClient();

    if (data.id) {
      const { error } = await adminClient
        .from('site_announcements')
        .update({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('site_announcements')
        .insert({
          title: data.title,
          message: data.message,
          badge: data.badge,
          link_url: data.link_url,
          link_text: data.link_text,
          style: data.style,
          is_active: data.is_active,
        });
      if (error) throw error;
    }

    await revalidateSite(['/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
