'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Film,
  Shield,
  Layers,
  Image as ImageIcon,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Search,
  X,
  Check,
  PlusCircle,
} from 'lucide-react';
import { InstagramLogo, ImdbLogo } from '@/components/ui/BrandLogos';
import { Instructor, FilmCredit, Discipline, parseCredit } from '@/types';
import { creditTitleKey } from '@/lib/credit-title';
import { upsertTeamMember, deleteTeamMember, upsertFilm } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface TeamViewProps {
  team: Instructor[];
  setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
  films?: FilmCredit[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
}

/** Rôles canoniques proposés pour un crédit film. */
const ROLE_OPTIONS = [
  'Cascadeur',
  'Doublure',
  'Coordinateur des cascades',
] as const;

type CanonicalRoleOption = (typeof ROLE_OPTIONS)[number];

/** Construit la chaîne "Titre — Rôle" persistée dans notable_credits. */
function buildCreditString(title: string, role: string): string {
  const cleanTitle = title.trim();
  const cleanRole = role.trim();
  if (!cleanTitle) return '';
  return cleanRole ? `${cleanTitle} — ${cleanRole}` : cleanTitle;
}

/** Extrait le rôle d'une chaîne "Titre — Rôle" (ou "Titre - Rôle"). */
function extractRoleFromCredit(raw: string): string {
  const parts = raw.split(/\s+[—–-]\s+/);
  if (parts.length < 2) return '';
  return parts.slice(1).join(' — ').trim();
}

export const TeamView: React.FC<TeamViewProps> = ({
  team,
  setTeam,
  films = [],
  disciplines = [],
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [editingMember, setEditingMember] = useState<Instructor | null>(null);
  const [showMediaPickerTeam, setShowMediaPickerTeam] = useState(false);
  /**
   * Recherche du catalogue pour AJOUTER un crédit au formateur.
   * Vide = aucun résultat affiché (on ne noie pas l'écran sous 700 films).
   */
  const [creditSearch, setCreditSearch] = useState('');

  /**
   * Formulaire de création d'une fiche film manquante au catalogue.
   * `null` = fermé. Sinon contient le titre pré-rempli depuis la recherche.
   */
  const [newFilmDraft, setNewFilmDraft] = useState<{
    title: string;
    year: string;
    category: FilmCredit['category'];
  } | null>(null);

  /** Tri de la liste « Tous les crédits » : par date (défaut) ou par nom. */
  const [creditSort, setCreditSort] = useState<'date' | 'name'>('date');

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const updated: Instructor = {
      ...editingMember,
      specialties: Array.isArray(editingMember.specialties)
        ? editingMember.specialties
        : typeof (editingMember as any).specialties === 'string'
          ? (editingMember as any).specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      doubledActors: Array.isArray(editingMember.doubledActors)
        ? editingMember.doubledActors
        : typeof (editingMember as any).doubledActors === 'string'
          ? (editingMember as any).doubledActors.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      notableCredits: Array.isArray(editingMember.notableCredits)
        ? editingMember.notableCredits
        : typeof (editingMember as any).notableCredits === 'string'
          ? (editingMember as any).notableCredits.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
      featuredCredits: Array.isArray(editingMember.featuredCredits)
        ? editingMember.featuredCredits
        : [],
      creditsDisplayLimit:
        typeof editingMember.creditsDisplayLimit === 'number' && editingMember.creditsDisplayLimit > 0
          ? editingMember.creditsDisplayLimit
          : 8,
    };

    setTeam((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      if (exists) return prev.map((m) => (m.id === updated.id ? updated : m));
      return [...prev, updated];
    });
    setEditingMember(null);
    showToast(`Formateur "${updated.name}" enregistré.`);

    startTransition(async () => {
      await upsertTeamMember({
        id: updated.id,
        name: updated.name,
        role: updated.role,
        title: updated.title,
        avatar_url: updated.avatarUrl,
        bio: updated.bio,
        specialties: updated.specialties,
        doubled_actors: updated.doubledActors,
        notable_credits: updated.notableCredits,
        featured_credits: updated.featuredCredits,
        credits_display_limit: updated.creditsDisplayLimit,
        instagram: updated.instagram,
        imdb: updated.imdb,
        external_url: updated.externalUrl,
        profile_id: updated.profile_id,
        metadata: updated.metadata,
      });
    });
  };

  const handleDeleteTeamMember = (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le formateur "${name}" ?`)) return;

    setTeam((prev) => prev.filter((m) => m.id !== id));
    showToast(`Formateur "${name}" supprimé.`);

    startTransition(async () => {
      await deleteTeamMember(id);
    });
  };

  /* ------------------------------------------------------------------ */
  /* Gestion unifiée des crédits film du formateur en cours d'édition    */
  /* ------------------------------------------------------------------ */

  /**
   * Clé canonique d'un crédit : le titre du film, normalisé (minuscules,
   * espaces compactés). C'est la SEULE clé utilisée pour relier
   * `notable_credits` et `featured_credits`, ce qui évite toute
   * désynchronisation lorsque le rôle change.
   */
  /**
   * Clé canonique d'un titre — déléguée au helper partagé `creditTitleKey`.
   * Elle retire notamment le suffixe d'année « (2021) » : sans cela, les
   * crédits du formateur (« Lupin (2021) ») ne correspondaient jamais aux
   * titres nus du catalogue (« Lupin »), rendant la mise en avant inopérante.
   */
  const creditKey = (title: string) => creditTitleKey(title);

  /**
   * Index des crédits du formateur, dérivé de `notableCredits`.
   * `raw` = chaîne persistée "Titre — Rôle" (ou "Titre"), `title` = titre
   * affiché, `role` = rôle courant.
   */
  const creditIndex = useMemo(() => {
    const map = new Map<string, { raw: string; title: string; role: string }>();
    (editingMember?.notableCredits || []).forEach((raw) => {
      const parsed = parseCredit(raw);
      const title = (parsed.title || raw).trim();
      if (!title) return;
      map.set(creditKey(title), {
        raw,
        title,
        role: parsed.role || extractRoleFromCredit(raw),
      });
    });
    return map;
  }, [editingMember?.notableCredits]);

  /**
   * Ensemble des titres mis en avant (clé = titre normalisé).
   * On résout chaque entrée de `featured_credits` via `parseCredit` pour
   * ne comparer que des titres — jamais des chaînes "Titre — Rôle".
   */
  const featuredSet = useMemo(
    () =>
      new Set(
        (editingMember?.featuredCredits || [])
          .map((c) => parseCredit(c).title || c)
          .map((t) => creditKey(t))
          .filter(Boolean)
      ),
    [editingMember?.featuredCredits]
  );

  /**
   * Résultats de recherche du catalogue pour AJOUTER un crédit.
   * On n'affiche rien tant que la recherche est vide (le catalogue compte
   * plusieurs centaines de films) ; on plafonne à 40 résultats.
   */
  const searchResults = useMemo(() => {
    const q = creditSearch.trim().toLowerCase();
    if (!q) return [];
    return films
      .filter((f) => f.title.toLowerCase().includes(q))
      .sort((a, b) => {
        const ya = parseInt(String(a.year), 10) || 0;
        const yb = parseInt(String(b.year), 10) || 0;
        return yb - ya;
      })
      .slice(0, 40);
  }, [films, creditSearch]);

  /** Ensemble des clés de titres présents dans le catalogue. */
  const catalogueKeys = useMemo(
    () => new Set(films.map((f) => creditKey(f.title))),
    [films]
  );

  /**
   * SOURCE UNIQUE DE VÉRITÉ : la totalité des crédits du formateur.
   *
   * Contient *tous* les `notableCredits`, qu'ils soient présents au catalogue
   * ou non. C'est ce qui manquait auparavant : un crédit présent au catalogue
   * mais non étoilé n'apparaissait nulle part.
   *
   * Chaque entrée expose : le libellé brut, le titre, le rôle, la clé
   * normalisée, et un drapeau `inCatalogue`.
   */
  const allCredits = useMemo(() => {
    const filmByKey = new Map(films.map((f) => [creditKey(f.title), f]));
    return (editingMember?.notableCredits || [])
      .map((raw) => {
        const parsed = parseCredit(raw);
        const title = (parsed.title || raw).trim();
        const key = creditKey(title);
        const film = filmByKey.get(key);
        // Année : priorité au catalogue, sinon extraite du titre « Titre (2021) ».
        const yearFromTitle = title.match(/\((\d{4})(?:\s*[-–—]\s*\d{4})?\)\s*$/)?.[1];
        const year = film?.year ? String(film.year) : yearFromTitle || '';
        return {
          raw,
          title: title.replace(/\s*\(\s*\d{4}\s*(?:[-–—]\s*\d{4}\s*)?\)\s*$/, '').trim() || title,
          role: parsed.role || extractRoleFromCredit(raw),
          key,
          year,
          inCatalogue: catalogueKeys.has(key),
        };
      })
      .filter((e) => e.key);
  }, [editingMember?.notableCredits, catalogueKeys, films]);

  /**
   * Tri de la liste « Tous les crédits » : par date (année décroissante) ou
   * par nom (alphabétique). Les crédits sans année sont relégués en fin de
   * tri par date.
   */
  const allCreditsSorted = useMemo(() => {
    const list = [...allCredits];
    if (creditSort === 'name') {
      return list.sort((a, b) =>
        a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' })
      );
    }
    return list.sort((a, b) => {
      const ya = parseInt(a.year, 10) || 0;
      const yb = parseInt(b.year, 10) || 0;
      if (yb !== ya) return yb - ya;
      return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
    });
  }, [allCredits, creditSort]);

  /**
   * Liste unifiée : les crédits mis en avant d'abord (dans l'ordre choisi),
   * puis les autres crédits du formateur. Sert de source unique d'affichage
   * pour éviter la confusion entre "catalogue" et "crédits".
   */
  const featuredCreditsOrdered = useMemo(() => {
    const list = editingMember?.featuredCredits || [];
    return list
      .map((raw, idx) => {
        const parsed = parseCredit(raw);
        const title = (parsed.title || raw).trim();
        return { raw, title, key: creditKey(title), rank: idx };
      })
      .filter((e) => e.key);
  }, [editingMember?.featuredCredits]);

  /**
   * CATALOGUE : uniquement les films mis en avant, dans l'ordre choisi.
   * C'est cette liste — et elle seule — qui pilote l'ordre d'affichage
   * en tête de la fiche publique.
   */
  const catalogueFilms = useMemo(() => {
    const byKey = new Map(films.map((f) => [creditKey(f.title), f]));
    return featuredCreditsOrdered
      .map((entry) => {
        const film = byKey.get(entry.key);
        return film ? { entry, film } : null;
      })
      .filter(
        (x): x is { entry: (typeof featuredCreditsOrdered)[number]; film: FilmCredit } =>
          Boolean(x)
      );
  }, [films, featuredCreditsOrdered]);

  /** Ajoute ou retire un film du catalogue comme crédit du formateur. */
  const toggleFilmCredit = (film: FilmCredit) => {
    if (!editingMember) return;
    const key = creditKey(film.title);
    const existing = creditIndex.get(key);
    const currentCredits = editingMember.notableCredits || [];
    const currentFeatured = editingMember.featuredCredits || [];

    if (existing) {
      // Retrait : on purge aussi la mise en avant correspondante (par titre).
      setEditingMember({
        ...editingMember,
        notableCredits: currentCredits.filter((c) => c !== existing.raw),
        featuredCredits: currentFeatured.filter(
          (c) => creditKey(parseCredit(c).title || c) !== key
        ),
      });
      return;
    }

    const raw = buildCreditString(film.title, 'Cascadeur');
    setEditingMember({
      ...editingMember,
      notableCredits: [...currentCredits, raw],
    });
  };

  /** Change le rôle d'un crédit existant (reconstruit la chaîne). */
  const setCreditRole = (filmTitle: string, role: string) => {
    if (!editingMember) return;
    const key = creditKey(filmTitle);
    const existing = creditIndex.get(key);
    if (!existing) return;

    const nextRaw = buildCreditString(existing.title, role);
    const currentCredits = editingMember.notableCredits || [];
    const currentFeatured = editingMember.featuredCredits || [];

    setEditingMember({
      ...editingMember,
      notableCredits: currentCredits.map((c) => (c === existing.raw ? nextRaw : c)),
      // La mise en avant suit le nouveau libellé, appariée par titre.
      featuredCredits: currentFeatured.map((c) =>
        creditKey(parseCredit(c).title || c) === key ? nextRaw : c
      ),
    });
  };

  /** Bascule la mise en avant d'un crédit (appariement par titre). */
  const toggleFeatured = (filmTitle: string) => {
    if (!editingMember) return;
    const key = creditKey(filmTitle);
    const existing = creditIndex.get(key);
    if (!existing) return;

    const currentFeatured = editingMember.featuredCredits || [];
    const isFeatured = currentFeatured.some(
      (c) => creditKey(parseCredit(c).title || c) === key
    );

    setEditingMember({
      ...editingMember,
      featuredCredits: isFeatured
        ? currentFeatured.filter((c) => creditKey(parseCredit(c).title || c) !== key)
        : [...currentFeatured, existing.raw],
    });
  };

  /** Réordonne les crédits mis en avant (par titre normalisé). */
  const moveFeatured = (key: string, direction: -1 | 1) => {
    if (!editingMember) return;
    const featured = editingMember.featuredCredits || [];
    const idx = featured.findIndex((c) => creditKey(parseCredit(c).title || c) === key);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= featured.length) return;
    const next = [...featured];
    [next[idx], next[target]] = [next[target], next[idx]];
    setEditingMember({ ...editingMember, featuredCredits: next });
  };

  /**
   * Supprime définitivement un crédit de la filmographie du formateur
   * (et sa mise en avant éventuelle). Vaut pour le catalogue comme hors catalogue.
   */
  const removeCredit = (raw: string) => {
    if (!editingMember) return;
    const key = creditKey(parseCredit(raw).title || raw);
    setEditingMember({
      ...editingMember,
      notableCredits: (editingMember.notableCredits || []).filter((c) => c !== raw),
      featuredCredits: (editingMember.featuredCredits || []).filter(
        (c) => creditKey(parseCredit(c).title || c) !== key
      ),
    });
  };

  /**
   * Crée une fiche film manquante dans `site_films`, puis l'ajoute
   * immédiatement comme crédit du formateur en cours d'édition.
   *
   * C'est le point qui manquait : pouvoir référencer une œuvre absente du
   * catalogue sans quitter le Cockpit.
   */
  const createFilmAndCredit = async () => {
    if (!editingMember || !newFilmDraft) return;
    const title = newFilmDraft.title.trim();
    if (!title) return;

    const slug =
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || `film-${Date.now()}`;

    const year = newFilmDraft.year.trim();

    // 1. Ajout immédiat au formateur (optimiste).
    const raw = buildCreditString(year ? `${title} (${year})` : title, 'Cascadeur');
    const currentCredits = editingMember.notableCredits || [];
    if (!creditIndex.has(creditKey(title))) {
      setEditingMember({
        ...editingMember,
        notableCredits: [...currentCredits, raw],
      });
    }

    // 2. Persistance de la fiche film dans le catalogue.
    startTransition(async () => {
      const res = await upsertFilm({
        id: slug,
        title,
        year,
        category: newFilmDraft.category,
        stunt_roles: '',
        highlight: false,
        image: '',
        tag: '',
        imdb_url: '',
        allocine_url: '',
        trailer_url: '',
      });
      if (res && 'success' in res && !res.success) {
        showToast(`Fiche « ${title} » non enregistrée : ${res.error ?? 'erreur'}`);
      } else {
        showToast(`Fiche « ${title} » créée et ajoutée au formateur.`);
      }
    });

    setNewFilmDraft(null);
    setCreditSearch('');
  };

  const selectedCount = creditIndex.size;
  const featuredCount = featuredCreditsOrdered.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" /> Équipe & Instructeurs
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Gestion des Formateurs
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Mettez à jour les formateurs, leurs bios, spécialités et réseaux.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs font-mono text-gray-400">{team.length} FORMATEURS</div>
        <button
          onClick={() =>
            setEditingMember({
              id: `coach-${Date.now()}`,
              name: '',
              role: 'Coach & Intervenant',
              title: 'Formateur Spécialisé',
              specialties: ['Combat', 'Acrobatie'],
              bio: '',
              notableCredits: [],
            })
          }
          className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
        >
          <Plus className="w-4 h-4" />
          Ajouter un formateur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                    CUC
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate flex items-center justify-between gap-1">
                  <span className="truncate">{member.name}</span>
                  {member.profile_id && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                      ✓ CUC Sign
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#FFE500] font-medium truncate">{member.role}</div>
                <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.title}</div>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>

            {member.specialties && member.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {member.specialties.slice(0, 4).map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Interconnexions : Modules et Films Liés */}
            {(() => {
              const taughtDisciplines = disciplines.filter(
                (d) => member.discipline_ids?.includes(d.id) || d.instructor_ids?.includes(member.id)
              );
              const relatedFilms = films.filter(
                (f) =>
                  member.film_ids?.includes(f.id) ||
                  f.cuc_team_involved?.includes(member.id) ||
                  f.instructor_ids?.includes(member.id) ||
                  member.notableCredits?.some((c) => f.title.toLowerCase().includes(c.toLowerCase()))
              );

              if (taughtDisciplines.length === 0 && relatedFilms.length === 0) return null;

              return (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
                  {taughtDisciplines.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Shield className="w-3 h-3 text-[#FFE500] shrink-0" />
                      <span className="text-zinc-500 text-[10px]">Modules :</span>
                      {taughtDisciplines.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          className="px-1.5 py-0.2 bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/20 rounded text-[10px] font-mono"
                        >
                          {d.number}
                        </span>
                      ))}
                      {taughtDisciplines.length > 3 && (
                        <span className="text-[10px] text-zinc-500">
                          +{taughtDisciplines.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {relatedFilms.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Film className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="text-zinc-500 text-[10px]">Films :</span>
                      {relatedFilms.slice(0, 2).map((f) => (
                        <span
                          key={f.id}
                          className="px-1.5 py-0.2 bg-purple-950/40 text-purple-200 border border-purple-800/30 rounded text-[10px] truncate max-w-[110px]"
                        >
                          {f.title}
                        </span>
                      ))}
                      {relatedFilms.length > 2 && (
                        <span className="text-[10px] text-zinc-500">
                          +{relatedFilms.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-400">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Instagram"
                  >
                    <InstagramLogo className="w-4 h-4" />
                  </a>
                )}
                {member.imdb && (
                  <a
                    href={member.imdb}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Fiche IMDb"
                  >
                    <ImdbLogo className="w-5 h-3.5" />
                  </a>
                )}
                {member.externalUrl && (
                  <a
                    href={member.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFE500] transition-colors"
                    title="Site officiel / Portfolio"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingMember(member)}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteTeamMember(member.id, member.name)}
                  title="Supprimer le formateur"
                  className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal édition membre */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#12121A] border border-white/10 rounded-xl w-full max-w-[95vw] xl:max-w-[1500px] h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* En-tête fixe */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#16161F] shrink-0">
              <h3 className="text-base font-bold text-white uppercase tracking-wide truncate">
                {editingMember.name ? `Modifier : ${editingMember.name}` : 'Nouveau formateur'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} className="flex flex-col flex-1 min-h-0">
              {/* Corps défilant */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Colonne gauche : identité & profil */}
                  <div className="space-y-4">
                    <div className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider font-bold">
                      Identité & Profil
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Nom complet</label>
                        <input
                          type="text"
                          required
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Rôle</label>
                        <input
                          type="text"
                          required
                          value={editingMember.role}
                          onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Titre & Spécialisation</label>
                      <input
                        type="text"
                        required
                        value={editingMember.title}
                        onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">URL Photo / Avatar</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="/images/... ou https://..."
                          value={editingMember.avatarUrl || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                          className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMediaPickerTeam(true)}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                          title="Choisir dans la médiathèque"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">
                        Domaines d'expertise & Disciplines enseignées (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Combat, Action Design, Chutes, Torches"
                        value={
                          Array.isArray(editingMember.specialties)
                            ? editingMember.specialties.join(', ')
                            : (editingMember as any).specialties || ''
                        }
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">
                        Comédiens doublés (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Tomer Sisley, Pierre Niney, Keanu Reeves"
                        value={
                          Array.isArray(editingMember.doubledActors)
                            ? editingMember.doubledActors.join(', ')
                            : (editingMember as any).doubledActors || ''
                        }
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            doubledActors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-400 mb-1">Biographie</label>
                      <textarea
                        rows={3}
                        value={editingMember.bio}
                        onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">Instagram URL</label>
                        <input
                          type="text"
                          placeholder="https://instagram.com/..."
                          value={editingMember.instagram || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, instagram: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                        <input
                          type="text"
                          placeholder="https://imdb.com/name/..."
                          value={editingMember.imdb || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, imdb: e.target.value })}
                          className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                        />
                      </div>
                    </div>

                    {/* Interconnexions : CUC Sign & Disciplines */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" />
                          Interconnexions Cockpit & CUC Sign
                        </div>
                        {editingMember.profile_id && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Compte Lié
                          </span>
                        )}
                      </div>

                      {/* Liaison CUC Sign */}
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                          Lier à un compte formateur CUC Sign (Supabase) :
                        </label>
                        <select
                          value={editingMember.profile_id || ''}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              profile_id: e.target.value || undefined,
                            })
                          }
                          className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                        >
                          <option value="">-- Aucun compte CUC Sign lié --</option>
                          <option value="92d46b8f-866e-4474-9825-58207293a618">Lucas DOLLFUS (cuc@cuc.fr)</option>
                          <option value="7cf41cec-1f89-48c3-9e42-968cb9054994">Malik DIOUF (cuc2@cuc.fr)</option>
                          <option value="4ef3188e-aee2-40a1-8afd-532816b11888">Bastien TROUVÉ (cuc10@cuc.fr)</option>
                          <option value="050b4b7b-660b-44d2-bf9f-4a1f6591420a">Pierre GOMES (cuc4@cuc.fr)</option>
                          <option value="76177715-c401-454c-8ee6-a4af13baa311">Franck BLANC (cuc1@cuc.fr)</option>
                          <option value="3aae8334-5d77-40c3-b4ab-3b44581ac242">Morgane TAILLARD (cuc3@cuc.fr)</option>
                          <option value="18a663c5-1bc6-4160-8342-e106525e23e6">Admin CUC (admin@cuc.fr)</option>
                          <option value="fcae4c8a-b488-415a-8c3b-4f392f6204a0">Niels Dalery (niels.dalery@gmail.com)</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Colonne droite : filmographie unifiée */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider font-bold">
                        Filmographie & Rôles
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-purple-300">{selectedCount} crédit(s)</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-[#FFE500]">{featuredCount} en avant</span>
                      </div>
                    </div>

                    {/* Limite d'affichage public */}
                    <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl">
                      <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        Crédits visibles avant « voir plus » :
                      </label>
                      <select
                        value={editingMember.creditsDisplayLimit ?? 8}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            creditsDisplayLimit: parseInt(e.target.value, 10),
                          })
                        }
                        className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                      >
                        {[4, 6, 8, 10, 12, 16, 24].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 1. AJOUTER UN CRÉDIT — recherche dans le catalogue */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter un crédit
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 shrink-0">
                          {selectedCount} crédit(s)
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Recherchez un film du catalogue pour l'ajouter à la filmographie de ce
                        formateur, puis précisez son rôle.
                      </p>

                      <div className="relative">
                        <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={creditSearch}
                          onChange={(e) => setCreditSearch(e.target.value)}
                          placeholder="Ajouter un crédit — rechercher un film..."
                          className="w-full bg-black/60 border border-white/15 rounded-lg pl-7 pr-7 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                        />
                        {creditSearch && (
                          <button
                            type="button"
                            onClick={() => setCreditSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            title="Effacer la recherche"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {creditSearch.trim() && (
                        <div className="max-h-[18rem] overflow-y-auto pr-1 space-y-1.5">
                          {searchResults.map((f) => {
                            const key = creditKey(f.title);
                            const entry = creditIndex.get(key);
                            const isChecked = Boolean(entry);
                            return (
                              <div
                                key={f.id}
                                className={`rounded-lg border transition ${isChecked
                                  ? 'bg-purple-500/10 border-purple-500/50'
                                  : 'bg-black/60 border-white/10 hover:border-white/20'
                                  }`}
                              >
                                <div className="flex items-center gap-2 px-2 py-1.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleFilmCredit(f)}
                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-[9px] font-bold ${isChecked
                                        ? 'bg-purple-500 border-purple-400 text-white'
                                        : 'border-zinc-600 text-transparent'
                                        }`}
                                    >
                                      ✓
                                    </span>
                                    <span
                                      className={`truncate text-[11px] ${isChecked ? 'text-white font-semibold' : 'text-zinc-300'
                                        }`}
                                    >
                                      {f.title}
                                    </span>
                                    {f.year && (
                                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                        {f.year}
                                      </span>
                                    )}
                                  </button>
                                  {isChecked && (
                                    <span className="text-[9px] font-mono text-purple-300 shrink-0">
                                      Ajouté
                                    </span>
                                  )}
                                </div>

                                {isChecked && (
                                  <div className="flex items-center gap-1.5 px-2 pb-2 pl-7">
                                    {ROLE_OPTIONS.map((role) => {
                                      const active = entry?.role === role;
                                      return (
                                        <button
                                          type="button"
                                          key={role}
                                          onClick={() => setCreditRole(f.title, active ? '' : role)}
                                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${active
                                            ? 'bg-[#FFE500]/20 border-[#FFE500] text-[#FFE500] font-bold'
                                            : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/25'
                                            }`}
                                        >
                                          {role}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {searchResults.length === 0 && (
                            <div className="py-2 space-y-2">
                              <p className="text-[11px] text-zinc-500 italic">
                                Aucun film du catalogue ne correspond à « {creditSearch} ».
                              </p>
                              {!newFilmDraft && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewFilmDraft({
                                      title: creditSearch.trim(),
                                      year: '',
                                      category: 'Cinéma Français',
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500]/15 border border-[#FFE500]/40 text-[11px] font-semibold text-[#FFE500] hover:bg-[#FFE500]/25 transition"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  Créer la fiche « {creditSearch.trim()} »
                                </button>
                              )}
                            </div>
                          )}

                          {newFilmDraft && (
                            <div className="p-2.5 bg-[#FFE500]/5 border border-[#FFE500]/30 rounded-lg space-y-2">
                              <div className="text-[10px] font-mono text-[#FFE500] uppercase tracking-wider">
                                Nouvelle fiche film
                              </div>
                              <div className="grid grid-cols-[1fr_5rem] gap-2">
                                <input
                                  type="text"
                                  value={newFilmDraft.title}
                                  onChange={(e) =>
                                    setNewFilmDraft({ ...newFilmDraft, title: e.target.value })
                                  }
                                  placeholder="Titre du film"
                                  className="bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                                />
                                <input
                                  type="text"
                                  value={newFilmDraft.year}
                                  onChange={(e) =>
                                    setNewFilmDraft({ ...newFilmDraft, year: e.target.value })
                                  }
                                  placeholder="Année"
                                  className="bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                                />
                              </div>
                              <select
                                value={newFilmDraft.category}
                                onChange={(e) =>
                                  setNewFilmDraft({
                                    ...newFilmDraft,
                                    category: e.target.value as FilmCredit['category'],
                                  })
                                }
                                className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                              >
                                {[
                                  'Blockbuster',
                                  'Cinéma Français',
                                  'Cinéma International',
                                  'Série / Plateforme',
                                  'Film Culte',
                                  'Streaming Global',
                                ].map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={createFilmAndCredit}
                                  disabled={!newFilmDraft.title.trim()}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500] text-black text-[11px] font-bold uppercase tracking-wider hover:bg-[#ffe600e6] disabled:opacity-40"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Créer et ajouter
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewFilmDraft(null)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-semibold"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. CATALOGUE — liste ordonnée des films mis en avant */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5" />
                          Catalogue
                        </div>
                        <span className="text-[10px] font-mono text-[#FFE500] shrink-0">
                          {catalogueFilms.length} mis en avant
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Films mis en avant sur la fiche publique, dans cet ordre. Réordonnez-les
                        avec les flèches, retirez-en un avec l'étoile. Le rôle se choisit dans
                        « Tous les crédits » ci-dessous.
                      </p>

                      {catalogueFilms.length > 0 ? (
                        <ol className="max-h-[22rem] overflow-y-auto pr-1 divide-y divide-white/5 border border-[#FFE500]/25 rounded-lg overflow-hidden">
                          {catalogueFilms.map(({ entry, film }, idx) => (
                            <li key={film.id} className="bg-[#FFE500]/5">
                              <div className="flex items-center gap-2 px-2.5 py-2">
                                <span className="font-mono text-[11px] font-bold text-[#FFE500] w-5 text-center shrink-0 tabular-nums">
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-[11px] text-white font-semibold">
                                    {film.title}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {film.year && (
                                      <span className="text-[9px] font-mono text-zinc-500">
                                        {film.year}
                                      </span>
                                    )}
                                    <span className="text-[9px] font-mono text-zinc-500">
                                      {creditIndex.get(entry.key)?.role || 'Rôle à préciser'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => moveFeatured(entry.key, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent"
                                    title="Monter dans la liste"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveFeatured(entry.key, 1)}
                                    disabled={idx === catalogueFilms.length - 1}
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent"
                                    title="Descendre dans la liste"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleFeatured(film.title)}
                                    className="p-1 rounded text-[#FFE500] hover:text-red-400 hover:bg-white/10 transition"
                                    title="Retirer de la mise en avant"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic py-2">
                          Aucun film mis en avant. Recherchez un film ci-dessus, ajoutez-le, puis
                          cliquez sur son étoile.
                        </p>
                      )}
                    </div>

                    {/* 3. TOUS LES CRÉDITS — source unique, catalogue et hors catalogue */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                          Tous les crédits ({allCredits.length})
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-500">
                            {allCredits.filter((c) => c.inCatalogue).length} cat. •{' '}
                            {allCredits.filter((c) => !c.inCatalogue).length} hors cat.
                          </span>
                          {/* Tri : par date (année décroissante) ou par nom */}
                          <div className="flex items-center rounded-md border border-white/10 overflow-hidden">
                            {(['date', 'name'] as const).map((mode) => (
                              <button
                                type="button"
                                key={mode}
                                onClick={() => setCreditSort(mode)}
                                className={`px-2 py-0.5 text-[10px] font-mono transition ${creditSort === mode
                                  ? 'bg-white/15 text-white font-bold'
                                  : 'bg-black/40 text-zinc-500 hover:text-zinc-300'
                                  }`}
                                title={mode === 'date' ? 'Trier par date' : 'Trier par nom'}
                              >
                                {mode === 'date' ? 'DATE' : 'NOM'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Cliquez sur l'étoile pour mettre un crédit en avant. Le rôle se choisit
                        directement sur chaque ligne.
                      </p>

                      {allCreditsSorted.length > 0 ? (
                        <div className="space-y-1 max-h-[26rem] overflow-y-auto pr-1">
                          {allCreditsSorted.map(({ raw, title, role, key, year, inCatalogue }) => {
                            const isFeatured = featuredSet.has(key);
                            const featuredRank = featuredCreditsOrdered.findIndex(
                              (e) => e.key === key
                            );
                            return (
                              <div
                                key={raw}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isFeatured
                                  ? 'bg-[#FFE500]/10 border-[#FFE500]/40'
                                  : 'bg-black/60 border-white/10'
                                  }`}
                              >
                                <span
                                  className={`px-1 py-0.5 rounded text-[8px] font-mono border shrink-0 ${inCatalogue
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : 'bg-white/5 text-zinc-500 border-white/10'
                                    }`}
                                  title={
                                    inCatalogue
                                      ? 'Présent au catalogue'
                                      : 'Absent du catalogue — fiche à créer si besoin'
                                  }
                                >
                                  {inCatalogue ? 'CAT.' : 'H.C.'}
                                </span>
                                <span className="flex-1 min-w-0 truncate text-[11px] text-zinc-200">
                                  {title}
                                  {year && (
                                    <span className="ml-1.5 font-mono text-[9px] text-zinc-500">
                                      {year}
                                    </span>
                                  )}
                                </span>

                                {/* Rôle : sélecteur compact sur la même ligne */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {ROLE_OPTIONS.map((option) => {
                                    const active = role === option;
                                    return (
                                      <button
                                        type="button"
                                        key={option}
                                        onClick={() => setCreditRole(title, active ? '' : option)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition ${active
                                          ? 'bg-[#FFE500]/20 border-[#FFE500] text-[#FFE500] font-bold'
                                          : 'bg-black/60 border-white/10 text-zinc-500 hover:border-white/25'
                                          }`}
                                        title={option}
                                      >
                                        {option === 'Coordinateur des cascades'
                                          ? 'Coord.'
                                          : option === 'Doublure'
                                            ? 'Doubl.'
                                            : 'Casc.'}
                                      </button>
                                    );
                                  })}
                                </div>

                                {isFeatured && (
                                  <>
                                    <span className="font-mono text-[9px] text-[#FFE500] w-3 text-center shrink-0">
                                      {featuredRank + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => moveFeatured(key, -1)}
                                      disabled={featuredRank === 0}
                                      className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30 shrink-0"
                                      title="Monter dans la mise en avant"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveFeatured(key, 1)}
                                      disabled={featuredRank === featuredCount - 1}
                                      className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30 shrink-0"
                                      title="Descendre dans la mise en avant"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleFeatured(title)}
                                  className={`p-0.5 rounded transition shrink-0 ${isFeatured
                                    ? 'text-[#FFE500]'
                                    : 'text-zinc-600 hover:text-[#FFE500]'
                                    }`}
                                  title={
                                    isFeatured
                                      ? 'Retirer de la mise en avant'
                                      : 'Mettre en avant sur la fiche publique'
                                  }
                                >
                                  <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeCredit(raw)}
                                  className="p-0.5 text-zinc-500 hover:text-red-400 shrink-0"
                                  title="Supprimer ce crédit"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic py-2">
                          Aucun crédit. Recherchez un film ci-dessus pour en ajouter un.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied fixe */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#16161F] shrink-0">
                <div className="text-[11px] font-mono text-zinc-500">
                  {selectedCount} crédit(s) • {featuredCount} mis en avant
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MediaPicker pour l'avatar */}
      {showMediaPickerTeam && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setShowMediaPickerTeam(false)}
          onSelectUrl={(url) => {
            if (editingMember) {
              setEditingMember({ ...editingMember, avatarUrl: url });
            }
            setShowMediaPickerTeam(false);
          }}
        />
      )}
    </div>
  );
};
