'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';

import { SitePageHero } from '@/lib/data/site-service';

interface ContactHeroSectionProps {
  heroData?: Partial<SitePageHero>;
}

export const ContactHeroSection: React.FC<ContactHeroSectionProps> = ({ heroData }) => {
  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroData?.bg_image || "https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg"}
          alt="Contact et inscriptions au Campus Univers Cascades"
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
          <span className="text-[#FFE500]">CONTACT &amp; PROJETS</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Phone className="w-3.5 h-3.5" />}>
            {heroData?.badge || 'HUB OPÉRATIONNEL • PRODUCTION & ADMISSIONS'}
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400">
            CAMPUS CUC • LE CATEAU-CAMBRÉSIS &amp; GENNEVILLIERS
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
          {heroData?.title ? (
            <span>{heroData.title}</span>
          ) : (
            <>CONTACT &amp; <span className="text-[#FFE500]">PROJETS</span></>
          )}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
          {heroData?.subtitle || "Productions cinématographiques, action design, formations professionnelles de cascadeurs, stages ou événements d'entreprise : échangez directement avec les équipes du CUC."}
        </p>
      </div>
    </section>
  );
};
