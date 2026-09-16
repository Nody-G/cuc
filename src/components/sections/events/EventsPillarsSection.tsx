'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { ArrowRight } from 'lucide-react';

export const EventsPillarsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. SPECTACLES */}
        <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="mb-4">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
                  PRESTATIONS &amp; SHOWS EN DIRECT
                </span>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                  SPECTACLES DE CASCADES
                </h3>
              </div>

              <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                Vous souhaitez dynamiser votre événement avec un spectacle percutant ? Le Campus Univers Cascades met à votre disposition son savoir-faire et ses équipes de cascadeurs professionnels pour créer des shows vivants sur-mesure.
              </p>
              <p className="text-xs font-tech text-zinc-400 leading-relaxed">
                Combats chorégraphiés médiévaux, contemporains ou fantastiques, chutes de hauteur spectaculaires, cascades pyrotechniques (torches humaines), nos créations s'adaptent à toutes les contraintes techniques et scéniques.
              </p>

              <div className="pt-4">
                <Link href="/contact-cuc">
                  <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    En savoir plus sur nos Spectacles
                  </TacticalButton>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black">
              <Image
                src="https://www.campus-universcascades.com/wp-content/uploads/2021/05/Photos-Spectacle-300x200.jpg"
                alt="Photo Spectacle CUC Events"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 2. ANIMATIONS */}
        <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black order-2 lg:order-1">
              <Image
                src="https://www.campus-universcascades.com/wp-content/uploads/2021/06/FreeJump-CCJ-Puteaux-03-300x200.jpg"
                alt="Animation FreeJump Airbag CUC Events"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
              <div className="mb-4">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
                  SENSATIONS FORTES GRAND PUBLIC
                </span>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                  ANIMATIONS &amp; FREEJUMP AIRBAG
                </h3>
              </div>

              <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                Offrez à votre public des sensations uniques grâce à nos animations interactives encadrées par des professionnels : le <strong className="text-white">FreeJump Airbag</strong> (sauts sécurisés de 4 à 8 mètres de haut), simulateur de câblage cinéma, ou ateliers d'initiation au parkour avec les membres des Yamakasi.
              </p>
              <p className="text-xs font-tech text-zinc-400 leading-relaxed">
                Installations entièrement conformes aux normes de sécurité les plus strictes avec assurance professionnelle et encadrement qualifié.
              </p>

              <div className="pt-4">
                <Link href="/contact-cuc">
                  <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    En savoir plus sur nos Animations
                  </TacticalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TEAM BUILDING */}
        <div className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/50 transition-all p-8 relative">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="mb-4">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
                  SÉMINAIRES &amp; IMMERSION ENTREPRISE
                </span>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                  TEAM BUILDING CINÉMA D&apos;ACTION
                </h3>
              </div>

              <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                Fédérez vos équipes lors d'un séminaire d'action inoubliable au cœur du domaine de 6 hectares du CUC au Cateau-Cambrésis.
              </p>
              <p className="text-xs font-tech text-zinc-400 leading-relaxed">
                Atelier cinéma indoor, cascades physiques, cascades de feu sécurisées, tournage d'une fausse bande-annonce d'action : vos collaborateurs dépassent leurs limites dans un esprit de camaraderie et de bienveillance totale. Capacité d'accueil jusqu'à 90 personnes avec hébergement et restauration sur site.
              </p>

              <div className="pt-4">
                <Link href="/contact-cuc">
                  <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                    Organiser un Team Building
                  </TacticalButton>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 sm:h-72 border border-zinc-800 overflow-hidden bg-black">
              <Image
                src="https://www.campus-universcascades.com/wp-content/uploads/2021/05/A-atelier-cinema-indoor-300x200.jpg"
                alt="Atelier Cinéma Indoor Team Building"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
