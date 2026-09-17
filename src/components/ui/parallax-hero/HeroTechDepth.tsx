'use client';

import React, { useMemo } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface HeroTechDepthProps {
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  smoothScroll: MotionValue<number>;
}

// Generate static deterministic particles for 3D depth
interface Particle {
  id: number;
  x: number; // %
  y: number; // %
  size: number; // px
  depth: number; // 0.4 (far) to 1.6 (near)
  opacity: number;
}

export const HeroTechDepth: React.FC<HeroTechDepthProps> = ({
  smoothMouseX,
  smoothMouseY,
  smoothScroll,
}) => {
  // Layer 1: Midground Mech Matrix Transforms (subtle tilt & shift)
  const matrixX = useTransform(smoothMouseX, [-20, 20], [-12, 12]);
  const matrixY = useTransform(smoothMouseY, [-20, 20], [-12, 12]);
  const matrixScrollY = useTransform(smoothScroll, [0, 1], [0, 60]);

  // Layer 2: Volumetric Organic Light (tracks pointer smoothly)
  const lightX = useTransform(smoothMouseX, [-20, 20], [-60, 60]);
  const lightY = useTransform(smoothMouseY, [-20, 20], [-40, 40]);

  // Layer 3: Foreground Optical Dust / Embers (near plane, moves faster with depth multiplier)
  const dustX = useTransform(smoothMouseX, [-20, 20], [-25, 25]);
  const dustY = useTransform(smoothMouseY, [-20, 20], [-25, 25]);
  const dustScrollY = useTransform(smoothScroll, [0, 1], [0, -90]);

  // Generate 20 floating particles across 3 stereoscopic depths
  const particles: Particle[] = useMemo(() => {
    return [
      { id: 1, x: 12, y: 22, size: 2.5, depth: 0.5, opacity: 0.4 },
      { id: 2, x: 28, y: 75, size: 3.5, depth: 1.2, opacity: 0.65 },
      { id: 3, x: 84, y: 30, size: 2, depth: 0.4, opacity: 0.35 },
      { id: 4, x: 72, y: 68, size: 4, depth: 1.5, opacity: 0.75 },
      { id: 5, x: 45, y: 15, size: 1.5, depth: 0.3, opacity: 0.3 },
      { id: 6, x: 18, y: 55, size: 3, depth: 0.9, opacity: 0.5 },
      { id: 7, x: 90, y: 80, size: 2, depth: 0.6, opacity: 0.4 },
      { id: 8, x: 62, y: 40, size: 3.5, depth: 1.3, opacity: 0.7 },
      { id: 9, x: 35, y: 88, size: 2, depth: 0.5, opacity: 0.35 },
      { id: 10, x: 80, y: 18, size: 4, depth: 1.6, opacity: 0.8 },
      { id: 11, x: 8, y: 82, size: 2.5, depth: 0.7, opacity: 0.45 },
      { id: 12, x: 52, y: 82, size: 3, depth: 1.1, opacity: 0.6 },
      { id: 13, x: 22, y: 38, size: 1.5, depth: 0.4, opacity: 0.3 },
      { id: 14, x: 68, y: 88, size: 3.5, depth: 1.4, opacity: 0.65 },
      { id: 15, x: 94, y: 48, size: 2, depth: 0.5, opacity: 0.4 },
      { id: 16, x: 40, y: 62, size: 2.5, depth: 0.8, opacity: 0.5 },
      { id: 17, x: 15, y: 12, size: 3, depth: 1.0, opacity: 0.55 },
      { id: 18, x: 86, y: 64, size: 1.5, depth: 0.4, opacity: 0.3 },
    ];
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 will-change-transform">
      {/* 1. Volumetric Organic Halo: Soft interactive warm beam */}
      <motion.div
        style={{ x: lightX, y: lightY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[35rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.065)_0%,_rgba(255,200,0,0.02)_45%,_transparent_70%)] blur-3xl pointer-events-none will-change-transform"
      />

      {/* 2. Midground Tech/Mech Precision Geometry (Perspective Grid + Optics) */}
      <motion.div
        style={{ x: matrixX, y: matrixY }}
        className="absolute inset-0 will-change-transform opacity-35 sm:opacity-45"
      >
        <motion.div style={{ y: matrixScrollY }} className="w-full h-full relative">
          {/* Subtle Cyber/Cinematic Reticle Circle in center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] sm:w-[48rem] h-[34rem] sm:h-[48rem] rounded-full border border-white/[0.04] pointer-events-none">
            {/* Pulsing Concentric Range Ring */}
            <div className="absolute inset-8 sm:inset-14 rounded-full border border-dashed border-[#FFE500]/[0.06] animate-[spin_120s_linear_infinite]" />
            <div className="absolute inset-24 sm:inset-36 rounded-full border border-white/[0.03]" />
          </div>

          {/* Perspective Horizon Lines (fine mech grid) */}
          <svg
            className="absolute inset-0 w-full h-full stroke-white/[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="tech-depth-grid"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path d="M 80 0 L 0 0 0 80" fill="none" strokeWidth="0.75" />
                <circle cx="80" cy="0" r="1" fill="rgba(255,229,0,0.15)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-depth-grid)" opacity="0.4" />
          </svg>

          {/* Precision Sensor Corner Brackets (Cinematic viewfinder markers) */}
          <div className="absolute top-16 left-6 sm:left-12 w-6 h-6 border-t border-l border-white/20" />
          <div className="absolute top-16 right-6 sm:right-12 w-6 h-6 border-t border-r border-white/20" />
          <div className="absolute bottom-24 left-6 sm:left-12 w-6 h-6 border-b border-l border-white/20" />
          <div className="absolute bottom-24 right-6 sm:right-12 w-6 h-6 border-b border-r border-white/20" />

          {/* Micro Telemetry Stamps (Purely aesthetic, quiet tech accents) */}
          <div className="hidden lg:flex items-center gap-4 absolute top-20 left-16 text-[9px] font-mono-tech text-zinc-600 tracking-widest uppercase">
            <span>OPTICAL DEPTH // 35MM</span>
            <span>•</span>
            <span>CUC SENSOR MATRIX v2.6</span>
          </div>

          <div className="hidden lg:flex items-center gap-4 absolute bottom-28 right-16 text-[9px] font-mono-tech text-zinc-600 tracking-widest uppercase">
            <span>FPS // 120 DAMPENED</span>
            <span>•</span>
            <span className="text-[#FFE500]/50">INERTIAL STABILIZED</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Foreground Floating Stereoscopic Optical Motes (Multi-depth embers) */}
      <motion.div
        style={{ x: dustX, y: dustY }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <motion.div style={{ y: dustScrollY }} className="w-full h-full relative">
          {particles.map((p) => {
            // Near particles drift more dramatically than far ones
            const depthFactor = p.depth;
            return (
              <motion.div
                key={p.id}
                animate={{
                  y: [0, -14 * depthFactor, 0],
                  opacity: [p.opacity * 0.7, p.opacity, p.opacity * 0.7],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 4.5 + p.id * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
                className="absolute rounded-full bg-[#FFE500] shadow-[0_0_8px_rgba(255,229,0,0.8)]"
              />
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};
