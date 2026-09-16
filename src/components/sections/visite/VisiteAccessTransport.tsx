'use client';

import React from 'react';
import Link from 'next/link';
import { Navigation, Car, Train, Plane, Compass } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const VisiteAccessTransport: React.FC = () => {
  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <StuntBadge variant="yellow" icon={<Navigation className="w-3.5 h-3.5" />}>
              ACCÈS &amp; TRANSPORT
            </StuntBadge>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
              COMMENT REJOINDRE LE CAMPUS ?
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
              Situé au cœur de la région Hauts-de-France, le campus est facilement accessible
              depuis Paris, Lille, Bruxelles ou Londres.
            </p>

            <div className="space-y-4 text-xs font-tech text-zinc-300">
              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Car className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    EN VOITURE :
                  </strong>
                  À 2h de Paris par les autoroutes A1 et A26. À 1h de Lille et Valenciennes.
                  Parking privé sécurisé gratuit sur place pour les stagiaires.
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Train className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    EN TRAIN (SNCF) :
                  </strong>
                  Gare de Le Cateau-Cambrésis (à 5 minutes du campus). Lignes directes depuis
                  Paris Gare du Nord (via Saint-Quentin ou Cambrai). Navette CUC disponible sur demande.
                </div>
              </div>

              <div className="p-3.5 bg-[#14141c] border border-zinc-800 flex items-start gap-3">
                <Plane className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-mono-tech block mb-0.5">
                    EN AVION :
                  </strong>
                  Aéroports internationaux de Paris CDG (1h45 de route), Lille Lesquin (1h)
                  ou Charleroi Bruxelles-Sud (1h15).
                </div>
              </div>
            </div>
          </div>

          {/* Adresse & Contact Box */}
          <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-8 relative">

            <h3 className="text-2xl font-display uppercase text-white mb-4">
              COORDONNÉES DU DOMAINE
            </h3>

            <div className="space-y-3 text-xs font-tech text-zinc-300 mb-6">
              <div>
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  Adresse postale &amp; Accès :
                </strong>
                CAMPUS UNIVERS CASCADES
                <br />
                Domaine CUC, 70 Rue Faidherbe, 59360 Le Cateau-Cambrésis (France)
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/contact-cuc#campus-map-hub"
                    className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase hover:bg-[#FFF04D] transition-colors inline-flex items-center gap-1"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Radar &amp; Itinéraires</span>
                  </Link>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=50.0909,3.5374"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#222230] text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono-tech inline-flex items-center gap-1 transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#FFE500]" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>

              <div>
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  Standard Admissions :
                </strong>
                Téléphone :{' '}
                <a
                  href="tel:+33672849492"
                  className="text-white font-bold hover:text-[#FFE500]"
                >
                  (+33) 06 72 84 94 92
                </a>
                <br />
                Email :{' '}
                <a
                  href="mailto:contact@campus-universcascades.com"
                  className="text-zinc-400 hover:text-white"
                >
                  contact@campus-universcascades.com
                </a>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <strong className="text-[#FFE500] font-mono-tech block uppercase">
                  Pôle Île-de-France (Studio Paris) :
                </strong>
                Studio de Répétition &amp; Comédiens
                <br />
                92230 Gennevilliers
              </div>
            </div>

            <Link href="/contact-cuc">
              <TacticalButton variant="primary" size="md" className="w-full">
                Planifier une Visite ou Réserver un Stage
              </TacticalButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
