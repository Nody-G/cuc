'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Film, ChevronRight } from 'lucide-react';

export const TeamHeroSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg"
          alt="CUC Stunt Team tournages cinéma et films d'action"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-35 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                ACCUEIL
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">TOURNAGES & CUC STUNT TEAM</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
              <span>COORDINATION DE CASCADES • TOURNAGES &amp; CINÉMA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              TOURNAGES & <span className="text-[#FFE500]">CUC STUNT TEAM</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              Le Campus Univers Cascades et la CUC Stunt Team accompagnent les réalisateurs,
              producteurs et directeurs de casting de la conception des scènes d'action jusqu'au tournage
              en plateau avec un vivier de plus de 200 cascadeurs professionnels certifiés.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/contact-cuc">
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  Contacter l'Équipe de Production
                </TacticalButton>
              </Link>
              <a
                href="#affiches-officielles"
                className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono-tech uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
              >
                <Film className="w-4 h-4 text-[#FFE500]" />
                <span>Voir les Affiches Officielles</span>
              </a>
            </div>
          </div>

          {/* Cinematic Textured CUC Emblem Showcase */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div className="relative w-64 h-64 border border-zinc-800 p-2 bg-[#0a0a0e] shadow-2xl group">
              <div className="relative w-full h-full overflow-hidden border border-zinc-800/80">
                <Image
                  src="/images/logos/cuc-logo-cinematic.jpg"
                  alt="Blason Cinématique Officiel CUC Stunt Team"
                  fill
                  priority
                  sizes="256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black px-3 py-0.5 border border-zinc-800 text-[10px] font-mono-tech text-[#FFE500] uppercase tracking-wider whitespace-nowrap shadow-md">
                CAMPUS UNIVERS CASCADES
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
