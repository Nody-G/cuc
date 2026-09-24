import { createAdminClient } from '@/lib/supabase/admin';
import type { SiteInquiry } from '@/lib/data/site-service';

/**
 * Persistance des candidatures — extrait de `inquiries.ts` (plafond SRP 300
 * lignes, `AGENTS.md` § 2).
 *
 * Deux dépôts, une seule vérité : la table dédiée `site_inquiries` et le miroir
 * `site_settings.inquiries` (« zéro orphelin » si la table est indisponible).
 *
 * **`supabase-js` ne lève jamais d'exception** : il renvoie `{ error }`. Chaque
 * écriture renvoie donc ici un message d'erreur ou `null` — un `try/catch` seul
 * laissait passer des écritures refusées, ce qui pouvait perdre une candidature
 * tout en affichant « demande envoyée » au visiteur (défaut corrigé le
 * 2026-09-24).
 */

/** Entrée du miroir `site_settings.inquiries` (colonnes propres incluses). */
export type InquiryMirrorEntry = SiteInquiry & { admin_notes?: string };

/** Réponse d'écriture Supabase. */
type WriteResult = { error: { message: string } | null };

const failureOf = (result: WriteResult): string | null =>
    result.error ? result.error.message : null;

/** Insère une candidature dans la table dédiée. Renvoie l'erreur éventuelle. */
export async function insertInquiryRow(entry: SiteInquiry): Promise<string | null> {
    try {
        const { error } = (await createAdminClient()
            .from('site_inquiries')
            .insert(entry)) as WriteResult;
        return failureOf({ error });
    } catch (e) {
        return e instanceof Error ? e.message : 'Erreur inconnue à l’insertion';
    }
}

/** Met à jour une candidature dans la table dédiée. */
export async function updateInquiryRow(
    id: string,
    patch: Record<string, unknown>
): Promise<string | null> {
    try {
        const { error } = (await createAdminClient()
            .from('site_inquiries')
            .update(patch)
            .eq('id', id)) as WriteResult;
        return failureOf({ error });
    } catch (e) {
        return e instanceof Error ? e.message : 'Erreur inconnue à la mise à jour';
    }
}

/** Supprime une candidature de la table dédiée. */
export async function deleteInquiryRow(id: string): Promise<string | null> {
    try {
        const { error } = (await createAdminClient()
            .from('site_inquiries')
            .delete()
            .eq('id', id)) as WriteResult;
        return failureOf({ error });
    } catch (e) {
        return e instanceof Error ? e.message : 'Erreur inconnue à la suppression';
    }
}

/** Lit le miroir `site_settings.inquiries`. */
export async function readInquiryMirror(): Promise<{
    entries: InquiryMirrorEntry[];
    error: string | null;
}> {
    try {
        const { data, error } = await createAdminClient()
            .from('site_settings')
            .select('value')
            .eq('key', 'inquiries')
            .maybeSingle();
        if (error) return { entries: [], error: error.message };
        const list =
            (data?.value as { list?: InquiryMirrorEntry[] } | null | undefined)?.list || [];
        return { entries: list, error: null };
    } catch (e) {
        return { entries: [], error: e instanceof Error ? e.message : 'Erreur de lecture du miroir' };
    }
}

/** Réécrit le miroir `site_settings.inquiries`. */
export async function writeInquiryMirror(
    entries: InquiryMirrorEntry[],
    description?: string
): Promise<string | null> {
    try {
        const { error } = (await createAdminClient()
            .from('site_settings')
            .upsert({
                key: 'inquiries',
                value: { list: entries },
                ...(description ? { description } : {}),
                updated_at: new Date().toISOString(),
            })) as WriteResult;
        return failureOf({ error });
    } catch (e) {
        return e instanceof Error ? e.message : 'Erreur d’écriture du miroir';
    }
}
