'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

interface HomeAboutSectionProps {
  aboutData?: {
    tag?: string;
    subtag?: string;
    title?: string;
    description?: string;
    founder_quote?: string;
    founder_name?: string;
    founder_role?: string;
    badge_year?: string;
    image_url?: string;
    cta_primary_text?: string;
    cta_primary_link?: string;
    cta_secondary_text?: string;
    cta_secondary_link?: string;
  };
}

export const HomeAboutSection: React.FC<HomeAboutSectionProps> = ({ aboutData }) => {
  const title = aboutData?.title || 'LE CENTRE DE FORMATION DE RÉFÉRENCE EN CASCADE DE CINÉMA';
  const tag = aboutData?.tag || 'PRÉSENTATION';
  const subtag = aboutData?.subtag || '• CINÉMA, SÉRIES & SPECTACLE';
  const description = aboutData?.description || "Créé en 2008 par Lucas Dollfus, le Campus Univers Cascades (CUC) est un centre de formation professionnelle dédié aux techniques de cascade physique et mécanique, établi sur un domaine privé de 6 hectares au Cateau-Cambrésis (59).";
  const founderQuote = aboutData?.founder_quote || "« Maîtriser le risque, créer l'inédit, repousser les limites de la vérité physique au service de la vision des plus grands réalisateurs. »";
  const founderName = aboutData?.founder_name || 'LUCAS DOLLFUS';
  const founderRole = aboutData?.founder_role || 'FONDATEUR & RÉGLEUR';
  const badgeYear = aboutData?.badge_year || 'DEPUIS 2008';
  const imageUrl = aboutData?.image_url || 'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg';
  const ctaPrimaryText = aboutData?.cta_primary_text || 'Découvrir la Formation Pro';
  const ctaPrimaryLink = aboutData?.cta_primary_link || '/formation-de-cascadeur';
  const ctaSecondaryText = aboutData?.cta_secondary_text || "L'Équipe des Cascadeurs";
  const ctaSecondaryLink = aboutData?.cta_secondary_link || '/equipe-cascadeurs-pro';
  const pillars = [
    {
      title: 'INFRASTRUCTURES DÉDIÉES',
      desc: 'Plateaux techniques complets : fosse de réception, dojos de combat chorégraphié, hangars de cascades mécaniques et manège équestre sur 6 hectares.',
      tag: '6 HECTARES',
      speed: -0.05,
    },
    {
      title: 'ÉQUIPE & INSTRUCTEURS',
      desc: "Encadrement par des régleurs et coordinateurs en activité, maîtres d'armes et spécialistes du combat scénique et du parkour.",
      tag: 'PÉDAGOGIE',
      speed: 0.05,
    },
    {
      title: 'INSERTION PROFESSIONNELLE',
      desc: 'Des diplômés actifs sur les longs-métrages, séries télévisées, spectacles vivants et productions internationales.',
      tag: 'CINÉMA & TV',
      speed: -0.04,
    },
    {
      title: 'AGENCE CUC EVENTS',
      desc: "Spectacles d'action sur mesure, cascades en direct, animations et démonstrations événementielles.",
      tag: 'ÉVÉNEMENTS',
      speed: 0.06,
    },
  ];

  return (
    <StudioParallaxScene className="py-28 bg-[#08080a]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background Soft Glow Layer */}
      <StudioParallaxLayer speed={-0.18} className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FFE500]/[0.025] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Side: 2.5D Multi-Plane Portrait Composition */}
          <div className="lg:col-span-5 relative">
            {/* Layer A: Background Shadow Frame & Photo (Deep plane) */}
            <StudioParallaxLayer speed={-0.12} className="relative">
              <div className="relative h-[460px] sm:h-[540px] w-full border border-zinc-800 bg-[#0c0c12] overflow-hidden shadow-2xl group">
                <Image
                  src={imageUrl}
                  alt="Campus Univers Cascades - Cascadeurs professionnels et formation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center brightness-90 contrast-110 group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              </div>
            </StudioParallaxLayer>

            {/* Layer B: Founder Quote Card (Floating mid-plane) */}
            <StudioParallaxLayer speed={0.08} className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 z-20">
              <StudioParallaxCard maxTilt={5}>
                <div className="bg-[#0a0a0e]/95 backdrop-blur-md border border-zinc-700/80 p-4 sm:p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                    <span className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                      LE MOT DU FONDATEUR
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 font-tech italic leading-relaxed">
                    {founderQuote}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono-tech text-zinc-400">
                    <span className="text-white font-bold">{founderName}</span>
                    <span className="text-[#FFE500]">{founderRole}</span>
                  </div>
                </div>
              </StudioParallaxCard>
            </StudioParallaxLayer>

            {/* Layer C: Year Tag Badge (Floating foreground plane) */}
            <StudioParallaxLayer speed={0.16} className="absolute -top-4 -left-3 z-30">
              <div className="bg-[#FFE500] text-black font-display text-sm tracking-widest px-4 py-1.5 font-bold shadow-[0_4px_25px_rgba(255,229,0,0.35)]">
                {badgeYear}
              </div>
            </StudioParallaxLayer>
          </div>

          {/* Editorial Content Side */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                  {tag}
                </span>
                <span className="text-xs font-mono-tech text-zinc-400">
                  {subtag}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight">
                {title}
              </h2>

              <p className="text-sm sm:text-base font-tech text-zinc-300 mt-3 leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* 4 Pillars Grid with Staggered Parallax Wave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {pillars.map((pillar, idx) => (
                <StudioParallaxLayer key={idx} speed={pillar.speed}>
                  <StudioParallaxCard maxTilt={4} className="h-full">
                    <div className="p-4 sm:p-5 border border-zinc-800 bg-[#0d0d12]/90 backdrop-blur-xs flex flex-col justify-between h-full hover:border-[#FFE500]/40 transition-colors group">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-sm font-display uppercase tracking-wider text-white group-hover:text-[#FFE500] transition-colors">
                            {pillar.title}
                          </h3>
                          <span className="text-[9px] font-mono-tech text-[#FFE500] border border-[#FFE500]/30 px-1.5 py-0.5">
                            {pillar.tag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-tech leading-relaxed">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  </StudioParallaxCard>
                </StudioParallaxLayer>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  {ctaPrimaryText}
                </TacticalButton>
              </Link>
              <Link href={ctaSecondaryLink}>
                <TacticalButton variant="secondary" size="md">
                  {ctaSecondaryText}
                </TacticalButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StudioParallaxScene>
  );
};
