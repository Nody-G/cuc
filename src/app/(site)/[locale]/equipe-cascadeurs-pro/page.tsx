'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getTeam, getFilms } from '@/lib/data/site-service';
import { applyTeamOverlay } from '@/lib/i18n/apply-team-overlay';
import { applyFilmOverlays } from '@/lib/i18n/apply-film-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { createClient } from '@/lib/supabase/client';
import { subscribeTable } from '@/lib/supabase/realtime';
import { Instructor, FilmCredit, parseCredit } from '@/types';
import { CucFilmsShowcase } from '@/components/sections/films/CucFilmsShowcase';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import {
  Users,
  ExternalLink,
  ChevronRight,
  Film,
  Globe,
  ArrowRight,
} from 'lucide-react';

import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { cucField } from '@/lib/preview/cuc-field';

export default function EquipeCascadeursProPage() {
  const [team, setTeam] = React.useState<Instructor[]>(CUC_TEAM);
  const [films, setFilms] = React.useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
  const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);
  const { content } = usePageDynamicContent('equipe-cascadeurs-pro');
  const t = useTranslations('team');

  // Overlays EN des coachs (`site_translations`, entité `team`) : la base FR
  // reste la référence, l'anglais se pose par-dessus dès qu'il est disponible.
  const teamOverlays = useEntityOverlays('team');

  /**
   * Overlays EN des films (entité `film`).
   *
   * Sans eux, le synopsis affiché dans `FilmDetailsModal` restait en français sur
   * les pages anglaises : les 501 traductions de `site_translations` étaient
   * semées mais **jamais appliquées**. Le défaut échappait au crawler parce que
   * le synopsis n'apparaît que dans une modale cliente, hors du HTML initial.
   */
  const filmOverlays = useEntityOverlays('film');

  const heroBadge = content.hero?.badge || t('badge');
  const heroTitle = content.hero?.title || t('title');
  const heroSubtitle = content.hero?.subtitle || t('subtitle');
  const heroBg =
    content.hero?.bg_image ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-equipe.jpg';

  React.useEffect(() => {
    getTeam().then(setTeam);
    getFilms().then(setFilms);

    const supabase = createClient();
    // Canal partagé par client : équipe et films sur le même WebSocket.
    const unsubscribeTeam = subscribeTable(supabase, { table: 'site_team' }, () => {
      getTeam().then(setTeam);
    });
    const unsubscribeFilms = subscribeTable(supabase, { table: 'site_films' }, () => {
      getFilms().then(setFilms);
      getTeam().then(setTeam);
    });

    return () => {
      unsubscribeTeam();
      unsubscribeFilms();
    };
  }, []);

  const displayTeam = React.useMemo(
    () => team.map((m) => applyTeamOverlay(m, teamOverlays?.[m.id])),
    [team, teamOverlays]
  );

  /** Catalogue localisé : la version FR reste la référence, l'EN se pose dessus. */
  const displayFilms = React.useMemo(
    () => applyFilmOverlays(films, filmOverlays),
    [films, filmOverlays]
  );

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28">
        {/* Hero Header */}
        <section className="relative py-20 bg-black border-b border-zinc-800 overflow-hidden">
          <div data-cuc-field="hero.bg_image" data-cuc-kind="image" className="absolute inset-0 z-0">
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

          <div className="relative z-10 page-shell">
            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-4">
              <Link href="/" className="hover:text-[#FFE500] transition-colors">
                {t('breadcrumbHome')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[#FFE500]">{t('breadcrumbCurrent')}</span>
            </div>

            <div className="inline-flex items-center gap-2 mb-4">
              <StuntBadge variant="yellow" icon={<Users className="w-3.5 h-3.5" />}>
                <span {...cucField('hero.badge')}>{heroBadge}</span>
              </StuntBadge>
              <span className="text-xs font-mono-tech text-zinc-400">
                {t('performerTag')}
              </span>
            </div>

            <h1
              {...cucField('hero.title')}
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
              {...cucField('hero.subtitle', 'textarea')}
              className="text-base sm:text-lg text-zinc-300 font-tech max-w-3xl mt-4 leading-relaxed"
            >
              {heroSubtitle}
            </p>
          </div>
        </section>

        {/* Team Roster Grid with Grand High-Impact Portraits */}
        <section className="py-16">
          <div className="page-shell">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {displayTeam.map((member) => {
                const coachFilms = displayFilms.filter(
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
                    {/* Portrait Showcase Stage */}
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

                          {/* Références & Tournages Qualifiés */}
                          {member.notableCredits && member.notableCredits.length > 0 && (
                            <div className="pt-2">
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <strong className="text-[11px] font-mono-tech text-zinc-400 uppercase block">
                                  {t('creditsLabel')}
                                </strong>
                                <span className="text-[10px] font-mono-tech text-zinc-500">
                                  {member.notableCredits.length} {t('creditsUnit')}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {member.notableCredits.slice(0, 4).map((credit, idx) => {
                                  const parsed = parseCredit(credit);
                                  const isCoord = parsed.category === 'coordination';
                                  const isDoublure = parsed.category === 'doublure';

                                  return (
                                    <span
                                      key={idx}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono-tech border rounded-xs ${isCoord
                                        ? 'bg-[#FFE500]/10 text-[#FFE500] border-[#FFE500]/30 font-semibold'
                                        : isDoublure
                                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                                          : 'bg-black/60 text-zinc-300 border-zinc-800'
                                        }`}
                                      title={parsed.role ? `${parsed.title} (${parsed.role})` : parsed.title}
                                    >
                                      <span className="truncate max-w-[130px]">{parsed.title}</span>
                                      {parsed.role && (
                                        <span className="text-[9px] opacity-75 font-normal shrink-0">
                                          [{isCoord ? t('roleCoordination') : isDoublure ? t('roleDouble') : t('roleStunt')}]
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                                {member.notableCredits.length > 4 && (
                                  <span className="text-[10px] font-mono-tech text-[#FFE500] self-center px-1 font-semibold">
                                    {t('othersLabel', { count: member.notableCredits.length - 4 })}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Projets & Tournages Cinéma */}
                          {coachFilms.length > 0 && (
                            <div className="pt-3 border-t border-zinc-800/80">
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="text-[11px] font-mono-tech text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                                  <Film className="w-3.5 h-3.5 text-[#FFE500]" />
                                  {t('projectsLabel')} ({coachFilms.length})
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {coachFilms.slice(0, 3).map((f) => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setSelectedFilm(f)}
                                    className="group/thumb relative aspect-[2/3] bg-black border border-zinc-800 hover:border-[#FFE500] overflow-hidden rounded-xs cursor-pointer transition-all text-left"
                                    title={t('filmCardTitle', { title: f.title, year: f.year })}
                                  >
                                    {f.image ? (
                                      <Image
                                        src={f.image}
                                        alt={f.title}
                                        fill
                                        sizes="80px"
                                        className="object-cover group-hover/thumb:scale-105 transition-transform"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                        <Film className="w-5 h-5 text-zinc-700" />
                                      </div>
                                    )}
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
                          <span>{t('ctaDetail')}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {member.externalUrl && (
                            <a
                              href={member.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-white/5 border border-zinc-800 transition-colors"
                              title={t('externalLinkAria')}
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

            {/* FILMOGRAPHIE & TOURNAGES DE L'ÉQUIPE — composant partagé avec la page TOURNAGE */}
            <CucFilmsShowcase className="mt-20" />

            {/* Bottom Callout */}
            <div className="mt-16 bg-[#121218] border-2 border-zinc-800 p-8 text-center relative">

              <h3 className="text-2xl sm:text-3xl font-display uppercase text-white mb-2">
                {t('ctaBlockTitle')}
              </h3>
              <p className="text-xs font-tech text-zinc-400 max-w-xl mx-auto mb-6">
                {t('ctaBlockBody')}
              </p>
              <Link href="/formation-de-cascadeur">
                <TacticalButton variant="primary" size="md">
                  {t('ctaBlockButton')}
                </TacticalButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal Dossier de Production du Film (interactions des cartes coachs) */}
      <FilmDetailsModal
        movie={selectedFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </div>
  );
}
