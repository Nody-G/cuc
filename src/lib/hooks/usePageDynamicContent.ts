'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSiteData } from '@/components/i18n/SiteDataProvider';
import { subscribeTable } from '@/lib/supabase/realtime';
import { SitePageContent, DEFAULT_PAGE_CONTENTS, normalizeSlug } from '@/lib/data/site-service';
import { mergeLocalized } from '@/lib/i18n/localized-merge';
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

  // Contenu DÉJÀ localisé fourni par le serveur (FR + overlay EN fusionnés) : il
  // remplace le fallback statique comme base, ce qui rend le premier rendu client
  // correct en anglais — c'est la fin du français affiché « un bref instant ».
  const serverPage = useSiteData()?.page ?? null;
  const hasServerPage = !!serverPage && normalizeSlug(String(serverPage.slug)) === cleanSlug;
  const effectiveFallback: Partial<SitePageContent> | undefined = hasServerPage
    ? (serverPage as Partial<SitePageContent>)
    : fallback;
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
    ...(effectiveFallback || {}),
    hero: {
      ...defaultData.hero,
      ...(effectiveFallback?.hero || {}),
    },
    layout_sections:
      effectiveFallback?.layout_sections && effectiveFallback.layout_sections.length > 0
        ? effectiveFallback.layout_sections
        : defaultData.layout_sections,
    sections_data: deepMergeSectionsData(
      defaultData.sections_data,
      effectiveFallback?.sections_data
    ),
  };

  const [content, setContent] = useState<SitePageContent>(initialContent);
  const [isLoading, setIsLoading] = useState(false);

  // Locale dérivée de l'URL (les pages publiques vivent sous `/[locale]`).
  const rawPathname = usePathname();
  const locale = rawPathname?.startsWith('/en') ? 'en' : 'fr';

  // Overlay de traduction (table `site_translations`) fusionné par-dessus la base FR.
  const [translation, setTranslation] = useState<Record<string, any> | null>(null);

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

    async function fetchTranslation() {
      if (locale === 'fr') {
        setTranslation(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('site_translations')
          .select('payload')
          .eq('entity', 'page')
          .eq('entity_id', cleanSlug)
          .eq('locale', locale)
          .eq('is_published', true)
          .maybeSingle();
        if (!error && isMounted) {
          setTranslation((data?.payload as Record<string, any>) || null);
        }
      } catch (err) {
        console.warn(`[usePageDynamicContent] Traduction ${locale} indisponible pour ${cleanSlug}:`, err);
      }
    }

    // Le serveur a déjà fusionné FR + EN : rejouer ces requêtes ne ferait que
    // réafficher du français le temps de la réponse (le Realtime, plus bas, reste
    // actif pour la fraîcheur).
    if (!hasServerPage) {
      fetchFreshContent();
      fetchTranslation();
    }

    // Abonnement Realtime instantané — canal PARTAGÉ par client (cf.
    // `subscribeTable`) : la page et ses traductions tiennent sur le même
    // WebSocket que la navigation, le pied de page et les réseaux sociaux.
    const unsubscribePage = subscribeTable(
      supabase,
      { table: 'site_pages', filter: `slug=eq.${cleanSlug}` },
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
    );

    const unsubscribeTranslation =
      locale === 'fr'
        ? null
        : subscribeTable(
          supabase,
          { table: 'site_translations', filter: `entity_id=eq.${cleanSlug}` },
          () => fetchTranslation()
        );

    return () => {
      isMounted = false;
      unsubscribePage();
      unsubscribeTranslation?.();
    };
  }, [cleanSlug, locale, hasServerPage]);

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

  /**
   * Fusion FR + overlay EN : on délègue à l'implémentation partagée
   * (`mergeLocalized`) au lieu de refaire un spread local. Deux raisons :
   *   - une valeur anglaise vide ne peut plus effacer le français (l'ancien
   *     `hero: {...content.hero, ...translation.hero}` le permettait) ;
   *   - le rendu client, l'aperçu du Cockpit et le formulaire de traduction
   *     appliquent désormais exactement la même règle.
   */
  const mergedContent = useMemo<SitePageContent>(() => {
    if (!translation) return content;
    return mergeLocalized(content, translation);
  }, [content, translation]);

  return { content: mergedContent, isLoading };
}
