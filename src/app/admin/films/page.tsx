import React from 'react';
import { getFilms } from '@/lib/data/site-service';
import { FilmsManager } from './FilmsManager';
import { Film } from 'lucide-react';

export const instant = false;

export default async function AdminFilmsPage() {
  const films = await getFilms();

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
          <Film className="w-3.5 h-3.5" /> Gestion de la filmographie & cascades
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
          Filmographie CUC
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Ajoutez vos derniers tournages cinéma, séries TV et shows, avec leurs affiches et crédits d&apos;action design.
        </p>
      </div>

      <FilmsManager films={films} />
    </div>
  );
}
