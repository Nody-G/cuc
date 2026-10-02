'use client';

import React, { useEffect, useMemo, useRef } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Amplitude verticale (px) de chaque élément pour une progression de 0 → 1. */
const PARALLAX_OFFSETS = {
  beacon1: 200,
  beacon2: -250,
  beacon3: 300,
  particles: -350,
} as const;

/**
 * Atmosphère globale du Studio — parallaxe de fond pilotée par une variable
 * CSS.
 *
 * `--cuc-atmo-progress` (0 → 1, progression de scroll du document) est écrite
 * sur l'élément racine à chaque frame utile (`requestAnimationFrame`) ; les
 * couches l'interprètent en `calc()`. Plus de `framer-motion` sur le chemin
 * d'accueil ; le lissage est une transition CSS sur `transform`.
 *
 * `prefers-reduced-motion` : aucun écouteur n'est posé, les couches restent à
 * leur position d'origine.
 */
export const StudioGlobalAtmosphere: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const raw = max > 0 ? window.scrollY / max : 0;
      const progress = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      el.style.setProperty('--cuc-atmo-progress', progress.toFixed(4));
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

  const layerClass =
    'absolute will-change-transform transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]';

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Subtle Global Vertical Telemetry Guide Lines (Studio Film Margins) */}
      <div className="absolute inset-x-0 inset-y-0 page-shell flex justify-between opacity-25">
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        <div className="hidden sm:block w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* 2. Soft Ambient Lighting Beacons that shift with scroll depth */}
      <div
        style={{ transform: `translate3d(0, calc(var(--cuc-atmo-progress, 0) * ${PARALLAX_OFFSETS.beacon1}px), 0)` }}
        className={`${layerClass} top-[25%] -left-[10%] w-[45rem] h-[35rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.035)_0%,_transparent_70%)] blur-3xl`}
      />
      <div
        style={{ transform: `translate3d(0, calc(var(--cuc-atmo-progress, 0) * ${PARALLAX_OFFSETS.beacon2}px), 0)` }}
        className={`${layerClass} top-[55%] -right-[10%] w-[50rem] h-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(255,200,0,0.025)_0%,_transparent_70%)] blur-3xl`}
      />
      <div
        style={{ transform: `translate3d(0, calc(var(--cuc-atmo-progress, 0) * ${PARALLAX_OFFSETS.beacon3}px), 0)` }}
        className={`${layerClass} top-[80%] left-[20%] w-[45rem] h-[35rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.02)_0%,_transparent_70%)] blur-3xl`}
      />

      {/* 3. Floating Micro-Particles rising with scroll inertia */}
      <div
        style={{ transform: `translate3d(0, calc(var(--cuc-atmo-progress, 0) * ${PARALLAX_OFFSETS.particles}px), 0)` }}
        className={`${layerClass} inset-0`}
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
      </div>
    </div>
  );
};
