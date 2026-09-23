import { createAdminClient, hasServiceRoleKey } from '@/lib/supabase/admin';
import { normalizeSlug } from '@/lib/data/site-service';

/**
 * ==============================================================================
 * CUC — État de publication d'une page (lecture SERVICE ROLE)
 * ==============================================================================
 * Sous RLS (`FOR SELECT USING (is_published = true)`), un brouillon n'est plus
 * lisible par le client public : la ligne devient « absente » pour `anon`, et
 * l'application ne peut plus distinguer un brouillon d'une panne de lecture.
 *
 * Cette lecture d'état — réservée au serveur, jamais exposée au navigateur —
 * rétablit la distinction :
 *   - `published`   : la page existe et est publiée ;
 *   - `unpublished` : la page existe et est dépubliée (→ 404 côté porte) ;
 *   - `unknown`     : clé de service absente — repli sûr, on ne conclut rien.
 *
 * Toujours appelée UNIQUEMENT quand la lecture publique n'a rien renvoyé
 * (brouillon masqué par RLS, panne, ou page réellement absente).
 */

export type PagePublicationState = 'published' | 'unpublished' | 'unknown';

export async function getPagePublicationState(slug: string): Promise<PagePublicationState> {
    if (!hasServiceRoleKey()) return 'unknown';

    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_pages')
            .select('is_published')
            .eq('slug', normalizeSlug(slug))
            .maybeSingle();

        if (error || !data) return 'unknown';
        return data.is_published === false ? 'unpublished' : 'published';
    } catch {
        return 'unknown';
    }
}
