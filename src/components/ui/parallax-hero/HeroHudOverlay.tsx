'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SitePageHero } from '@/lib/data/site-service';

interface HeroHudOverlayProps {
  className?: string;
  /**
   * Données éditoriales du hero (`hero.*`). La cible de la carte retombe sur
   * l'adresse du campus quand la clé est vide : le repli reste la source par
   * défaut.
   */
  heroData?: Partial<SitePageHero>;
}

const DEFAULT_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Campus+Univers+Cascades+70+Rue+Faidherbe+59360+Le+Cateau-Cambr%C3%A9sis';

/**
 * Accès rapide à la carte du campus, en haut à droite du hero.
 *
 * Les repères textuels (région, nature du domaine, libellé de la pilule) ont
 * été retirés : ils doublonnaient des informations déjà présentes ailleurs sur
 * la page. Il ne reste que l'épingle, dont la cible se règle dans le Cockpit
 * (`hero.hud_map_url`).
 */
export const HeroHudOverlay: React.FC<HeroHudOverlayProps> = ({
  className = '',
  heroData,
}) => {
  const t = useTranslations('home.hero');
  const mapUrl = heroData?.hud_map_url || DEFAULT_MAP_URL;

  return (
    <div
      className={`absolute top-6 left-4 right-4 sm:left-8 sm:right-8 z-20 pointer-events-none flex items-center justify-end ${className}`}
    >
      {/* Épingle seule : le calque reste décoratif (il ne doit pas intercepter
          la parallaxe), l'ancre est la seule zone sensible. */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={t('hudMapTitle')}
        aria-label={t('hudMapTitle')}
        className="pointer-events-auto inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#FFE500]/50 text-zinc-300 hover:text-white transition-all backdrop-blur-md cursor-pointer group shadow-sm"
      >
        <MapPin className="w-4 h-4 text-[#FFE500] group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
};
