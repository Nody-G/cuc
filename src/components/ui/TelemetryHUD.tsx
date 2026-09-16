'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { soundFX } from '@/lib/soundFx';
import {
  Volume2,
  VolumeX,
  Layers,
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface TelemetryHUDProps {
  onOpenSearch?: () => void;
  onOpenPlan3D?: () => void;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  onOpenSearch,
  onOpenPlan3D,
}) => {
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAudio, setIsAudio] = useState<boolean>(() => (typeof window !== 'undefined' ? soundFX.isEnabled() : false));
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let speedTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const deltaY = Math.abs(currentScrollY - lastScrollY);
      const deltaTime = Math.max(10, now - lastTime);

      // Speed in pixels per ms converted to simulated km/h
      const speed = Math.min(85, Math.round((deltaY / deltaTime) * 25));
      setScrollSpeed(speed);

      // Scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.round((currentScrollY / docHeight) * 100) : 0;
      setScrollProgress(progress);

      lastScrollY = currentScrollY;
      lastTime = now;

      clearTimeout(speedTimer);
      speedTimer = setTimeout(() => {
        setScrollSpeed(0);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(speedTimer);
    };
  }, []);

  const toggleSound = () => {
    const next = soundFX.toggle();
    setIsAudio(next);
  };

  return (
    <aside
      aria-label="Télémétrie et outils de navigation tactiques"
      className="fixed bottom-20 sm:bottom-6 right-4 z-40 select-none font-mono-tech hidden sm:block"
    >
      <div className="bg-[#0b0b12]/95 backdrop-blur-md border border-zinc-800 shadow-[0_0_25px_rgba(0,0,0,0.8)] flex flex-col items-end">
        {/* Expanded Telemetry Stats */}
        {isExpanded && (
          <div className="p-3 border-b border-zinc-800 text-[11px] text-zinc-400 space-y-1.5 w-64">
            <div className="flex items-center justify-between text-white font-bold pb-1 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 text-[#FFE500]">
                <Image
                  src="/images/logos/cuc-logo-yellow.png"
                  alt="CUC"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span>TÉLÉMÉTRIE CUC</span>
              </span>
              <span className="text-[10px] text-emerald-400">CONNECTÉ</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Vitesse défilement :</span>
              <span className="text-white font-bold">{scrollSpeed} km/h</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Position page :</span>
              <span className="text-[#FFE500] font-bold">{scrollProgress}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Fréquence capteurs :</span>
              <span className="text-white">700 Hz True-Motion</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Coordonnées :</span>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Campus+Univers+Cascades+70+Rue+Faidherbe+59360+Le+Cateau-Cambr%C3%A9sis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFE500] hover:underline text-[10px] flex items-center gap-1 cursor-pointer"
                title="Ouvrir sur Google Maps"
              >
                <span>50.1032° N, 3.5417° E</span>
                <span className="text-[8px]">↗</span>
              </a>
            </div>
          </div>
        )}

        {/* Compact Dock Controls Bar */}
        <div className="flex items-center gap-1 p-1 bg-[#0e0e16]">
          {/* Quick 3D Jump */}
          <Link
            href="/visite-virtuelle#plan-3d-campus"
            onClick={onOpenPlan3D}
            className="px-2 py-1 text-[10px] text-zinc-300 hover:text-[#FFE500] hover:bg-zinc-800/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="Aller au Plan 3D"
          >
            <Layers className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden md:inline">Plan 3D</span>
          </Link>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="px-2 py-1 text-[10px] text-zinc-300 hover:text-[#FFE500] hover:bg-zinc-800/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="Recherche tactique (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden md:inline">Recherche</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`px-2 py-1 text-[10px] transition-colors flex items-center gap-1 cursor-pointer ${
              isAudio ? 'text-[#FFE500] bg-[#FFE500]/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={isAudio ? 'Désactiver les micro-sons' : 'Activer les sons cinéma tactiques'}
          >
            {isAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isAudio ? 'SON ON' : 'SON OFF'}</span>
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-zinc-500 hover:text-white cursor-pointer"
            title={isExpanded ? 'Réduire la télémétrie' : 'Développer la télémétrie'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
