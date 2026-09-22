'use client';
import { Link } from '@/i18n/navigation';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApplicationModal } from '@/components/sections/ApplicationModal';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  Globe,
  Award,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Zap,
  Bed
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { mergeSectionItems, usePageSectionData } from '@/lib/hooks/usePageSectionData';

/**
 * Copie certifiée du bloc « workshop » de la page internationale.
 *
 * Elle sert de **repli** : chaque texte est éditable en place dans le Mode Studio
 * (`sections_data.workshop.*`), y compris les points de programme et les visuels
 * de la page. Aucune valeur vide n'est publiée — le repli reste la référence.
 */
interface WorkshopHighlight {
  value?: string;
  label?: string;
}

interface WorkshopCurriculumItem {
  title?: string;
  desc?: string;
}

const HIGHLIGHTS_DEFAULT: Required<WorkshopHighlight>[] = [
  { value: '14 DAYS', label: 'Intensive Training Camp' },
  { value: '21M', label: 'CUC Stunt High Fall Tower' },
  { value: '90 BEDS', label: 'On-Site Accommodation' },
  { value: '100%', label: 'Real Action Showreel Video' },
];

const CURRICULUM_DEFAULT: Required<WorkshopCurriculumItem>[] = [
  {
    title: 'FIGHT CHOREOGRAPHY & HONG KONG ACTION DESIGN',
    desc: 'Camera angles, punch-selling techniques, multi-opponent combat drills, and weapons flow.',
  },
  {
    title: 'WIREWORK & 3D RIGGING',
    desc: 'Harness flights, deadman drops, air-ramps, and superhero wall-running stunts.',
  },
  {
    title: 'HIGH FALLS UP TO 21 METERS',
    desc: 'Defenestrations, backwards drops, and high-impact landing on giant calibrated airbags.',
  },
  {
    title: 'FULL BODY BURN (HUMAN TORCH)',
    desc: 'Pyro safety protocols, protective Nomex suits, fire retardant gels, and emergency procedures.',
  },
  {
    title: 'SHOWREEL ACTION PRODUCTION',
    desc: 'Professional cinematic camera crew shoots your dynamic action scene at the end of the camp.',
  },
];

