'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { CUC_TEAM } from '@/data/team';
import { ALL_OFFICIAL_FILM_POSTERS } from '@/data/all_official_films';
import {
  Users,
  ExternalLink,
  ChevronRight,
  Film,
  Globe
} from 'lucide-react';

export default function EquipeCascadeursProPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg"
              alt="L'équipe pédagogique et cascadeurs professionnels du CUC"
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
              <span className="text-[#FFE500]">L'ÉQUIPE 2025-2026</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                COORDINATEURS & FORMATEURS
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                CASCADEURS DU CINÉMA D'ACTION INTERNATIONAL
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase tracking-tight text-white max-w-5xl leading-none">
              L'ÉQUIPE <span className="text-[#FFE500]">PÉDAGOGIQUE DU CUC</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed">
              Une faculté d'action unique au monde. Des coordinateurs de cascades renommés,
              des pionniers des Yamakasi, et des cascadeurs en exercice sur les plus grandes productions
              hollywoodiennes et françaises qui transmettent chaque jour leur savoir-faire sur le terrain.
            </p>
          </div>
        </section>

        {/* Team Roster Grid with Grand High-Impact Portraits */}
        <section className="py-16">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {CUC_TEAM.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/70 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden shadow-xl hover:shadow-[0_15px_40px_rgba(255,229,0,0.1)]"
                >
                  {/* Grand Dedicated Portrait Showcase Stage */}
                  <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-gradient-to-b from-[#181824] via-[#101016] to-[#0e0e14] overflow-hidden flex items-end justify-center border-b border-zinc-800/80">
                    {/* Ambient Glow on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/15 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Tactical cinematic grid overlay */}
                    <div className="absolute inset-0 cinematic-grid opacity-30 pointer-events-none" />

                    {/* Tactical HUD Corners */}

                    {/* Role Badge - Top Left */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-[11px] uppercase font-bold tracking-wider shadow-md">
                        {member.role}
                      </span>
                    </div>

                    {/* Status Beacon - Top Right */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-xs border border-zinc-800 text-[10px] font-mono-tech text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PRO STAFF</span>
                    </div>

                    {/* High-Resolution Full-Stature Portrait */}
                    {member.avatarUrl ? (
                      <div className="relative w-full h-full max-h-[96%] flex items-end justify-center">
                        <Image
                          src={member.avatarUrl}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-8xl text-zinc-800">
                        {member.name.charAt(0)}
                      </div>
                    )}

                    {/* Subtle bottom shadow gradient to blend with card content */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none" />
                  </div>

                  {/* Card Content Section */}
                  <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Name & Title */}
                      <div className="mb-3">
                        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                          {member.name}
                        </h2>
                        <h3 className="text-xs font-mono-tech text-[#FFE500] uppercase tracking-wider mt-1">
                          {member.title}
                        </h3>
                      </div>

                      {/* Bio */}
                      <p className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed mb-6">
                        {member.bio}
                      </p>

                      {/* Specialties */}
                      <div className="space-y-3 mb-6 pt-4 border-t border-zinc-800/80">
                        <div>
                          <strong className="text-[11px] font-mono-tech text-zinc-400 uppercase block mb-2">
                            Domaines d'expertise :
                          </strong>
                          <div className="flex flex-wrap gap-1.5">
                            {member.specialties.map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono-tech text-zinc-300 group-hover:border-zinc-700 transition-colors"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {member.notableCredits && member.notableCredits.length > 0 && (
                          <div className="pt-2">
                            <strong className="text-[11px] font-mono-tech text-zinc-400 uppercase block mb-1">
                              Références & Tournages :
                            </strong>
                            <p className="text-[11px] font-tech text-zinc-400 leading-relaxed">
                              {member.notableCredits.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Links / Portfolio Footer */}
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                      {member.externalUrl ? (
                        <a
                          href={member.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono-tech text-[#FFE500] hover:underline"
                        >
                          <span>Fiche & Références</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span />
                      )}

                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                          title="Instagram"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FILMOGRAPHIE & TOURNAGES DE L'ÉQUIPE (Authentique du site CUC) */}
            <div className="mt-20 border-t border-zinc-800 pt-16">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <StuntBadge variant="yellow" icon={<Film className="w-3.5 h-3.5" />}>
                    TOURNAGES & AFFICHES OFFICIELLES
                  </StuntBadge>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    CINÉMA D'ACTION INTERNATIONAL
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
                  LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC
                </h2>
                <p className="text-xs sm:text-sm font-tech text-zinc-400">
                  Découvrez l'ensemble des productions cinématographiques et télévisuelles sur lesquelles nos cascadeurs et formateurs sont intervenus.
                </p>
              </div>

              {/* Grid of All 60 Authentic Posters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ALL_OFFICIAL_FILM_POSTERS.map((film, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 transition-all p-2 group flex flex-col justify-between"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black mb-2">
                      <Image
                        src={film.img}
                        alt={film.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[11px] font-mono-tech uppercase text-zinc-300 group-hover:text-[#FFE500] truncate text-center">
                      {film.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-16 bg-[#121218] border-2 border-zinc-800 p-8 text-center relative">

              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
                FORMEZ-VOUS AVEC LES MEILLEURS PROFESSIONNELS DU SECTEUR
              </h3>
              <p className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6">
                Chaque instructeur du Campus Univers Cascades est actif sur les plateaux de tournage
                et transmet les exigences actuelles du cinéma mondial.
              </p>
              <Link href="/formation-de-cascadeur">
                <TacticalButton variant="primary" size="md">
                  Découvrir les Formations du CUC
                </TacticalButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
