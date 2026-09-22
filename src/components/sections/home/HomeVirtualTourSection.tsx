'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Compass } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';
import type { HomeVirtualTourData } from './HomeTournagesSection';

interface HomeVirtualTourSectionProps {
  virtualTourData?: HomeVirtualTourData;
}

export const HomeVirtualTourSection: React.FC<HomeVirtualTourSectionProps> = ({
  virtualTourData,
}) => {
  const t = useTranslations('home.virtualTour');

  const badge = virtualTourData?.badge || t('badge');
  const title = virtualTourData?.title || t('title');
  const subtitle = virtualTourData?.subtitle || t('subtitle');
  const ctaText = virtualTourData?.cta_text || t('cta');
  const ctaLink = virtualTourData?.cta_link || '/visite-virtuelle';
  const tag = virtualTourData?.tag || t('tag');
  const installationsCta = virtualTourData?.installations_cta || t('installationsCta');
  const hudTitle = virtualTourData?.hud_title || t('hudTitle');
  const hudHint = virtualTourData?.hud_hint || t('hudHint');
  const imageUrl =
    virtualTourData?.image_url ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Zoe-Bell-Hall.jpg';

  return (
    <StudioParallaxScene className="py-28 bg-[#08080c] border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Volumetric Beam */}
      <StudioParallaxLayer
        speed={-0.25}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[48rem] h-[48rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.04)_0%,_transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="page-shell relative z-10">
        <StudioParallaxCard maxTilt={3}>
          <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/70 p-8 sm:p-12 relative shadow-[0_0_50px_rgba(255,229,0,0.12)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text Side */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    data-cuc-field="sections_data.virtual_tour.badge"
                    className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider"
                  >
                    {badge}
                  </span>
                  <span
                    data-cuc-field="sections_data.virtual_tour.tag"
                    className="text-xs font-mono-tech text-zinc-400"
                  >
                    {tag}
                  </span>
                </div>

                <h2
                  data-cuc-field="sections_data.virtual_tour.title"
                  className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight"
                >
                  {title}
                </h2>

                <p
                  data-cuc-field="sections_data.virtual_tour.subtitle"
                  className="text-sm sm:text-base font-tech text-zinc-300 leading-relaxed"
                >
                  {subtitle}
                </p>

                <div className="flex flex-wrap gap-4 pt-3">
                  <Link href={ctaLink} data-cuc-field="sections_data.virtual_tour.cta_text">
                    <TacticalButton
                      variant="primary"
                      size="lg"
                      icon={<Compass className="w-4 h-4" />}
                    >
                      {ctaText}
                    </TacticalButton>
                  </Link>
                  <Link href="/visite-guidee">
                    <TacticalButton variant="secondary" size="lg">
                      <span data-cuc-field="sections_data.virtual_tour.installations_cta">
                        {installationsCta}
                      </span>
                    </TacticalButton>
                  </Link>
                </div>
              </div>

              {/* 3D Portal Window Side */}
              <div className="lg:col-span-5 relative">
                <div className="relative h-64 sm:h-80 w-full border border-zinc-700/80 overflow-hidden bg-black group shadow-2xl">
                  {/* Sliding Internal 360 Photo (Layer Depth) */}
                  <StudioParallaxLayer
                    speed={-0.12}
                    className="relative w-full h-[120%] -top-[10%]"
                    data-cuc-field="sections_data.virtual_tour.image_url"
                    data-cuc-kind="image"
                  >
                    <Image
                      src={imageUrl}
                      alt={t('previewAlt')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover brightness-85 group-hover:scale-105 transition-transform duration-700"
                    />
                  </StudioParallaxLayer>

                  {/* Floating Compass Center HUD */}
                  <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                    <StudioParallaxLayer speed={0.12}>
                      <div className="w-16 h-16 rounded-full bg-[#FFE500] text-black flex items-center justify-center mb-2.5 shadow-[0_0_30px_rgba(255,229,0,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(255,229,0,0.8)] transition-all duration-300">
                        <Compass className="w-8 h-8" />
                      </div>
                    </StudioParallaxLayer>
                    <span
                      data-cuc-field="sections_data.virtual_tour.hud_title"
                      className="font-display uppercase text-lg text-white font-bold tracking-wider"
                    >
                      {hudTitle}
                    </span>
                    <span
                      data-cuc-field="sections_data.virtual_tour.hud_hint"
                      className="text-xs font-mono-tech text-[#FFE500] mt-1"
                    >
                      {hudHint}
                    </span>
                  </div>

                  <Link
                    href={ctaLink}
                    className="absolute inset-0 z-20"
                    aria-label={t('launchLabel')}
                  />
                </div>
              </div>
            </div>
          </div>
        </StudioParallaxCard>
      </div>
    </StudioParallaxScene>
  );
};
