'use server';

/**
 * Journal d’audit — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile } from './auth';

/**
 * Enregistre une action d'audit dans site_audit_logs et site_settings.
 */
export async function logAuditEvent(action: string, target: string, details?: string) {
  try {
    const adminClient = createAdminClient();
    const userProfile = await getCurrentUserProfile();

    /**
     * `supabase-js` **ne lève pas** sur une erreur d'écriture : elle revient dans
     * `error`. Sans cette vérification, un journal cassé resterait invisible tout
     * en ayant l'air correct — c'est exactement le piège relevé le 2026-09-24 en
     * mesurant la base (`site_audit_logs` vide, aucun signal nulle part).
     */
    const { error } = await adminClient.from('site_audit_logs').insert({
      user_id: userProfile?.id || null,
      user_name: userProfile?.full_name || userProfile?.email || 'Administrateur',
      action,
      target,
      details: details || null,
    });

    if (error) {
      console.warn(`[audit] Journal non écrit (« ${action} ») : ${error.message}`);
      // Repli : `site_settings` clé `audit_logs`, miroir lu par le Cockpit.
      const { data: row } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'audit_logs')
        .maybeSingle();

      interface AuditLogEntry {
        id: string;
        user_name: string;
        action: string;
        target: string;
        details?: string;
        created_at: string;
      }
      const list: AuditLogEntry[] =
        (row?.value as { list?: AuditLogEntry[] } | null | undefined)?.list || [];
      list.unshift({
        id: `log_${Date.now()}`,
        user_name: userProfile?.full_name || 'Admin',
        action,
        target,
        details,
        created_at: new Date().toISOString(),
      });
      if (list.length > 50) list.length = 50;

      await adminClient.from('site_settings').upsert({
        key: 'audit_logs',
        value: { list },
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // Ignore logging failures
  }
}

/* La machinerie privée de la médiathèque vit désormais dans `./media-internals`. */
