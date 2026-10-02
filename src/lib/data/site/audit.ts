/**
 * Journal d’audit — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { toAuditLogEntries } from './audit-mapper';
import { SAMPLE_AUDIT_LOGS } from './defaults/samples';
import { AuditLogEntry } from './types';

/**
 * Récupère l'historique d'audit des actions administratives.
 */
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('site_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      // La base nomme la colonne `target`, le domaine l'appelle `entity` :
      // sans cette traduction, le filtre « Entité » resterait vide à jamais.
      return toAuditLogEntries(data);
    }

    // Fallback Supabase site_settings key='audit_logs'
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'audit_logs')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list)) {
      return toAuditLogEntries(row.value.list);
    }
  } catch {
    // Ignore
  }

  return SAMPLE_AUDIT_LOGS;
}

/**
 * Récupère un volume élargi de journaux d'audit pour la vue dédiée du Cockpit.
 * Priorité : 1. table dédiée site_audit_logs, 2. miroir site_settings, 3. échantillon local.
 */
export async function getAuditLogsExtended(limit = 500): Promise<AuditLogEntry[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('site_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return toAuditLogEntries(data);
    }

    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'audit_logs')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list)) {
      return toAuditLogEntries(row.value.list);
    }
  } catch {
    // Ignore
  }

  return SAMPLE_AUDIT_LOGS;
}
