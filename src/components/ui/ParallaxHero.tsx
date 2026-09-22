'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { mergeSectionItems } from '@/lib/hooks/usePageSectionData';
import {
  HERO_SLIDES,
  HeroBottomControls,
  HeroHudOverlay,
  HeroTechDepth,
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
  const heroMotion = useParallaxHero(heroRef);

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
  const activeCopy = slideCopy[HERO_SLIDES[heroMotion.currentSlide].key];

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

      {/* 3. Subtle Location & Campus Header Overlay */}
      <HeroHudOverlay heroData={heroData} />

      {/* 4. Central Text Content: Rock-Solid Focal Plane (NO text displacement!) */}
      <HeroFocalContent
        heroData={heroData}
        currentSlide={heroMotion.currentSlide}
        activeCopy={activeCopy}
        quickMetrics={quickMetrics}
        focalTextOpacity={heroMotion.focalTextOpacity}
      />

      {/* 5. Modern Segmented Slide Navigation & Smooth Scroll Cue */}
      <HeroBottomControls
        slides={HERO_SLIDES}
        currentSlide={heroMotion.currentSlide}
        onSelectSlide={heroMotion.handleSelectSlide}
        slideDuration={SLIDE_DURATION_SEC}
      />
    </section>
  );
};
