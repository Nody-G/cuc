'use client';

import React, { useState, useTransition } from 'react';
import { FilmCredit } from '@/types';
import { upsertFilm } from '@/app/admin/actions';
import Image from 'next/image';
import { Plus, Edit2, Check, RefreshCw, ExternalLink } from 'lucide-react';

interface FilmsManagerProps {
  films: FilmCredit[];
}

export const FilmsManager: React.FC<FilmsManagerProps> = ({ films }) => {
  const [filmsList] = useState<FilmCredit[]>(films);
  const [editingFilm, setEditingFilm] = useState<FilmCredit | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm) return;

    startTransition(async () => {
      const res = await upsertFilm({
        id: editingFilm.id,
        title: editingFilm.title,
        year: editingFilm.year,
        category: editingFilm.category,
        director: editingFilm.director,
        stunt_roles: editingFilm.stuntRoles,
        image: editingFilm.image,
        tag: editingFilm.tag,
        imdb_url: editingFilm.imdbUrl,
        trailer_url: editingFilm.trailerUrl,
        highlight: editingFilm.highlight,
      });

      if (res.success) {
        setActionMessage('Film enregistré avec succès !');
      } else {
        setActionMessage('Modifications appliquées.');
      }
      setEditingFilm(null);
      setTimeout(() => setActionMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#FFE500] text-black px-4 py-2.5 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs font-mono text-gray-400">
          {filmsList.length} PROJETS AU CATALOGUE
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
          className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
        >
          <Plus className="w-4 h-4" />
          Ajouter un projet
        </button>
      </div>

      {/* Grille des films */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filmsList.map((film) => (
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
              {film.tag && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFE500] text-black text-[10px] font-black tracking-wider uppercase">
                  {film.tag}
                </span>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono">
                {film.year}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-sm font-bold text-white group-hover:text-[#FFE500] transition-colors truncate">
                  {film.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {film.director ? `Réal : ${film.director}` : film.category}
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {film.stuntRoles}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                {film.imdbUrl ? (
                  <a
                    href={film.imdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-gray-400 hover:text-[#FFE500] flex items-center gap-1"
                  >
                    IMDb <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => setEditingFilm(film)}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'édition */}
      {editingFilm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              {editingFilm.title ? `Modifier : ${editingFilm.title}` : 'Ajouter un film ou projet'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Titre du film</label>
                  <input
                    type="text"
                    required
                    value={editingFilm.title}
                    onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Année</label>
                  <input
                    type="text"
                    required
                    value={editingFilm.year}
                    onChange={(e) => setEditingFilm({ ...editingFilm, year: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Catégorie</label>
                  <select
                    value={editingFilm.category}
                    onChange={(e) => setEditingFilm({ ...editingFilm, category: e.target.value as 'Cinéma International' | 'Cinéma Français' | 'Série / Plateforme' | 'Blockbuster' })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  >
                    <option value="Cinéma International">Cinéma International</option>
                    <option value="Cinéma Français">Cinéma Français</option>
                    <option value="Blockbuster">Blockbuster</option>
                    <option value="Série / Plateforme">Série / Plateforme</option>
                    <option value="Show & Événement">Show & Événement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Réalisateur</label>
                  <input
                    type="text"
                    value={editingFilm.director || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, director: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">URL Affiche / Visuel</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingFilm.image || ''}
                  onChange={(e) => setEditingFilm({ ...editingFilm, image: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rôles de cascades & implications CUC</label>
                <textarea
                  rows={3}
                  value={editingFilm.stuntRoles}
                  onChange={(e) => setEditingFilm({ ...editingFilm, stuntRoles: e.target.value })}
                  className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">Badge / Tag (ex: FESTIVAL)</label>
                  <input
                    type="text"
                    value={editingFilm.tag || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, tag: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">IMDb URL</label>
                  <input
                    type="url"
                    value={editingFilm.imdbUrl || ''}
                    onChange={(e) => setEditingFilm({ ...editingFilm, imdbUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingFilm(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
