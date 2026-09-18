'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Crosshair,
  Compass,
  Copy,
  Check,
} from 'lucide-react';
import {
  CAMPUS_POIS,
  TRAVEL_ROUTES,
  POI,
} from './campus-map/campusMap.data';
import { getCampusPOIs } from '@/lib/data/site-service';
import { CampusRadarView } from './campus-map/CampusRadarView';
import { CampusAppLaunchers } from './campus-map/CampusAppLaunchers';
import { CampusTravelPlanner } from './campus-map/CampusTravelPlanner';

export const InteractiveCampusMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'map'>('radar');
  const [pois, setPois] = useState<POI[]>(CAMPUS_POIS);
  const [selectedPoi, setSelectedPoi] = useState<POI>(CAMPUS_POIS[0]);
  const [activeRoute, setActiveRoute] = useState<string>('paris');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    getCampusPOIs().then((data) => {
      if (data && data.length > 0) {
        setPois(data);
        setSelectedPoi((prev) => data.find((p) => p.id === prev.id) || data[0]);
      }
    });
  }, []);

  const coordinates = '50.0909, 3.5374';
  const fullAddress =
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
            <span className="text-white font-bold tracking-wider">
              CAMPUS UNIVERS CASCADES
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
            <span>Le Cateau-Cambrésis • Domaine 6 Ha</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map / Radar Viewer + Multi-App Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Interactive Map / Radar View (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between">
          <div>
            {/* View Selector & Mode Switch */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('radar')}
                  className={`px-3 py-1.5 text-xs font-mono-tech uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'radar'
                      ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                      : 'bg-[#15151e] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Radar Satellite 6 Ha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1.5 text-xs font-mono-tech uppercase transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'map'
                      ? 'bg-[#FFE500] text-black font-bold shadow-[0_0_15px_rgba(255,229,0,0.3)]'
                      : 'bg-[#15151e] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Carte Routière</span>
                </button>
              </div>

              {/* Copy GPS button */}
              <button
                type="button"
                onClick={() => copyToClipboard(coordinates)}
                className="px-2.5 py-1.5 bg-[#14141c] hover:bg-[#1a1a24] border border-zinc-800 text-[11px] font-mono-tech text-zinc-300 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copier les coordonnées GPS"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">
                      GPS COPIÉ !
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPIER GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* View Content Area */}
            <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-black border border-zinc-800 overflow-hidden group">
              {activeTab === 'map' ? (
                /* Interactive OpenStreetMap Dark / Live Map Embed */
                <div className="w-full h-full relative">
                  <iframe
                    title="Campus Univers Cascades Location Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.5250%2C50.0840%2C3.5500%2C50.0980&layer=mapnik&marker=50.0909%2C3.5374"
                    className="w-full h-full border-0 filter invert contrast-125 hue-rotate-180 brightness-90"
                    loading="lazy"
                  />
                  {/* Tactical Target Overlay */}
                  <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md border border-[#FFE500]/60 p-3 pointer-events-none max-w-xs">
                    <div className="flex items-center gap-2 text-[#FFE500] text-xs font-mono-tech font-bold mb-1">
                      <Crosshair className="w-4 h-4 animate-spin-slow" />
                      <span>DOMAINE CUC — 6 HECTARES</span>
                    </div>
                    <p className="text-[11px] font-tech text-zinc-300 leading-snug">
                      70 Rue Faidherbe, 59360 Le Cateau-Cambrésis
                    </p>
                    <div className="mt-1 text-[10px] font-mono-tech text-zinc-500">
                      50°05&apos;27.2&quot;N 3°32&apos;14.6&quot;E
                    </div>
                  </div>

                  {/* Adresse badge */}
                  <div className="absolute bottom-3 right-3 bg-black/90 px-2 py-1 text-[10px] font-mono-tech text-zinc-400 border border-zinc-800 flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-[#FFE500]" />
                    <span>70 Rue Faidherbe • 59360 Le Cateau-Cambrésis</span>
                  </div>
                </div>
              ) : (
                /* Tactical Radar Layout for 6 Hectares Domain */
                <CampusRadarView
                  pois={pois}
                  selectedPoi={selectedPoi}
                  onSelectPoi={setSelectedPoi}
                />
              )}
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
