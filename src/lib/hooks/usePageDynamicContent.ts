'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';
import { SitePageContent, DEFAULT_PAGE_CONTENTS, normalizeSlug } from '@/lib/data/site-service';
import { getPreviewDraft, subscribePreviewDraft } from '@/lib/preview/preview-store';

/**
 * Hook dynamique de synchronisation du contenu d'une page du site vitrine.
 * 
 * Propriétés clés :
 * 1. Zéro clignotement (Zero-Flicker) : initialisé immédiatement avec les données par défaut.
 * 2. Chargement asynchrone : récupère la dernière version depuis Supabase `site_pages`.
 * 3. Supabase Realtime : écoute en temps réel toute mise à jour effectuée dans le Cockpit.
 * 4. Filet de sécurité anti-casse : conserve les textes et agencements de secours si des champs sont manquants.
 */
/**
 * Fusion profonde résiliente des sections_data pour éviter d'effacer les valeurs certifiées
 * par défaut si l'administrateur ne met à jour qu'un seul sous-champ.
 */
function deepMergeSectionsData(
  defaultSections?: Record<string, any>,
  customSections?: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...(defaultSections || {}) };
  if (!customSections) return result;

  for (const key of Object.keys(customSections)) {
    const customVal = customSections[key];
    const defaultVal = result[key];

    if (Array.isArray(customVal)) {
      result[key] = customVal.length > 0 ? customVal : (defaultVal || []);
    } else if (customVal && typeof customVal === 'object' && !Array.isArray(customVal)) {
      result[key] = {
        ...(defaultVal || {}),
        ...customVal,
      };
    } else if (customVal !== undefined && customVal !== null && customVal !== '') {
      result[key] = customVal;
    } else if (defaultVal !== undefined) {
      result[key] = defaultVal;
    }
  }
  return result;
}

export function usePageDynamicContent(slug: string, fallback?: Partial<SitePageContent>) {
  const cleanSlug = normalizeSlug(slug);
  const defaultData: SitePageContent = DEFAULT_PAGE_CONTENTS[cleanSlug] || {
    slug: cleanSlug,
    title: 'Campus Univers Cascades',
    hero: {
      title: 'CAMPUS UNIVERS CASCADES',
      subtitle: "Le plus grand centre européen de formation de cascadeurs.",
    },
    layout_sections: [],
    sections_data: {},
    sections: [],
    is_published: true,
  };

  const initialContent: SitePageContent = {
    ...defaultData,
    ...(fallback || {}),
    hero: {
      ...defaultData.hero,
      ...(fallback?.hero || {}),
    },
    layout_sections:
      fallback?.layout_sections && fallback.layout_sections.length > 0
        ? fallback.layout_sections
        : defaultData.layout_sections,
    sections_data: deepMergeSectionsData(
      defaultData.sections_data,
      fallback?.sections_data
    ),
  };

  const [content, setContent] = useState<SitePageContent>(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchFreshContent() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('site_pages')
          .select('*')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (!error && data && isMounted) {
          setContent((prev) => {
            return {
              ...prev,
              ...data,
              hero: {
                ...prev.hero,
                ...(data.hero || {}),
              },
              layout_sections:
                data.layout_sections && data.layout_sections.length > 0
                  ? data.layout_sections
                  : prev.layout_sections,
              sections_data: deepMergeSectionsData(
                defaultData.sections_data,
                data.sections_data
              ),
              sections:
                data.sections && data.sections.length > 0
                  ? data.sections
                  : prev.sections,
            };
          });
        }
      } catch (err) {
        console.warn(`[usePageDynamicContent] Impossible de charger ${cleanSlug}:`, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFreshContent();

    // Abonnement Supabase Realtime instantané
    const channel = createSafeChannel(
      supabase,
      `realtime_page_${cleanSlug.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      (ch) =>
        ch.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'site_pages',
            filter: `slug=eq.${cleanSlug}`,
          },
          (payload) => {
            if (payload.new && isMounted) {
              const updated = payload.new as SitePageContent;
              setContent((prev) => ({
                ...prev,
                ...updated,
                hero: {
                  ...prev.hero,
                  ...(updated.hero || {}),
                },
                layout_sections:
                  updated.layout_sections && updated.layout_sections.length > 0
                    ? updated.layout_sections
                    : prev.layout_sections,
                sections_data: deepMergeSectionsData(
                  defaultData.sections_data,
                  updated.sections_data
                ),
                sections:
                  updated.sections && updated.sections.length > 0
                    ? updated.sections
                    : prev.sections,
              }));
            }
          }
        )
    );

    return () => {
      isMounted = false;
      removeSafeChannel(supabase, channel);
    };
  }, [cleanSlug]);

  // Aperçu live du Cockpit : si un brouillon est poussé via `postMessage`,
  // il prend le pas sur le contenu Supabase sans rechargement ni écriture.
  useEffect(() => {
    const applyDraft = (draft: SitePageContent) => {
      if (normalizeSlug(draft.slug) !== cleanSlug) return;
      setContent((prev) => ({
        ...prev,
        ...draft,
        hero: { ...prev.hero, ...(draft.hero || {}) },
        layout_sections:
          draft.layout_sections && draft.layout_sections.length > 0
            ? draft.layout_sections
            : prev.layout_sections,
        sections_data: deepMergeSectionsData(
          defaultData.sections_data,
          draft.sections_data
        ),
        sections:
          draft.sections && draft.sections.length > 0 ? draft.sections : prev.sections,
      }));
    };

    // Applique un éventuel brouillon déjà présent (iframe rechargée).
    const existing = getPreviewDraft();
    if (existing) applyDraft(existing);

    return subscribePreviewDraft(applyDraft);
  }, [cleanSlug]);

  return { content, isLoading };
}
