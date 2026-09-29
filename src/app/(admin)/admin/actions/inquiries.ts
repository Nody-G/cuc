'use server';

/**
 * Candidatures & demandes de contact — façade métier.
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 *
 * La persistance (table `site_inquiries` + miroir `site_settings.inquiries`) vit
 * dans `inquiries-mirror.ts`. Ici : les décisions métier — validation, choix du
 * dépôt qui fait foi, et **journal d'audit**.
 *
 * Principe non négociable : une demande n'est annoncée « envoyée » que si au
 * moins un des deux dépôts l'a réellement acceptée. Avant le 2026-09-24, les
 * erreurs d'écriture Supabase étaient avalées et le visiteur pouvait lire
 * « envoyée » alors que rien n'était enregistré.
 */

import { logAuditEvent } from './audit';
import {
  insertInquiryRow,
  readInquiryMirror,
  selectInquiriesRows,
  writeInquiryMirror,
  type InquiryMirrorEntry,
} from './inquiries-mirror';
import { mutateInquiry } from './inquiries-mutations';
import { firstStageOf, getPipeline } from '@/lib/inquiries/pipelines';
import type { SiteInquiry } from '@/lib/data/site-service';

const MIRROR_DESCRIPTION = 'Registre des candidatures et devis CUC';

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
      // Première étape du pipeline : un dossier entre toujours « reçu ».
      status: firstStageOf(getPipeline('formation')).id,
      metadata: { pipeline: 'formation' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Table dédiée — l'erreur est lue, jamais avalée.
    const insertError = await insertInquiryRow(newInquiry);

    // 2. Miroir `site_settings.inquiries` : la demande survit même si la table
    //    dédiée est indisponible (c'est lui qui garantit « zéro orphelin »).
    const mirror = await readInquiryMirror();
    let mirrorError = mirror.error;
    if (!mirrorError) {
      mirrorError = await writeInquiryMirror(
        [newInquiry as InquiryMirrorEntry, ...mirror.entries],
        MIRROR_DESCRIPTION
      );
    }

    // Aucun des deux dépôts n'a accepté la demande : on ne peut pas dire « envoyée ».
    if (insertError && mirrorError) {
      console.error(
        `[inquiries] Demande perdue (${newInquiry.email}) — site_inquiries : ${insertError} · miroir : ${mirrorError}`
      );
      await logAuditEvent(
        'inquiry.create.failed',
        `inquiry:${newInquiry.id}`,
        JSON.stringify({ email: newInquiry.email, insertError, mirrorError })
      );
      return {
        success: false,
        error: 'La demande n’a pas pu être enregistrée. Merci de réessayer, ou d’appeler directement le campus.',
      };
    }

    if (insertError) {
      console.warn(
        `[inquiries] Table site_inquiries indisponible (${insertError}) — demande conservée dans le miroir.`
      );
    }

    await logAuditEvent(
      'inquiry.create',
      `inquiry:${newInquiry.id}`,
      JSON.stringify({
        email: newInquiry.email,
        program: newInquiry.program_id,
        storedIn: insertError ? 'miroir' : 'table + miroir',
      })
    );

    return { success: true, inquiry: newInquiry };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur soumission formulaire';
    return { success: false, error: message };
  }
}

/**
 * Met à jour l'étape d'un dossier dans son pipeline (écriture bas niveau).
 *
 * Le garde-fou métier — verrou Découverte → Cursus Pro — est appliqué par
 * `updateInquiryStage` (`inquiries-pipeline.ts`), qui lit le dossier avant
 * d'écrire. Cette fonction ne fait que persister l'étape choisie.
 */
export async function updateInquiryStatus(id: string, stage: string) {
  try {
    const stamp = new Date().toISOString();
    return await mutateInquiry(
      id,
      { status: stage, updated_at: stamp },
      (entry) => ({ ...entry, status: stage, updated_at: stamp }),
      {
        action: 'inquiry.stage',
        failureAction: 'inquiry.stage.failed',
        failureMessage: 'L’étape n’a pas pu être enregistrée.',
        details: { stage },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour étape';
    return { success: false, error: message };
  }
}

/**
 * Met à jour les notes administratives privées d'une candidature.
 */
export async function updateInquiryNotes(id: string, notes: string) {
  try {
    return await mutateInquiry(
      id,
      { admin_notes: notes, updated_at: new Date().toISOString() },
      (entry) => ({ ...entry, admin_notes: notes, updated_at: new Date().toISOString() }),
      {
        action: 'inquiry.notes',
        failureAction: 'inquiry.notes.failed',
        failureMessage: 'Les notes n’ont pas pu être enregistrées.',
        details: { length: notes.length },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur mise à jour notes';
    return { success: false, error: message };
  }
}

/**
 * Supprime une candidature de la base de données et du miroir.
 */
export async function deleteInquiry(id: string) {
  try {
    return await mutateInquiry(
      id,
      {},
      (entry) => entry,
      {
        action: 'inquiry.delete',
        failureAction: 'inquiry.delete.failed',
        failureMessage: 'La demande n’a pas pu être supprimée.',
      },
      true
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression candidature';
    return { success: false, error: message };
  }
}

/**
 * Récupère l'intégralité des candidatures et demandes de contact via le client d'administration.
 * Priorité : table dédiée `site_inquiries`, puis miroir `site_settings.inquiries`.
 */
export async function fetchInquiriesAction(): Promise<SiteInquiry[]> {
  try {
    const tableRes = await selectInquiriesRows();
    if (!tableRes.error && tableRes.entries.length > 0) {
      return tableRes.entries;
    }

    const mirror = await readInquiryMirror();
    if (mirror.entries && mirror.entries.length > 0) {
      return mirror.entries;
    }

    if (!tableRes.error) {
      return tableRes.entries;
    }
  } catch (err) {
    console.error('[inquiries] Erreur fetchInquiriesAction:', err);
  }
  return [];
}
