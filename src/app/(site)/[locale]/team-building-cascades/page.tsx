'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  Users,
  ChevronRight
} from 'lucide-react';

const TEAM_BUILDING_WORKSHOPS = [
  {
    title: "Chute de Hauteur sur Airbag",
    category: "Adrénaline & Confiance",
    desc: "En intérieur comme en extérieur, faites goûter à vos collaborateurs les sensations de la chute libre sur coussin d'air géant de cinéma. Dépassement de soi et cohésion collective garantie.",
    img: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-chute-hauteur-1.jpg"
  },
  {
    title: "Combats au Cinéma",
    category: "Chorégraphie & Précision",
    desc: "Initiation aux techniques de combats de films : esquives, feintes, coups scéniques et synchronisation avec les axes caméra.",
    img: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg"
  },
  {
    title: "Parkour & Yamakasi",
    category: "Agilité & Mouvement",
    desc: "Initiation encadrée par des cascadeurs professionnels et spécialistes du déplacement urbain : franchissements d'obstacles, sauts de précision et motricité.",
    img: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-parkour-1.jpg"
  },
  {
    title: "Maquillage Effets Spéciaux (SFX)",
    category: "Coulisses & Cinéma",
    desc: "Découvrez les secrets des maquilleurs de cinéma : création de blessures ultra-réalistes, fausses cicatrices, impacts de balles et prothèses d'action.",
    img: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-maquillage.jpg"
  },
  {
    title: "Doublage de Voix & Post-Production",
    category: "Créativité & Voix",
    desc: "Mettez-vous dans la peau d'un comédien de doublage ! Enregistrez en équipe les répliques et bruitages de séquences cultes du cinéma d'action.",
    img: "https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-doublage-voix.jpg"
  }
];

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function TeamBuildingCascadesPage() {
  const t = useTranslations('teamBuilding');
  const { content } = usePageDynamicContent('team-building-cascades');

  const heroBadge = content.hero?.badge || 'SÉMINAIRES & ENTREPRISES';
  const heroTitle = content.hero?.title || "TEAM BUILDING D'EXCEPTION";
  const heroSubtitle =
    content.hero?.subtitle ||
    "Offrez à vos équipes une immersion inoubliable dans l'univers du cinéma d'action et des cascadeurs professionnels. Ateliers modulables de 10 à 300 personnes sur notre campus ou sur le lieu de votre séminaire.";
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Team-building-combat-cinema-1.jpg';
  const ctaPrimaryText = content.hero?.cta_primary_text || 'Construire votre Projet Team Building';
  const ctaPrimaryLink = content.hero?.cta_primary_link || '/contact-cuc';
  const ctaSecondaryText = content.hero?.cta_secondary_text || 'Découvrir CUC Events';
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/cuc-events-agence';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt={t('heroMeta')}
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
              <span className="text-[#FFE500]">TEAM BUILDING D'EXCEPTION</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                {t('heroMeta')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              {heroTitle.includes(' ') ? (
                <>
                  {heroTitle.substring(0, heroTitle.lastIndexOf(' '))}{' '}
                  <span className="text-[#FFE500]">
                    {heroTitle.substring(heroTitle.lastIndexOf(' ') + 1)}
                  </span>
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

        {/* Intro */}
        <section className="py-14 bg-[#09090d] border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-4 flex flex-col items-center justify-center gap-2">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="CUC Events Team Building"
                width={52}
                height={52}
                className="w-13 h-13 object-contain drop-shadow-[0_0_12px_rgba(255,229,0,0.35)]"
              />
              <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-widest uppercase">
                {content.sections_data?.overview?.badge || t('overviewBadge')}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display uppercase text-white mb-4">
              {content.sections_data?.overview?.title || t('overviewTitle')}
            </h2>
            <p className="text-sm font-tech text-zinc-300 leading-relaxed">
              {content.sections_data?.overview?.description || t('overviewDescription')}
            </p>
          </div>
        </section>

        {/* Ateliers Dynamiques & Adaptatifs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {((content.sections_data?.workshops && content.sections_data.workshops.length > 0)
                ? content.sections_data.workshops
                : TEAM_BUILDING_WORKSHOPS
              ).map((workshop: any, idx: number) => (
                <div
                  key={workshop.id || idx}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 w-full mb-4 border border-zinc-800 overflow-hidden bg-black">
                      {workshop.img ? (
                        <Image
                          src={workshop.img}
                          alt={workshop.title || t('workshopFallbackTitle')}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono-tech text-zinc-500">
                          {t('workshopFallbackLabel')}
                        </div>
                      )}
                      {workshop.category && (
                        <div className="absolute top-3 left-3 bg-black/85 px-2.5 py-0.5 text-[10px] font-mono-tech text-[#FFE500] border border-white/20">
                          {workshop.category}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-xs font-tech text-zinc-400 leading-relaxed">
                      {workshop.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                    <span>{t('workshopChoice')}</span>
                    <span className="text-[#FFE500]">{t('workshopModular')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formule personnalisée CTA */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
              {t('customBadge')}
            </StuntBadge>
            <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
              {t('customTitle')}
            </h2>
            <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
              {t('customDescription')}
            </p>
            <Link href="/contact-cuc?demande=cuc-events">
              <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
                {t('customCta')}
              </TacticalButton>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
