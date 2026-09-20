'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getTeam, getFilms } from '@/lib/data/site-service';
import { orderCreditsForDisplay } from '@/lib/credit-notability';
import { normalizeRole } from '@/lib/credit-role';
import { Instructor, FilmCredit, parseCredit, ParsedCredit } from '@/types';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import {
  ChevronRight,
  ShieldCheck,
  Film,
  Award,
  Globe,
  Clapperboard,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle2,
  Filter,
  Maximize2,
} from 'lucide-react';

interface CoachDetailClientProps {
  slug: string;
}

export const CoachDetailClient: React.FC<CoachDetailClientProps> = ({ slug }) => {
  const [allTeam, setAllTeam] = useState<Instructor[]>(CUC_TEAM);
  const [allFilms, setAllFilms] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
  const [selectedFilmModal, setSelectedFilmModal] = useState<FilmCredit | null>(null);

  // Filtres & recherche pour les crédits de tournage
  const [creditFilter, setCreditFilter] = useState<'all' | 'coordination' | 'stunt' | 'doublure'>('all');
  const [creditSearch, setCreditSearch] = useState('');
  const [isCreditsExpanded, setIsCreditsExpanded] = useState(false);

  useEffect(() => {
    getTeam().then((t) => {
      if (t && t.length > 0) setAllTeam(t);
    });
    getFilms().then((f) => {
      if (f && f.length > 0) setAllFilms(f);
    });
  }, []);

  const member = allTeam.find((m) => m.id === slug) || CUC_TEAM.find((m) => m.id === slug);

  // Parsing des crédits de tournage du coach
  const parsedCredits: ParsedCredit[] = useMemo(() => {
    if (!member?.notableCredits) return [];
    return member.notableCredits.map(parseCredit);
  }, [member?.notableCredits]);

  const coordCount = useMemo(
    () => parsedCredits.filter((c) => c.category === 'coordination').length,
    [parsedCredits]
  );
  const doublureCount = useMemo(
    () => parsedCredits.filter((c) => c.category === 'doublure').length,
    [parsedCredits]
  );
  const stuntCount = useMemo(
    () => parsedCredits.filter((c) => c.category !== 'coordination').length,
    [parsedCredits]
  );

  // Ordre d'affichage : les crédits mis en avant dans le Cockpit d'abord,
  // puis les autres par notoriété décroissante du film correspondant.
  const orderedCredits = useMemo(
    () => orderCreditsForDisplay(member?.notableCredits || [], member?.featuredCredits, allFilms),
    [member?.notableCredits, member?.featuredCredits, allFilms]
  );

  const filteredCredits = useMemo(() => {
    return orderedCredits.filter((c) => {
      if (creditFilter === 'coordination' && c.category !== 'coordination') return false;
      if (creditFilter === 'doublure' && c.category !== 'doublure') return false;
      if (creditFilter === 'stunt' && c.category === 'coordination') return false;
      if (creditSearch) {
        const q = creditSearch.toLowerCase();
        return c.title.toLowerCase().includes(q) || (c.role && c.role.toLowerCase().includes(q));
      }
      return true;
    });
  }, [orderedCredits, creditFilter, creditSearch]);

  // Limite d'affichage configurable depuis le Cockpit (défaut : 8).
  const creditsDisplayLimit =
    typeof member?.creditsDisplayLimit === 'number' && member.creditsDisplayLimit > 0
      ? member.creditsDisplayLimit
      : 8;

  const displayedCredits = isCreditsExpanded
    ? filteredCredits
    : filteredCredits.slice(0, creditsDisplayLimit);

  if (!member) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4">
        <Navbar />
        <div className="text-center max-w-md my-auto">
          <h1 className="text-4xl font-display uppercase text-white mb-4">Coach Introuvable</h1>
          <p className="text-sm font-tech text-zinc-400 mb-6">
            Ce membre de l'équipe pédagogique n'existe pas ou a été déplacé.
          </p>
          <Link
            href="/equipe-cascadeurs-pro"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE500] text-black font-mono-tech text-xs uppercase font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'équipe</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Films associés à cet instructeur
  const relatedFilms = allFilms.filter(
    (f) =>
      (member.film_ids && member.film_ids.includes(f.id)) ||
      (f.cuc_team_involved && f.cuc_team_involved.includes(member.id)) ||
      (member.notableCredits &&
        member.notableCredits.some((c) => f.title.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(f.title.toLowerCase())))
  );

  // Fonction pour obtenir le rôle précis du coach sur un film donné.
  // Le libellé brut est systématiquement ramené à un rôle canonique lisible
  // (Coordinateur des cascades · Doublure de X · Cascadeur · Parkour · Câblage).
  const getCoachFilmRole = (film: FilmCredit): { role: string; isCoord: boolean; isDoublure: boolean } => {
    const fromRaw = (raw: string) => {
      const n = normalizeRole(raw);
      return {
        role: n.label,
        isCoord: n.roles.includes('Coordinateur des cascades'),
        isDoublure: n.roles.includes('Doublure'),
      };
    };

    // 1. Rôle direct dans cuc_team_roles du film
    if (film.cuc_team_roles && film.cuc_team_roles[member.id]) {
      return fromRaw(film.cuc_team_roles[member.id]);
    }
    // 2. Rôle dans les metadata du membre
    if (member.metadata?.film_roles && member.metadata.film_roles[film.id]) {
      return fromRaw(member.metadata.film_roles[film.id]);
    }
    // 3. Correspondance dans les crédits parsés
    const matched = parsedCredits.find(
      (c) =>
        c.title.toLowerCase().includes(film.title.toLowerCase()) ||
        film.title.toLowerCase().includes(c.title.toLowerCase())
    );
    if (matched && matched.role) {
      return fromRaw(matched.role);
    }
    // 4. Déduction basée sur le titre principal
    if (member.title.toLowerCase().includes('coordinateur')) {
      return { role: 'Coordinateur des cascades', isCoord: true, isDoublure: false };
    }
    return { role: 'Cascadeur', isCoord: false, isDoublure: false };
  };

  // Autres membres de l'équipe
  const otherMembers = allTeam.filter((m) => m.id !== member.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col selection:bg-[#FFE500] selection:text-black">
      <Navbar />

      <main id="contenu-principal" className="flex-grow pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 mb-8 flex-wrap">
            <Link href="/" className="hover:text-[#FFE500] transition-colors">
              ACCUEIL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/equipe-cascadeurs-pro" className="hover:text-[#FFE500] transition-colors">
              ÉQUIPE PRO
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[#FFE500] uppercase font-bold">{member.name}</span>
          </div>

          {/* Profil Principal — Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
            {/* Colonne Gauche : Grande Photo Portrait Immersive */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-[#0e0e14] border-2 border-zinc-800 relative group overflow-hidden shadow-2xl">
                {/* Stage Portrait plein format */}
                <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[620px] bg-gradient-to-b from-[#181824] via-[#101016] to-[#0a0a0f] overflow-hidden flex items-end justify-center border-b border-zinc-800">
                  {/* Ambient Lighting Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFE500]/20 via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Tactical Grid */}
                  <div className="absolute inset-0 cinematic-grid opacity-35 pointer-events-none" />

                  {/* Badge Rôle - Top Left */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 bg-black/85 backdrop-blur-xs border border-zinc-700 text-[#FFE500] font-mono-tech text-xs uppercase font-bold tracking-wider shadow-lg">
                      {member.role}
                    </span>
                  </div>

                  {/* Photo Haute Définition Pleine Taille */}
                  {member.avatarUrl ? (
                    <div className="relative w-full h-full flex items-end justify-center">
                      <Image
                        src={member.avatarUrl}
                        alt={`Portrait de ${member.name}`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-contain object-bottom drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)]"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-9xl text-zinc-800">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  {/* Dégradé de transition basse */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/70 to-transparent pointer-events-none" />
                </div>

                {/* Liens Officiels & Profils en pied de photo */}
                <div className="p-4 bg-[#0a0a0f] flex items-center justify-between gap-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    {member.imdb && (
                      <a
                        href={member.imdb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#14141e] hover:bg-[#F5C518] hover:text-black border border-zinc-800 hover:border-[#F5C518] text-xs font-mono-tech font-bold uppercase transition-colors"
                        title="Fiche IMDb Officielle"
                      >
                        IMDb
                      </a>
                    )}

                    {member.allocine && (
                      <a
                        href={member.allocine}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#14141e] hover:bg-[#FECC00] hover:text-black border border-zinc-800 hover:border-[#FECC00] text-xs font-mono-tech font-bold uppercase transition-colors"
                        title="Fiche Allociné"
                      >
                        Allociné
                      </a>
                    )}

                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#14141e] hover:bg-white hover:text-black border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-mono-tech font-bold"
                        title="Instagram"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}

                    {member.externalUrl && !member.imdb && (
                      <a
                        href={member.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#14141e] hover:bg-[#FFE500] hover:text-black border border-zinc-800 transition-colors text-xs font-mono-tech font-bold"
                        title="Site officiel ou portfolio"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-wider">
                    STAFF CUC
                  </span>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Informations Détaillées, Trajectoire & Compétences */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <StuntBadge variant="yellow" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                    {member.role}
                  </StuntBadge>
                  <span className="text-xs font-mono-tech text-zinc-400">
                    FACULTÉ PÉDAGOGIQUE DU CUC
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight text-white leading-none mb-3">
                  {member.name}
                </h1>

                <p className="text-base sm:text-lg text-[#FFE500] font-mono-tech uppercase font-bold tracking-wide">
                  {member.title}
                </p>
              </div>

              {/* Biographie Détaillée */}
              <div className="bg-[#0e0e14] border border-zinc-800 p-6 sm:p-8 relative">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400 uppercase tracking-wider mb-4 pb-3 border-b border-zinc-800/80">
                  <Award className="w-4 h-4 text-[#FFE500]" />
                  <span>Trajectoire &amp; Philosophie</span>
                </div>

                <p className="text-sm sm:text-base font-tech text-zinc-200 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </p>
              </div>

              {/* Domaines d'Expertise Tactique */}
              <div>
                <h2 className="text-sm font-mono-tech uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFE500]" />
                  <span>Domaines d'expertise &amp; Disciplines enseignées :</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#12121c] border border-zinc-700 text-xs font-mono-tech text-zinc-200 shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Doublures Acteurs Clés (si existant) */}
              {member.doubledActors && member.doubledActors.length > 0 && (
                <div className="bg-[#14141e] border border-zinc-800 p-5">
                  <h2 className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Acteurs doublés à l&apos;écran :</span>
                  </h2>
                  <p className="text-sm font-tech text-zinc-300">
                    {member.doubledActors.join(' • ')}
                  </p>
                </div>
              )}

              {/* Tournages & Crédits Qualifiés (Coordination vs Cascades) */}
              {parsedCredits.length > 0 && (
                <div className="bg-[#0e0e14] border border-zinc-800 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div>
                      <h2 className="text-xs font-mono-tech text-white uppercase tracking-wider font-bold flex items-center gap-2">
                        <Clapperboard className="w-4 h-4 text-[#FFE500]" />
                        <span>Tournages &amp; Crédits Techniques ({parsedCredits.length})</span>
                      </h2>
                      <p className="text-[11px] font-tech text-zinc-400 mt-0.5">
                        Distinction précise des rôles exercés (Coordination, Cascades physiques, Doublures)
                      </p>
                    </div>

                    {/* Filtres par catégorie */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCreditFilter('all')}
                        className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase font-bold transition rounded-xs cursor-pointer ${creditFilter === 'all'
                          ? 'bg-[#FFE500] text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                      >
                        Tous ({parsedCredits.length})
                      </button>

                      {coordCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCreditFilter('coordination')}
                          className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase font-bold transition rounded-xs cursor-pointer flex items-center gap-1 ${creditFilter === 'coordination'
                            ? 'bg-[#FFE500] text-black font-extrabold'
                            : 'bg-zinc-900 text-[#FFE500] hover:bg-[#FFE500]/10 border border-[#FFE500]/30'
                            }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Coordination ({coordCount})</span>
                        </button>
                      )}

                      {stuntCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCreditFilter('stunt')}
                          className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase font-bold transition rounded-xs cursor-pointer flex items-center gap-1 ${creditFilter === 'stunt'
                            ? 'bg-zinc-200 text-black font-extrabold'
                            : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                            }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>Cascades ({stuntCount})</span>
                        </button>
                      )}

                      {doublureCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCreditFilter('doublure')}
                          className={`px-2.5 py-1 text-[10px] font-mono-tech uppercase font-bold transition rounded-xs cursor-pointer flex items-center gap-1 ${creditFilter === 'doublure'
                            ? 'bg-sky-400 text-black font-extrabold'
                            : 'bg-zinc-900 text-sky-300 hover:bg-sky-500/10 border border-sky-500/30'
                            }`}
                        >
                          <Users className="w-3 h-3" />
                          <span>Doublures ({doublureCount})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Champ de recherche si plus de 6 crédits */}
                  {parsedCredits.length > 6 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filtrer les films ou rôles de ce formateur..."
                        value={creditSearch}
                        onChange={(e) => setCreditSearch(e.target.value)}
                        className="w-full bg-black/60 border border-zinc-800 rounded-xs pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>
                  )}

                  {/* Grille des crédits précis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {displayedCredits.map((credit, cIdx) => {
                      const isCoord = credit.category === 'coordination';
                      const isDoublure = credit.category === 'doublure';

                      return (
                        <div
                          key={cIdx}
                          className={`p-2.5 bg-black/60 border rounded-xs flex flex-col justify-between transition-colors ${isCoord
                            ? 'border-[#FFE500]/40 hover:border-[#FFE500]'
                            : isDoublure
                              ? 'border-sky-500/40 hover:border-sky-400'
                              : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-display uppercase text-sm text-white tracking-wide">
                              {credit.title}
                            </span>
                            {credit.year && (
                              <span className="text-[10px] font-mono-tech text-zinc-500 shrink-0">
                                {credit.year}
                              </span>
                            )}
                          </div>

                          <div>
                            {isCoord ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/40 text-[10px] font-mono-tech font-bold uppercase rounded-xs">
                                <ShieldCheck className="w-3 h-3 shrink-0" />
                                <span>{credit.role || 'Coordinateur des cascades'}</span>
                              </span>
                            ) : isDoublure ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-mono-tech font-bold uppercase rounded-xs">
                                <Users className="w-3 h-3 shrink-0" />
                                <span>{credit.role || 'Doublure'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/80 text-zinc-300 border border-zinc-700 text-[10px] font-mono-tech uppercase rounded-xs">
                                <Award className="w-3 h-3 shrink-0 text-zinc-400" />
                                <span>{credit.role || 'Cascadeur'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bouton pour afficher l'ensemble des crédits */}
                  {filteredCredits.length > 8 && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setIsCreditsExpanded(!isCreditsExpanded)}
                        className="px-4 py-2 bg-zinc-900 hover:bg-[#FFE500] hover:text-black border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>
                          {isCreditsExpanded
                            ? 'Réduire la liste'
                            : `Afficher tous les crédits (${filteredCredits.length})`}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${isCreditsExpanded ? '-rotate-90' : 'rotate-90'
                            }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Call to Action Direct */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/contact-cuc" className="w-full sm:w-auto flex-1">
                  <TacticalButton variant="primary" size="lg" className="w-full justify-center">
                    Solliciter ce régleur pour une production
                  </TacticalButton>
                </Link>

                <Link href="/formation-de-cascadeur" className="w-full sm:w-auto flex-1">
                  <TacticalButton variant="secondary" size="lg" className="w-full justify-center">
                    S'entraîner au Campus avec l'équipe
                  </TacticalButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Section Filmographie & Tournages Associés (Affiches & Rôles Spécifiques) */}
          {relatedFilms.length > 0 && (
            <div className="mb-20 pt-12 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                    <Film className="w-4 h-4" />
                    <span>FILMOGRAPHIE &amp; PRODUCTIONS CINÉMA</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                    Cascades &amp; Tournages de {member.name}
                  </h2>
                  <p className="text-xs font-tech text-zinc-400 mt-1">
                    Cliquez sur une production pour afficher la fiche complète, vidéos et cascadeurs impliqués.
                  </p>
                </div>
                <span className="text-xs font-mono-tech text-zinc-400">
                  {relatedFilms.length} production{relatedFilms.length > 1 ? 's' : ''} répertoriée{relatedFilms.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedFilms.map((film) => {
                  const { role, isCoord, isDoublure } = getCoachFilmRole(film);

                  return (
                    <div
                      key={film.id}
                      onClick={() => setSelectedFilmModal(film)}
                      className="bg-[#0e0e14] border-2 border-zinc-800 hover:border-[#FFE500] transition-all flex flex-col justify-between group overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(255,229,0,0.1)]"
                      title={`Cliquez pour voir les détails de ${film.title}`}
                    >
                      <div>
                        {/* Affiche du film */}
                        <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                          {film.image ? (
                            <Image
                              src={film.image}
                              alt={film.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
                              <Film className="w-10 h-10 text-zinc-700" />
                              <span className="text-[10px] font-mono-tech uppercase tracking-wider text-zinc-600 px-4 text-center">
                                {film.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent opacity-90" />

                          {/* Année */}
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/85 backdrop-blur-xs text-[10px] font-mono-tech text-[#FFE500] border border-zinc-800 font-bold shadow-md">
                            {film.year}
                          </span>

                          {/* Hover action icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                            <span className="px-3 py-1.5 bg-[#FFE500] text-black font-mono-tech text-xs uppercase font-bold flex items-center gap-1.5 shadow-xl">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Fiche film</span>
                            </span>
                          </div>
                        </div>

                        {/* Informations & Rôle spécifique */}
                        <div className="p-4 space-y-3">
                          {/* RÔLE DU COACH SUR CE FILM */}
                          <div>
                            <span className="text-[9px] font-mono-tech text-zinc-500 uppercase block mb-1">
                              Rôle sur cette production :
                            </span>
                            {isCoord ? (
                              <div className="px-2.5 py-1 bg-[#FFE500]/15 border border-[#FFE500]/50 text-[#FFE500] text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{role}</span>
                              </div>
                            ) : isDoublure ? (
                              <div className="px-2.5 py-1 bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs">
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{role}</span>
                              </div>
                            ) : (
                              <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tech font-semibold uppercase flex items-center gap-1.5 rounded-xs">
                                <Award className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                <span className="truncate">{role}</span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-display uppercase text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                            {film.title}
                          </h3>

                          {film.stuntRoles && (
                            <p className="text-xs font-tech text-zinc-400 line-clamp-2 leading-relaxed">
                              {film.stuntRoles}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-zinc-800/80 mt-2 flex items-center justify-between text-[10px] font-mono-tech text-zinc-500">
                        <span>{film.director ? `Réal. ${film.director}` : 'Production'}</span>
                        <span className="text-[#FFE500] group-hover:underline">Détails →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Découvrir les autres formateurs du Campus */}
          <div className="pt-12 border-t border-zinc-800">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold block mb-1">
                  FACULTÉ DU CAMPUS
                </span>
                <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                  Autres Coordinateurs &amp; Instructeurs
                </h2>
              </div>

              <Link
                href="/equipe-cascadeurs-pro"
                className="text-xs font-mono-tech text-zinc-400 hover:text-[#FFE500] flex items-center gap-1.5 transition-colors group"
              >
                <span>Voir toute l'équipe</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherMembers.map((other) => (
                <Link
                  key={other.id}
                  href={`/equipe-cascadeurs-pro/${other.id}`}
                  className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-4 group transition-all flex flex-col justify-between"
                >
                  <div className="relative w-full h-44 bg-gradient-to-b from-[#181824] to-[#0e0e14] overflow-hidden flex items-end justify-center mb-3">
                    {other.avatarUrl ? (
                      <Image
                        src={other.avatarUrl}
                        alt={other.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl font-display text-zinc-700">{other.name.charAt(0)}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold block">
                      {other.role}
                    </span>
                    <h3 className="text-base font-display uppercase text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                      {other.name}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-tech text-zinc-500">
                    <span>Fiche complète</span>
                    <ArrowRight className="w-3 h-3 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bouton Retour */}
          <div className="mt-16 text-center">
            <Link
              href="/equipe-cascadeurs-pro"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#121218] hover:bg-[#FFE500] hover:text-black border border-zinc-800 hover:border-[#FFE500] text-xs font-mono-tech uppercase font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à toute l'équipe pédagogique</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Modale d'informations de film quand on clique sur une affiche */}
      {selectedFilmModal && (
        <FilmDetailsModal
          movie={selectedFilmModal}
          onClose={() => setSelectedFilmModal(null)}
        />
      )}

      <Footer />
    </div>
  );
};
