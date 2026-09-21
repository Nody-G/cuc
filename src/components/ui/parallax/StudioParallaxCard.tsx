'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface StudioParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees, default 6
  depthBoost?: boolean; // add 3D pop effect
}

export const StudioParallaxCard: React.FC<StudioParallaxCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  depthBoost = true,
}) => {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Souris uniquement : au doigt, le scroll tactile déclenchait l'inclinaison
    // 3D et laissait les cartes penchées (aucun `pointerleave` au toucher).
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(x);
    rawY.set(y);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={depthBoost ? { scale: 1.015, translateZ: 20 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
