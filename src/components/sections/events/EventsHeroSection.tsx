'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Sparkles, ChevronRight } from 'lucide-react';

export const EventsHeroSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.campus-universcascades.com/wp-content/uploads/2025/08/Image1-scaled.jpg"
          alt="CUC Events spectacles de cascades et animations en direct"
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
          <span className="text-[#FFE500]">CUC EVENTS & SPECTACLES</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
            AGENCE ÉVÉNEMENTIELLE D'ACTION
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400">
            SPECTACLES • ANIMATIONS • TEAM BUILDING
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
          CUC EVENTS : <span className="text-[#FFE500]">SPECTACLES & ANIMATIONS</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
          Marquez les esprits lors de vos festivals, lancements de marque, parcs à thème
          ou séminaires d'entreprise grâce à des shows d'action spectaculaires orchestrés
          par les cascadeurs professionnels du Campus Univers Cascades.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link href="/contact-cuc">
            <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
              Demander un Devis Événementiel
            </TacticalButton>
          </Link>
          <Link href="/videos-cascadeur">
            <TacticalButton variant="secondary" size="lg">
              Voir nos Vidéos en Direct
            </TacticalButton>
          </Link>
        </div>
      </div>
    </section>
  );
};
