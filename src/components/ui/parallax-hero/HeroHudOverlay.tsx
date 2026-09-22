'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SitePageHero } from '@/lib/data/site-service';
import { cucField } from '@/lib/preview/cuc-field';

interface HeroHudOverlayProps {
  className?: string;
  /**
   * Données éditoriales du hero (`hero.*`). Chaque micro-texte retombe sur sa
   * traduction quand la clé est vide : le repli reste la source par défaut.
   */
  heroData?: Partial<SitePageHero>;
}

const DEFAULT_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Campus+Univers+Cascades+70+Rue+Faidherbe+59360+Le+Cateau-Cambr%C3%A9sis';

export const HeroHudOverlay: React.FC<HeroHudOverlayProps> = ({
  className = '',
  heroData,
}) => {
  const t = useTranslations('home.hero');

  const location = heroData?.hud_location || t('hudLocation');
  const privateDomain = heroData?.hud_private_domain || t('hudPrivateDomain');
  const mapLabel = heroData?.hud_map_label || t('hudMapLabel');
  const mapUrl = heroData?.hud_map_url || DEFAULT_MAP_URL;

  return (
    <div className={`absolute top-6 left-4 right-4 sm:left-8 sm:right-8 z-20 pointer-events-none flex items-center justify-between ${className}`}>
      {/* Discreet Location Indicator */}
      <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono-tech uppercase tracking-widest text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500]" />
        <span {...cucField('hero.hud_location')} className="text-zinc-300 font-medium">
          {location}
        </span>
        <span className="text-zinc-600">•</span>
        <span {...cucField('hero.hud_private_domain')} className="text-zinc-400">
          {privateDomain}
        </span>
      </div>

      {/* Google Maps Quick Access Pill */}
      <a
        href={mapUrl}
        data-cuc-field="hero.hud_map_url"
        data-cuc-kind="link"
        target="_blank"
        rel="noopener noreferrer"
        title={t('hudMapTitle')}
        className="pointer-events-auto ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#FFE500]/50 text-[11px] font-mono-tech text-zinc-300 hover:text-white transition-all backdrop-blur-md cursor-pointer group shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-[#FFE500] group-hover:scale-110 transition-transform" />
        <span {...cucField('hero.hud_map_label')}>{mapLabel}</span>
        <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#FFE500] transition-colors" />
      </a>
    </div>
  );
};
