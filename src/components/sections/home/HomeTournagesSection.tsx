'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import { Film, Clapperboard, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';
import { getFilms } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { creditTitleKey } from '@/lib/credit-title';
import { summarizeFilmRoleSet } from '@/lib/credit-role';
import { renderRoleSet } from '@/lib/i18n/role-labels';
import { FilmPosterCard } from '@/components/sections/films/FilmPosterCard';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import { FilmCredit } from '@/types';

interface HighlightProject {
  title: string;
  year: string;
  poster: string;
}

/**
 * Données éditables du bloc « tournages » (page Accueil).
 * Toutes les clés sont optionnelles : en leur absence, les valeurs
 * certifiées ci-dessous sont utilisées (zéro régression).
 */
export interface HomeTournagesData {
  badge?: string;
  title?: string;
  subtitle?: string;
  team_tag?: string;
  cta_text?: string;
  cta_link?: string;
  cta_production?: string;
  cta_catalog?: string;
  pillar1_title?: string;
  pillar1_desc?: string;
  pillar2_title?: string;
  pillar2_desc?: string;
  pillar3_title?: string;
  pillar3_desc?: string;
}

export interface HomeVirtualTourData {
  badge?: string;
  title?: string;
  subtitle?: string;
  tag?: string;
  cta_text?: string;
  cta_link?: string;
  installations_cta?: string;
  hud_title?: string;
  hud_hint?: string;
  image_url?: string;
}

interface HomeTournagesSectionProps {
  tournagesData?: HomeTournagesData;
}

/**
 * Sélection éditoriale de longs métrages — vérifiés comme tels (typologie
 * IMDb `movie`, cf. `metadata.title_type` en base). La seule distinction
 * autorisée est reprise ici : aucune étiquette marketing.
 *
 * Source de vérité des affiches : `site_films` (résolution par titre
 * normalisé `creditTitleKey`). La jaquette IMDb ci-dessous n'est qu'un
 * dernier recours d'AFFICHAGE pour une sélection éditoriale pas encore
 * cataloguée — la navigation de repli reste le catalogue complet.
 *
 * Doctrine i18n : titres et années sont des données (noms propres, aucune
 * traduction) ; les rôles d'intervention par production vivent dans
 * `home.tournages.actorRoles` (alignés par index, cf. `FEATURED_PRODUCTIONS`).
 */
const FEATURED_PRODUCTIONS: HighlightProject[] = [
  {
    title: 'Le Comte de Monte-Cristo',
    year: '2024',
    poster: 'https://m.media-amazon.com/images/M/MV5BZWI4NTlhM2UtZmMxZS00ZTg0LThmNTEtYjM3MTEyYTU4NGRmXkEyXkFqcGc@._V1_.jpg',
  },
  {
    title: 'John Wick : Chapitre 4',
    year: '2023',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDI3OWNiMGItZmVkMS00Mjg3LWJhNzUtNDViMWU3OTJiODAyXkEyXkFqcGc@._V1_.jpg',
  },
  {
    title: 'The Substance',
    year: '2024',
    poster: 'https://m.media-amazon.com/images/M/MV5BZDQ1NGE5MGMtYzdlZC00ODExLWJlMDMtNWU4NjA5OWYwMDEwXkEyXkFqcGc@._V1_.jpg',
  },
  {
    title: "L'Amour Ouf",
    year: '2024',
    poster: 'https://m.media-amazon.com/images/M/MV5BNjY0NGU4NDMtYWI2ZS00NDE2LWE5MzUtM2UyODUyNmFmN2ZhXkEyXkFqcGc@._V1_.jpg',
  },
];

