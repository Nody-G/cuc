'use server';

/**
 * Historique de candidature d'une **personne**, versé dans son profil CUC Sign.
 *
 * Règle projet : dès qu'une personne **participe** à un stage ou à une formation,
 * elle doit avoir un profil CUC Sign. Ce module ne crée jamais de profil : il
 * écrit l'historique **si un profil existe déjà** — sinon il ne fait rien, et le
 * dit franchement.
 *
 * Le jour où la colonne `profiles.applicant_history` (JSONB) n'est pas encore
 * migrée, l'écriture échoue : l'erreur est traduite en message explicite plutôt
 * que d'être avalée (`durability_health.md` § 8).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from './audit';
import { checkIsAdmin } from './auth';
import { readInquiryMirror, selectInquiriesRows } from './inquiries-mirror';
import {
    buildApplicantHistory,
    normalizeApplicantEmail,
    type ApplicantDossier,
    type ApplicantHistory,
} from '@/lib/inquiries/applicant-history';

export interface SyncApplicantHistoryResult {
    success: boolean;
    /** `false` quand aucun profil CUC Sign n'existe — ce n'est pas une erreur. */
    synced: boolean;
    error?: string;
    /** Historique versé (utile aux appelants qui veulent l'afficher). */
    history?: ApplicantHistory;
}

/** Dossiers d'une personne, lus dans la table puis, à défaut, dans le miroir. */
async function readApplicantDossiers(email: string): Promise<ApplicantDossier[]> {
    const table = await selectInquiriesRows();
    const rows = table.entries.length > 0 ? table.entries : (await readInquiryMirror()).entries;
    return rows.filter((row) => normalizeApplicantEmail(row.email) === email);
}

/**
 * Verse l'historique d'une personne dans `profiles.applicant_history`.
 *
 * Sans profil CUC Sign : succès sans écriture (`synced: false`) — une simple
 * demande de renseignement ne crée pas d'identité.
 */
export async function syncApplicantHistoryToProfile(
    email: string
): Promise<SyncApplicantHistoryResult> {
    try {
        if (!(await checkIsAdmin())) {
            return { success: false, synced: false, error: 'Accès refusé' };
        }

        const key = normalizeApplicantEmail(email);
        if (!key) return { success: false, synced: false, error: 'Adresse email absente.' };

        const admin = createAdminClient();
        const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('email', key)
            .maybeSingle();
        if (!profile?.id) return { success: true, synced: false };

        const history = buildApplicantHistory(key, await readApplicantDossiers(key));

        const { error } = await admin
            .from('profiles')
            .update({ applicant_history: history })
            .eq('id', profile.id);

        if (error) {
            const missingColumn = /applicant_history/i.test(error.message);
            await logAuditEvent('applicant.history.profile.failed', key, error.message);
            return {
                success: false,
                synced: false,
                error: missingColumn
                    ? 'La colonne `profiles.applicant_history` n’existe pas encore : appliquez la migration (npm run db:migrate:applicant-history:write).'
                    : error.message,
                history,
            };
        }

        await logAuditEvent(
            'applicant.history.profile',
            key,
            `candidatures=${history.applications} · décisions=${history.decisions.length}`
        );
        return { success: true, synced: true, history };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur de synchronisation du profil';
        return { success: false, synced: false, error: message };
    }
}

/** Lit l'historique d'une personne sans rien écrire (affichage Cockpit). */
export async function readApplicantHistory(email: string): Promise<ApplicantHistory | null> {
    const key = normalizeApplicantEmail(email);
    if (!key) return null;
    try {
        return buildApplicantHistory(key, await readApplicantDossiers(key));
    } catch {
        return null;
    }
}