export default function StuntWorkshopCucPage() {
  const t = useTranslations('stuntWorkshop');
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { content } = usePageDynamicContent('stunt-workshop-cuc');

  const heroBadge = content.hero?.badge || 'STAGE INTERNATIONAL';
  const heroTitle = content.hero?.title || 'INTERNATIONAL STUNT WORKSHOP';
  const heroSubtitle =
    content.hero?.subtitle ||
    "Join performers and stuntmen from across the globe (USA, UK, Europe, Australia, Asia) at the world's premier stunt training facility. 2 weeks of full immersion, 10 physical disciplines, full board on our 6-hectare private estate in France.";
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-8-scaled.jpg';
  const ctaPrimaryText = content.hero?.cta_primary_text || 'Apply for Next Session';
  const ctaSecondaryText = content.hero?.cta_secondary_text || 'Inquire & Information';
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/contact-cuc';

  const workshop = usePageSectionData<{
    breadcrumb_home?: string;
    breadcrumb_current?: string;
    highlights?: WorkshopHighlight[];
    program_badge?: string;
    program_tag?: string;
    program_title?: string;
    program_intro?: string;
    curriculum?: WorkshopCurriculumItem[];
    location_title?: string;
    location_body?: string;
    location_note?: string;
    housing_title?: string;
    housing_body?: string;
    housing_note?: string;
    certificate_title?: string;
    certificate_body?: string;
    certificate_note?: string;
    cta_title?: string;
    cta_body?: string;
    cta_primary?: string;
    cta_secondary?: string;
  }>('workshop');

  const highlights = mergeSectionItems(
    HIGHLIGHTS_DEFAULT,
    workshop?.highlights ? { items: workshop.highlights } : null
  );
  const curriculum = mergeSectionItems(
    CURRICULUM_DEFAULT,
    workshop?.curriculum ? { items: workshop.curriculum } : null
  );

  const breadcrumbHome = workshop?.breadcrumb_home || 'HOME / ACCUEIL';
  const breadcrumbCurrent = workshop?.breadcrumb_current || 'INTERNATIONAL STUNT WORKSHOP';
  const programBadge = workshop?.program_badge || 'PROGRAMME INTENSIF';
  const programTag = workshop?.program_tag || 'CURRICULUM INTERNATIONAL';
  const programTitle = workshop?.program_title || 'INTERNATIONAL STUNT PERFORMER TRAINING';
  const programIntro =
    workshop?.program_intro ||
    'The CUC International Stunt Workshop is designed for physical actors, martial artists, gymnasts, parkour athletes and professional stuntmen seeking world-class certification. Taught in both English and French by high-profile action coordinators with credits on John Wick 4, Fast & Furious, and James Bond.';
  const locationTitle = workshop?.location_title || 'LOCATION & ACCESS';
  const locationBody =
    workshop?.location_body ||
    'Campus Univers Cascades is located in Le Cateau-Cambrésis (59360), Northern France. Just 2 hours drive from Paris CDG International Airport, and 1 hour from Lille or Brussels (Belgium).';
  const locationNote =
    workshop?.location_note ||
    'Airport shuttles and train station pickups available upon booking.';
  const housingTitle = workshop?.housing_title || 'FULL BOARD HOUSING';
  const housingBody =
    workshop?.housing_body ||
    'Stay on-site in student housing facilities (90 beds total). All three meals (breakfast, lunch, dinner) are served daily by our professional catering staff, specifically calibrated for high athletic performance.';
  const housingNote =
    workshop?.housing_note ||
    'Single or shared rooms with high-speed Wi-Fi and laundry facilities.';
  const certificateTitle = workshop?.certificate_title || 'OFFICIAL CERTIFICATE';
  const certificateBody =
    workshop?.certificate_body ||
    'Graduates receive the official CUC Workshop Certificate detailing all hours and disciplines completed during the session.';
  const certificateNote =
    workshop?.certificate_note || 'Includes raw 4K footage of your choreographed action scenes.';
  const ctaTitle = workshop?.cta_title || 'READY TO ELEVATE YOUR ACTION CAREER?';
  const ctaBody =
    workshop?.cta_body ||
    'Spaces are limited to ensure maximum individual camera time and safety coaching. Apply today to secure your spot for the upcoming international session.';
  const ctaPrimary = workshop?.cta_primary || 'Apply for International Workshop';
  const ctaSecondary = workshop?.cta_secondary || 'Contact Admissions';

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* International Workshop Hero */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt="CUC International Stunt Workshop"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-40 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />
          </div>

          <div className="relative z-10 page-shell">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link
                href="/"
                data-cuc-field="sections_data.workshop.breadcrumb_home"
                className="hover:text-[#FFE500] transition-colors"
              >
                {breadcrumbHome}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span
                data-cuc-field="sections_data.workshop.breadcrumb_current"
                className="text-[#FFE500]"
              >
                {breadcrumbCurrent}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Globe className="w-3.5 h-3.5" />}>
                <span data-cuc-field="hero.badge" data-cuc-kind="text">
                  {heroBadge}
                </span>
              </StuntBadge>
              <span
                data-cuc-field="hero.meta"
                data-cuc-kind="text"
                className="text-xs font-mono-tech text-zinc-400"
              >
                {content.hero?.meta || t('heroMeta')}
              </span>
            </div>

            <h1
              data-cuc-field="hero.title"
              data-cuc-kind="text"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none"
            >
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

            <p
              data-cuc-field="hero.subtitle"
              data-cuc-kind="textarea"
              className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
            >
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <TacticalButton
                variant="primary"
                size="lg"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setIsApplicationOpen(true)}
              >
                <span data-cuc-field="hero.cta_primary_text" data-cuc-kind="text">
                  {ctaPrimaryText}
                </span>
              </TacticalButton>
              <Link href={ctaSecondaryLink}>
                <TacticalButton variant="secondary" size="lg">
                  <span data-cuc-field="hero.cta_secondary_text" data-cuc-kind="text">
                    {ctaSecondaryText}
                  </span>
                </TacticalButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Global Key Highlights */}
        <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
          <div className="page-shell">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
              {highlights.map((highlight, index) => (
                <div key={index} className="border-l-2 border-[#FFE500] pl-4">
                  <div
                    data-cuc-field={`sections_data.workshop.highlights.${index}.value`}
                    className={`text-3xl sm:text-4xl font-display ${index % 2 === 0 ? 'text-white' : 'text-[#FFE500]'
                      }`}
                  >
                    {highlight.value}
                  </div>
                  <div
                    data-cuc-field={`sections_data.workshop.highlights.${index}.label`}
                    className="text-zinc-400 uppercase"
                  >
                    {highlight.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workshop Content & Curriculum */}
        <section className="py-16">
          <div className="page-shell">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2">
                  <StuntBadge variant="yellow" icon={<Zap className="w-3.5 h-3.5" />}>
                    <span data-cuc-field="sections_data.workshop.program_badge">{programBadge}</span>
                  </StuntBadge>
                  <span
                    data-cuc-field="sections_data.workshop.program_tag"
                    className="text-xs font-mono-tech text-zinc-400"
                  >
                    {programTag}
                  </span>
                </div>

                <h2
                  data-cuc-field="sections_data.workshop.program_title"
                  className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white"
                >
                  {programTitle}
                </h2>

                <p
                  data-cuc-field="sections_data.workshop.program_intro"
                  className="text-sm font-tech text-zinc-300 leading-relaxed"
                >
                  {programIntro}
                </p>

                <div className="space-y-3 text-xs font-tech text-zinc-300">
                  {curriculum.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                      <div>
                        <strong
                          data-cuc-field={`sections_data.workshop.curriculum.${index}.title`}
                          className="text-white font-mono-tech block mb-0.5"
                        >
                          {item.title}
                        </strong>
                        <span data-cuc-field={`sections_data.workshop.curriculum.${index}.desc`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side Visual Cards — Real Workshop Photos */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative h-64 border border-zinc-800 overflow-hidden bg-black/40">
                  <Image
                    src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Stage-Workshop-2.png"
                    alt="International Stunt Workshop Official Poster"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative h-40 border border-zinc-800 overflow-hidden">
                    <Image
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-BRI.jpg"
                      alt={t('briAlt')}
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="relative h-40 border border-zinc-800 overflow-hidden">
                    <Image
                      src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Dos-CUC-TOWER-scaled.jpeg"
                      alt="CUC Tower Stunt Jump"
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="relative h-48 border border-zinc-800 overflow-hidden">
                  <Image
                    src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/CUC-5.0-586.jpg"
                    alt="International Performers at CUC"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accommodation & Location Info */}
        <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
          <div className="page-shell">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#FFE500]" />
                  <h3
                    data-cuc-field="sections_data.workshop.location_title"
                    className="font-display uppercase text-lg text-white"
                  >
                    {locationTitle}
                  </h3>
                </div>
                <p
                  data-cuc-field="sections_data.workshop.location_body"
                  className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
                >
                  {locationBody}
                </p>
                <div
                  data-cuc-field="sections_data.workshop.location_note"
                  className="text-[11px] font-mono-tech text-zinc-500"
                >
                  {locationNote}
                </div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bed className="w-4 h-4 text-[#FFE500]" />
                  <h3
                    data-cuc-field="sections_data.workshop.housing_title"
                    className="font-display uppercase text-lg text-white"
                  >
                    {housingTitle}
                  </h3>
                </div>
                <p
                  data-cuc-field="sections_data.workshop.housing_body"
                  className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
                >
                  {housingBody}
                </p>
                <div
                  data-cuc-field="sections_data.workshop.housing_note"
                  className="text-[11px] font-mono-tech text-zinc-500"
                >
                  {housingNote}
                </div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-[#FFE500]" />
                  <h3
                    data-cuc-field="sections_data.workshop.certificate_title"
                    className="font-display uppercase text-lg text-white"
                  >
                    {certificateTitle}
                  </h3>
                </div>
                <p
                  data-cuc-field="sections_data.workshop.certificate_body"
                  className="text-xs font-tech text-zinc-300 leading-relaxed mb-4"
                >
                  {certificateBody}
                </p>
                <div
                  data-cuc-field="sections_data.workshop.certificate_note"
                  className="text-[11px] font-mono-tech text-zinc-500"
                >
                  {certificateNote}
                </div>
              </div>
            </div>

            {/* Bottom Inscription Box */}
            <div className="mt-12 bg-[#101016] border-2 border-[#FFE500] p-8 text-center relative">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/logos/cuc-logo-yellow.png"
                  alt="Campus Univers Cascades"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(255,229,0,0.35)]"
                />
              </div>
              <h3
                data-cuc-field="sections_data.workshop.cta_title"
                className="text-3xl font-display uppercase text-white mb-2"
              >
                {ctaTitle}
              </h3>
              <p
                data-cuc-field="sections_data.workshop.cta_body"
                className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6"
              >
                {ctaBody}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <TacticalButton
                  variant="primary"
                  size="lg"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  <span data-cuc-field="sections_data.workshop.cta_primary">{ctaPrimary}</span>
                </TacticalButton>
                <Link href="/contact-cuc">
                  <TacticalButton variant="secondary" size="lg">
                    <span data-cuc-field="sections_data.workshop.cta_secondary">
                      {ctaSecondary}
                    </span>
                  </TacticalButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        defaultProgramId="pro-longue-duree"
      />
    </div>
  );
}
