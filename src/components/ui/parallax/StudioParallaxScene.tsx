'use client';

import React, { useEffect, useRef } from 'react';

interface StudioParallaxSceneProps {
  children: React.ReactNode;
  className?: string;
  /** Conservé pour compatibilité d'API — le lissage est désormais porté par la transition CSS. */
  stiffness?: number;
  damping?: number;
  id?: string;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Scène de parallaxe 2.5D pilotée par une variable CSS.
 *
 * `--cuc-parallax-progress` (0 → 1) est écrite sur l'élément racine à chaque
 * frame utile (`requestAnimationFrame`) et héritée par les
 * [`StudioParallaxLayer`](src/components/ui/parallax/StudioParallaxLayer.tsx:1)
 * descendants, qui l'interprètent en `calc()`. Aucun re-render React, aucun
 * `framer-motion` : le lissage jadis assuré par un ressort est une transition
 * CSS sur `transform`.
 *
 * `prefers-reduced-motion` : la progression est figée à 0 et les couches
 * restent statiques.
 */
export const StudioParallaxScene: React.FC<StudioParallaxSceneProps> = ({
  children,
  className = '',
  id,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      el.style.setProperty('--cuc-parallax-progress', '0');
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const span = rect.height + viewport;
      const raw = span > 0 ? (viewport - rect.top) / span : 0;
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      el.style.setProperty('--cuc-parallax-progress', progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      id={id}
      ref={sceneRef}
      className={`relative ${className}`}
      style={{ perspective: 1200 }}
    >
      {children}
    </div>
  );
};
