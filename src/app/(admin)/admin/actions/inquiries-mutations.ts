/**
 * Mutation d'un dossier Contact sur ses **deux dépôts**, avec journal d'audit.
 *
 * Module serveur sans directive `'use server'` : il n'expose aucune Server
 * Action — `inquiries.ts` et `inquiries-pipeline.ts` s'appuient sur lui.
 *
 * Règle rappelée par `durability_health.md` § 8 : `supabase-js` **ne lève pas**,
 * il renvoie `{ error }`. Le succès n'est donc annoncé que si au moins un dépôt
 * a réellement accepté l'écriture.
 */

import { logAuditEvent } from './audit';
import {
    deleteInquiryRow,
    readInquiryMirror,
    updateInquiryRow,
    writeInquiryMirror,
    type InquiryMirrorEntry,
} from './inquiries-mirror';

export interface MutationOutcome {
    success: boolean;
    error?: string;
}

export interface MutationOperation {
    action: string;
    failureAction: string;
    failureMessage: string;
    details?: Record<string, unknown>;
}

/**
 * Applique une modification sur les deux dépôts et n'annonce le succès que si au
 * moins un a accepté. Mutualise le motif commun aux opérations du Cockpit.
 */
export async function mutateInquiry(
    id: string,
    patch: Record<string, unknown>,
    applyToMirror: (entry: InquiryMirrorEntry) => InquiryMirrorEntry,
    operation: MutationOperation,
    removeFromMirror = false
): Promise<MutationOutcome> {
    const tableError = removeFromMirror
        ? await deleteInquiryRow(id)
        : await updateInquiryRow(id, patch);

    const mirror = await readInquiryMirror();
    let mirrorError = mirror.error;
    if (!mirrorError) {
        const entries = removeFromMirror
            ? mirror.entries.filter((entry) => entry.id !== id)
            : mirror.entries.map((entry) => (entry.id === id ? applyToMirror(entry) : entry));
        mirrorError = await writeInquiryMirror(entries);
    }

    if (tableError && mirrorError) {
        console.error(
            `[inquiries] ${operation.failureAction} (${id}) : ${tableError} · ${mirrorError}`
        );
        await logAuditEvent(
            operation.failureAction,
            `inquiry:${id}`,
            JSON.stringify({ tableError, mirrorError, ...(operation.details ?? {}) })
        );
        return { success: false, error: operation.failureMessage };
    }

    await logAuditEvent(operation.action, `inquiry:${id}`, JSON.stringify(operation.details ?? {}));
    return { success: true };
}
