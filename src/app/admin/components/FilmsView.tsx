'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  Film,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Users,
  Shield,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import { FilmCredit, Instructor, Discipline } from '@/types';
import { upsertFilm, deleteFilm } from '@/app/admin/actions';
import { MediaPickerModal } from './MediaPickerModal';

interface FilmsViewProps {
  films: FilmCredit[];
  setFilms: React.Dispatch<React.SetStateAction<FilmCredit[]>>;
  team?: Instructor[];
  disciplines?: Discipline[];
  showToast: (msg: string) => void;
}

export const FilmsView: React.FC<FilmsViewProps> = ({
  films,
  setFilms,
  team = [],
  disciplines = [],
  showToast,
}) => {
  const [, startTransition] = useTransition();
  const [editingFilm, setEditingFilm] = useState<FilmCredit | null>(null);
  const [showMediaPickerFilm, setShowMediaPickerFilm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredFilms = films.filter((f) => {
    const matchSearch =
      !searchTerm ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.director && f.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.year && f.year.includes(searchTerm));
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSaveFilm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm) return;

    const updated: FilmCredit = {
      ...editingFilm,
      doubledActors: Array.isArray(editingFilm.doubledActors)
        ? editingFilm.doubledActors
        : typeof (editingFilm as any).doubledActors === 'string'
        ? (editingFilm as any).doubledActors.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    };

    setFilms((prev) => {
      const exists = prev.some((f) => f.id === updated.id);
      if (exists) return prev.map((f) => (f.id === updated.id ? updated : f));
      return [...prev, updated];
    });
    setEditingFilm(null);
    showToast('Projet enregistré au catalogue !');

    startTransition(async () => {
      await upsertFilm({
        id: updated.id,
        title: updated.title,
        year: updated.year,
        category: updated.category,
        director: updated.director,
        stunt_roles: updated.stuntRoles,
        image: updated.image,
        tag: updated.tag,
        imdb_url: updated.imdbUrl,
        allocine_url: updated.allocineUrl,
        trailer_url: updated.trailerUrl,
        doubled_actors: updated.doubledActors,
        highlight: updated.highlight,
        cuc_team_involved: updated.cuc_team_involved || updated.instructor_ids || [],
      });
    });
  };

  const handleDeleteFilm = (id: string, title: string) => {
    if (!confirm(`Supprimer définitivement le projet "${title}" ?`)) return;

    setFilms((prev) => prev.filter((f) => f.id !== id));
    showToast(`Projet "${title}" supprimé`);

    startTransition(async () => {
      await deleteFilm(id);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Film className="w-3.5 h-3.5" /> Filmographie CUC
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Projets Cinéma &amp; Cascades
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Ajoutez vos dernières sorties cinéma et séries TV.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un film, réalisateur, année..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FFE500] w-64"
            />
          </div>
          <div className="text-xs font-mono text-gray-400">
            {filteredFilms.length} / {films.length} PROJETS
          </div>
        </div>

        <button
          onClick={() =>
            setEditingFilm({
              id: `film-${Date.now()}`,
              title: '',
              year: '2025',
              category: 'Cinéma International',
              stuntRoles: 'Cascades physiques, combats, chutes',
              highlight: false,
              image: '',
              tag: 'NOUVEAU',
              imdbUrl: '',
              allocineUrl: '',
              trailerUrl: '',
            })
          }
          className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un projet
        </button>
      </div>

      {/* Catégories rapides */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {['all', 'Blockbuster', 'Cinéma Français', 'Cinéma International', 'Série / Plateforme', 'Film Culte', 'Streaming Global'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#FFE500] text-black font-bold'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat === 'all' ? 'Tous les films' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFilms.map((film) => (
          <div
            key={film.id}
            className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors group"
          >
            <div className="relative aspect-[16/10] bg-black/60 overflow-hidden">
              {film.image ? (
                <Image
                  src={film.image}
                  alt={film.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="300px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                  PAS D&apos;AFFICHE
                </div>
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                {film.tag && (
                  <span className="px-2 py-0.5 rounded bg-[#FFE500] text-black text-[10px] font-black uppercase shadow">
                    {film.tag}
                  </span>
                )}
                {film.highlight && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase flex items-center gap-1 shadow">
                    <Star className="w-2.5 h-2.5 fill-black" /> Vedette
                  </span>
                )}
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono">
                {film.year}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-white group-hover:text-[#FFE500] transition-colors truncate">
                  {film.title}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#FFE500] font-mono">
                    {film.category}
                  </span>
                  {film.director && (
                    <span className="text-[11px] text-gray-400 truncate">
                      Réal : {film.director}
                    </span>
                  )}
                </div>
                {film.doubledActors && film.doubledActors.length > 0 && (
                  <div className="text-[11px] text-gray-400 line-clamp-1">
                    <span className="text-gray-500 font-medium">Doublures :</span>{' '}
                    {Array.isArray(film.doubledActors)
                      ? film.doubledActors.join(', ')
                      : film.doubledActors}
                  </div>
                )}
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {film.stuntRoles}
                </p>

                {/* Interconnexions : Formateurs et Modules Liés */}
                {(() => {
                  const linkedStaff = team.filter(
                    (t) =>
                      film.cuc_team_involved?.includes(t.id) ||
                      film.instructor_ids?.includes(t.id) ||
                      t.film_ids?.includes(film.id)
                  );
                  const linkedDisc = disciplines.filter((d) => d.film_ids?.includes(film.id));

                  if (linkedStaff.length === 0 && linkedDisc.length === 0) return null;

                  return (
                    <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                      {linkedStaff.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Users className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="text-zinc-500">Staff CUC :</span>
                          {linkedStaff.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              className="px-1.5 py-0.2 bg-sky-950/40 text-sky-300 border border-sky-800/30 rounded"
                            >
                              {t.name.split(' ')[0]}
                            </span>
                          ))}
                          {linkedStaff.length > 2 && (
                            <span className="text-zinc-500 font-mono">+{linkedStaff.length - 2}</span>
                          )}
                        </div>
                      )}
                      {linkedDisc.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Shield className="w-3 h-3 text-[#FFE500] shrink-0" />
                          <span className="text-zinc-500">Modules :</span>
                          {linkedDisc.slice(0, 2).map((d) => (
                            <span
                              key={d.id}
                              className="px-1.5 py-0.2 bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/20 rounded font-mono"
                            >
                              {d.number}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {film.imdbUrl && (
                    <a
                      href={film.imdbUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-1.5 py-1 rounded bg-[#f5c518]/15 hover:bg-[#f5c518]/30 text-[#f5c518] flex items-center gap-1 transition-colors"
                      title="Fiche IMDb"
                    >
                      <ImdbLogo className="h-3 w-auto shrink-0" />
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                  {film.allocineUrl && (
                    <a
                      href={film.allocineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-1.5 py-1 rounded bg-[#fecc00]/15 hover:bg-[#fecc00]/30 text-[#fecc00] flex items-center gap-1 transition-colors"
                      title="Fiche AlloCiné"
                    >
                      <AllocineLogo className="h-3 w-auto shrink-0" />
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                  {film.trailerUrl && (
                    <a
                      href={film.trailerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-1.5 py-1 rounded bg-red-600/15 hover:bg-red-600/30 text-red-400 flex items-center gap-1 transition-colors"
                      title="Bande-annonce"
                    >
                      <YouTubeLogo className="w-3 h-3 shrink-0" variant="color" />
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingFilm(film)}
                    className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteFilm(film.id, film.title)}
                    title="Supprimer le projet"
                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal édition film */}
      {editingFilm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Film className="w-4 h-4 text-[#FFE500]" />
                {editingFilm.title ? `Modifier : ${editingFilm.title}` : 'Ajouter un film'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingFilm(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFilm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Titre du film *</label>
                  <input
                    type="text"
                    required
                    value={editingFilm.title}
                    onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Année de sortie *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 2025"
                    value={editingFilm.year}
                    onChange={(e) => setEditingFilm({ ...editingFilm, year: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Catégorie vitrine</label>
                  <select
                    value={editingFilm.category}
                    onChange={(e) =>
                      setEditingFilm({
                        ...editingFilm,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  >
                    <option value="Blockbuster">Blockbuster</option>
                    <option value="Cinéma Français">Cinéma Français</option>
                    <option value="Cinéma International">Cinéma International</option>
                    <option value="Série / Plateforme">Série / Plateforme</option>
                    <option value="Show & Événement">Show &amp; Événement</option>
                    <option value="Film Culte">Film Culte</option>
                    <option value="Streaming Global">Streaming Global</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="ex: BLOCKBUSTER, NETFLIX, NOUVEAU"
                    value={editingFilm.tag || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, tag: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Réalisateur</label>
                  <input
                    type="text"
                    placeholder="ex: Olivier Megaton, Luc Besson..."
                    value={editingFilm.director || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, director: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Affiche (URL ou locale)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/images/... ou https://..."
                      value={editingFilm.image || ''}
                      onChange={(e) => setEditingFilm({ ...editingFilm, image: e.target.value })}
                      className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaPickerFilm(true)}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                      title="Choisir dans la médiathèque"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Comédiens doublés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="ex: Tomer Sisley, Pierre Niney, Keanu Reeves"
                  value={
                    Array.isArray(editingFilm.doubledActors)
                      ? editingFilm.doubledActors.join(', ')
                      : (editingFilm as any).doubledActors || ''
                  }
                  onChange={(e) =>
                    setEditingFilm({
                      ...editingFilm,
                      doubledActors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rôles de cascades &amp; Réalisations</label>
                <textarea
                  rows={2}
                  placeholder="ex: Coordination cascades, chorégraphie combats, doublure Tomer Sisley, chutes hauteur 18m"
                  value={editingFilm.stuntRoles}
                  onChange={(e) => setEditingFilm({ ...editingFilm, stuntRoles: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1">
                    <ImdbLogo className="h-3 w-auto inline-block" /> URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://imdb.com/title/..."
                    value={editingFilm.imdbUrl || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, imdbUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1">
                    <AllocineLogo className="h-3 w-auto inline-block" /> URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://allocine.fr/film/..."
                    value={editingFilm.allocineUrl || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, allocineUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 flex items-center gap-1">
                    <YouTubeLogo className="w-3 h-3 inline-block" variant="color" /> Trailer
                  </label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={editingFilm.trailerUrl || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, trailerUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              {/* Interconnexions : Formateurs et Cascadeurs CUC */}
              {team.length > 0 && (
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    Instructeurs &amp; Cascadeurs CUC sur cette production
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {team.map((t) => {
                      const isChecked =
                        editingFilm.cuc_team_involved?.includes(t.id) ||
                        editingFilm.instructor_ids?.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            const current =
                              editingFilm.cuc_team_involved ||
                              editingFilm.instructor_ids ||
                              [];
                            const updated = isChecked
                              ? current.filter((id) => id !== t.id)
                              : [...current, t.id];
                            setEditingFilm({
                              ...editingFilm,
                              cuc_team_involved: updated,
                              instructor_ids: updated,
                            });
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition border cursor-pointer ${
                            isChecked
                              ? 'bg-sky-500/20 border-sky-500 text-white font-semibold'
                              : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/20'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingFilm.highlight || false}
                    onChange={(e) => setEditingFilm({ ...editingFilm, highlight: e.target.checked })}
                    className="rounded border-white/20 text-[#FFE500] focus:ring-[#FFE500] h-4 w-4 bg-black/60"
                  />
                  <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#FFE500]" />
                    Mettre en avant ce film (Projet Vedette sur le site vitrine)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingFilm(null)}
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

      {/* MediaPicker pour l'affiche */}
      {showMediaPickerFilm && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setShowMediaPickerFilm(false)}
          onSelectUrl={(url) => {
            if (editingFilm) {
              setEditingFilm({ ...editingFilm, image: url });
            }
            setShowMediaPickerFilm(false);
          }}
        />
      )}
    </div>
  );
};
