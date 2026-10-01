'use server';

/**
 * Sauvegarde & restauration du site — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from './auth';
import { RESTORE_ROLES, hasRole } from './backup-versions-service';
import { revalidateSite } from './revalidate';

/** Lecture d'une table : clé de charge utile, lignes et erreur PostgREST éventuelle. */
interface BackupTableRead {
  table: string;
  key: string;
  data: unknown[] | null;
  error: string | null;
}

/**
 * Exporte un instantané JSON complet de toutes les données du site CUC.
 *
 * Chaque `select` PostgREST renvoie `{ data, error }` ; `supabase-js` ne lève
 * jamais pour une table absente ou refusée par RLS. Lire `error` est donc la
 * seule façon d'éviter de convertir un échec en tableau vide et de déclarer
 * « valide » un instantané vide.
 *
 * La charge utile conserve sa forme historique `{ app, version, export_date, data }` ;
 * les diagnostics (`rowCounts`, `totalRows`) sont ajoutés **en plus**, jamais à la place.
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
      inquiriesRes,
      navigationRes,
      footerRes,
      translationsRes
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
      adminClient.from('site_navigation').select('*'),
      adminClient.from('site_footer').select('*'),
      adminClient.from('site_translations').select('*'),
    ]);

    // Lecture EXPLICITE du champ `error` de chaque requête (cause racine du bug a1).
    const reads: BackupTableRead[] = [
      { table: 'site_programs', key: 'programs', data: programsRes.data, error: programsRes.error?.message ?? null },
      { table: 'site_pages', key: 'pages', data: pagesRes.data, error: pagesRes.error?.message ?? null },
      { table: 'site_team', key: 'team', data: teamRes.data, error: teamRes.error?.message ?? null },
      { table: 'site_films', key: 'films', data: filmsRes.data, error: filmsRes.error?.message ?? null },
      { table: 'site_sessions', key: 'sessions', data: sessionsRes.data, error: sessionsRes.error?.message ?? null },
      { table: 'site_partners', key: 'partners', data: partnersRes.data, error: partnersRes.error?.message ?? null },
      { table: 'site_events', key: 'events', data: eventsRes.data, error: eventsRes.error?.message ?? null },
      { table: 'site_settings', key: 'settings', data: settingsRes.data, error: settingsRes.error?.message ?? null },
      { table: 'site_disciplines', key: 'disciplines', data: disciplinesRes.data, error: disciplinesRes.error?.message ?? null },
      { table: 'site_campus_pois', key: 'campus_pois', data: poisRes.data, error: poisRes.error?.message ?? null },
      { table: 'site_inquiries', key: 'inquiries', data: inquiriesRes.data, error: inquiriesRes.error?.message ?? null },
      { table: 'site_navigation', key: 'navigation', data: navigationRes.data, error: navigationRes.error?.message ?? null },
      { table: 'site_footer', key: 'footer', data: footerRes.data, error: footerRes.error?.message ?? null },
      { table: 'site_translations', key: 'translations', data: translationsRes.data, error: translationsRes.error?.message ?? null },
    ];

    // Une seule table en erreur suffit à invalider tout l'export : on n'invente
    // jamais de données, on nomme précisément les tables fautives.
    const failed = reads.filter((read) => read.error !== null);
    if (failed.length > 0) {
      const details = failed.map((read) => `${read.table} (${read.error})`).join(' ; ');
      return {
        success: false,
        error: `Export interrompu — table(s) en erreur : ${details}`,
        failedTables: failed.map((read) => read.table),
      };
    }

    const data: Record<string, unknown[]> = {};
    const rowCounts: Record<string, number> = {};
    for (const read of reads) {
      const rows = read.data ?? [];
      data[read.key] = rows;
      rowCounts[read.table] = rows.length;
    }

    // Toutes les tables vides : signal fort de credentials/RLS, pas d'une base vide.
    const totalRows = Object.values(rowCounts).reduce((sum, count) => sum + count, 0);
    if (totalRows === 0) {
      return {
        success: false,
        error:
          'Export interrompu — toutes les tables sont vides. ' +
          'Cause probable : clé de service absente ou politiques RLS restrictives.',
        rowCounts,
      };
    }

    const backupPayload = {
      app: 'Campus Univers Cascades',
      version: '2.0-cockpit',
      export_date: new Date().toISOString(),
      data,
      // Diagnostics ajoutés en plus de la forme historique (aucun champ renommé).
      rowCounts,
      totalRows,
    };

    return { success: true, backup: backupPayload, rowCounts };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de l’export';
    return { success: false, error: message };
  }
}

/** Résultat d'une restauration, table par table : l'échec n'est jamais masqué. */
interface RestoreTableResult {
  table: string;
  ok: boolean;
  upserted: number;
  error: string | null;
}

