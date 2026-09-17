'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

interface HomePartner {
  name: string;
  role: string;
  logo: string;
  bgVariant?: 'light' | 'dark';
  speed: number;
}

export const HomePartnersSection: React.FC = () => {
  const partners: HomePartner[] = [
    {
      name: 'Nike',
      role: 'Équipementier',
      logo: '/images/partenaires/nike.jpg',
      bgVariant: 'dark',
      speed: -0.06,
    },
    {
      name: 'Kiloutou',
      role: 'Nacelles & Levage',
      logo: '/images/partenaires/kiloutou.jpg',
      bgVariant: 'light',
      speed: 0.06,
    },
    {
      name: 'Qualiopi',
      role: 'Certification',
      logo: '/images/partenaires/qualiopi.png',
      bgVariant: 'light',
      speed: -0.05,
    },
    {
      name: 'RXR Protect',
      role: 'Protections Airbag',
      logo: '/images/partenaires/rxr-protect.jpg',
      bgVariant: 'dark',
      speed: 0.05,
    },
    {
      name: 'C17 Special Effects',
      role: 'Pyrotechnie & SFX',
      logo: '/images/partenaires/c17.jpg',
      bgVariant: 'light',
      speed: -0.06,
    },
    {
      name: 'Action Cascade',
      role: 'Stunt & Rigging',
      logo: '/images/partenaires/action-cascade.jpg',
      bgVariant: 'dark',
      speed: 0.06,
    },
  ];

  return (
    <StudioParallaxScene className="py-20 bg-[#08080c]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Soft Glow */}
      <StudioParallaxLayer
        speed={-0.2}
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#FFE500]/[0.02] blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold block mb-1">
              COLLABORATION INDUSTRIE &amp; CINÉMA
            </span>
            <h3 className="text-2xl sm:text-3xl font-display uppercase text-white">
              NOS PARTENAIRES
            </h3>
          </div>
          <Link
            href="/partenaires"
            className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors group"
          >
            <span>Voir tous les partenaires</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Staggered Wave Parallax Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-stretch">
          {partners.map((partner, i) => (
            <StudioParallaxLayer key={i} speed={partner.speed}>
              <StudioParallaxCard maxTilt={6} className="h-full">
                <Link
                  href="/partenaires"
                  className="h-28 bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#FFE500]/50 p-3 flex flex-col items-center justify-between transition-all duration-300 group hover:shadow-[0_4px_25px_rgba(255,229,0,0.12)] relative rounded-xs block h-full"
                >
                  <div
                    className={`w-full h-14 ${
                      partner.bgVariant === 'light'
                        ? 'bg-white border-zinc-200'
                        : 'bg-black/90 border-zinc-800'
                    } border p-1.5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300 relative`}
                  >
                    <Image
                      src={partner.logo}
                      alt={`Logo ${partner.name}`}
                      fill
                      sizes="140px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="text-center w-full">
                    <span className="block text-[11px] font-display uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors truncate">
                      {partner.name}
                    </span>
                    <span className="block text-[9px] font-mono-tech text-zinc-500 uppercase tracking-tight truncate">
                      {partner.role}
                    </span>
                  </div>
                </Link>
              </StudioParallaxCard>
            </StudioParallaxLayer>
          ))}
        </div>
      </div>
    </StudioParallaxScene>
  );
};
