'use client';

import React from 'react';
import { MapPin, Phone, Mail, Train, Car, Shield, Send } from 'lucide-react';
import { StuntBadge } from '../ui/StuntBadge';
import { TacticalButton } from '../ui/TacticalButton';

interface ContactSectionProps {
  onOpenApplication: (programId?: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenApplication }) => {
  return (
    <section className="py-20 bg-[#060608] relative border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Direct Access & Coordinates */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <StuntBadge variant="yellow" icon={<MapPin className="w-3.5 h-3.5" />}>
                ACCÈS AU DOMAINE
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-500">
                HAUTS-DE-FRANCE & ÎLE-DE-FRANCE
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display uppercase tracking-tight text-white leading-tight">
              REJOINDRE LE CAMPUS UNIVERS CASCADES
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-tech leading-relaxed">
              Que vous souhaitiez candidater à la formation longue durée, bloquer votre place sur un
              stage week-end ou engager l'équipe CUC Stunt Team sur votre prochain tournage, nos
              coordinateurs vous répondent sous 24 à 48 heures.
            </p>

            <div className="space-y-4 pt-2">
              {/* Le Cateau Card */}
              <div className="bg-[#0e0e12] border border-zinc-800 p-5 relative">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-black border border-[#FFE500] text-[#FFE500] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display uppercase text-lg text-white tracking-wider">
                      CAMPUS PRINCIPAL — LE CATEAU-CAMBRÉSIS (59)
                    </h4>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                      Domaine CUC, 59360 Le Cateau-Cambrésis (Hauts-de-France)
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs font-mono-tech text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-[#FFE500]" /> À 2h de Paris (A1 / A26)
                      </span>
                      <span className="flex items-center gap-1">
                        <Train className="w-3.5 h-3.5 text-[#FFE500]" /> Gare SNCF Le Cateau à 5 min
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gennevilliers Card */}
              <div className="bg-[#0e0e12] border border-zinc-800 p-5 relative">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-black border border-zinc-700 text-zinc-300 shrink-0">
                    <Shield className="w-5 h-5 text-[#FFE500]" />
                  </div>
                  <div>
                    <h4 className="font-display uppercase text-lg text-white tracking-wider">
                      STUDIO ÎLE-DE-FRANCE — GENNEVILLIERS (92)
                    </h4>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                      Local technique, répétitions cascades comédiens et tournages
                    </p>
                  <p className="text-xs font-mono-tech text-zinc-500 mt-2">
                    Studio technique et pôle formations comédiens
                  </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High Impact Call to Action Box */}
          <div className="lg:col-span-6 bg-[#0e0e12] border-2 border-[#FFE500] p-8 sm:p-10 relative shadow-[0_0_50px_rgba(255,229,0,0.1)]">

            <div className="h-1.5 w-full hazard-stripes mb-6" />

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono-tech uppercase text-[#FFE500] font-bold">
                CANDIDATURES 2026 / 2027
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white mb-3">
              PRÊT À ENTRER DANS L'ACTION ?
            </h3>

            <p className="text-sm font-tech text-zinc-300 mb-6 leading-relaxed">
              Les places pour les sessions 2026/2027 sont strictement limitées afin de garantir un
              encadrement sur-mesure et une sécurité absolue. Ne laissez pas votre place sur liste
              d'attente s'échapper.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs font-mono-tech text-zinc-300 bg-[#14141a] p-3 border border-zinc-800">
                <Phone className="w-4 h-4 text-[#FFE500] shrink-0" />
                <div>
                  <span className="text-zinc-500 block text-[10px]">TÉLÉPHONE DIRECT :</span>
                  <a href="tel:+33672849492" className="text-white hover:text-[#FFE500] font-bold">
                    (+33) 06 72 84 94 92
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono-tech text-zinc-300 bg-[#14141a] p-3 border border-zinc-800">
                <Mail className="w-4 h-4 text-[#FFE500] shrink-0" />
                <div>
                  <span className="text-zinc-500 block text-[10px]">CONTACT COURRIEL :</span>
                  <a
                    href="mailto:contact@campus-universcascades.com"
                    className="text-white hover:text-[#FFE500] font-bold"
                  >
                    contact@campus-universcascades.com
                  </a>
                </div>
              </div>
            </div>

            <TacticalButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => onOpenApplication()}
              icon={<Send className="w-4 h-4" />}
            >
              Ouvrir le Formulaire de Candidature
            </TacticalButton>
          </div>
        </div>
      </div>
    </section>
  );
};
