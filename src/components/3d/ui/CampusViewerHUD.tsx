'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Compass, Maximize, Minimize, RotateCcw } from 'lucide-react';
import { EditableFacilityItem } from '../types/campus3d.types';
import { FacilitySpotlightCard } from './FacilitySpotlightCard';

interface CampusViewerHUDProps {
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  bearing: number;
  cameraDistance: number;
  activeFacility: EditableFacilityItem | null;
  isCardVisible: boolean;
  onCloseCard: () => void;
}

/**
 * HUD public du plan 3D — réduit au strict nécessaire.
 *
 * Ce qui a été **retiré** volontairement :
 *  - le carrousel d'installations : plus aucun raccourci ne fait sauter la vue
 *    d'un bâtiment à l'autre, l'orientation reste à l'utilisateur ;
 *  - les vues caméra imposées (vue globale, plan 2D) ;
 *  - le sélecteur d'ambiance (nocturne / solaire), désormais fixe ;
 *  - les boutons de zoom, redondants avec la molette et le pincement.
 *
 * Ce qui reste : l'identité du plan, le cap et la distance (télémesure
 * factuelle), le recentrage — devenu utile depuis l'ajout du déplacement
 * latéral —, le plein écran, et la fiche du bâtiment sélectionné.
 *
 * Copie : catalogue `campus3dViewer` (`messages/{fr,en}.json`) — le HUD est
 * public (`/en/…` inclus) et le Cockpit fournit le catalogue FR, donc la même
 * source sert les deux contextes.
 */
export const CampusViewerHUD: React.FC<CampusViewerHUDProps> = ({
  onReset,
  isFullscreen,
  onToggleFullscreen,
  bearing,
  cameraDistance,
  activeFacility,
  isCardVisible,
  onCloseCard,
}) => {
  const t = useTranslations('campus3dViewer');

  return (
    <>
      {/* Barre de contrôle */}
      <div className="bg-[#0c0c12]/95 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFE500] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE500]" />
          </span>
          <span className="font-display uppercase tracking-wider text-sm text-white font-bold truncate">
            {t('title')}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono-tech text-zinc-500">
            <Compass className="w-3 h-3 text-[#FFE500]" />
            <span>{bearing.toString().padStart(3, '0')}°</span>
            <span className="text-zinc-700">•</span>
            <span>{cameraDistance} m</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 bg-[#14141c] border border-zinc-800 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
            aria-label={t('resetView')}
            title={t('resetView')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 bg-[#14141c] border border-zinc-800 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
            aria-label={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}
            title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Gestes réellement disponibles */}
      <div className="pointer-events-none absolute top-3 right-3 z-10 hidden lg:block">
        <span className="bg-black/70 backdrop-blur-xs border border-zinc-800/80 px-2.5 py-1 text-[10px] font-mono-tech text-zinc-400">
          {t('gestures')}
        </span>
      </div>

      {/* Fiche d'information du bâtiment sélectionné */}
      <FacilitySpotlightCard
        activeFacility={activeFacility}
        isVisible={isCardVisible}
        onClose={onCloseCard}
      />
    </>
  );
};
