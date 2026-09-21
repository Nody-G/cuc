'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';

import { Award, ChevronRight } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';

import { SitePageHero } from '@/lib/data/site-service';

interface FormationHeroSectionProps {
  onApply: (programId: string) => void;
  heroData?: Partial<SitePageHero>;
}

export const FormationHeroSection: React.FC<FormationHeroSectionProps> = ({
  onApply,
  heroData,
}) => {
  return (
    <>
      {/* Page Header Hero */}
      <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroData?.bg_image || "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-7-scaled.jpg"}
            alt="Formation professionnelle de cascadeur au Campus Univers Cascades"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-40 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              ACCUEIL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500]">
              FORMATION PROFESSIONNELLE DE CASCADEUR
            </span>
          </div>

          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo CUC"
                width={36}
                height={36}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
              />
            </div>
            <StuntBadge variant="yellow" icon={<Award className="w-3.5 h-3.5" />}>
              {heroData?.badge || 'CURSUS CERTIFIÉ QUALIOPI'}
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-400 hidden sm:inline">
              AFDAS 100% • FRANCE TRAVAIL
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
            {heroData?.title ? (
              <span>{heroData.title}</span>
            ) : (
              <>FORMATION PROFESSIONNELLE <span className="text-[#FFE500]">DE CASCADEUR</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
            {heroData?.subtitle || "Cursus de formation professionnelle fondé par Lucas Dollfus. Une immersion technique au Cateau-Cambrésis pour acquérir les compétences, la discipline de plateau et les réflexes de sécurité exigés par le cinéma d'action."}
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <TacticalButton
              variant="primary"
              size="lg"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => onApply('pro-longue-duree')}
            >
              Candidater au Cursus Pro
            </TacticalButton>
            <TacticalButton
              variant="secondary"
              size="lg"
              onClick={() => onApply('stage-decouverte')}
            >
              Formule Découverte (12 jours)
            </TacticalButton>
            <a
              href="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/document/21452296-CHALLENGE-EUROPE-PRODUCTIONS-Qualiopi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition-opacity"
              title="Consulter le dossier d'agrément et de certification CUC"
            >
              <Image
                src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Encart-plaquette.png"
                alt="Télécharger la plaquette CUC"
                width={240}
                height={50}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Chiffres clés & indicateurs */}
      <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-white">
                720H
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                Pratique Intensive Plateau
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                224
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                Stagiaires Certifiés
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-white">
                100%
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                Taux de Satisfaction
              </div>
            </div>

            <div className="border-l-2 border-[#FFE500] pl-4 py-1">
              <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">
                DEPUIS 2011
              </div>
              <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider">
                Formation Référente en France
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
