'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Navigation, ExternalLink } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';

interface CampusAppLaunchersProps {
  coordinates?: string;
}

/**
 * Boutons d'action directe pour le guidage GPS.
 *
 * Remplace tout menu déroulant pour offrir une ouverture instantanée
 * de l'application de navigation préférée sur smartphone (Google Maps,
 * Waze, Apple Plans) sans friction ni risque de masquage par overflow.
 */
export const CampusAppLaunchers: React.FC<CampusAppLaunchersProps> = ({
  coordinates = '50.0909,3.5374',
}) => {
  const t = useTranslations('contact.map');

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;
  const wazeUrl = `https://waze.com/ul?ll=${coordinates}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${coordinates}`;

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs font-mono-tech text-zinc-400">
          <span {...cucMicro('contact.map.appLaunchTitle')}>{t('appLaunchTitle')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bouton Principal : ouverture directe de l'itinéraire universel */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe81a] text-black text-xs font-mono-tech uppercase font-bold tracking-wider transition-all shadow-md active:scale-[0.98] border border-[#FFE500]"
          >
            <Navigation className="w-3.5 h-3.5 fill-black shrink-0" />
            <span {...cucMicro('contact.map.launchRoute')}>{t('launchRoute')}</span>
            <ExternalLink className="w-3 h-3 text-black/70 shrink-0" />
          </a>

          {/* Raccourci direct Waze */}
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir l'itinéraire dans Waze (alertes et trafic en temps réel)"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#14141c] hover:bg-[#1a1a26] text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#33CCFF]/70 text-xs font-mono-tech transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#33CCFF] shrink-0" />
            <span>Waze</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
          </a>

          {/* Raccourci direct Apple Plans (iOS / macOS) */}
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir dans Apple Plans"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#14141c] hover:bg-[#1a1a26] text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-400 text-xs font-mono-tech transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <span>Apple Plans</span>
            <ExternalLink className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};
