'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '@/components/i18n/SiteDataProvider';
import { createClient } from '@/lib/supabase/client';
import { subscribeTable } from '@/lib/supabase/realtime';
import { DEFAULT_SOCIAL_LINKS, type SiteSocialLink } from '@/data/navigation';
import { currentLocale } from './navigation-labels';

/**
 * Hook de lecture des réseaux sociaux officiels.
 * Source unique de vérité partagée par la Navbar, le drawer mobile et le Footer.
 */
export function useSocialLinks(): SiteSocialLink[] {
    // Mêmes garanties que la navigation : quand le serveur fournit les réseaux
    // DÉJÀ localisés, ils sont l'état initial (premier rendu correct) et aucune
    // requête n'est rejouée côté navigateur.
    const serverSocial = useSiteData()?.social ?? null;
    const hasServerSocial = !!serverSocial && serverSocial.length > 0;
    const [links, setLinks] = useState<SiteSocialLink[]>(serverSocial ?? DEFAULT_SOCIAL_LINKS);

    useEffect(() => {
        if (hasServerSocial) return;
        let cancelled = false;
        const supabase = createClient();

        async function fetchLinks() {
            try {
                const { data, error } = await supabase
                    .from('site_social_links')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true });

                if (cancelled || error || !data || data.length === 0) return;

                // Overlays EN des réseaux (entité `social_link`) : les indices
                // d'affichage (« Réponse rapide »…) vivent en base, sans table
                // dédiée — on les surcharge ici, en anglais uniquement.
                let overlays: Record<string, { label?: string; display_hint?: string }> = {};
                if (currentLocale() === 'en') {
                    const { data: rows } = await supabase
                        .from('site_translations')
                        .select('entity_id, payload')
                        .eq('entity', 'social_link')
                        .eq('locale', 'en')
                        .eq('is_published', true);
                    overlays = Object.fromEntries(
                        (rows || []).map(
                            (row: { entity_id: string; payload?: Record<string, unknown> }) => [
                                row.entity_id,
                                (row.payload || {}) as { label?: string; display_hint?: string },
                            ]
                        )
                    );
                }

                setLinks(
                    data.map((s) => ({
                        id: s.id,
                        platform: s.platform,
                        label: overlays[s.id]?.label || s.label,
                        handle: s.handle || undefined,
                        url: s.url,
                        display_hint: overlays[s.id]?.display_hint || s.display_hint || undefined,
                        brand_color: s.brand_color || undefined,
                        order_index: s.order_index ?? 0,
                        is_active: s.is_active ?? true,
                        show_in_navbar: s.show_in_navbar ?? true,
                        show_in_footer: s.show_in_footer ?? true,
                        show_in_drawer: s.show_in_drawer ?? true,
                    })) as SiteSocialLink[]
                );
            } catch {
                /* fallback silencieux */
            }
        }

        fetchLinks();

        // Canal nommé dans l'exception de production :
        // "cannot add postgres_changes callbacks for realtime:site_social_links:all
        //  after subscribe()". Le nom unique par instance supprime la collision.
        const unsubscribeSocial = subscribeTable(supabase, { table: 'site_social_links' }, () => {
            fetchLinks();
        });

        return () => {
            cancelled = true;
            unsubscribeSocial();
        };
    }, [hasServerSocial]);

    return links;
}
