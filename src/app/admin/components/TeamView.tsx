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
  ArrowUpDown,
  X,
} from 'lucide-react';
import { InstagramLogo, ImdbLogo } from '@/components/ui/BrandLogos';
import { Instructor, FilmCredit, Discipline, parseCredit } from '@/types';
import { upsertTeamMember, deleteTeamMember } from '@/app/admin/actions';
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
  const [filmSearch, setFilmSearch] = useState('');
  const [filmSort, setFilmSort] = useState<'name' | 'year-desc' | 'year-asc'>('name');
  const [filmFilter, setFilmFilter] = useState<'all' | 'selected'>('all');

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
  const creditKey = (title: string) => title.trim().toLowerCase().replace(/\s+/g, ' ');

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

  /** Films du catalogue filtrés + triés pour l'affichage. */
  const visibleFilms = useMemo(() => {
    const q = filmSearch.trim().toLowerCase();
    return films
      .filter((f) => {
        if (q && !f.title.toLowerCase().includes(q)) return false;
        if (filmFilter === 'selected' && !creditIndex.has(creditKey(f.title))) return false;
        return true;
      })
      .sort((a, b) => {
        if (filmSort === 'name') {
          return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
        }
        const ya = parseInt(String(a.year), 10) || 0;
        const yb = parseInt(String(b.year), 10) || 0;
        return filmSort === 'year-desc' ? yb - ya : ya - yb;
      });
  }, [films, filmSearch, filmSort, filmFilter, creditIndex]);

  /** Crédits saisis qui ne correspondent à aucun film du catalogue. */
  const orphanCredits = useMemo(() => {
    const catalogueTitles = new Set(films.map((f) => creditKey(f.title)));
    return (editingMember?.notableCredits || []).filter((raw) => {
      const parsed = parseCredit(raw);
      const title = creditKey(parsed.title || raw);
      return title && !catalogueTitles.has(title);
    });
  }, [editingMember?.notableCredits, films]);

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

  /** Supprime un crédit orphelin (hors catalogue). */
  const removeOrphanCredit = (raw: string) => {
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

                      {/* Modules enseignés */}
                      {disciplines.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                            Modules de cascade enseignés par ce formateur :
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {disciplines.map((d) => {
                              const isChecked =
                                editingMember.discipline_ids?.includes(d.id) ||
                                d.instructor_ids?.includes(editingMember.id);
                              return (
                                <button
                                  type="button"
                                  key={d.id}
                                  onClick={() => {
                                    const current = editingMember.discipline_ids || [];
                                    const updated = isChecked
                                      ? current.filter((id) => id !== d.id)
                                      : [...current, d.id];
                                    setEditingMember({ ...editingMember, discipline_ids: updated });
                                  }}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition border ${isChecked
                                    ? 'bg-[#FFE500]/15 border-[#FFE500] text-white font-semibold'
                                    : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/20'
                                    }`}
                                >
                                  <span className="font-mono text-[10px] text-[#FFE500]">{d.number}</span>
                                  <span className="truncate">{d.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
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

                    {/* Filmographie unifiée : une seule liste, mise en avant incluse */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                          <Film className="w-3.5 h-3.5" />
                          Filmographie du formateur
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 shrink-0">
                          {selectedCount} / {films.length}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Cochez les films où ce formateur est intervenu, puis précisez son rôle.
                        Cliquez sur l'étoile{' '}
                        <Star className="inline w-3 h-3 text-[#FFE500] -mt-0.5" /> pour placer un film
                        en tête de la fiche publique : les films étoilés remontent en haut de la liste
                        et se réordonnent avec les flèches.
                      </p>

                      {/* Recherche + tri + filtre */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={filmSearch}
                            onChange={(e) => setFilmSearch(e.target.value)}
                            placeholder="Rechercher un film..."
                            className="w-full bg-black/60 border border-white/15 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                          />
                        </div>
                        <div className="relative shrink-0">
                          <ArrowUpDown className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={filmSort}
                            onChange={(e) => setFilmSort(e.target.value as 'name' | 'year-desc' | 'year-asc')}
                            className="bg-black/60 border border-white/15 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                          >
                            <option value="name">Nom (A→Z)</option>
                            <option value="year-desc">Année (récent)</option>
                            <option value="year-asc">Année (ancien)</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFilmFilter((f) => (f === 'all' ? 'selected' : 'all'))}
                          className={`shrink-0 px-2 py-1.5 rounded-lg text-[11px] font-mono border transition ${filmFilter === 'selected'
                            ? 'bg-purple-500/20 border-purple-500 text-white'
                            : 'bg-black/60 border-white/15 text-zinc-400 hover:border-white/25'
                            }`}
                          title="N'afficher que les films sélectionnés"
                        >
                          {filmFilter === 'selected' ? 'Sélection' : 'Tous'}
                        </button>
                      </div>

                      <div className="max-h-[26rem] overflow-y-auto pr-1 space-y-1.5">
                        {visibleFilms.map((f) => {
                          const key = creditKey(f.title);
                          const entry = creditIndex.get(key);
                          const isChecked = Boolean(entry);
                          const isFeatured = featuredSet.has(key);
                          const featuredRank = featuredCreditsOrdered.findIndex(
                            (e) => e.key === key
                          );
                          return (
                            <div
                              key={f.id}
                              className={`rounded-lg border transition ${isFeatured
                                ? 'bg-[#FFE500]/10 border-[#FFE500]/40'
                                : isChecked
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
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    {isFeatured && (
                                      <>
                                        <span className="font-mono text-[9px] text-[#FFE500] w-3 text-center">
                                          {featuredRank + 1}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => moveFeatured(key, -1)}
                                          disabled={featuredRank === 0}
                                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          title="Monter dans la mise en avant"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveFeatured(key, 1)}
                                          disabled={featuredRank === featuredCount - 1}
                                          className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          title="Descendre dans la mise en avant"
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => toggleFeatured(f.title)}
                                      className={`p-1 rounded transition ${isFeatured
                                        ? 'text-[#FFE500]'
                                        : 'text-zinc-600 hover:text-[#FFE500]'
                                        }`}
                                      title={
                                        isFeatured
                                          ? 'Retirer de la mise en avant'
                                          : 'Mettre en avant sur la fiche publique'
                                      }
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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

                        {visibleFilms.length === 0 && (
                          <p className="text-[11px] text-zinc-500 italic py-2">
                            {filmFilter === 'selected'
                              ? 'Aucun film sélectionné pour ce formateur.'
                              : `Aucun film ne correspond à « ${filmSearch} ».`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Crédits hors catalogue (saisie libre conservée) */}
                    {orphanCredits.length > 0 && (
                      <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                            Crédits hors catalogue ({orphanCredits.length})
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Conservés tels quels
                          </span>
                        </div>
                        <div className="space-y-1">
                          {orphanCredits.map((raw) => {
                            const parsed = parseCredit(raw);
                            const isCoord = parsed.category === 'coordination';
                            const isDoublure = parsed.category === 'doublure';
                            return (
                              <div
                                key={raw}
                                className="flex items-center gap-2 px-2 py-1 bg-black/60 border border-white/10 rounded text-[11px]"
                              >
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border shrink-0 ${isCoord
                                    ? 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/40'
                                    : isDoublure
                                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                      : 'bg-white/5 text-zinc-400 border-white/10'
                                    }`}
                                >
                                  {parsed.role || 'Rôle non précisé'}
                                </span>
                                <span className="flex-1 truncate text-zinc-200">{parsed.title || raw}</span>
                                <button
                                  type="button"
                                  onClick={() => removeOrphanCredit(raw)}
                                  className="p-0.5 text-zinc-500 hover:text-red-400 shrink-0"
                                  title="Supprimer ce crédit"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
