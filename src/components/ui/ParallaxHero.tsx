'use client';

import React, { useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';
import {
  HeroBottomControls,
  HeroTechDepth,
  mergeHeroSlides,
  type HeroSlideOverride,
} from './parallax-hero';
import { HeroBackground3D } from './parallax-hero/HeroBackground3D';
import { HeroFocalContent } from './parallax-hero/HeroFocalContent';
import {
  useParallaxHero,
  SLIDE_DURATION_SEC,
  type HeroMetric,
  type SlideCopyMap,
} from './parallax-hero/useParallaxHero';
import type { SitePageHero } from '@/lib/data/site-service';

interface ParallaxHeroProps {
  onOpenSearch?: () => void;
  heroData?: Partial<SitePageHero>;
}

/**
 * Hero de la page d'accueil — façade de composition.
 *
 * L'orchestration (calm mode, ressorts, avancement des visuels) vit dans
 * `useParallaxHero` ; les couches visuelles dans `parallax-hero/**`
 * (fond 3D, profondeur technique, contenu focal, contrôles).
 */
export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ heroData }) => {
  const heroRef = useRef<HTMLElement>(null);
  /**
   * Liste des visuels : les quatre défauts historiques, fusionnés index par
   * index avec la surcharge éditée dans `sections_data.hero.slides` (brouillon
   * d'aperçu compris). `mergeHeroSlides` garantit une liste non vide.
   */
  const heroSection = usePageSectionData<{ slides?: HeroSlideOverride[] }>('hero');
  const heroSlides = useMemo(() => mergeHeroSlides(heroSection?.slides), [heroSection]);
  const heroMotion = useParallaxHero(heroRef, heroSlides.length);

  const tHero = useTranslations('home.hero');
  /**
   * Copies localisées par clé de visuel (`home.hero.slides.<key>`) et métriques
   * (`home.hero.metrics`) : plus aucune chaîne rédactionnelle dans ce fichier,
   * donc plus de français résiduel en anglais.
   */
  const slideCopy = tHero.raw('slides') as SlideCopyMap;
  const metricDefaults = tHero.raw('metrics') as HeroMetric[];
  /**
   * Fusion index par index : `hero.metrics.<i>` prime sur `home.hero.metrics`,
   * sans jamais ajouter ni retirer de métrique (structure stable).
   */
  const quickMetrics = mergeSectionItems(
    metricDefaults,
    heroData?.metrics ? { items: heroData.metrics } : null
  );
  /**
   * Index borné : la copie i18n n'existe que pour les quatre clés historiques,
   * un visuel ajouté laisse le sous-titre du catalogue intact (`undefined`).
   */
  const activeSlide =
    heroSlides[heroMotion.currentSlide] ?? heroSlides[0];
  const activeCopy = activeSlide?.key ? slideCopy[activeSlide.key] : undefined;

  return (
    <section
      ref={heroRef}
      onPointerMove={heroMotion.handlePointerMove}
      onPointerLeave={heroMotion.handlePointerLeave}
      className="relative min-h-[90svh] sm:min-h-[94svh] flex flex-col justify-between overflow-hidden bg-[#060608] border-b border-zinc-900 select-none [perspective:1200px]"
    >
      {/* 1. Deep 3D Background Layer: Photography + Ken-Burns + Organic Inertial Tilt */}
      <HeroBackground3D
        isCalmMode={heroMotion.isCalmMode}
        currentSlide={heroMotion.currentSlide}
        slides={heroSlides}
        slideCopy={slideCopy}
        bgScrollY={heroMotion.bgScrollY}
        bgShiftX={heroMotion.bgShiftX}
        bgRotateX={heroMotion.bgRotateX}
        bgRotateY={heroMotion.bgRotateY}
      />

      {/* 2. Tech / Mech & Organic 3D Depth Layer (absorbs wheel & finger saccades) */}
      <HeroTechDepth
        smoothMouseX={heroMotion.smoothMouseX}
        smoothMouseY={heroMotion.smoothMouseY}
        smoothScroll={heroMotion.smoothScroll}
        simplified={heroMotion.isCalmMode}
      />

      {/* 3. Central Text Content: Rock-Solid Focal Plane (NO text displacement!) */}
      <HeroFocalContent
        heroData={heroData}
        currentSlide={heroMotion.currentSlide}
        activeCopy={activeCopy}
        quickMetrics={quickMetrics}
        focalTextOpacity={heroMotion.focalTextOpacity}
      />

      {/* 4. Modern Segmented Slide Navigation & Smooth Scroll Cue */}
      <HeroBottomControls
        slides={heroSlides}
        currentSlide={heroMotion.currentSlide}
        onSelectSlide={heroMotion.handleSelectSlide}
        slideDuration={SLIDE_DURATION_SEC}
      />
    </section>
  );
};
