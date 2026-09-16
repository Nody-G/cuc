'use client';

import React, { useState } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { TacticalButton } from '../ui/TacticalButton';

interface VideoShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApplication: () => void;
}

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  isOpen,
  onClose,
  onOpenApplication,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0e0e12] border-2 border-[#FFE500] p-4 sm:p-6 shadow-[0_0_80px_rgba(255,229,0,0.2)]">
        {/* Tactical Crosshair Corners */}

        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
              SHOWREEL OFFICIEL
            </span>
            <span className="text-xs font-mono-tech text-zinc-500 hidden sm:inline">
              • CUC STUNT TEAM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-zinc-400 hover:text-[#FFE500] border border-zinc-800 bg-[#14141a] transition-colors"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-[#FFE500] border border-zinc-800 bg-[#14141a] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Frame / Embed */}
        <div className="relative aspect-video w-full bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
          <iframe
            className="w-full h-full"
            loading="lazy"
            src="https://www.youtube-nocookie.com/embed/DwpD2jceFXA?autoplay=1&rel=0&modestbranding=1"
            title="Campus Univers Cascades Showreel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Bottom Details */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs font-mono-tech text-zinc-400">
            <span className="text-[#FFE500]">Tournages récents :</span> Cascades physiques, chutes de hauteur, torches humaines, John Wick 4, Coka Chicas, Bagarre.
          </div>

          <TacticalButton
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenApplication();
            }}
          >
            Rejoindre les Prochaines Sessions
          </TacticalButton>
        </div>
      </div>
    </div>
  );
};
