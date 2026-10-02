'use client';

import React, { useRef } from 'react';

interface StudioParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees, default 6
  depthBoost?: boolean; // add 3D pop effect
}

/**
 * Carte 3D : l'inclinaison au survol (souris uniquement) écrit deux variables
 * CSS locales (`--cuc-card-x` / `--cuc-card-y`, normalisées −0.5 → 0.5) que le
 * `transform` interprète en `calc()`. Plus aucun `framer-motion` ; le retour à
 * plat et le relief passent par des transitions CSS.
 */
export const StudioParallaxCard: React.FC<StudioParallaxCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  depthBoost = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Souris uniquement : au doigt, le scroll tactile déclenchait l'inclinaison
    // 3D et laissait les cartes penchées (aucun `pointerleave` au toucher).
    if (e.pointerType !== 'mouse') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--cuc-card-x', String(x));
    el.style.setProperty('--cuc-card-y', String(y));
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--cuc-card-x', '0');
    el.style.setProperty('--cuc-card-y', '0');
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `rotateX(calc(var(--cuc-card-y, 0) * ${-2 * maxTilt}deg)) rotateY(calc(var(--cuc-card-x, 0) * ${2 * maxTilt}deg))`,
      }}
      className={`relative will-change-transform transition-transform duration-300 ease-out ${depthBoost ? 'hover:scale-[1.015]' : ''
        } ${className}`}
    >
      {children}
    </div>
  );
};
