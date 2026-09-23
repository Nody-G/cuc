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

    try {
      await adminClient.from('site_audit_logs').insert({
        user_id: userProfile?.id || null,
        user_name: userProfile?.full_name || userProfile?.email || 'Administrateur',
        action,
        target,
        details: details || null,
      });
    } catch {
      // Fallback site_settings key='audit_logs'
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
