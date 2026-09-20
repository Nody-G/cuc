'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export default function StuntWorkshopCucPage() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const { content } = usePageDynamicContent('stunt-workshop-cuc');

  const heroBadge = content.hero?.badge || 'STAGE INTERNATIONAL';
  const heroTitle = content.hero?.title || 'INTERNATIONAL STUNT WORKSHOP';
  const heroSubtitle =
    content.hero?.subtitle ||
    "Join performers and stuntmen from across the globe (USA, UK, Europe, Australia, Asia) at the world's premier stunt training facility. 2 weeks of full immersion, 10 physical disciplines, full board on our 6-hectare private estate in France.";
  const heroBg =
    content.hero?.bg_image ||
    'https://www.campus-universcascades.com/wp-content/uploads/2023/02/slider-8-scaled.jpg';
  const ctaPrimaryText = content.hero?.cta_primary_text || 'Apply for Next Session';
  const ctaSecondaryText = content.hero?.cta_secondary_text || 'Inquire & Information';
  const ctaSecondaryLink = content.hero?.cta_secondary_link || '/contact-cuc';

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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                HOME / ACCUEIL
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">INTERNATIONAL STUNT WORKSHOP</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Globe className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                EN ANGLAIS &amp; FRANÇAIS • 2 SEMAINES RÉSIDENTIELLES
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
              <TacticalButton
                variant="primary"
                size="lg"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setIsApplicationOpen(true)}
              >
                {ctaPrimaryText}
              </TacticalButton>
              <Link href={ctaSecondaryLink}>
                <TacticalButton variant="secondary" size="lg">
                  {ctaSecondaryText}
                </TacticalButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Global Key Highlights */}
        <section className="py-8 bg-[#0c0c10] border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono-tech text-xs">
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-white">14 DAYS</div>
                <div className="text-zinc-400 uppercase">Intensive Training Camp</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">21M</div>
                <div className="text-zinc-400 uppercase">CUC Stunt High Fall Tower</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-white">90 BEDS</div>
                <div className="text-zinc-400 uppercase">On-Site Accommodation</div>
              </div>
              <div className="border-l-2 border-[#FFE500] pl-4">
                <div className="text-3xl sm:text-4xl font-display text-[#FFE500]">100%</div>
                <div className="text-zinc-400 uppercase">Real Action Showreel Video</div>
              </div>
            </div>
          </div>
        </section>

        {/* Workshop Content & Curriculum */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2">
                  <StuntBadge variant="yellow" icon={<Zap className="w-3.5 h-3.5" />}>
                    PROGRAMME INTENSIF
                  </StuntBadge>
                  <span className="text-xs font-mono-tech text-zinc-400">CURRICULUM INTERNATIONAL</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white">
                  TRAIN LIKE A HOLLYWOOD STUNT PERFORMER
                </h2>

                <p className="text-sm font-tech text-zinc-300 leading-relaxed">
                  The CUC International Stunt Workshop is designed for physical actors, martial artists,
                  gymnasts, parkour athletes and professional stuntmen seeking world-class certification.
                  Taught in both English and French by high-profile action coordinators with credits on
                  <em> John Wick 4</em>, <em>Fast & Furious</em>, and <em>James Bond</em>.
                </p>

                <div className="space-y-3 text-xs font-tech text-zinc-300">
                  <div className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-mono-tech block mb-0.5">
                        FIGHT CHOREOGRAPHY & HONG KONG ACTION DESIGN
                      </strong>
                      Camera angles, punch-selling techniques, multi-opponent combat drills, and weapons flow.
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-mono-tech block mb-0.5">
                        WIREWORK & 3D RIGGING
                      </strong>
                      Harness flights, deadman drops, air-ramps, and superhero wall-running stunts.
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-mono-tech block mb-0.5">
                        HIGH FALLS UP TO 21 METERS
                      </strong>
                      Defenestrations, backwards drops, and high-impact landing on giant calibrated airbags.
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-mono-tech block mb-0.5">
                        FULL BODY BURN (HUMAN TORCH)
                      </strong>
                      Pyro safety protocols, protective Nomex suits, fire retardant gels, and emergency procedures.
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0e0e14] border border-zinc-800 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-mono-tech block mb-0.5">
                        SHOWREEL ACTION PRODUCTION
                      </strong>
                      Professional cinematic camera crew shoots your dynamic action scene at the end of the camp.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Visual Cards — Real Workshop Photos */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative h-64 border border-zinc-800 overflow-hidden bg-black/40">
                  <Image
                    src="https://www.campus-universcascades.com/wp-content/uploads/2025/03/Stage-Workshop-2.png"
                    alt="International Stunt Workshop Official Poster"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative h-40 border border-zinc-800 overflow-hidden">
                    <Image
                      src="https://www.campus-universcascades.com/wp-content/uploads/2025/04/CUC-BRI.jpg"
                      alt="CUC BRI Tactical Stunt Training"
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="relative h-40 border border-zinc-800 overflow-hidden">
                    <Image
                      src="https://www.campus-universcascades.com/wp-content/uploads/2025/03/Dos-CUC-TOWER-scaled.jpeg"
                      alt="CUC Tower Stunt Jump"
                      fill
                      sizes="25vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>

                <div className="relative h-48 border border-zinc-800 overflow-hidden">
                  <Image
                    src="https://www.campus-universcascades.com/wp-content/uploads/2025/03/CUC-5.0-586.jpg"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#FFE500]" />
                  <h3 className="font-display uppercase text-lg text-white">LOCATION & ACCESS</h3>
                </div>
                <p className="text-xs font-tech text-zinc-300 leading-relaxed mb-4">
                  Campus Univers Cascades is located in <strong>Le Cateau-Cambrésis (59360)</strong>,
                  Northern France. Just 2 hours drive from Paris CDG International Airport,
                  and 1 hour from Lille or Brussels (Belgium).
                </p>
                <div className="text-[11px] font-mono-tech text-zinc-500">
                  Airport shuttles and train station pickups available upon booking.
                </div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bed className="w-4 h-4 text-[#FFE500]" />
                  <h3 className="font-display uppercase text-lg text-white">FULL BOARD HOUSING</h3>
                </div>
                <p className="text-xs font-tech text-zinc-300 leading-relaxed mb-4">
                  Stay on-site in student housing facilities (90 beds total). All three meals
                  (breakfast, lunch, dinner) are served daily by our professional catering staff,
                  specifically calibrated for high athletic performance.
                </p>
                <div className="text-[11px] font-mono-tech text-zinc-500">
                  Single or shared rooms with high-speed Wi-Fi and laundry facilities.
                </div>
              </div>

              <div className="bg-[#121218] border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-[#FFE500]" />
                  <h3 className="font-display uppercase text-lg text-white">OFFICIAL CERTIFICATE</h3>
                </div>
                <p className="text-xs font-tech text-zinc-300 leading-relaxed mb-4">
                  Graduates receive the official CUC Worldwide Stunt Certificate, recognized
                  by international action directors and stunt coordinating agencies globally.
                </p>
                <div className="text-[11px] font-mono-tech text-zinc-500">
                  Includes raw 4K footage of your choreographed action scenes.
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
              <h3 className="text-3xl font-display uppercase text-white mb-2">
                READY TO ELEVATE YOUR ACTION CAREER?
              </h3>
              <p className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6">
                Spaces are limited to ensure maximum individual camera time and safety coaching.
                Apply today to secure your spot for the upcoming international session.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <TacticalButton
                  variant="primary"
                  size="lg"
                  onClick={() => setIsApplicationOpen(true)}
                >
                  Apply for International Workshop
                </TacticalButton>
                <Link href="/contact-cuc">
                  <TacticalButton variant="secondary" size="lg">
                    Contact Admissions
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
