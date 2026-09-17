'use client';

import React, { useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export const StudioGlobalAtmosphere: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Unified global spring physics for the entire background environment
  const smoothGlobalScroll = useSpring(scrollYProgress, {
    stiffness: 35,
    damping: 25,
    mass: 0.9,
    restDelta: 0.0001,
  });

  // Vertical movement ranges for atmospheric elements
  const beacon1Y = useTransform(smoothGlobalScroll, [0, 1], [0, 200]);
  const beacon2Y = useTransform(smoothGlobalScroll, [0, 1], [0, -250]);
  const beacon3Y = useTransform(smoothGlobalScroll, [0, 1], [0, 300]);
  const particlesY = useTransform(smoothGlobalScroll, [0, 1], [0, -350]);

  // Ambient particles distributed along page depth
  const ambientParticles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: ((i * 23 + 11) % 94) + 3,
      y: ((i * 37 + 19) % 94) + 3,
      size: (i % 3) * 1 + 1.5,
      opacity: 0.15 + (i % 4) * 0.08,
      speedMultiplier: 0.6 + (i % 3) * 0.4,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Subtle Global Vertical Telemetry Guide Lines (Studio Film Margins) */}
      <div className="absolute inset-x-0 inset-y-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between opacity-25">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        <div className="hidden sm:block w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* 2. Soft Ambient Lighting Beacons that shift with scroll depth */}
      <motion.div
        style={{ y: beacon1Y }}
        className="absolute top-[25%] -left-[10%] w-[45rem] h-[35rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.035)_0%,_transparent_70%)] blur-3xl will-change-transform"
      />
      <motion.div
        style={{ y: beacon2Y }}
        className="absolute top-[55%] -right-[10%] w-[50rem] h-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(255,200,0,0.025)_0%,_transparent_70%)] blur-3xl will-change-transform"
      />
      <motion.div
        style={{ y: beacon3Y }}
        className="absolute top-[80%] left-[20%] w-[45rem] h-[35rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.02)_0%,_transparent_70%)] blur-3xl will-change-transform"
      />

      {/* 3. Floating Micro-Particles rising with scroll inertia */}
      <motion.div
        style={{ y: particlesY }}
        className="absolute inset-0 will-change-transform"
      >
        {ambientParticles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
            }}
            className="absolute rounded-full bg-[#FFE500] shadow-[0_0_6px_rgba(255,229,0,0.4)]"
          />
        ))}
      </motion.div>
    </div>
  );
};
