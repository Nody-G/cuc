'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Sparkles, ChevronRight } from 'lucide-react';

import { SitePageHero } from '@/lib/data/site-service';

interface StagesHeroSectionProps {
  heroData?: Partial<SitePageHero>;
}

export const StagesHeroSection: React.FC<StagesHeroSectionProps> = ({ heroData }) => {
  return (
    <>
      {/* Hero Header */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroData?.bg_image || "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg"}
            alt="Stages et séjours de cascades au Campus Univers Cascades"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-40 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              ACCUEIL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">STAGES & SÉJOURS DE CASCADES</span>
          </div>

          <div className="inline-flex items-center gap-2 mb-4">
            <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
              {heroData?.badge || 'IMMERSION & PERFECTIONNEMENT'}
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-400">
              WEEK-ENDS DÈS 250€ • STAGES AFDAS 100% • SUMMER CAMP
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
            {heroData?.title ? (
              <span>{heroData.title}</span>
            ) : (
              <>STAGES DE CASCADE, <span className="text-[#FFE500]">PARKOUR & ACTION</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
            {heroData?.subtitle || "Pour vivre l'expérience cascadeur le temps d'un week-end en immersion totale à 250€, profiter d'une prise en charge intégrale AFDAS en tant qu'artiste interprète, ou rejoindre notre grand Summer Camp estival sur 6 hectares d'installations."}
          </p>
        </div>
      </section>

      {/* Header Visual Banner from original site */}
      <section className="py-6 bg-[#09090d] border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <Image
            src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/partner-logo/Logos-stages-3-768x139.png"
            alt="Logos des stages CUC"
            width={768}
            height={139}
            className="object-contain"
          />
        </div>
      </section>
    </>
  );
};
