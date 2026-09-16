'use client';

import React from 'react';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';

export const EventsPartnersBanners: React.FC = () => {
  return (
    <>
      {/* ILS NOUS ONT FAIT CONFIANCE (BANDES LOGOS) */}
      <section className="py-16 bg-[#09090d] border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <StuntBadge variant="yellow">PARTENAIRES & MARQUES</StuntBadge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              ILS NOUS ONT FAIT CONFIANCE
            </h2>
          </div>

          {/* Authentic Brand Logo Strips directly from the live site */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-1.png"
                alt="Partenaires CUC Bande 1"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-2.png"
                alt="Partenaires CUC Bande 2"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
            <div className="bg-[#121218] border border-zinc-800 p-4 flex justify-center">
              <Image
                src="/images/partenaires/bandes-logos-3.png"
                alt="Partenaires CUC Bande 3"
                width={800}
                height={120}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BANDES AFFICHES DE FILMS */}
      <section className="py-16 bg-black border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 mb-2">
              <StuntBadge variant="yellow">RÉFÉRENCES CINÉMA</StuntBadge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              LES PRODUCTIONS CINÉMA & TÉLÉVISION
            </h2>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="border border-zinc-800 p-2 bg-[#0e0e14]">
              <Image
                src="/images/events/bandeau-images-films.png"
                alt="Bandeau images tournages films"
                width={1000}
                height={250}
                className="w-full object-contain"
                priority
              />
            </div>
            <div className="border border-zinc-800 p-2 bg-[#0e0e14]">
              <Image
                src="/images/events/bandes-affiches-film-1.png"
                alt="Bandes affiches film série 1"
                width={1000}
                height={200}
                className="w-full object-contain"
              />
            </div>
            <div className="border border-zinc-800 p-2 bg-[#0e0e14]">
              <Image
                src="/images/events/bandes-affiches-film-2.png"
                alt="Bandes affiches film série 2"
                width={1000}
                height={200}
                className="w-full object-contain"
              />
            </div>
            <div className="border border-zinc-800 p-2 bg-[#0e0e14]">
              <Image
                src="/images/events/bandes-affiches-film-3.png"
                alt="Bandes affiches film série 3"
                width={1000}
                height={200}
                className="w-full object-contain"
              />
            </div>
            <div className="border border-zinc-800 p-2 bg-[#0e0e14]">
              <Image
                src="/images/events/bandes-affiches-film-4.png"
                alt="Bandes affiches film série 4"
                width={1000}
                height={200}
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
