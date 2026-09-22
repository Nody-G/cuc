import { createClient } from '@/lib/supabase/client';

/** Ligne de la table `site_translations` (overlay EN par entité). */
export interface TranslationRow {
    id: string;
    entity: string;
    entity_id: string;
    locale: string;
    payload: Record<string, unknown>;
    is_published: boolean;
}

/**
 * Couche Données — lecture des overlays de traduction pour le Cockpit.
 *
 * La vue (`TranslationsView`) ne crée plus de client Supabase : la requête vit
 * ici, la vue ne consomme qu'un résultat typé (règle SRP, `AGENTS.md` § 1).
 * L'écriture reste sur la server action `upsertSiteTranslation`.
 */
export async function getTranslationRows(): Promise<{
    rows: TranslationRow[];
    error: string | null;
}> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('site_translations')
        .select('*')
        .order('entity', { ascending: true })
        .order('entity_id', { ascending: true });

    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []) as TranslationRow[], error: null };
}
