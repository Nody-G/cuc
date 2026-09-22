import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import {
    MICROCOPY_SETTINGS_KEY,
    sanitizeMicrocopyOverlay,
    type MicrocopyOverlay,
} from './microcopy';

/**
 * Surcharges de micro-textes écrites depuis le Cockpit
 * (`site_settings.microcopy_overrides`).
 *
 * Lues une seule fois puis servies par le cache (`'use cache'` + tag
 * `site_settings`) : le rendu i18n ne déclenche donc **aucune requête publique
 * nominale**, et une publication du Cockpit rafraîchit le cache par tag. Une
 * lecture en échec laisse le catalogue embarqué intact.
 */
export async function getMicrocopyOverrides(): Promise<MicrocopyOverlay> {
    'use cache';
    cacheLife('max');
    cacheTag('site_settings');

    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', MICROCOPY_SETTINGS_KEY)
            .maybeSingle();

        if (error || !data?.value) return {};
        return sanitizeMicrocopyOverlay(data.value);
    } catch {
        return {};
    }
}
