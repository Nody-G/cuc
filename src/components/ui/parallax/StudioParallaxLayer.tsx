'use client';

import React from 'react';

interface StudioParallaxLayerProps {
  children?: React.ReactNode;
  speed?: number; // e.g. -0.2 (slower/deep) to +0.3 (faster/near)
  yOffset?: [number, number]; // explicit [startPx, endPx] translation
  scaleOffset?: [number, number]; // e.g. [0.98, 1.04]
  opacityOffset?: [number, number]; // e.g. [0.6, 1]
  className?: string;
  depth?: number; // visual z-depth in px, e.g. -50 or +50
}

/**
 * Couche parallaxe : traduit `--cuc-parallax-progress` (héritée de la scène
 * [`StudioParallaxScene`](src/components/ui/parallax/StudioParallaxScene.tsx:1))
 * en `transform`/`opacity` via `calc()`, sans JavaScript d'animation. Le
 * lissage précédemment assuré par un ressort est porté par la transition CSS.
 */
export const StudioParallaxLayer: React.FC<StudioParallaxLayerProps> = ({
  children,
  speed = 0,
  yOffset,
  scaleOffset,
  opacityOffset,
  className = '',
  depth = 0,
}) => {
  // Determine translation range
  const [yStart, yEnd]: [number, number] = yOffset ?? [speed * 120, speed * -120];
  const translateY = `translate3d(0, calc(var(--cuc-parallax-progress, 0) * ${yEnd - yStart}px + ${yStart}px), 0)`;
  const scale = scaleOffset
    ? ` scale(calc(${scaleOffset[0]} + var(--cuc-parallax-progress, 0) * ${scaleOffset[1] - scaleOffset[0]}))`
    : '';
  const translateZ = depth ? ` translateZ(${depth}px)` : '';
  const opacity = opacityOffset
    ? `calc(${opacityOffset[0]} + var(--cuc-parallax-progress, 0) * ${opacityOffset[1] - opacityOffset[0]})`
    : undefined;

  return (
    <div
      style={{
        transform: `${translateY}${scale}${translateZ}`,
        opacity,
        willChange: 'transform',
      }}
      className={`transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${className}`}
    >
      {children}
    </div>
  );
};
