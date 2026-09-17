'use client';

import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { useStudioParallax } from './StudioParallaxScene';

interface StudioParallaxLayerProps {
  children?: React.ReactNode;
  speed?: number; // e.g. -0.2 (slower/deep) to +0.3 (faster/near)
  yOffset?: [number, number]; // explicit [startPx, endPx] translation
  scaleOffset?: [number, number]; // e.g. [0.98, 1.04]
  opacityOffset?: [number, number]; // e.g. [0.6, 1]
  className?: string;
  depth?: number; // visual z-depth in px, e.g. -50 or +50
}

export const StudioParallaxLayer: React.FC<StudioParallaxLayerProps> = ({
  children,
  speed = 0,
  yOffset,
  scaleOffset,
  opacityOffset,
  className = '',
  depth = 0,
}) => {
  const { smoothProgress } = useStudioParallax();

  // Determine translation range
  const rangeY: [number, number] = yOffset
    ? yOffset
    : [speed * 120, speed * -120];

  const y = useTransform(smoothProgress, [0, 1], rangeY);
  const scale = useTransform(smoothProgress, [0, 1], scaleOffset ?? [1, 1]);
  const opacity = useTransform(smoothProgress, [0, 1], opacityOffset ?? [1, 1]);

  return (
    <motion.div
      style={{
        y,
        scale: scaleOffset ? scale : undefined,
        opacity: opacityOffset ? opacity : undefined,
        translateZ: depth,
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
