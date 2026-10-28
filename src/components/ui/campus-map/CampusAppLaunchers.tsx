'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Navigation, ExternalLink, ChevronDown, Car, Train, MapPin } from 'lucide-react';

interface CampusAppLaunchersProps {
  coordinates?: string;
}

export const CampusAppLaunchers: React.FC<CampusAppLaunchersProps> = ({
  coordinates = '50.0909,3.5374',
}) => {
  const t = useTranslations('contact.map');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture automatique au clic à l'extérieur ou sur Échap
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const apps = [
    {
      name: 'Google Maps',
      desc: t('googleMapsDesc'),
      url: `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`,
      dotColor: 'bg-[#4285F4]',
      hoverBorder: 'hover:border-[#4285F4]/70',
      icon: Car,
    },
    {
      name: 'Apple Maps',
      desc: t('appleMapsDesc'),
      url: `https://maps.apple.com/?daddr=${coordinates}`,
      dotColor: 'bg-white',
      hoverBorder: 'hover:border-zinc-400',
      icon: MapPin,
    },
    {
      name: 'Waze',
      desc: t('wazeDesc'),
      url: `https://waze.com/ul?ll=${coordinates}&navigate=yes`,
      dotColor: 'bg-[#33CCFF]',
      hoverBorder: 'hover:border-[#33CCFF]/70',
      icon: Car,
    },
    {
      name: 'SNCF Connect',
      desc: t('sncfDesc'),
      url: 'https://www.sncf-connect.com/',
      dotColor: 'bg-[#0088CE]',
      hoverBorder: 'hover:border-[#0088CE]/70',
      icon: Train,
    },
  ];

  return (
    <div ref={containerRef} className="mt-4 pt-4 border-t border-zinc-800 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs font-mono-tech text-zinc-400">
          <span>{t('appLaunchTitle')}</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe81a] text-black text-xs font-mono-tech uppercase font-bold tracking-wider transition-all shadow-md cursor-pointer border border-[#FFE500] active:scale-[0.98]"
          >
            <Navigation className="w-3.5 h-3.5 fill-black shrink-0" />
            <span>{t('launchRoute')}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menu sélecteur d'application */}
          {isOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-full sm:w-84 bg-[#0e0e14]/98 border border-[#FFE500]/50 p-2 shadow-2xl z-50 backdrop-blur-md">
              <div className="text-[10px] font-mono-tech text-zinc-400 px-3 py-1.5 border-b border-zinc-800/80 uppercase tracking-wider">
                <span>{t('chooseApp')}</span>
              </div>
              <div className="space-y-1.5 pt-2">
                {apps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <a
                      key={app.name}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-[#14141c]/90 hover:bg-[#1a1a26] border border-zinc-800/80 hover:border-[#FFE500]/60 flex items-center justify-between text-xs font-mono-tech text-zinc-300 hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${app.dotColor} shrink-0`} />
                        <div className="text-left">
                          <div className="font-bold text-white group-hover:text-[#FFE500] transition-colors flex items-center gap-1.5">
                            <Icon className="w-3 h-3 text-zinc-400 group-hover:text-[#FFE500]" />
                            <span>{app.name}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                            {app.desc}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#FFE500] transition-colors shrink-0 ml-2" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
