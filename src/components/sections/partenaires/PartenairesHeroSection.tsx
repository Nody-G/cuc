'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { Handshake, ChevronRight } from 'lucide-react';
import { SitePageHero } from '@/lib/data/site-service';

interface PartenairesHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const PartenairesHeroSection: React.FC<PartenairesHeroSectionProps> = ({ hero }) => {
  const badge = hero?.badge || 'ILS NOUS ACCOMPAGNENT';
  const title = hero?.title || 'NOS PARTENAIRES';
  const subtitle =
    hero?.subtitle ||
    'Le Campus Univers Cascades travaille avec des marques, fabricants et institutions reconnus dans leurs domaines : équipement, protection, effets spéciaux et formation.';
  const bgImage =
    hero?.bg_image ||
    'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-6-scaled.jpg';

  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Partenaires du Campus Univers Cascades"
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
          <span className="text-[#FFE500]">PARTENAIRES</span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <StuntBadge variant="yellow" icon={<Handshake className="w-3.5 h-3.5" />}>
            {badge}
          </StuntBadge>
          <span className="text-xs font-mono-tech text-zinc-400">
            ÉQUIPEMENTIERS • CINÉMA • INSTITUTIONNELS • ÉTAT
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
          {title.includes(' ') ? (
            <>
              {title.substring(0, title.lastIndexOf(' '))}{' '}
              <span className="text-[#FFE500]">
                {title.substring(title.lastIndexOf(' ') + 1)}
              </span>
            </>
          ) : (
            title
          )}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
};