/**
 * Restaure un instantané JSON complet sur la base du site.
 *
 * Lit et propage le champ `error` de chaque `upsert` (supabase-js ne lève pas) :
 * ce champ est la seule preuve d'écriture. **Aucun repli n'écrit dans
 * `site_settings`** — un échec réel est remonté tel quel (table + message),
 * jamais transformé en donnée fictive. L'algorithme d'écriture (upserts, sans
 * `DELETE`) reste strictement inchangé : le vrai retour arrière est un lot ultérieur.
 *
 * Une **garde de rôle serveur** précède toute écriture (motif du panneau
 * « Versions & restauration ») : un compte non admin/directeur est refusé sans
 * le moindre `upsert`.
 */
export async function restoreFullSiteBackup(jsonData: string) {
  // Garde 1 — rôle lu dans la session serveur, jamais dans les paramètres.
  const profile = await getCurrentUserProfile();
  if (profile === null || !hasRole(profile.role ?? '', RESTORE_ROLES)) {
    return {
      success: false,
      error: 'Accès refusé : la restauration est réservée aux comptes admin ou directeur.',
      tables: [] as RestoreTableResult[],
    };
  }

  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed.data || typeof parsed.data !== 'object') {
      return {
        success: false,
        error: 'Format de fichier JSON de sauvegarde invalide.',
        tables: [] as RestoreTableResult[],
      };
    }

    const adminClient = createAdminClient();
    const data = parsed.data as Record<string, unknown>;

    // Ordre d'écriture identique à l'implémentation d'origine (aucun changement d'algorithme).
    const tables: Array<[string, unknown]> = [
      ['site_programs', data.programs],
      ['site_pages', data.pages],
      ['site_team', data.team],
      ['site_films', data.films],
      ['site_sessions', data.sessions],
      ['site_partners', data.partners],
      ['site_events', data.events],
      ['site_settings', data.settings],
      ['site_disciplines', data.disciplines],
      ['site_campus_pois', data.campus_pois],
      ['site_inquiries', data.inquiries],
      ['site_navigation', data.navigation],
      ['site_footer', data.footer],
      ['site_translations', data.translations],
    ];

    const results: RestoreTableResult[] = [];

    for (const [table, rows] of tables) {
      if (!Array.isArray(rows) || rows.length === 0) continue;

      const { error } = await adminClient.from(table).upsert(rows);
      results.push({
        table,
        ok: error === null,
        upserted: error === null ? rows.length : 0,
        error: error ? error.message : null,
      });
    }

    const failed = results.filter((result) => !result.ok);
    if (failed.length > 0) {
      const details = failed.map((result) => `${result.table} (${result.error})`).join(' ; ');
      return {
        success: false,
        error: `Restauration partielle — ${failed.length} table(s) en erreur : ${details}`,
        tables: results,
      };
    }

    await revalidateSite(['/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/contact-cuc', '/team-building-cascades']);

    return { success: true, tables: results };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la restauration';
    return { success: false, error: message, tables: [] as RestoreTableResult[] };
  }
}

// ==============================================================================
// MONITEUR SYSTÈME — MESURES RÉELLES
// ==============================================================================
