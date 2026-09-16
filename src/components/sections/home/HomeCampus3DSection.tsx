'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Compass } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { CampusPlan3D } from '@/components/3d/CampusPlan3D';

export const HomeCampus3DSection: React.FC = () => {
  return (
    <section
      id="plan-3d-campus"
      className="py-24 bg-[#060608] border-b border-zinc-800 relative scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <StuntBadge
                  variant="yellow"
                  icon={<Layers className="w-3.5 h-3.5" />}
                >
                  MODÉLISATION SPATIALE 3D
                </StuntBadge>
                <span className="text-xs font-mono-tech text-zinc-400">
                  LE CATEAU-CAMBRÉSIS • 6 HECTARES
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white leading-none">
                EXPLOREZ LE DOMAINE <span className="text-[#FFE500]">EN PLAN 3D</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 font-tech mt-3 max-w-3xl leading-relaxed">
                Naviguez dans la réplique isométrique 3D du plus grand site
                d&apos;entraînement d&apos;Europe. Pivotez, zoomez et cliquez sur les
                bâtiments pour afficher leurs spécifications techniques et
                basculer en immersion 360°.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/visite-virtuelle">
                <TacticalButton
                  variant="secondary"
                  size="md"
                  icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
                >
                  Visite Virtuelle 360°
                </TacticalButton>
              </Link>
              <Link href="/visite-guidee">
                <TacticalButton variant="outline" size="md">
                  Fiches des 9 Espaces
                </TacticalButton>
              </Link>
            </div>
          </div>

          {/* Sector Quick Selector Bar */}
          <div className="mb-4 bg-[#0e0e14] border border-zinc-800/90 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech shadow-md">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
              <span className="text-white font-bold uppercase tracking-wider text-[11px]">
                POINTS D&apos;INTÉRÊT RECONNUS :
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 bg-black/80 border border-[#FFE500]/50 text-[#FFE500] text-[10px] font-bold">
                01 • CUC TOWER (21M)
              </span>
              <span className="px-2 py-0.5 bg-black/60 border border-zinc-800 text-zinc-300 text-[10px]">
                02 • ZOÉ BELL HALL (700M²)
              </span>
              <span className="px-2 py-0.5 bg-black/60 border border-zinc-800 text-zinc-300 text-[10px]">
                03 • FOSSE OLYMPIQUE (50M³)
              </span>
              <span className="px-2 py-0.5 bg-black/60 border border-zinc-800 text-zinc-300 text-[10px]">
                04 • MANÈGE ÉQUESTRE (900M²)
              </span>
              <span className="px-2 py-0.5 bg-[#FFE500]/15 border border-[#FFE500]/40 text-[#FFE500] text-[10px] font-bold">
                05 • PARC 6 HECTARES
              </span>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <CampusPlan3D />
        </div>
      </motion.div>
    </section>
  );
};
