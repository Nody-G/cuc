'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';
import {
    DEFAULT_NAVIGATION,
    DEFAULT_FOOTER,
    DEFAULT_SOCIAL_LINKS,
    type NavigationStructure,
    type FooterStructure,
    type SiteSocialLink,
} from '@/data/navigation';

/**
 * Hook de lecture de la navigation principale.
 *
 * Doctrine « zéro régression » : l'état initial est TOUJOURS la constante
 * `DEFAULT_NAVIGATION` (identique au rendu historique codé en dur). Si Supabase
 * répond avec une structure valide, on la substitue ; sinon on conserve le
 * fallback. Aucun flash de contenu vide n'est possible.
 *
 * Écoute Supabase Realtime sur `site_navigation` pour refléter immédiatement
 * toute modification faite depuis le Cockpit.
 */
export function useNavigation(id: string = 'main'): NavigationStructure {
    const [structure, setStructure] = useState<NavigationStructure>(DEFAULT_NAVIGATION.structure);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();

        async function fetchNavigation() {
            try {
                const { data, error } = await supabase
                    .from('site_navigation')
                    .select('structure, is_published')
                    .eq('id', id)
                    .eq('is_published', true)
                    .maybeSingle();

                if (cancelled || error || !data?.structure) return;

                const incoming = data.structure as NavigationStructure;
                if (!incoming.items || !Array.isArray(incoming.items) || incoming.items.length === 0) {
                    return;
                }

                setStructure({
                    items: incoming.items,
                    cta: incoming.cta || DEFAULT_NAVIGATION.structure.cta,
                });
            } catch {
                /* fallback silencieux : on conserve DEFAULT_NAVIGATION */
            }
        }

        fetchNavigation();

        // Canal à nom unique + garde : évite la collision qui provoquait
        // « cannot add postgres_changes callbacks ... after subscribe() ».
        const channel = createSafeChannel(supabase, `site_navigation:${id}`, (ch) =>
            ch.on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'site_navigation', filter: `id=eq.${id}` },
                (payload) => {
                    const row = payload.new as { structure?: NavigationStructure; is_published?: boolean } | null;
                    if (!row?.structure || row.is_published === false) {
                        setStructure(DEFAULT_NAVIGATION.structure);
                        return;
                    }
                    const incoming = row.structure;
                    if (!incoming.items || !Array.isArray(incoming.items) || incoming.items.length === 0) {
                        setStructure(DEFAULT_NAVIGATION.structure);
                        return;
                    }
                    setStructure({
                        items: incoming.items,
                        cta: incoming.cta || DEFAULT_NAVIGATION.structure.cta,
                    });
                }
            )
        );

        return () => {
            cancelled = true;
            removeSafeChannel(supabase, channel);
        };
    }, [id]);

    return structure;
}

/**
 * Hook de lecture du pied de page.
 * Même doctrine de fallback que `useNavigation`.
 */
export function useFooter(id: string = 'main'): FooterStructure {
    const [structure, setStructure] = useState<FooterStructure>(DEFAULT_FOOTER.structure);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();

        async function fetchFooter() {
            try {
                const { data, error } = await supabase
                    .from('site_footer')
                    .select('structure, is_published')
                    .eq('id', id)
                    .eq('is_published', true)
                    .maybeSingle();

                if (cancelled || error || !data?.structure) return;

                const incoming = data.structure as FooterStructure;
                if (!incoming.columns || !Array.isArray(incoming.columns)) return;

                setStructure({
                    columns: incoming.columns,
                    brand: incoming.brand || DEFAULT_FOOTER.structure.brand,
                    legal: incoming.legal || DEFAULT_FOOTER.structure.legal,
                });
            } catch {
                /* fallback silencieux */
            }
        }

        fetchFooter();

        const channel = createSafeChannel(supabase, `site_footer:${id}`, (ch) =>
            ch.on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'site_footer', filter: `id=eq.${id}` },
                (payload) => {
                    const row = payload.new as { structure?: FooterStructure; is_published?: boolean } | null;
                    if (!row?.structure || row.is_published === false) {
                        setStructure(DEFAULT_FOOTER.structure);
                        return;
                    }
                    const incoming = row.structure;
                    if (!incoming.columns || !Array.isArray(incoming.columns)) {
                        setStructure(DEFAULT_FOOTER.structure);
                        return;
                    }
                    setStructure({
                        columns: incoming.columns,
                        brand: incoming.brand || DEFAULT_FOOTER.structure.brand,
                        legal: incoming.legal || DEFAULT_FOOTER.structure.legal,
                    });
                }
            )
        );

        return () => {
            cancelled = true;
            removeSafeChannel(supabase, channel);
        };
    }, [id]);

    return structure;
}

/**
 * Hook de lecture des réseaux sociaux officiels.
 * Source unique de vérité partagée par la Navbar, le drawer mobile et le Footer.
 */
export function useSocialLinks(): SiteSocialLink[] {
    const [links, setLinks] = useState<SiteSocialLink[]>(DEFAULT_SOCIAL_LINKS);

    useEffect(() => {
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

                setLinks(
                    data.map((s) => ({
                        id: s.id,
                        platform: s.platform,
                        label: s.label,
                        handle: s.handle || undefined,
                        url: s.url,
                        display_hint: s.display_hint || undefined,
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
        const channel = createSafeChannel(supabase, 'site_social_links:all', (ch) =>
            ch.on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'site_social_links' },
                () => {
                    fetchLinks();
                }
            )
        );

        return () => {
            cancelled = true;
            removeSafeChannel(supabase, channel);
        };
    }, []);

    return links;
}
