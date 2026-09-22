'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '@/components/i18n/SiteDataProvider';
import { createClient } from '@/lib/supabase/client';
import { subscribeTable } from '@/lib/supabase/realtime';
import { DEFAULT_FOOTER, type FooterStructure } from '@/data/navigation';
import { applyFooterLabels, currentLocale, fetchLabelOverlay } from './navigation-labels';

/**
 * Hook de lecture du pied de page.
 * Même doctrine de fallback que `useNavigation`.
 */
export function useFooter(id: string = 'main'): FooterStructure {
    // Même doctrine que la navigation : le serveur fournit la structure ET les
    // libellés traduits, donc le premier rendu est déjà en anglais.
    const serverFooter = useSiteData()?.footer ?? null;
    const hasServerFooter = !!serverFooter;

    const [structure, setStructure] = useState<FooterStructure>(() => {
        if (!serverFooter) return DEFAULT_FOOTER.structure;
        return applyFooterLabels(serverFooter.structure, serverFooter.labels);
    });

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();

        async function fetchFooter() {
            if (hasServerFooter) return;
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

                const labels = await fetchLabelOverlay(supabase, 'footer', id, currentLocale());
                setStructure(applyFooterLabels(incoming, labels));
            } catch {
                /* fallback silencieux */
            }
        }

        fetchFooter();

        const unsubscribeFooter = subscribeTable(
            supabase,
            { table: 'site_footer', filter: `id=eq.${id}` },
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
        );

        return () => {
            cancelled = true;
            unsubscribeFooter();
        };
    }, [id, hasServerFooter]);

    return structure;
}
