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
  Clapperboard,
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';
import { InstagramLogo, ImdbLogo } from '@/components/ui/BrandLogos';
import { Instructor, FilmCredit, Discipline, parseCredit } from '@/types';
import { scoreFilmNotability, matchFilmForCredit } from '@/lib/credit-notability';
import { upsertTeamMember, deleteTeamMember } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface TeamViewProps {
  team: Instructor[];
  setTeam: React.Dispatch<React.SetStateAction<Instructor[]>>;
  films?: FilmCredit[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Users className="w-3.5 h-3.5" /> Équipe &amp; Instructeurs
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingMember.name ? `Modifier : ${editingMember.name}` : 'Nouveau formateur'}
            </h3>
            <form onSubmit={handleSaveTeamMember} className="space-y-4">
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
                <label className="block text-xs font-mono text-gray-400 mb-1">Titre &amp; Spécialisation</label>
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
                  Spécialités (séparées par des virgules)
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

              {/* Tournages & Crédits Techniques (Coordination vs Cascades) */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-3.5 h-3.5" />
                    Tournages &amp; Crédits Qualifiés ({editingMember.notableCredits?.length || 0})
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Format : Titre — Rôle
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Indiquez les films et rôles précis (un par ligne), ex : <br />
                  <span className="text-[#FFE500] font-mono">Bagarre — Coordinateur des cascades &amp; Action Designer</span><br />
                  <span className="text-zinc-300 font-mono">John Wick : Chapitre 4 — Cascadeur</span>
                </p>

                <textarea
                  rows={6}
                  placeholder={`Bagarre — Coordinateur des cascades & Action Designer\nJohn Wick : Chapitre 4 — Cascadeur\nSous la Seine — Cascadeur (Cascades subaquatiques)`}
                  value={
                    Array.isArray(editingMember.notableCredits)
                      ? editingMember.notableCredits.join('\n')
                      : (editingMember as any).notableCredits || ''
                  }
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      notableCredits: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFE500] leading-relaxed"
                />

                {/* Aperçu interactif des pastilles de rôles */}
                {editingMember.notableCredits && editingMember.notableCredits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingMember.notableCredits.map((c, i) => {
                      const parsed = parseCredit(c);
                      const isCoord = parsed.category === 'coordination';
                      const isDoublure = parsed.category === 'doublure';
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${isCoord
                            ? 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/40 font-bold'
                            : isDoublure
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : 'bg-black/60 text-zinc-300 border-zinc-700'
                            }`}
                        >
                          <span className="font-semibold">{parsed.title}</span>
                          {parsed.role && <span className="opacity-75 font-normal">[{parsed.role}]</span>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mise en avant & affichage public */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" />
                    Mise en avant sur la fiche publique
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {editingMember.featuredCredits?.length || 0} sélectionné(s)
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Choisissez les tournages à afficher en premier sur la fiche du coach. Sans
                  sélection, les crédits sont triés automatiquement par notoriété du film
                  (blockbusters et films mis en avant d'abord).
                </p>

                {/* Limite d'affichage */}
                <div className="flex items-center gap-3">
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

                {/* Sélection ordonnée des crédits mis en avant */}
                {(() => {
                  const credits = editingMember.notableCredits || [];
                  const featured = editingMember.featuredCredits || [];

                  if (credits.length === 0) {
                    return (
                      <p className="text-[11px] text-zinc-500 italic">
                        Ajoutez d'abord des tournages ci-dessus pour pouvoir les mettre en avant.
                      </p>
                    );
                  }

                  const toggleFeatured = (raw: string) => {
                    const next = featured.includes(raw)
                      ? featured.filter((c) => c !== raw)
                      : [...featured, raw];
                    setEditingMember({ ...editingMember, featuredCredits: next });
                  };

                  const moveFeatured = (raw: string, direction: -1 | 1) => {
                    const idx = featured.indexOf(raw);
                    if (idx < 0) return;
                    const target = idx + direction;
                    if (target < 0 || target >= featured.length) return;
                    const next = [...featured];
                    [next[idx], next[target]] = [next[target], next[idx]];
                    setEditingMember({ ...editingMember, featuredCredits: next });
                  };

                  // Le reste est trié par notoriété du film correspondant.
                  const remaining = [...credits]
                    .filter((c) => !featured.includes(c))
                    .sort((a, b) => {
                      const filmA = matchFilmForCredit(parseCredit(a), films);
                      const filmB = matchFilmForCredit(parseCredit(b), films);
                      const scoreA = filmA ? scoreFilmNotability(filmA) : -1;
                      const scoreB = filmB ? scoreFilmNotability(filmB) : -1;
                      return scoreB - scoreA;
                    });

                  return (
                    <div className="space-y-2">
                      {/* Crédits mis en avant, réordonnables */}
                      {featured.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono text-[#FFE500] uppercase">
                            En tête de fiche (ordre d'affichage)
                          </div>
                          {featured.map((raw, idx) => (
                            <div
                              key={raw}
                              className="flex items-center gap-1.5 px-2 py-1 bg-[#FFE500]/10 border border-[#FFE500]/30 rounded text-[11px]"
                            >
                              <span className="font-mono text-[10px] text-[#FFE500] w-4 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="flex-1 truncate text-white">{raw}</span>
                              <button
                                type="button"
                                onClick={() => moveFeatured(raw, -1)}
                                disabled={idx === 0}
                                className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                title="Monter"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveFeatured(raw, 1)}
                                disabled={idx === featured.length - 1}
                                className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                title="Descendre"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleFeatured(raw)}
                                className="p-0.5 text-zinc-400 hover:text-red-400"
                                title="Retirer de la mise en avant"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Crédits disponibles */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">
                          Autres tournages (cliquer pour mettre en avant)
                        </div>
                        <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
                          {remaining.map((raw) => (
                            <button
                              type="button"
                              key={raw}
                              onClick={() => toggleFeatured(raw)}
                              className="w-full flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-white/10 hover:border-[#FFE500]/50 rounded text-left text-[11px] text-zinc-300 transition"
                            >
                              <Star className="w-3 h-3 text-zinc-600 shrink-0" />
                              <span className="truncate">{raw}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Interconnexions : CUC Sign, Disciplines & Projets Cinéma */}
              <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Interconnexions Cockpit &amp; CUC Sign
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
                    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
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

                {/* Projets Filmographie */}
                {films.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1.5">
                      Films du catalogue où ce formateur est intervenu :
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {films.slice(0, 12).map((f) => {
                        const isChecked =
                          editingMember.film_ids?.includes(f.id) ||
                          f.instructor_ids?.includes(editingMember.id);
                        return (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => {
                              const current = editingMember.film_ids || [];
                              const updated = isChecked
                                ? current.filter((id) => id !== f.id)
                                : [...current, f.id];
                              setEditingMember({ ...editingMember, film_ids: updated });
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition border ${isChecked
                              ? 'bg-purple-500/20 border-purple-500 text-white font-semibold'
                              : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/20'
                              }`}
                          >
                            <Film className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate">{f.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
