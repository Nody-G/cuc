'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getTeam, getFilms } from '@/lib/data/site-service';
import { createClient } from '@/lib/supabase/client';
import { Instructor, FilmCredit } from '@/types';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import {
  Users,
  ExternalLink,
  ChevronRight,
  Film,
  Globe,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

export default function EquipeCascadeursProPage() {
  const [team, setTeam] = React.useState<Instructor[]>(CUC_TEAM);
  const [films, setFilms] = React.useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
  const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);
  const { content } = usePageDynamicContent('equipe-cascadeurs-pro');

  const heroBadge = content.hero?.badge || 'COORDINATEURS & FORMATEURS';
  const heroTitle = content.hero?.title || "L'ÉQUIPE PÉDAGOGIQUE DU CUC";
  const heroSubtitle =
    content.hero?.subtitle ||
    "Une faculté d'action unique au monde. Des coordinateurs de cascades renommés, des pionniers des Yamakasi, et des cascadeurs en exercice sur les plus grandes productions hollywoodiennes et françaises qui transmettent chaque jour leur savoir-faire sur le terrain.";
  const heroBg =
    content.hero?.bg_image ||
    'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-equipe.jpg';

  React.useEffect(() => {
    getTeam().then(setTeam);
    getFilms().then(setFilms);

    try {
      const supabase = createClient();
      const channel = supabase
        .channel('realtime:site_team_films')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_team' },
          () => {
            getTeam().then(setTeam);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_films' },
          () => {
            getFilms().then(setFilms);
            getTeam().then(setTeam);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
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
              <span className="text-[#FFE500]">L'ÉQUIPE</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                {heroBadge}
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                CASCADEURS DU CINÉMA D'ACTION INTERNATIONAL
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
          </div>
        </section>

        {/* Team Roster Grid with Grand High-Impact Portraits */}
        <section className="py-16">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {team.map((member) => {
                const coachFilms = films.filter(
                  (f) =>
                    (member.film_ids && member.film_ids.includes(f.id)) ||
                    (f.cuc_team_involved && f.cuc_team_involved.includes(member.id))
                );

                return (
                  <div
                    key={member.id}
                    id={member.id}
                    className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500]/70 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden shadow-xl hover:shadow-[0_15px_40px_rgba(255,229,0,0.1)] scroll-mt-32"
                  >
                  {/* Portrait Showcase Stage (Taille compacte optimisée) */}
                  <Link
                    href={`/equipe-cascadeurs-pro/${member.id}`}
                    className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-[#181824] via-[#101016] to-[#0e0e14] overflow-hidden flex items-end justify-center border-b border-zinc-800/80 block cursor-pointer group/img"
                    title={`Voir la fiche détaillée de ${member.name}`}
                  >
                    {/* Ambient Glow on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/15 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Tactical cinematic grid overlay */}
                    <div className="absolute inset-0 cinematic-grid opacity-30 pointer-events-none" />

                    {/* Role Badge - Top Left */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-2.5 py-1 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-[10px] sm:text-[11px] uppercase font-bold tracking-wider shadow-md">
                        {member.role}
                      </span>
                    </div>

                    {/* High-Resolution Full-Stature Portrait */}
                    {member.avatarUrl ? (
                      <div className="relative w-full h-full max-h-[96%] flex items-end justify-center">
                        <Image
                          src={member.avatarUrl}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] group-hover/img:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-7xl text-zinc-800">
                        {member.name.charAt(0)}
                      </div>
                    )}

                    {/* Subtle bottom shadow gradient to blend with card content */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent pointer-events-none" />
                  </Link>

                  {/* Card Content Section */}
                  <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Name & Title */}
                      <div className="mb-3">
                        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                          <Link href={`/equipe-cascadeurs-pro/${member.id}`} className="hover:text-[#FFE500] transition-colors">
                            {member.name}
                          </Link>
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

                        {/* Projets & Tournages Cinéma */}
                        {coachFilms.length > 0 && (
                          <div className="pt-3 border-t border-zinc-800/80">
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5 text-[#FFE500]" />
                                Projets & Tournages Cinéma ({coachFilms.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {coachFilms.slice(0, 3).map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setSelectedFilm(f)}
                                  className="group/thumb relative aspect-[2/3] bg-black border border-zinc-800 hover:border-[#FFE500] overflow-hidden rounded-xs cursor-pointer transition-all text-left"
                                  title={`${f.title} (${f.year}) - Cliquez pour ouvrir la fiche de production`}
                                >
                                  <Image
                                    src={f.image}
                                    alt={f.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover group-hover/thumb:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90" />
                                  <span className="absolute bottom-1 left-1 right-1 text-[8px] font-mono-tech uppercase text-zinc-200 group-hover/thumb:text-[#FFE500] truncate text-center font-bold block">
                                    {f.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button & Links Footer */}
                    <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <Link
                        href={`/equipe-cascadeurs-pro/${member.id}`}
                        className="w-full sm:w-auto flex-grow py-2 px-3 bg-[#14141e] hover:bg-[#FFE500] hover:text-black border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase font-bold text-center transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                      >
                        <span>Voir la fiche complète</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {member.externalUrl && (
                          <a
                            href={member.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                            title="Fiche & Références externes"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {member.instagram && (
                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                            title="Instagram"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* FILMOGRAPHIE & TOURNAGES DE L'ÉQUIPE (Authentique du site CUC) */}
            <div className="mt-20 border-t border-zinc-800 pt-16">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <StuntBadge variant="yellow" icon={<Film className="w-3.5 h-3.5" />}>
                    TOURNAGES & AFFICHES
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

              {/* Grid of All 63 Authentic Posters loaded dynamically from Supabase */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {films.map((film) => (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => setSelectedFilm(film)}
                    className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 transition-all p-2 group flex flex-col justify-between cursor-pointer text-left"
                    title={`${film.title} (${film.year}) - Cliquez pour voir la fiche`}
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-black mb-2">
                      <Image
                        src={film.image}
                        alt={film.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {film.year && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.2 bg-black/80 text-[#FFE500] font-mono-tech text-[9px] font-bold">
                          {film.year}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono-tech uppercase text-zinc-300 group-hover:text-[#FFE500] truncate text-center">
                      {film.title}
                    </p>
                  </button>
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

      {/* Modal Dossier de Production du Film */}
      <FilmDetailsModal
        movie={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </div>
  );
}
