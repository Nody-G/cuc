'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import { CoachFilmography } from './coach-detail/CoachFilmography';
import { CoachNotFound } from './coach-detail/CoachNotFound';
import { CoachOtherMembers } from './coach-detail/CoachOtherMembers';
import { CoachPortrait } from './coach-detail/CoachPortrait';
import { CoachProfile } from './coach-detail/CoachProfile';
import { createCoachFilmRoleResolver } from './coach-detail/coach-films';
import { useCoachDetailData } from './coach-detail/useCoachDetailData';

interface CoachDetailClientProps {
  slug: string;
  /**
   * Overlays EN des coachs, résolus côté serveur (`site_translations`,
   * entité `team`). Le français reste la base : un overlay absent laisse la
   * fiche FR intacte.
   */
  teamOverlays?: Record<string, Record<string, unknown>>;
}

/**
 * Fiche coach (vitrine) — façade de composition (`AGENTS.md` § 1).
 *
 * Données (équipe + films, repli statique puis serveur, Realtime, appariement
 * des crédits au catalogue, mise en avant et tri) dans `useCoachDetailData` ;
 * résolution des rôles par film dans `coach-films.ts` ; le rendu est réparti
 * dans `coach-detail/**` (portrait, profil, filmographie, autres formateurs).
 */
export const CoachDetailClient: React.FC<CoachDetailClientProps> = ({
  slug,
  teamOverlays,
}) => {
  const tt = useTranslations('team');
  const tf = useTranslations('films');
  /** Chrome commun : fil d'Ariane et intitulés de sections transverses. */
  const chrome = useTranslations('commonChrome');

  const data = useCoachDetailData({ slug, teamOverlays });

  // Garde d'affichage placée APRÈS tous les hooks : les règles des hooks
  // imposent un nombre d'appels constant entre les rendus.
  if (!data.member) {
    return <CoachNotFound tt={tt} />;
  }

  const member = data.member;
  const getFilmRole = createCoachFilmRoleResolver({
    member,
    parsedCredits: data.parsedCredits,
    tt,
  });

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28 pb-20">
        <div className="page-shell">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              {chrome('breadcrumbHome')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/equipe-cascadeurs-pro" className="hover:text-[#FFE500] transition-colors">
              {tt('breadcrumb')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500] uppercase font-bold">{member.name}</span>
          </div>

          {/* Profil Principal — Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
            {/* Colonne Gauche : Grande Photo Portrait Immersive */}
            <CoachPortrait member={member} tt={tt} />

            {/* Colonne Droite : Informations Détaillées, Trajectoire & Compétences */}
            <CoachProfile member={member} chrome={chrome} tt={tt} />
          </div>

          {/* Section Filmographie & Tournages Associés (Affiches & Rôles Spécifiques) */}
          {data.relatedFilms.length > 0 && (
            <CoachFilmography
              member={member}
              relatedFilms={data.relatedFilms}
              sortedFilms={data.sortedFilms}
              filmSort={data.filmSort}
              onFilmSortChange={data.setFilmSort}
              getFilmRole={getFilmRole}
              featuredOrder={data.featuredOrder}
              tt={tt}
              tf={tf}
              onSelectFilm={data.setSelectedFilmModal}
            />
          )}

          {/* Découvrir les autres formateurs du Campus */}
          <CoachOtherMembers members={data.otherMembers} chrome={chrome} tt={tt} />

          {/* Bouton Retour */}
          <div className="mt-16 text-center">
            <Link
              href="/equipe-cascadeurs-pro"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#121218] hover:bg-[#FFE500] hover:text-black border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{tt('backToTeam')}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Modale d'informations de film quand on clique sur une affiche */}
      {data.selectedFilmModal && (
        <FilmDetailsModal
          movie={data.selectedFilmModal}
          onClose={() => data.setSelectedFilmModal(null)}
        />
      )}

      <Footer />
    </div>
  );
};
