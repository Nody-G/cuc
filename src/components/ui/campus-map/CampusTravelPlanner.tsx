'use client';

import React from 'react';
import { Compass, Train, Car, MapPin, Copy } from 'lucide-react';
import { TravelRoute } from './campusMap.data';

interface CampusTravelPlannerProps {
  routes: TravelRoute[];
  activeRouteId: string;
  onSelectRoute: (id: string) => void;
  onCopyAddress: (addr: string) => void;
  isCopied: boolean;
  fullAddress: string;
}

export const CampusTravelPlanner: React.FC<CampusTravelPlannerProps> = ({
  routes,
  activeRouteId,
  onSelectRoute,
  onCopyAddress,
  isCopied,
  fullAddress,
}) => {
  const selectedRouteData =
    routes.find((r) => r.id === activeRouteId) || routes[0];

  return (
    <div className="lg:col-span-4 p-4 sm:p-6 bg-[#0e0e14] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#FFE500]" />
            <h3 className="text-base font-display uppercase text-white tracking-wider">
              TEMPS DE TRAJET & ACCÈS
            </h3>
          </div>
          <span className="text-[10px] font-mono-tech px-1.5 py-0.5 bg-zinc-800 text-zinc-400">
            CAMPUS CUC
          </span>
        </div>

        {/* City Tabs */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => onSelectRoute(route.id)}
              className={`p-2 text-left text-xs font-mono-tech transition-all border ${
                activeRouteId === route.id
                  ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold'
                  : 'bg-[#14141c] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <div className="truncate">{route.origin}</div>
              <div className="text-[9px] opacity-75">{route.tag}</div>
            </button>
          ))}
        </div>

        {/* Selected Route Info Box */}
        <div className="space-y-4">
          {/* Train Card */}
          <div className="bg-[#12121a] border border-zinc-800 p-3.5 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white">
                <Train className="w-4 h-4 text-[#FFE500]" />
                <span>EN TRAIN DIRECT</span>
              </div>
              <span className="text-xs font-mono-tech font-bold text-[#FFE500] bg-[#FFE500]/10 px-2 py-0.5 border border-[#FFE500]/30">
                {selectedRouteData.train.time}
              </span>
            </div>
            <p className="text-xs font-tech text-zinc-300 mb-2 leading-relaxed">
              {selectedRouteData.train.details}
            </p>
            <div className="text-[10px] font-mono-tech text-zinc-500 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-zinc-400" />
              <span>Arrivée : {selectedRouteData.train.station}</span>
            </div>
          </div>

          {/* Car Card */}
          <div className="bg-[#12121a] border border-zinc-800 p-3.5 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono-tech font-bold text-white">
                <Car className="w-4 h-4 text-[#FFE500]" />
                <span>EN VOITURE</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono-tech">
                <span className="text-zinc-400">
                  {selectedRouteData.car.distance}
                </span>
                <span className="font-bold text-white bg-zinc-800 px-2 py-0.5">
                  {selectedRouteData.car.time}
                </span>
              </div>
            </div>
            <p className="text-xs font-tech text-zinc-300 leading-relaxed">
              {selectedRouteData.car.details}
            </p>
          </div>

          {/* Practical Guidance */}
          <div className="bg-[#151520] border border-zinc-800/80 p-3 text-[11px] font-tech text-zinc-400 space-y-1">
            <div className="font-mono-tech text-[#FFE500] uppercase font-bold text-[10px]">
              INFO ACCÈS & STATIONNEMENT :
            </div>
            <p>
              • <strong>Parking gratuit 50 places</strong> à l&apos;intérieur du
              Domaine CUC sécurisé.
            </p>
            <p>
              • <strong>Navette CUC gratuite</strong> entre la Gare du Cateau et
              le Campus pour les stagiaires en formation.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Call to Action */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => onCopyAddress(fullAddress)}
          className="w-full py-2.5 px-3 bg-[#181822] hover:bg-[#202030] border border-zinc-700 text-xs font-mono-tech text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>
            {isCopied
              ? 'ADRESSE COPIÉE DANS LE PRESSE-PAPIER !'
              : "COPIER L'ADRESSE COMPLÈTE"}
          </span>
        </button>
      </div>
    </div>
  );
};
