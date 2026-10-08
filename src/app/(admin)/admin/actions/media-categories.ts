'use server';

/**
 * Persistance des surcharges de catégories de médias dans `site_settings`.
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { MediaCategory } from '@/lib/media-library/media-categories';
import { checkIsAdmin } from './auth';
import { logAuditEvent } from './audit';

const SETTINGS_KEY = 'media_categories';

/**
 * Récupère le dictionnaire des catégories personnalisées { [path]: category }.
 */
export async function getMediaCategoryOverrides(): Promise<Record<string, MediaCategory>> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', SETTINGS_KEY)
            .maybeSingle();

        if (error || !data?.value) return {};
        return (data.value as Record<string, MediaCategory>) || {};
    } catch {
        return {};
    }
}

/**
 * Associe manuellement une catégorie à un média donné.
 */
export async function setMediaCategoryOverride(
    path: string,
    category: MediaCategory
): Promise<{ success: boolean; error?: string }> {
    try {
        const isAdmin = await checkIsAdmin();
        if (!isAdmin) return { success: false, error: 'Accès refusé' };

        const adminClient = createAdminClient();
        const current = await getMediaCategoryOverrides();
        const updated = { ...current, [path]: category };

        const { error } = await adminClient
            .from('site_settings')
            .upsert({
                key: SETTINGS_KEY,
                value: updated,
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;
        await logAuditEvent('media.category.update', path, category);
        return { success: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur de mise à jour de la catégorie';
        return { success: false, error: message };
    }
}
