'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 8)
  scale?: number; // Scale on hover (default: 1.02)
  glare?: boolean; // Show specular reflection glare
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  glare = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates normalized from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for rotation
  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);
  const cardScale = useSpring(isHovered ? scale : 1, springConfig);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        scale: cardScale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic specular glare overlay */}
      {glare && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 opacity-20 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 65%)`,
          }}
        />
      )}
    </motion.div>
  );
};
