'use client';

import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';

interface HeroHudOverlayProps {
  hudY: MotionValue<string>;
  mouseOffsetX: number;
}

export const HeroHudOverlay: React.FC<HeroHudOverlayProps> = ({
  hudY,
  mouseOffsetX,
}) => {
  return (
    <motion.div
      style={{
        y: hudY,
        x: mouseOffsetX * 0.4,
      }}
      className="absolute inset-4 sm:inset-6 pointer-events-none z-20 will-change-transform flex flex-col justify-between"
    >
      {/* Clean Top Bar */}
      <div className="flex items-center justify-between w-full">
        <div className="text-[11px] font-mono-tech text-zinc-400 hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
          <span className="text-white font-bold tracking-wider">CAMPUS UNIVERS CASCADES</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">DEPUIS 2008</span>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Campus+Univers+Cascades+70+Rue+Faidherbe+59360+Le+Cateau-Cambr%C3%A9sis"
          target="_blank"
          rel="noopener noreferrer"
          title="Ouvrir le Campus Univers Cascades (Le Cateau-Cambrésis) sur Google Maps"
          className="pointer-events-auto text-[11px] font-mono-tech text-zinc-300 hover:text-white hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-black/60 hover:bg-black/80 border border-zinc-800 hover:border-[#FFE500]/60 transition-all cursor-pointer group shadow-sm backdrop-blur-xs ml-auto"
        >
          <MapPin className="w-3.5 h-3.5 text-[#FFE500] group-hover:scale-110 transition-transform" />
          <span>LE CATEAU-CAMBRÉSIS (59)</span>
          <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#FFE500]" />
        </a>
      </div>

      {/* Clean Bottom Bar */}
      <div className="flex items-center justify-between w-full text-[11px] font-mono-tech text-zinc-400 hidden md:flex">
        <div className="flex items-center gap-2">
          <span className="text-[#FFE500]">DOMAINE DE 6 HECTARES</span>
          <span className="text-zinc-600">•</span>
          <span>HAUTS-DE-FRANCE</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white font-bold">QUALIOPI</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">PRISE EN CHARGE AFDAS</span>
        </div>
      </div>
    </motion.div>
  );
};
