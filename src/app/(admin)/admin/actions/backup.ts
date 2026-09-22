'use server';

/**
 * Sauvegarde & restauration du site — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Exporte un instantané JSON complet de toutes les données du site CUC.
 */
export async function exportFullSiteBackup() {
  try {
    const adminClient = createAdminClient();

    const [
      programsRes,
      pagesRes,
      teamRes,
      filmsRes,
      sessionsRes,
      partnersRes,
      eventsRes,
      settingsRes,
      disciplinesRes,
      poisRes,
      inquiriesRes
    ] = await Promise.all([
      adminClient.from('site_programs').select('*'),
      adminClient.from('site_pages').select('*'),
      adminClient.from('site_team').select('*'),
      adminClient.from('site_films').select('*'),
      adminClient.from('site_sessions').select('*'),
      adminClient.from('site_partners').select('*'),
      adminClient.from('site_events').select('*'),
      adminClient.from('site_settings').select('*'),
      adminClient.from('site_disciplines').select('*'),
      adminClient.from('site_campus_pois').select('*'),
      adminClient.from('site_inquiries').select('*'),
    ]);

    const backupPayload = {
      app: 'Campus Univers Cascades',
      version: '2.0-cockpit',
      export_date: new Date().toISOString(),
      data: {
        programs: programsRes.data || [],
        pages: pagesRes.data || [],
        team: teamRes.data || [],
        films: filmsRes.data || [],
        sessions: sessionsRes.data || [],
        partners: partnersRes.data || [],
        events: eventsRes.data || [],
        settings: settingsRes.data || [],
        disciplines: disciplinesRes.data || [],
        campus_pois: poisRes.data || [],
        inquiries: inquiriesRes.data || [],
      },
    };

    return { success: true, backup: backupPayload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de l’export';
    return { success: false, error: message };
  }
}

/**
 * Restaure un instantané JSON complet sur la base du site.
 */
export async function restoreFullSiteBackup(jsonData: string) {
  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { success: false, error: 'Format de fichier JSON de sauvegarde invalide.' };
    }

    const adminClient = createAdminClient();
    const {
      programs,
      pages,
      team,
      films,
      sessions,
      partners,
      events,
      settings,
      disciplines,
      campus_pois,
      inquiries
    } = parsed.data;

    if (Array.isArray(programs) && programs.length > 0) {
      await adminClient.from('site_programs').upsert(programs);
    }
    if (Array.isArray(pages) && pages.length > 0) {
      await adminClient.from('site_pages').upsert(pages);
    }
    if (Array.isArray(team) && team.length > 0) {
      await adminClient.from('site_team').upsert(team);
    }
    if (Array.isArray(films) && films.length > 0) {
      await adminClient.from('site_films').upsert(films);
    }
    if (Array.isArray(sessions) && sessions.length > 0) {
      await adminClient.from('site_sessions').upsert(sessions);
    }
    if (Array.isArray(partners) && partners.length > 0) {
      await adminClient.from('site_partners').upsert(partners);
    }
    if (Array.isArray(events) && events.length > 0) {
      await adminClient.from('site_events').upsert(events);
    }
    if (Array.isArray(settings) && settings.length > 0) {
      await adminClient.from('site_settings').upsert(settings);
    }
    if (Array.isArray(disciplines) && disciplines.length > 0) {
      try {
        await adminClient.from('site_disciplines').upsert(disciplines);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'disciplines', value: { list: disciplines } });
      }
    }
    if (Array.isArray(campus_pois) && campus_pois.length > 0) {
      try {
        await adminClient.from('site_campus_pois').upsert(campus_pois);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'campus_pois', value: { list: campus_pois } });
      }
    }
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      try {
        await adminClient.from('site_inquiries').upsert(inquiries);
      } catch {
        await adminClient.from('site_settings').upsert({ key: 'inquiries', value: { list: inquiries } });
      }
    }

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/contact-cuc', '/team-building-cascades']);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la restauration';
    return { success: false, error: message };
  }
}

// ==============================================================================
// MONITEUR SYSTÈME — MESURES RÉELLES
// ==============================================================================
