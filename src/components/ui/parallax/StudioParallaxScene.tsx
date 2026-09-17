'use client';

import React, { createContext, useContext, useRef } from 'react';
import { useScroll, useSpring, MotionValue } from 'framer-motion';

interface StudioParallaxContextValue {
  smoothProgress: MotionValue<number>;
}

const StudioParallaxContext = createContext<StudioParallaxContextValue | null>(null);

export const useStudioParallax = () => {
  const context = useContext(StudioParallaxContext);
  if (!context) {
    throw new Error('useStudioParallax must be used within a StudioParallaxScene');
  }
  return context;
};

interface StudioParallaxSceneProps {
  children: React.ReactNode;
  className?: string;
  stiffness?: number;
  damping?: number;
  id?: string;
}

export const StudioParallaxScene: React.FC<StudioParallaxSceneProps> = ({
  children,
  className = '',
  stiffness = 45,
  damping = 25,
  id,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  // Measure scroll through this section from entering viewport to leaving
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  });

  // Hydraulic spring to absorb 100% of wheel notches & finger flicks
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness,
    damping,
    mass: 0.8,
    restDelta: 0.0001,
  });

  return (
    <StudioParallaxContext.Provider value={{ smoothProgress }}>
      <div
        id={id}
        ref={sceneRef}
        className={`relative ${className}`}
        style={{ perspective: 1200 }}
      >
        {children}
      </div>
    </StudioParallaxContext.Provider>
  );
};
