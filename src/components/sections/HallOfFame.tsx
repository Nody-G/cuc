'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getFilms } from '@/lib/data/site-service';
import { createClient } from '@/lib/supabase/client';
import { FilmCredit, DoubledCelebrity } from '@/types';
import { StuntBadge } from '../ui/StuntBadge';
import { Clapperboard, Film } from 'lucide-react';
import { CelebrityDoublesGallery } from './hall-of-fame/CelebrityDoublesGallery';
import { FilmGridCard } from './hall-of-fame/FilmGridCard';
import { FilmDetailsModal } from './hall-of-fame/FilmDetailsModal';
import { CelebrityDetailsModal } from './hall-of-fame/CelebrityDetailsModal';

const CATEGORIES = [
  { id: 'all', label: 'Toutes les Productions' },
  { id: 'Blockbuster', label: 'Blockbusters Hollywood' },
  { id: 'Cinéma Français', label: 'Cinéma Français & Auteurs' },
  { id: 'Show & Événement', label: 'Shows & Parcs à Thème' },
];

export const HallOfFame: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedMovie, setSelectedMovie] = useState<FilmCredit | null>(null);
  const [selectedCelebrity, setSelectedCelebrity] = useState<DoubledCelebrity | null>(null);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMovie(null);
        setSelectedCelebrity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [movies, setMovies] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);

  useEffect(() => {
    getFilms().then(setMovies);

    try {
      const supabase = createClient();
      const channel = supabase
        .channel('realtime:site_films')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_films' },
          () => {
            getFilms().then(setMovies);
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

  const filteredMovies =
    filter === 'all'
      ? movies
      : movies.filter((m) => m.category === filter);

  return (
    <section id="filmographie" className="py-24 bg-[#08080a] relative border-t border-zinc-800 overflow-hidden">
      {/* Subtle Anamorphic Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full lens-flare-gold opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Principal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14 drop-shadow-[0_0_20px_rgba(255,229,0,0.4)]">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Blason CUC"
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 mb-3">
            <StuntBadge variant="yellow" icon={<Clapperboard className="w-3.5 h-3.5" />}>
              CRÉDITS &amp; TOURNAGES
            </StuntBadge>
            <span className="text-xs font-mono-tech text-zinc-500">PRODUCTIONS CUC &amp; ANCIENS ÉLÈVES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tight text-white">
            HALL OF FAME DU CINÉMA D&apos;ACTION
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FFE500] to-transparent mx-auto my-3" />
          <p className="text-sm sm:text-base text-zinc-400 font-tech mt-2">
            Retrouvez une sélection de productions audiovisuelles et cinématographiques sur lesquelles sont intervenus les cascadeurs et formateurs du CUC.
          </p>
        </div>

        {/* SECTION VEDETTE : LES ACTEURS ET COMÉDIENS DOUBLÉS */}
        <CelebrityDoublesGallery onSelectCelebrity={setSelectedCelebrity} />

        {/* SECTION DES FILMS DU HALL OF FAME */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 text-[#FFE500]" />
                <span className="text-xs font-mono-tech text-zinc-400 uppercase font-bold tracking-wider">
                  FILMOGRAPHIE
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-display uppercase tracking-tight text-white">
                FILMS &amp; SÉRIES
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tech text-zinc-400">
              <span>Cliquez sur un film pour afficher les détails</span>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap gap-2 mb-10 pb-3 border-b border-zinc-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 text-xs font-display tracking-wider uppercase border transition-all cursor-pointer ${filter === cat.id
                    ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_12px_rgba(255,229,0,0.3)]'
                    : 'bg-[#121216] text-zinc-300 border-zinc-800 hover:border-zinc-600'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Film Credits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <FilmGridCard
              key={movie.id}
              movie={movie}
              onSelectMovie={setSelectedMovie}
            />
          ))}
        </div>
      </div>

      {/* Modales Interactives */}
      <CelebrityDetailsModal
        celebrity={selectedCelebrity}
        onClose={() => setSelectedCelebrity(null)}
      />

      <FilmDetailsModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </section>
  );
};
