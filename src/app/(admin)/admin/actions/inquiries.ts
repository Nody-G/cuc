'use server';

/**
 * Candidatures — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { SiteInquiry } from '@/lib/data/site-service';

/** Entrée du miroir `site_settings.inquiries` (colonnes propres incluses). */
type InquiryMirror = SiteInquiry & { admin_notes?: string };

/**
 * Enregistre une nouvelle candidature ou demande de contact depuis le site vitrine.
 */
export async function submitInquiry(data: {
  full_name: string;
  email: string;
  phone: string;
  program_id: string;
  program_title?: string;
  age?: string;
  sport_background?: string;
  session_date?: string;
  afdas_status?: string;
  message: string;
}) {
  try {
    if (!data.full_name || !data.email || !data.phone) {
      return { success: false, error: 'Champs obligatoires manquants (Nom, Email, Téléphone)' };
    }

    const newInquiry: SiteInquiry = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: data.full_name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      program_id: data.program_id || 'general',
      program_title: data.program_title || 'Demande Générale',
      age: data.age?.trim(),
      sport_background: data.sport_background?.trim(),
      session_date: data.session_date?.trim(),
      afdas_status: data.afdas_status?.trim(),
      message: data.message?.trim() || '',
      status: 'nouveau',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const adminClient = createAdminClient();

    // 1. Tenter l'insertion dans la table dédiée site_inquiries
    try {
      await adminClient.from('site_inquiries').insert(newInquiry);
    } catch {
      // Table non encore créée
    }

    // 2. Toujours persister dans site_settings key='inquiries' pour garantir zéro orphelin
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: InquiryMirror[] =
        (settingRow?.value as { list?: InquiryMirror[] } | null | undefined)?.list || [];
      inqs.unshift(newInquiry);

      await adminClient.from('site_settings').upsert({
        key: 'inquiries',
        value: { list: inqs },
        description: 'Registre des candidatures et devis CUC',
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erreur synchronisation site_settings inquiries:', e);
    }

    return { success: true, inquiry: newInquiry };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur soumission formulaire';
    return { success: false, error: message };
  }
}

/**
 * Met à jour le statut d'une candidature (nouveau, en_cours, admis, refuse, archive).
 */
export async function updateInquiryStatus(id: string, status: 'nouveau' | 'en_cours' | 'admis' | 'refuse' | 'archive') {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: InquiryMirror[] =
        (settingRow?.value as { list?: InquiryMirror[] } | null | undefined)?.list || [];
      const item = inqs.find((i) => i.id === id);
      if (item) {
        item.status = status;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiryStatus:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour statut';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les notes administratives privées d'une candidature.
 */
export async function updateInquiryNotes(id: string, notes: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: InquiryMirror[] =
        (settingRow?.value as { list?: InquiryMirror[] } | null | undefined)?.list || [];
      const item = inqs.find((i) => i.id === id);
      if (item) {
        item.admin_notes = notes;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiryNotes:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour notes';
    return { success: false, error: message };
  }
}

/**
 * Supprime une candidature de la base de données.
 */
export async function deleteInquiry(id: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Table site_inquiries
    try {
      await adminClient
        .from('site_inquiries')
        .delete()
        .eq('id', id);
    } catch {
      // ignore
    }

    // 2. Miroir site_settings
    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      let inqs: InquiryMirror[] =
        (settingRow?.value as { list?: InquiryMirror[] } | null | undefined)?.list || [];
      inqs = inqs.filter((i) => i.id !== id);
      await adminClient.from('site_settings').upsert({
        key: 'inquiries',
        value: { list: inqs },
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Erreur miroir deleteInquiry:', e);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression candidature';
    return { success: false, error: message };
  }
}
