'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface CampusAppLaunchersProps {
  coordinates?: string;
}

export const CampusAppLaunchers: React.FC<CampusAppLaunchersProps> = ({
  coordinates = '50.0909,3.5374',
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <div className="text-xs font-mono-tech text-zinc-400 mb-2">
        <span>LANCER L'ITINÉRAIRE DANS VOTRE APPLICATION :</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Google Maps */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#121218] hover:bg-[#1a1a24] border border-zinc-800 hover:border-[#4285F4]/70 flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span>Google Maps</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#4285F4]" />
        </a>

        {/* Apple Maps */}
        <a
          href={`https://maps.apple.com/?daddr=${coordinates}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#121218] hover:bg-[#1a1a24] border border-zinc-800 hover:border-zinc-400 flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Apple Maps</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white" />
        </a>

        {/* Waze */}
        <a
          href={`https://waze.com/ul?ll=${coordinates}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#121218] hover:bg-[#1a1a24] border border-zinc-800 hover:border-[#33CCFF]/70 flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#33CCFF]" />
            <span>Waze</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#33CCFF]" />
        </a>

        {/* SNCF Connect */}
        <a
          href="https://www.sncf-connect.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-[#121218] hover:bg-[#1a1a24] border border-zinc-800 hover:border-[#0088CE]/70 flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0088CE]" />
            <span>SNCF Connect</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#0088CE]" />
        </a>
      </div>
    </div>
  );
};
