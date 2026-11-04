'use client';

import { useState, useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Hook d'orchestration de parallaxe cinématique pour les bandeaux héro de page.
 *
 * Déplace verticalement le visuel d'arrière-plan de façon subtile et fluide
 * lors du défilement, avec écoute passive, synchronisation `requestAnimationFrame`
 * et neutralisation immédiate sous `prefers-reduced-motion`.
 *
 * @param speed Vitesse relative de déplacement (défaut: 0.18)
 * @param maxOffset Déplacement maximal en pixels (défaut: 140)
 */
export function useHeroParallax(speed = 0.18, maxOffset = 140): number {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setOffsetY(Math.min(window.scrollY * speed, maxOffset));
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed, maxOffset]);

  return offsetY;
}
