'use client';

import React, { useState, useRef } from 'react';
import {
  Maximize,
  Minimize,
  RotateCcw,
  Compass,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VirtualTourViewerProps {
  className?: string;
  defaultFullscreen?: boolean;
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  className = '',
}) => {
  const t = useTranslations('visiteVirtuelle');
  /** Chrome commun : localisation affichée dans la barre du lecteur 360. */
  const chrome = useTranslations('commonChrome');
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [infoOpen, setInfoOpen] = useState(true);

  const TOUR_URL =
    'https://www.hdmedia.fr/visite-virtuelle/hd/cbprqpmz9-campus-univers-cascades-le-cateau-cambresis.html';

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

  return (
    <div
      ref={containerRef}
      id="visite-virtuelle-360"
      className={`relative bg-[#08080c] border-2 border-[#FFE500] rounded-none overflow-hidden shadow-[0_0_40px_rgba(255,229,0,0.15)] flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-0 m-0 w-screen h-screen' : ''
        } ${className}`}
    >
      {/* HUD Top Control Bar */}
      <div className="bg-[#0b0b10] border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="font-display uppercase tracking-wider text-sm text-white font-bold flex items-center gap-2">
            {t('viewerTitle')}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-[#14141c] border border-zinc-800 text-[10px] font-mono-tech text-zinc-400">
            {chrome('locationLabel')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title={t('helpTitle')}
          >
            <Info className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden md:inline">{t('helpLabel')}</span>
          </button>

          <button
            onClick={handleResetTour}
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title={t('resetTitle')}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden sm:inline">{t('resetLabel')}</span>
          </button>

          <a
            href={TOUR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[11px] font-mono-tech border border-zinc-800 bg-[#121218] text-zinc-300 hover:text-[#FFE500] hover:border-zinc-700 transition-colors flex items-center gap-1.5"
            title={t('openTabTitle')}
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="hidden lg:inline">{t('openTabLabel')}</span>
          </a>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 text-[11px] font-mono-tech border border-[#FFE500] bg-[#FFE500] text-black font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            title={isFullscreen ? t('exitFullscreenTitle') : t('fullscreenTitle')}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5" />
                <span>{t('collapseLabel')}</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5" />
                <span>{t('fullscreenLabel')}</span>
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
              <strong className="text-white">{t('navHelpTitle')}</strong> {t('navHelpBody1')}{' '}
              <span className="text-[#FFE500] font-semibold">{t('navHelpHighlight')}</span>{' '}
              {t('navHelpBody2')}
            </span>
          </div>
          <button
            onClick={() => setInfoOpen(false)}
            className="text-zinc-500 hover:text-white text-xs font-mono-tech shrink-0 cursor-pointer"
          >
            {t('hideLabel')}
          </button>
        </div>
      )}

      {/* The 360 Virtual Tour iFrame Container */}
      <div className={`relative w-full bg-black ${isFullscreen ? 'flex-grow h-full' : 'h-[520px] sm:h-[620px] lg:h-[720px]'}`}>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={TOUR_URL}
          title={t('iframeTitle')}
          className="w-full h-full border-0"
          scrolling="no"
          allowFullScreen
          allow="fullscreen; xr-spatial-tracking; autoplay; gyroscope; accelerometer"
        />
      </div>
    </div>
  );
};
