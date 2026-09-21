'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';

import Image from 'next/image';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Film, ChevronRight } from 'lucide-react';
import { SitePageHero } from '@/lib/data/site-service';

interface TeamHeroSectionProps {
  hero?: Partial<SitePageHero>;
}

export const TeamHeroSection: React.FC<TeamHeroSectionProps> = ({ hero }) => {
  const badge = hero?.badge || 'COORDINATION DE CASCADES • CINÉMA';
  const title = hero?.title || 'TOURNAGE';
  const subtitle =
    hero?.subtitle ||
    "Le Campus Univers Cascades et la CUC Stunt Team accompagnent les productions cinématographiques et audiovisuelles, de la conception des chorégraphies d'action jusqu'au tournage en plateau.";
  const bgImage =
    hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.jpg';
  const ctaPrimaryText = hero?.cta_primary_text || "Contacter l'Équipe de Production";
  const ctaPrimaryLink = hero?.cta_primary_link || '/contact-cuc';

  return (
    <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
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
              <span className="text-[#FFE500]">TOURNAGE</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs font-mono-tech uppercase font-bold tracking-wider text-[#FFE500]">
              <span>{badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              {title.includes('&') ? (
                <>
                  {title.split('&')[0]} &amp;{' '}
                  <span className="text-[#FFE500]">{title.split('&')[1]}</span>
                </>
              ) : (
                title
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  {ctaPrimaryText}
                </TacticalButton>
              </Link>
              <a
                href="#filmographie"
                className="inline-flex items-center gap-2 px-5 py-3 border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono-tech uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
              >
                <Film className="w-4 h-4 text-[#FFE500]" />
                <span>Voir les affiches</span>
              </a>
            </div>
          </div>

          {/* Cinematic Textured CUC Emblem Showcase */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div className="relative w-64 h-64 border border-zinc-800 p-2 bg-[#0a0a0e] shadow-2xl group">
              <div className="relative w-full h-full overflow-hidden border border-zinc-800/80">
                <Image
                  src="/images/logos/cuc-logo-cinematic.jpg"
                  alt="Blason CUC Stunt Team"
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
