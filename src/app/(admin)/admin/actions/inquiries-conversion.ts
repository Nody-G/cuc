'use server';

/**
 * Conversion candidature → élève CUC Sign — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';
import { logAuditEvent } from './audit';
import { syncSessionsSeatCountsFromCucSign } from './sessions-sync';

/** Candidature telle que lue (table `site_inquiries` ou miroir `site_settings`). */
type InquiryRecord = {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  program_id?: string;
  preferred_date?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  updated_at?: string;
};

/**
 * Convertit une candidature du site vitrine en compte élève complet dans CUC Sign (Passerelle 1-Clic).
 * Crée le profil utilisateur, la fiche élève (dossier médical/urgence) et rattache l'élève à la formation dans CUC Sign.
 */
export async function convertInquiryToCucSignStudent(inquiryId: string) {
  try {
    const adminClient = createAdminClient();

    // 1. Récupération de la candidature
    let inq: InquiryRecord | null = null;
    try {
      const { data } = await adminClient
        .from('site_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .maybeSingle();
      inq = data;
    } catch {
      // ignore
    }

    if (!inq) {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();
      const inqs: InquiryRecord[] =
        (settingRow?.value as { list?: InquiryRecord[] } | null | undefined)?.list || [];
      inq = inqs.find((i) => i.id === inquiryId) ?? null;
    }

    if (!inq) {
      return { success: false, error: 'Candidature introuvable.' };
    }

    const email = (inq.email || '').trim().toLowerCase();
    const fullName = (inq.full_name || inq.name || 'Élève CUC').trim();
    const phone = inq.phone || '';

    if (!email) {
      return { success: false, error: 'La candidature ne contient aucune adresse email.' };
    }

    // 2. Vérification / Création dans profiles (CUC Sign)
    let profileId: string;
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
      if (!existingProfile.role) {
        await adminClient.from('profiles').update({ role: 'student' }).eq('id', profileId);
      }
    } else {
      profileId = crypto.randomUUID();
      const { error: insertProfileErr } = await adminClient.from('profiles').insert({
        id: profileId,
        email: email,
        full_name: fullName,
        role: 'student',
        created_at: new Date().toISOString(),
      });
      if (insertProfileErr) {
        throw new Error(`Erreur création profil CUC Sign: ${insertProfileErr.message}`);
      }
    }

    // 3. Vérification / Création dans students (CUC Sign)
    const { data: existingStudent } = await adminClient
      .from('students')
      .select('user_id')
      .eq('user_id', profileId)
      .maybeSingle();

    if (!existingStudent) {
      const { error: insertStudentErr } = await adminClient.from('students').insert({
        user_id: profileId,
        enrollment_date: new Date().toISOString().split('T')[0],
        emergency_contact: phone || 'Non renseigné',
        credits_left: 0,
        image_rights: true,
        updated_at: new Date().toISOString(),
      });
      if (insertStudentErr) {
        console.warn('Erreur création students CUC Sign:', insertStudentErr.message);
      }
    }

    // 4. Rattachement à la formation correspondante dans CUC Sign
    let linkedFormationId: string | null = null;
    const { data: sessions } = await adminClient
      .from('site_sessions')
      .select('id, program_id, cuc_sign_formation_id, date_display');

    if (sessions && sessions.length > 0) {
      const matchedSession = sessions.find((s) => {
        if (s.cuc_sign_formation_id) {
          if (inq.preferred_date && s.date_display && s.date_display.toLowerCase().includes(inq.preferred_date.toLowerCase())) return true;
          if (inq.program_id && s.program_id === inq.program_id) return true;
        }
        return false;
      });
      if (matchedSession?.cuc_sign_formation_id) {
        linkedFormationId = matchedSession.cuc_sign_formation_id;
      }
    }

    if (linkedFormationId) {
      const { data: formationGroups } = await adminClient
        .from('groups')
        .select('id')
        .eq('formation_id', linkedFormationId)
        .limit(1);

      let groupId = formationGroups?.[0]?.id;
      if (!groupId) {
        const { data: anyGroups } = await adminClient.from('groups').select('id').limit(1);
        groupId = anyGroups?.[0]?.id;
      }

      if (groupId) {
        const { data: existingMembership } = await adminClient
          .from('group_memberships')
          .select('id')
          .eq('student_id', profileId)
          .eq('formation_id', linkedFormationId)
          .maybeSingle();

        if (!existingMembership) {
          await adminClient.from('group_memberships').insert({
            student_id: profileId,
            formation_id: linkedFormationId,
            group_id: groupId,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 5. Mise à jour de la candidature (status = 'admis', metadata enrichi)
    const updatedMetadata = {
      ...(inq.metadata || {}),
      cuc_sign_student_id: profileId,
      cuc_sign_formation_id: linkedFormationId,
      converted_at: new Date().toISOString(),
    };

    try {
      await adminClient
        .from('site_inquiries')
        .update({
          status: 'admis',
          metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inquiryId);
    } catch {
      // ignore
    }

    try {
      const { data: settingRow } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();

      const inqs: InquiryRecord[] =
        (settingRow?.value as { list?: InquiryRecord[] } | null | undefined)?.list || [];
      const item = inqs.find((i) => i.id === inquiryId);
      if (item) {
        item.status = 'admis';
        item.metadata = updatedMetadata;
        item.updated_at = new Date().toISOString();
        await adminClient.from('site_settings').upsert({
          key: 'inquiries',
          value: { list: inqs },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Erreur miroir updateInquiry convert:', e);
    }

    // Auto-synchronisation immédiate des jauges de places dans site_sessions
    try {
      await syncSessionsSeatCountsFromCucSign();
    } catch (errSync) {
      console.warn('Erreur auto-sync jauges sessions:', errSync);
    }

    // 6. Audit Log
    await logAuditEvent(
      'convert_inquiry_to_cuc_sign',
      `site_inquiries:${inquiryId}`,
      JSON.stringify({
        full_name: fullName,
        email: email,
        profile_id: profileId,
        formation_id: linkedFormationId,
      })
    );

    await revalidateSite(['/admin']);

    return {
      success: true,
      profile_id: profileId,
      formation_id: linkedFormationId,
      message: `Élève "${fullName}" créé avec succès dans CUC Sign !`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur conversion CUC Sign';
    return { success: false, error: message };
  }
}
