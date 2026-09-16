'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Layers, Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const VisiteHeroSection: React.FC = () => {
  return (
    <>
      {/* Hero Header */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://www.campus-universcascades.com/wp-content/uploads/2020/11/img-campus-2.jpg"
            alt="Domaine de 6 hectares du Campus Univers Cascades"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-35 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              ACCUEIL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">VISITE GUIDÉE DU CAMPUS</span>
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
            <span>INFRASTRUCTURES DE FORMATION</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">LE CATEAU-CAMBRÉSIS (59) • 6 HECTARES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
            VISITE GUIDÉE <span className="text-[#FFE500]">DU CAMPUS</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
            Découvrez les 6 hectares d'infrastructures du Campus Univers Cascades :
            la tour de saut de 21 mètres, 1300 m² de hangars couverts, fosse de réception,
            dojos, manège équestre, hébergement 90 lits et studio de répétition en région parisienne.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a href="#plan-3d-domaine">
              <TacticalButton
                variant="primary"
                size="lg"
                icon={<Layers className="w-4 h-4 text-black" />}
              >
                Plan 3D du Domaine (6 Ha)
              </TacticalButton>
            </a>
            <a href="#visite-virtuelle-360">
              <TacticalButton
                variant="secondary"
                size="lg"
                icon={<Compass className="w-4 h-4 text-[#FFE500]" />}
              >
                Visite 360° HD Media
              </TacticalButton>
            </a>
            <a href="#installations-detail">
              <TacticalButton variant="outline" size="lg">
                Les 9 Espaces Clés
              </TacticalButton>
            </a>
          </div>
        </div>
      </section>

      {/* Chiffres Clés du Site */}
      <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
            <div className="border-l-2 border-[#FFE500] pl-4">
              <div className="text-3xl sm:text-4xl font-display text-white">
                6 HECTARES
              </div>
              <div className="text-zinc-400 uppercase">Domaine Privé Clos</div>
            </div>
            <div className="border-l-2 border-[#FFE500] pl-4">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                21 MÈTRES
              </div>
              <div className="text-zinc-400 uppercase">Hauteur de la Tour CUC</div>
            </div>
            <div className="border-l-2 border-[#FFE500] pl-4">
              <div className="text-3xl sm:text-4xl font-display text-white">
                90 LITS
              </div>
              <div className="text-zinc-400 uppercase">Hébergement Sur Site</div>
            </div>
            <div className="border-l-2 border-[#FFE500] pl-4">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                2 SITES
              </div>
              <div className="text-zinc-400 uppercase">Nord (59) &amp; Paris (92)</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
