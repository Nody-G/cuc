'use client';

import React, { useState, useRef } from 'react';
import {
  Maximize,
  Minimize,
  RotateCcw,
  Compass,
  ExternalLink,
  Building,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';

interface FacilitySpot {
  id: string;
  name: string;
  code: string;
  description: string;
  badge: string;
}

const TOUR_HOTSPOTS: FacilitySpot[] = [
  {
    id: 'zoe-bell',
    name: 'Zoé Bell Hall',
    code: 'ZONE 01',
    description: 'Fosse olympique à cubes de mousse, trampolines de propulsion et praticables de chutes.',
    badge: 'Plateau Principal'
  },
  {
    id: 'cuc-tower',
    name: 'CUC Tower 21M',
    code: 'ZONE 02',
    description: 'Tour monumentale de 21 mètres : simulations de défenestrations, rappels et sauts airbag.',
    badge: 'Chutes Extrêmes'
  },
  {
    id: 'dojos',
    name: "Dojos & Salle d'Armes",
    code: 'ZONE 03',
    description: "Tatamis d'impact, ring de boxe et arsenal d'armes factices pour combats de cinéma.",
    badge: 'Fight Choreography'
  },
  {
    id: 'manege',
    name: 'Manège Équestre',
    code: 'ZONE 04',
    description: 'Structure équestre couverte pour voltige, chutes de cheval et cascades équestres.',
    badge: 'Cascades Équestres'
  },
  {
    id: 'mecanique',
    name: 'Zone Mécanique & Piste',
    code: 'ZONE 05',
    description: 'Ateliers de préparation mécanique, quads, motos et véhicules de dérapage & percussions.',
    badge: 'Cascades Véhicules'
  },
  {
    id: 'hebergement',
    name: 'QG Staff & Hébergements',
    code: 'ZONE 06',
    description: '90 lits en pension complète, réfectoire, salle de projection et pôle vie des élèves.',
    badge: 'Vie de Campus'
  }
];

interface VirtualTourViewerProps {
  className?: string;
  showHotspots?: boolean;
  defaultFullscreen?: boolean;
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  className = '',
  showHotspots = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSpot, setActiveSpot] = useState<FacilitySpot>(TOUR_HOTSPOTS[0]);
  const [iframeKey, setIframeKey] = useState(0);
  const [infoOpen, setInfoOpen] = useState(true);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Erreur plein écran:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleResetTour = () => {
    setIframeKey((prev) => prev + 1);
  };

  const TOUR_URL =
    'https://www.hdmedia.fr/visite-virtuelle/hd/cbprqpmz9-campus-univers-cascades-le-cateau-cambresis.html';

  return (
    <div
      ref={containerRef}
      id="visite-virtuelle-360"
      className={`relative bg-[#08080c] border-2 border-[#FFE500] rounded-none overflow-hidden shadow-[0_0_40px_rgba(255,229,0,0.15)] flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-0 m-0 w-screen h-screen' : ''
      } ${className}`}
    >
      {/* HUD Corners */}

      {/* HUD Top Control Bar */}
      <div className="bg-[#0b0b10] border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="font-display uppercase tracking-wider text-sm text-white font-bold flex items-center gap-2">
            VISITE VIRTUELLE 360° INTERACTIVE <span className="text-[#FFE500] font-mono-tech text-xs">{'// HD MEDIA'}</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-[#14141c] border border-zinc-800 text-[10px] font-mono-tech text-zinc-400">
            6 HECTARES • LE CATEAU-CAMBRÉSIS
          </span>
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Aide de navigation"
          >
            <Info className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden md:inline">Mode d'emploi</span>
          </button>

          <button
            onClick={handleResetTour}
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Réinitialiser la visite à l'entrée"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>

          <a
            href={TOUR_URL}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5"
            title="Ouvrir en plein écran dans un nouvel onglet / Casque VR"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden lg:inline">Ouvrir dans un onglet</span>
          </a>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-[11px] font-mono-tech border border-[#FFE500] bg-[#FFE500] text-black font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran immersif"}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span>RÉDUIRE</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span>PLEIN ÉCRAN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Helper Banner */}
      {infoOpen && (
        <div className="bg-[#12121c] border-b border-zinc-800/80 px-4 py-2 text-xs font-tech text-zinc-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FFE500] shrink-0 animate-spin-slow" />
            <span>
              <strong className="text-white">Navigation 360° :</strong> Cliquez et faites glisser votre curseur (ou votre doigt sur mobile) pour regarder autour de vous. Cliquez sur les <span className="text-[#FFE500] font-semibold">flèches clignotantes au sol</span> pour avancer d'une pièce à l'autre.
            </span>
          </div>
          <button
            onClick={() => setInfoOpen(false)}
            className="text-zinc-500 hover:text-white text-xs font-mono-tech shrink-0 cursor-pointer"
          >
            [MASQUER]
          </button>
        </div>
      )}

      {/* The 360 Virtual Tour iFrame Container */}
      <div className={`relative w-full bg-black ${isFullscreen ? 'flex-grow h-full' : 'h-[520px] sm:h-[620px] lg:h-[720px]'}`}>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={TOUR_URL}
          title="Visite Virtuelle 360° Campus Univers Cascades"
          className="w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          allow="fullscreen; xr-spatial-tracking; autoplay; gyroscope; accelerometer"
        />

        {/* Live Watermark / HUD Badge on top of frame */}
        <div className="absolute top-4 left-4 pointer-events-none hidden sm:flex items-center gap-2 bg-black/85 backdrop-blur-xs px-3 py-1.5 border border-zinc-700/80 text-[11px] font-mono-tech text-zinc-300">
          <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>VUE 360° DIRECTE DU DOMAINE CUC</span>
        </div>
      </div>

      {/* Quick Jump Hotspots Navigation Bar */}
      {showHotspots && !isFullscreen && (
        <div className="bg-[#0b0b10] border-t border-zinc-800 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FFE500]" />
              <span className="text-xs font-mono-tech uppercase text-white font-bold">
                Repères & Espaces d'Entraînement Clés du Campus
              </span>
            </div>
            <span className="text-[11px] font-mono-tech text-zinc-500 hidden sm:inline">
              Sélectionnez une zone pour voir ses spécifications
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {TOUR_HOTSPOTS.map((spot) => {
              const isSelected = activeSpot.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveSpot(spot)}
                  className={`p-2.5 text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#181824] border-[#FFE500] text-white shadow-[0_0_12px_rgba(255,229,0,0.25)]'
                      : 'bg-[#101016] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-mono-tech px-1 py-0.2 font-bold ${
                        isSelected ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {spot.code}
                    </span>
                    <span className="text-[9px] font-mono-tech text-zinc-500 truncate">
                      {spot.badge}
                    </span>
                  </div>
                  <span className="font-display uppercase text-xs tracking-wide block truncate text-white">
                    {spot.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Spotlight Description Card */}
          <div className="mt-3 p-3 bg-[#12121a] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#FFE500] font-mono-tech font-bold uppercase mr-2">
                [{activeSpot.code}] {activeSpot.name} :
              </span>
              <span className="text-zinc-300 font-tech">
                {activeSpot.description}
              </span>
            </div>
            <a
              href="#installations-detail"
              className="inline-flex items-center gap-1 text-[11px] font-mono-tech text-[#FFE500] hover:underline shrink-0"
            >
              <span>Voir la fiche technique complète</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
