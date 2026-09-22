'use server';

/**
 * Partenaires & événements — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Met à jour ou insère un partenaire.
 */
export async function upsertPartner(partner: {
  id: string;
  name: string;
  category: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .upsert({
        ...partner,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un partenaire.
 */
export async function deletePartner(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/partenaires', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Met à jour ou insère une prestation CUC Events.
 */
export async function upsertEvent(event: {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  features?: string[];
  price_indicator?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  order_index?: number;
}) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .upsert({
        ...event,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/team-building-cascades', '/spectacles-cascadeurs-yamakasi', '/animations-airbag-parkour', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime une prestation CUC Events.
 */
export async function deleteEvent(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await revalidateSite(['/cuc-events-agence', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
