'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';

export const HomeVirtualTourSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#08080c] border-b border-zinc-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full lens-flare-gold opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-[#0e0e14] border-2 border-[#FFE500] p-8 sm:p-12 relative shadow-[0_0_60px_rgba(255,229,0,0.14)]">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
                  Découvrez nos 6 hectares comme si vous y étiez ! Pénétrez dans le Zoé Bell Hall,
                  la fosse olympique de mousse, la tour de saut et d&apos;impact, les dojos de combat chorégraphié
                  et les hangars de cascades mécaniques grâce à notre visite virtuelle interactive officielle.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
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

              <div className="lg:col-span-5 relative">
                <div className="relative h-64 sm:h-80 w-full border border-zinc-700 overflow-hidden bg-black group shadow-xl">
                  <Image
                    src="https://www.campus-universcascades.com/wp-content/uploads/2020/11/Zoé-Bell-Hall.jpg"
                    alt="Aperçu 360 du Zoé Bell Hall au Campus Univers Cascades"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#FFE500] text-black flex items-center justify-center mb-2 shadow-2xl group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,229,0,0.6)] transition-all duration-300 ease-out">
                      <Compass className="w-7 h-7" />
                    </div>
                    <span className="font-display uppercase text-lg text-white font-bold tracking-wider">
                      Visite 360° Interactive
                    </span>
                    <span className="text-xs font-mono-tech text-[#FFE500] mt-1">
                      Cliquer pour explorer le campus
                    </span>
                  </div>
                  <Link
                    href="/visite-virtuelle"
                    className="absolute inset-0 z-10"
                    aria-label="Lancer la visite virtuelle 360"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
