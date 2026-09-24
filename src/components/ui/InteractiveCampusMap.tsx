'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { TRAVEL_ROUTES } from './campus-map/campusMap.data';
import {
  getSiteSettings,
  DEFAULT_SITE_SETTINGS,
  SiteSettings,
} from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { usePreviewSettings } from '@/lib/preview/use-preview-settings';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { CampusAppLaunchers } from './campus-map/CampusAppLaunchers';
import { CampusTravelPlanner } from './campus-map/CampusTravelPlanner';

export const InteractiveCampusMap: React.FC = () => {
  const t = useTranslations('contact.map');
  /** Chrome commun : nom du campus affiché dans la barre d'état de la carte. */
  const chrome = useTranslations('commonChrome');

  const [activeRoute, setActiveRoute] = useState<string>('paris');
  const [copied, setCopied] = useState<boolean>(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  /** Recharge les réglages (adresse du domaine, coordonnées du standard). */
  const loadSettings = useCallback(() => {
    getSiteSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Synchronisation Realtime Cockpit → Vitrine (réglages : adresse, standard).
  useRealtimeRefresh(['site_settings'], loadSettings);

  /** Brouillon de réglages du Mode Studio : la surcharge locale prime. */
  const previewSettings = usePreviewSettings();

  const coordinates = '50.0909, 3.5374';
  /** Adresse des réglages, utilisée par le planificateur de trajet (colonne de droite). */
  const fullAddress =
    previewSettings.address ||
    settings.address ||
    'Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis, France';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#0b0b10] border-2 border-zinc-800 rounded-none relative overflow-hidden shadow-2xl">

      {/* Top Info Bar */}
      <div className="bg-[#121218] border-b border-zinc-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span
              className="text-white font-bold tracking-wider"
              {...cucMicro('commonChrome.brandName')}
            >
              {chrome('brandName')}
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="text-[#FFE500]">
            LAT 50.0909° N • LON 3.5374° E
          </span>
        </div>

        {/* Domain info */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>{t('mapAddressLabel')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Satellite Map + Multi-App Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Satellite Map (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between">
          <div>
            {/* Copie GPS — un seul affichage (vue satellite), plus de sélecteur. */}
            <div className="flex items-center justify-end mb-4">
              <button
                type="button"
                onClick={() => copyToClipboard(coordinates)}
                className="px-2.5 py-1.5 bg-[#14141c] hover:bg-[#1a1a24] border border-zinc-800 text-[11px] font-mono-tech text-zinc-300 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors cursor-pointer"
                title={t('copyGpsTitle')}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span
                      className="text-emerald-400 font-bold"
                      {...cucMicro('contact.map.copied')}
                    >
                      {t('copied')}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span {...cucMicro('contact.map.copyGps')}>{t('copyGps')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Carte — vue satellite Google Maps (`t=k`), imagerie seule : aucune
                surcouche de texte. Cette vue n'existe que sur la page contact. */}
            <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-black border border-zinc-800 overflow-hidden">
              <iframe
                title="Campus Univers Cascades — vue satellite"
                src="https://www.google.com/maps?q=50.0909,3.5374&t=k&z=17&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Quick Interconnectivity Buttons */}
          <CampusAppLaunchers coordinates="50.0909,3.5374" />
        </div>

        {/* Right Column: Travel Times & Step-by-Step Directions (4 cols) */}
        <CampusTravelPlanner
          routes={TRAVEL_ROUTES}
          activeRouteId={activeRoute}
          onSelectRoute={setActiveRoute}
          onCopyAddress={copyToClipboard}
          isCopied={copied}
          fullAddress={fullAddress}
        />
      </div>
    </div>
  );
};
