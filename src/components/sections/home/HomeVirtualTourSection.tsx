'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

export const HomeVirtualTourSection: React.FC = () => {
  return (
    <StudioParallaxScene className="py-28 bg-[#08080c] border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Volumetric Beam */}
      <StudioParallaxLayer
        speed={-0.25}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[48rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.04)_0%,_transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <StudioParallaxCard maxTilt={3}>
          <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/70 p-8 sm:p-12 relative shadow-[0_0_50px_rgba(255,229,0,0.12)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text Side */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                    IMMERSION INTERACTIVE
                  </span>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    • VISITE 360° VR HD MEDIA
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight">
                  VISITE VIRTUELLE <span className="text-[#FFE500]">EN IMMERSION 360°</span>
                </h2>

                <p className="text-sm sm:text-base font-tech text-zinc-300 leading-relaxed">
                  Découvrez nos 6 hectares comme si vous y étiez ! Arpentez les plateaux de tournage,
                  la fosse olympique de mousse, les dojos de combat chorégraphié, les hangars de cascades
                  mécaniques et le manège équestre grâce à notre visite virtuelle interactive.
                </p>

                <div className="flex flex-wrap gap-4 pt-3">
                  <Link href="/visite-virtuelle">
                    <TacticalButton
                      variant="primary"
                      size="lg"
                      icon={<Compass className="w-4 h-4" />}
                    >
                      Ouvrir la Visite Virtuelle 360°
                    </TacticalButton>
                  </Link>
                  <Link href="/visite-guidee">
                    <TacticalButton variant="secondary" size="lg">
                      Détail des 9 Installations
                    </TacticalButton>
                  </Link>
                </div>
              </div>

              {/* 3D Portal Window Side */}
              <div className="lg:col-span-5 relative">
                <div className="relative h-64 sm:h-80 w-full border border-zinc-700/80 overflow-hidden bg-black group shadow-2xl">
                  {/* Sliding Internal 360 Photo (Layer Depth) */}
                  <StudioParallaxLayer speed={-0.12} className="relative w-full h-[120%] -top-[10%]">
                    <Image
                      src="https://www.campus-universcascades.com/wp-content/uploads/2020/11/Zoé-Bell-Hall.jpg"
                      alt="Aperçu 360 d'un plateau technique du Campus Univers Cascades"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover brightness-85 group-hover:scale-105 transition-transform duration-700"
                    />
                  </StudioParallaxLayer>

                  {/* Floating Compass Center HUD */}
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                    <StudioParallaxLayer speed={0.12}>
                      <div className="w-16 h-16 rounded-full bg-[#FFE500] text-black flex items-center justify-center mb-2.5 shadow-[0_0_30px_rgba(255,229,0,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(255,229,0,0.8)] transition-all duration-300">
                        <Compass className="w-8 h-8" />
                      </div>
                    </StudioParallaxLayer>
                    <span className="font-display uppercase text-lg text-white font-bold tracking-wider">
                      Visite 360° Interactive
                    </span>
                    <span className="text-xs font-mono-tech text-[#FFE500] mt-1">
                      Cliquer pour explorer le campus
                    </span>
                  </div>

                  <Link
                    href="/visite-virtuelle"
                    className="absolute inset-0 z-20"
                    aria-label="Lancer la visite virtuelle 360"
                  />
                </div>
              </div>
            </div>
          </div>
        </StudioParallaxCard>
      </div>
    </StudioParallaxScene>
  );
};
