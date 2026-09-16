'use client';

import React from 'react';
import Image from 'next/image';
import { TacticalButton } from '../ui/TacticalButton';
import {
  ShieldCheck,
  Award,
  Zap,
  Globe2,
  ArrowRight,
} from 'lucide-react';

interface SchoolOriginsProps {
  onOpenApplication: () => void;
}

export const SchoolOrigins: React.FC<SchoolOriginsProps> = ({ onOpenApplication }) => {
  return (
    <section id="ecole" className="py-20 bg-[#060608] relative border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Stacking with Real Stunt Photos */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[420px] sm:h-[500px] w-full border-2 border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl">
              <Image
                src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg"
                alt="Formation cascadeurs professionnels au Campus Univers Cascades"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-80 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Founder Quote Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-md border border-[#FFE500]/50 p-4">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono-tech text-xs uppercase font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>LE MOT DU FONDATEUR // LUCAS DOLLFUS</span>
                </div>
                <p className="text-xs text-zinc-200 font-tech italic">
                  « La cascade de cinéma n'est pas une prise de risque aveugle, c'est l'art du
                  contrôle physique et de la sécurité absolue. »
                </p>
              </div>
            </div>

            {/* Corner Badges */}
            <div className="absolute -top-3 -left-3 bg-[#FFE500] text-black font-display text-sm tracking-wider px-3 py-1 font-bold">
              EST. 2008
            </div>
            <div className="absolute -bottom-3 -right-3 bg-[#121216] border border-[#FFE500]/40 text-[#FFE500] font-mono-tech text-xs px-3 py-1 font-bold">
              LE CATEAU-CAMBRÉSIS (59)
            </div>
          </div>

          {/* Right Column: Narrative & Arguments */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Campus Univers Cascades"
                width={32}
                height={32}
                className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(255,229,0,0.3)]"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                  PRÉSENTATION DU CAMPUS
                </span>
                <span className="text-xs font-mono-tech text-zinc-500">• DEPUIS 2008</span>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display uppercase tracking-tight text-white leading-tight">
              LE CENTRE DE FORMATION DE RÉFÉRENCE EN CASCADE
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-tech leading-relaxed">
              Créé en 2008 par <strong className="text-white">Lucas Dollfus</strong>, le{' '}
              <strong className="text-[#FFE500]">Campus Univers Cascades (CUC)</strong> est un
              centre de formation professionnelle dédié aux techniques de cascade pour le cinéma,
              la télévision et le spectacle vivant.
            </p>

            <p className="text-sm sm:text-base text-zinc-400 font-tech leading-relaxed">
              Sur un site fermé de 6 hectares au Cateau-Cambrésis, nous formons les professionnels de l'action :
              combats chorégraphiés, chutes de hauteur, câblage, torche humaine et parkour.
              Encadrés par des coordinateurs de cascades, des maîtres d'armes et des chorégraphes en activité,
              nos stagiaires développent une <strong className="text-white">polyvalence technique rigoureuse</strong>{' '}
              reconnue dans le milieu du cinéma et des spectacles.
            </p>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0e0e12] border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono-tech text-xs uppercase font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SÉCURITÉ &amp; RIGUEUR</span>
                </div>
                <p className="text-xs text-zinc-400 font-tech">
                  Maîtrise des gestes, répétition et équipements de réception professionnels.
                </p>
              </div>

              <div className="bg-[#0e0e12] border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono-tech text-xs uppercase font-bold mb-1">
                  <Zap className="w-4 h-4" />
                  <span>POLYVALENCE TECHNIQUE</span>
                </div>
                <p className="text-xs text-zinc-400 font-tech">
                  Combat, chutes de hauteur, feu, câblage, maniement d'armes et parkour.
                </p>
              </div>

              <div className="bg-[#0e0e12] border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono-tech text-xs uppercase font-bold mb-1">
                  <Award className="w-4 h-4" />
                  <span>QUALIOPI &amp; AFDAS</span>
                </div>
                <p className="text-xs text-zinc-400 font-tech">
                  Actions de formation certifiées. Prise en charge AFDAS pour les intermittents.
                </p>
              </div>

              <div className="bg-[#0e0e12] border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-[#FFE500] font-mono-tech text-xs uppercase font-bold mb-1">
                  <Globe2 className="w-4 h-4" />
                  <span>AGENCE &amp; TOURNAGES</span>
                </div>
                <p className="text-xs text-zinc-400 font-tech">
                  Accompagnement, coordination de cascades et accès aux castings de productions.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <TacticalButton
                variant="primary"
                size="md"
                onClick={onOpenApplication}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Rejoindre la Promotion 2026/2027
              </TacticalButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