export const HomeTournagesSection: React.FC<HomeTournagesSectionProps> = ({
  tournagesData,
}) => {
  const t = useTranslations('home.tournages');
  /** Namespace `team` : il porte déjà les libellés de rôle traduits (FR/EN). */
  const tTeam = useTranslations('team');

  const badge = tournagesData?.badge || t('badge');
  const title = tournagesData?.title || t('title');
  const subtitle = tournagesData?.subtitle || t('subtitle');
  const ctaText = tournagesData?.cta_text || t('cta');
  const ctaLink = tournagesData?.cta_link || '/cuc-team-cascadeur';
  const teamTag = tournagesData?.team_tag || t('teamTag');
  const ctaProduction = tournagesData?.cta_production || t('ctaProduction');
  const ctaCatalog = tournagesData?.cta_catalog || t('ctaCatalog');
  const pillar1Title = tournagesData?.pillar1_title || t('pillar1Title');
  const pillar1Desc = tournagesData?.pillar1_desc || t('pillar1Desc');
  const pillar2Title = tournagesData?.pillar2_title || t('pillar2Title');
  const pillar2Desc = tournagesData?.pillar2_desc || t('pillar2Desc');
  const pillar3Title = tournagesData?.pillar3_title || t('pillar3Title');
  const pillar3Desc = tournagesData?.pillar3_desc || t('pillar3Desc');

  /**
   * Catalogue live des films (`site_films`) : les affiches éditoriales de la
   * section sont résolues par titre normalisé dans le catalogue — mêmes
   * données, même modale et même navigation que « LES FILMS DOUBLÉS &
   * COORDONNÉS PAR LE CUC ».
   */
  const [films, setFilms] = React.useState<FilmCredit[]>([]);
  const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);

  const loadFilms = React.useCallback(() => {
    getFilms().then(setFilms);
  }, []);

  React.useEffect(() => {
    loadFilms();
  }, [loadFilms]);

  // Synchronisation Realtime Cockpit → Vitrine (catalogue des films).
  useRealtimeRefresh(['site_films'], loadFilms);

  const filmsByTitle = React.useMemo(
    () => new Map(films.map((f) => [creditTitleKey(f.title), f])),
    [films]
  );

  /**
   * Légende d'une jaquette : synthèse des rôles **réellement enregistrés** pour
   * cette production (`metadata.cuc_team_roles`). Les libellés écrits en dur
   * (« Cascadeurs CUC (tournage Paris) », « Équipe cascades CUC ») sont retirés :
   * une auto-référence au campus n'est pas un rôle. Sans rôle en base, aucune
   * légende n'est affichée — une affirmation fausse serait pire qu'une absence.
   */
  const captionFor = (film?: FilmCredit): string | undefined => {
    if (!film?.cuc_team_roles) return undefined;
    const label = renderRoleSet(summarizeFilmRoleSet(film.cuc_team_roles), tTeam);
    return label === '' ? undefined : label;
  };

  return (
    <StudioParallaxScene className="py-24 sm:py-28 bg-[#08080c] border-b border-zinc-800/80 relative overflow-hidden">
      {/* Cinematic Golden Ambience Beam */}
      <StudioParallaxLayer
        speed={-0.2}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52rem] h-[52rem] rounded-full bg-[radial-gradient(circle,_rgba(255,229,0,0.05)_0%,_transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="page-shell relative z-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                data-cuc-field="sections_data.tournages.badge"
                className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider flex items-center gap-1.5"
              >
                <Clapperboard className="w-3.5 h-3.5" />
                {badge}
              </span>
              <span
                data-cuc-field="sections_data.tournages.team_tag"
                className="text-xs font-mono-tech text-zinc-500 hidden sm:inline"
              >
                {teamTag}
              </span>
            </div>

            <h2
              data-cuc-field="sections_data.tournages.title"
              className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white leading-tight max-w-3xl"
            >
              {title}
            </h2>

            <p
              data-cuc-field="sections_data.tournages.subtitle"
              className="text-sm sm:text-base font-tech text-zinc-300 leading-relaxed max-w-3xl"
            >
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link href={ctaLink} data-cuc-field="sections_data.tournages.cta_text">
              <TacticalButton variant="primary" size="md" icon={<ChevronRight className="w-4 h-4" />}>
                {ctaText}
              </TacticalButton>
            </Link>
          </div>
        </div>

        {/* Studio Card with 3 Pillars & Production Poster Showcase */}
        <StudioParallaxCard maxTilt={2}>
          <div className="bg-[#0e0e14]/95 backdrop-blur-md border border-[#FFE500]/50 p-6 sm:p-10 relative shadow-[0_0_40px_rgba(255,229,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: 3 Pillars */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <Film className="w-3.5 h-3.5" />
                    <span data-cuc-field="sections_data.tournages.pillar1_title">
                      {pillar1Title}
                    </span>
                  </div>
                  <p
                    data-cuc-field="sections_data.tournages.pillar1_desc"
                    className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillar1Desc}
                  </p>
                </div>

                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span data-cuc-field="sections_data.tournages.pillar2_title">
                      {pillar2Title}
                    </span>
                  </div>
                  <p
                    data-cuc-field="sections_data.tournages.pillar2_desc"
                    className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillar2Desc}
                  </p>
                </div>

                <div className="p-4 bg-[#14141c] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span data-cuc-field="sections_data.tournages.pillar3_title">
                      {pillar3Title}
                    </span>
                  </div>
                  <p
                    data-cuc-field="sections_data.tournages.pillar3_desc"
                    className="text-xs sm:text-sm font-tech text-zinc-300 leading-relaxed"
                  >
                    {pillar3Desc}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link href="/contact-cuc?demande=tournage-production">
                    <TacticalButton variant="primary" size="md">
                      <span data-cuc-field="sections_data.tournages.cta_production">
                        {ctaProduction}
                      </span>
                    </TacticalButton>
                  </Link>
                  <Link href="/cuc-team-cascadeur#filmographie">
                    <span className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] transition-colors flex items-center gap-1">
                      <span data-cuc-field="sections_data.tournages.cta_catalog">
                        {ctaCatalog}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </div>

              {/*
                * Right Column: Mini Showcase of Featured Production Posters.
                * Jaquettes canoniques `FilmPosterCard` : présentation et
                * navigation IDENTIQUES au showcase « LES FILMS DOUBLÉS &
                * COORDONNÉS PAR LE CUC » (affiche 2/3, badge d'année, clic →
                * fiche détaillée). Repli vers le catalogue si la production
                * n'a pas encore de fiche.
                */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {FEATURED_PRODUCTIONS.map((prod, idx) => {
                    const match = filmsByTitle.get(creditTitleKey(prod.title));
                    return (
                      <FilmPosterCard
                        key={match?.id ?? `home-${prod.title}`}
                        film={
                          match ?? {
                            id: `home-${idx}`,
                            title: prod.title,
                            year: prod.year,
                            image: prod.poster,
                          }
                        }
                        sizes="(max-width: 1024px) 50vw, 20vw"
                        caption={captionFor(match)}
                        onOpen={match ? () => setSelectedFilm(match) : undefined}
                        href={match ? undefined : '/cuc-team-cascadeur#filmographie'}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </StudioParallaxCard>
      </div>

      {/* Fiche détaillée — même modale que le showcase des films. */}
      <FilmDetailsModal movie={selectedFilm} onClose={() => setSelectedFilm(null)} />
    </StudioParallaxScene>
  );
};
