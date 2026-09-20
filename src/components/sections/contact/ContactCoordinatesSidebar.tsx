'use client';

import React from 'react';
import Image from 'next/image';
import {
  Phone,
  Mail,
  Clock,
  Compass,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface ContactCoordinatesSidebarProps {
  accessInfo?: {
    train?: string;
    car?: string;
    plane?: string;
    opening_hours?: string;
  };
}

export const ContactCoordinatesSidebar: React.FC<ContactCoordinatesSidebarProps> = ({
  accessInfo,
}) => {
  return (
    <div className="lg:col-span-5 space-y-6">
      {/* Standard téléphonique */}
      <div className="bg-[#0e0e14] border-2 border-[#FFE500] p-6 relative">

        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-display uppercase text-white">
            STANDARD ADMISSIONS &amp; DIRECTION
          </h3>
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/images/logos/cuc-logo-yellow.png"
              alt="Logo CUC"
              width={40}
              height={40}
              className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
            />
          </div>
        </div>

        <div className="space-y-4 text-xs font-tech">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#FFE500] shrink-0" />
            <div>
              <strong className="text-zinc-300 font-mono-tech block">
                TÉLÉPHONE DIRECT :
              </strong>
              <a
                href="tel:+33672849492"
                className="text-base font-bold text-white hover:text-[#FFE500]"
              >
                06 72 84 94 92
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#FFE500] shrink-0" />
            <div>
              <strong className="text-zinc-300 font-mono-tech block">
                EMAIL :
              </strong>
              <a
                href="mailto:contact@campus-universcascades.com"
                className="text-zinc-300 hover:text-white truncate"
              >
                contact@campus-universcascades.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#FFE500] shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-300 font-mono-tech block">
                HORAIRES DU STANDARD :
              </strong>
              <span className="text-zinc-400">
                {accessInfo?.opening_hours || (
                  <>
                    Du Lundi au Vendredi : 09h00 - 18h30
                    <br />
                    Samedi (jours de stage) : 09h00 - 17h00
                  </>
                )}
              </span>
            </div>
          </div>
          {(accessInfo?.train || accessInfo?.car) && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400">
              {accessInfo?.train && (
                <div className="flex items-start gap-2">
                  <span className="text-[#FFE500] font-mono-tech font-bold shrink-0">TRAIN :</span>
                  <span>{accessInfo.train}</span>
                </div>
              )}
              {accessInfo?.car && (
                <div className="flex items-start gap-2">
                  <span className="text-[#FFE500] font-mono-tech font-bold shrink-0">ROUTE :</span>
                  <span>{accessInfo.car}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Implantations */}
      <div className="bg-[#0e0e14] border border-zinc-800 p-6 space-y-4 text-xs font-tech">
        <h3 className="text-lg font-display uppercase text-white border-b border-zinc-800 pb-2">
          NOS DEUX SITES
        </h3>

        <div className="p-3 bg-[#12121a] border border-zinc-800/80 hover:border-[#FFE500]/50 transition-colors">
          <strong className="text-[#FFE500] font-mono-tech block mb-0.5">
            CAMPUS PRINCIPAL (6 HECTARES) :
          </strong>
          <p className="text-zinc-300">
            Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis
            <br />
            <span className="text-zinc-500">
              Hauts-de-France (À 1h40 de Paris en train / 1h de Lille)
            </span>
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <a
              href="#campus-map-hub"
              className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase hover:bg-[#FFF04D] transition-colors flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>Voir la Carte &amp; Accès</span>
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#222230] text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono-tech flex items-center gap-1 transition-colors"
            >
              <Navigation className="w-3 h-3 text-[#FFE500]" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        <div className="p-3 bg-[#12121a] border border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <strong className="text-[#FFE500] font-mono-tech block mb-0.5">
            PÔLE ÎLE-DE-FRANCE (STUDIO PARIS) :
          </strong>
          <p className="text-zinc-300">
            Studio de Répétition &amp; Préparation Comédiens
            <br />
            <span className="text-zinc-500">
              92230 Gennevilliers (Région Parisienne)
            </span>
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          <strong className="text-zinc-400 font-mono-tech block text-[11px] mb-0.5">
            SOCIÉTÉ DE PRODUCTION :
          </strong>
          <span className="text-zinc-500">
            CUC PROD — Société de production cinéma et spectacle
          </span>
        </div>
      </div>

      {/* Qualiopi Guarantee */}
      <div className="bg-[#101018] border border-zinc-800 p-4 flex items-center gap-3 text-xs font-mono-tech text-zinc-300">
        <ShieldCheck className="w-5 h-5 text-[#FFE500] shrink-0" />
        <span>Organisme certifié QUALIOPI pour la formation professionnelle.</span>
      </div>

      {/* Official Entities Logos */}
      <div className="bg-[#0e0e14] border border-zinc-800 p-6 text-center space-y-3">
        <span className="text-[10px] font-mono-tech uppercase text-zinc-500 block">
          ENTITÉS &amp; DÉPARTEMENTS DU CAMPUS
        </span>
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex flex-col items-center">
            <Image
              src="/images/logos/cuc-logo-yellow.png"
              alt="Campus Univers Cascades CUC"
              width={60}
              height={60}
              className="object-contain p-1"
            />
            <span className="text-[10px] font-mono-tech text-zinc-400 mt-1">
              CAMPUS CUC
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/partner-logo/logo-CUC-Events-150x150.png"
              alt="CUC Events"
              width={60}
              height={60}
              className="rounded-full border border-zinc-700 object-cover"
            />
            <span className="text-[10px] font-mono-tech text-zinc-400 mt-1">
              CUC EVENTS
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/partner-logo/CUC-TEAM-fond-noir-Website-1-150x150.png"
              alt="CUC Team"
              width={60}
              height={60}
              className="rounded-full border border-zinc-700 object-cover"
            />
            <span className="text-[10px] font-mono-tech text-zinc-400 mt-1">
              CUC STUNT TEAM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
