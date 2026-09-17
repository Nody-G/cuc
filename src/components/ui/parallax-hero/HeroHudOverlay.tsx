'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface HeroHudOverlayProps {
  className?: string;
}

export const HeroHudOverlay: React.FC<HeroHudOverlayProps> = ({ className = '' }) => {
  return (
    <div className={`absolute top-6 left-4 right-4 sm:left-8 sm:right-8 z-20 pointer-events-none flex items-center justify-between ${className}`}>
      {/* Discreet Location Indicator */}
      <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
        <span className="text-zinc-300 font-medium">Hauts-de-France</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-400">Domaine de 6 Hectares</span>
      </div>

      {/* Google Maps Quick Access Pill */}
      <a
        href="https://www.google.com/maps/search/?api=1&query=Campus+Univers+Cascades+70+Rue+Faidherbe+59360+Le+Cateau-Cambr%C3%A9sis"
        target="_blank"
        rel="noopener noreferrer"
        title="Ouvrir le Campus Univers Cascades sur Google Maps"
        className="pointer-events-auto ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#FFE500]/50 text-[11px] font-mono-tech text-zinc-300 hover:text-white transition-all backdrop-blur-md cursor-pointer group shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-[#FFE500] group-hover:scale-110 transition-transform" />
        <span>Le Cateau-Cambrésis (59)</span>
        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#FFE500] transition-colors" />
      </a>
    </div>
  );
};
