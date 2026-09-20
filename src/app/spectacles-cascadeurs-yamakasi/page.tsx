'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  Sparkles,
  ChevronRight,
  Award
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function SpectaclesCascadeursYamakasiPage() {
  const { content } = usePageDynamicContent('spectacles-cascadeurs-yamakasi');

  const heroBadge = content.hero?.badge || "LE CINÉMA S'INVITE SUR SCÈNE";
  const heroTitle = content.hero?.title || 'SPECTACLES CASCADEURS & YAMAKASI';
  const heroSubtitle =
    content.hero?.subtitle ||
    "Revivez les séquences d'action mythiques de vos films préférés avec les cascadeurs professionnels et doublures cinéma du Campus Univers Cascades. Combats, chutes, Parkour, humour et effets scéniques pour tous vos événements.";
  const heroBg =
    content.hero?.bg_image ||
    'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg';
  const ctaPrimaryText = content.hero?.cta_primary_text || 'Demander un Devis Spectacle';
  const ctaPrimaryLink = content.hero?.cta_primary_link || '/contact-cuc';
  const ctaSecondaryText = content.hero?.cta_secondary_text || 'Voir nos Vidéos en Direct';
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/videos-cascadeur';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt="Spectacles de cascadeurs professionnels CUC Events"
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
              <Link href="/cuc-events-agence" className="hover:text-[#FFE500] transition-colors">
                CUC EVENTS
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">SPECTACLES CASCADEURS & YAMAKASI</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Sparkles className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                CASCADEURS • COMÉDIENS • SHOWS CLÉ EN MAIN
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              {heroTitle.includes('&') ? (
                <>
                  {heroTitle.split('&')[0]} &amp;{' '}
                  <span className="text-[#FFE500]">{heroTitle.split('&')[1]}</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={ctaPrimaryLink}>
                <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                  {ctaPrimaryText}
                </TacticalButton>
              </Link>
              {ctaSecondaryText && (
                <Link href={ctaSecondaryLink}>
                  <TacticalButton variant="secondary" size="lg">
                    {ctaSecondaryText}
                  </TacticalButton>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Détails de l'offre Spectacles */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Show Formats */}
            <div className="bg-[#0e0e14] border-2 border-zinc-800 p-6 sm:p-10 relative">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src="/images/logos/cuc-logo-yellow.png"
                      alt="CUC Events Spectacles"
                      width={44}
                      height={44}
                      className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(255,229,0,0.3)]"
                    />
                    <div>
                      <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-wider uppercase block">
                        CUC EVENTS SPECTACLES
                      </span>
                      <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">
                        CASCADEURS &amp; DOUBLURES CINÉMA
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display uppercase text-white">
                    DES SHOWS CLÉ EN MAIN ADAPTÉS À VOTRE LIEU
                  </h2>

                  <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                    Nos artistes font partie du milieu très restreint des doublures-cascadeurs pour les films
                    d’action au cinéma. Formés au sein du Campus Univers Cascades et travaillant en exclusivité
                    avec notre agence, ils s’adaptent à n’importe quel environnement pour satisfaire vos envies.
                  </p>

                  <div className="p-4 bg-[#14141c] border border-zinc-800 space-y-2 text-xs font-tech">
                    <div className="text-[#FFE500] font-mono-tech font-bold uppercase">
                      Spécifications de la formule Spectacle :
                    </div>
                    <ul className="space-y-1.5 text-zinc-300">
                      <li>• <strong>Équipe :</strong> 5 artistes professionnels polyvalents (cascadeurs, comédiens, traceurs)</li>
                      <li>• <strong>Format :</strong> De 8 à 20 minutes d'action ininterrompue et réglée au millimètre</li>
                      <li>• <strong>Thèmes au choix :</strong> James Bond 007, Univers Super-Héros (Marvel/DC), John Wick, Post-apocalyptique</li>
                      <li>• <strong>Disciplines intégrées :</strong> Combats scéniques, chutes de hauteur, comédie, acrobaties, Parkour Yamakasi</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  <div className="relative h-72 sm:h-96 w-full border border-zinc-800 overflow-hidden bg-black shadow-xl">
                    <Image
                      src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-7-scaled.jpg"
                      alt="Spectacles cascadeurs CUC sur scène"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Référence Prestige : Accor Arena */}
            <div className="bg-[#121218] border-2 border-[#FFE500] p-6 sm:p-10 relative shadow-[0_0_30px_rgba(255,229,0,0.1)]">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 relative">
                  <div className="relative h-72 w-full border border-zinc-700 overflow-hidden bg-black">
                    <Image
                      src="https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-5-scaled.jpg"
                      alt="CUC Events spectacle et performance live cascadeurs"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <StuntBadge variant="yellow" icon={<Award className="w-3.5 h-3.5" />}>
                      ÉVÉNEMENT
                    </StuntBadge>
                    <span className="text-xs font-mono-tech text-zinc-400">ACCOR ARENA • PARIS</span>
                  </div>

                  <h3 className="text-3xl font-display uppercase text-white">
                    CUC EVENTS À L’ACCOR ARENA (BERCY)
                  </h3>

                  <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                    Devant plus de 15 000 spectateurs, la CUC Stunt Team a assuré le show d&apos;ouverture
                    avec des cascades synchronisées, des sauts depuis les structures aériennes et des combats
                    retransmis sur écrans géants.
                  </p>

                  <div className="pt-2">
                    <Link href="/contact-cuc?demande=cuc-events">
                      <TacticalButton variant="primary" size="md">
                        Organiser un Show dans votre Salle
                      </TacticalButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
