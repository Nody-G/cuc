'use server';

/**
 * Synchronisation des places de session (CUC Sign) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';
import { logAuditEvent } from './audit';

/**
 * Synchronise les compteurs de places et statuts des sessions CUC à partir des effectifs réels de CUC Sign.
 */
export async function syncSessionsSeatCountsFromCucSign() {
  try {
    const adminClient = createAdminClient();

    // 1. Récupérer toutes les adhésions aux formations dans CUC Sign
    const { data: memberships, error: memErr } = await adminClient
      .from('group_memberships')
      .select('student_id, formation_id');

    if (memErr) throw memErr;

    const countsByFormation: Record<string, number> = {};
    for (const m of memberships || []) {
      if (m.formation_id) {
        countsByFormation[m.formation_id] = (countsByFormation[m.formation_id] || 0) + 1;
      }
    }

    // 2. Récupérer les sessions de la vitrine
    const { data: sessions, error: sessErr } = await adminClient
      .from('site_sessions')
      .select('*');

    if (sessErr) throw sessErr;

    let updatedCount = 0;
    for (const s of sessions || []) {
      if (s.cuc_sign_formation_id) {
        const enrolled = countsByFormation[s.cuc_sign_formation_id] || 0;
        const maxSeats = s.max_seats || 15;

        let newStatus = s.status;
        if (enrolled >= maxSeats) {
          newStatus = 'complet';
        } else if (maxSeats - enrolled <= 3 && enrolled > 0) {
          newStatus = 'dernières places';
        } else if (s.status === 'complet' && enrolled < maxSeats) {
          newStatus = 'ouvert';
        }

        const { error: upErr } = await adminClient
          .from('site_sessions')
          .update({
            booked_seats: enrolled,
            max_seats: maxSeats,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', s.id);

        if (!upErr) updatedCount++;
      }
    }

    await logAuditEvent(
      'sync_sessions_seat_counts',
      'site_sessions',
      JSON.stringify({ updated_sessions: updatedCount })
    );

    await revalidateSite(['/admin', '/', '/formation-de-cascadeur']);

    return {
      success: true,
      updatedCount,
      message: `${updatedCount} sessions synchronisées avec les effectifs de CUC Sign !`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur synchronisation effectifs';
    return { success: false, error: message };
  }
}
