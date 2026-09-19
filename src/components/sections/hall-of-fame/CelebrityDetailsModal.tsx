'use client';

import React from 'react';
import Image from 'next/image';
import { DoubledCelebrity } from '@/types';
import { X, ShieldCheck, Sparkles } from 'lucide-react';

interface CelebrityDetailsModalProps {
  celebrity: DoubledCelebrity | null;
  onClose: () => void;
}

export const CelebrityDetailsModal: React.FC<CelebrityDetailsModalProps> = ({
  celebrity,
  onClose,
}) => {
  if (!celebrity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border-2 border-[#FFE500] w-full max-w-2xl overflow-hidden relative shadow-[0_0_50px_rgba(255,229,0,0.2)] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="bg-[#141419] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] animate-pulse" />
            <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-wider uppercase">
              DOUBLURE CINÉMA • COMÉDIEN &amp; CASCADES
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Fermer la fiche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-5 relative h-72 w-full border border-zinc-800 bg-black overflow-hidden shadow-lg">
              <Image
                src={celebrity.photo}
                alt={celebrity.name}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-cover object-top"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-[#FFE500] text-black text-xs font-mono-tech font-bold px-2 py-0.5">
                  {celebrity.highlightTag}
                </span>
              </div>
            </div>

            <div className="sm:col-span-7 space-y-4">
              <div>
                <div className="text-xs font-mono-tech text-[#00e5ff] uppercase font-bold">
                  {celebrity.roleType}
                </div>
                <h3 className="text-3xl font-display uppercase tracking-tight text-white mt-1">
                  {celebrity.name}
                </h3>
              </div>

              <div className="bg-[#141419] border border-zinc-800 p-4 space-y-2">
                <div className="text-xs font-mono-tech text-[#FFE500] font-bold uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
                  <span>Cascades Réalisées par l&apos;Équipe :</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-tech leading-relaxed">
                  {celebrity.stuntSpecialty}
                </p>
              </div>

              <div className="text-xs font-mono-tech text-zinc-300">
                <span className="text-zinc-500 uppercase block mb-1">Cascadeurs Référents CUC :</span>
                <span className="text-white font-bold bg-[#141419] border border-zinc-800 px-2 py-1 inline-block">
                  {celebrity.stuntDoubles}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono-tech text-zinc-500 uppercase block mb-1.5 font-bold">
                  Filmographie &amp; Tournages Clés :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {celebrity.productions.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-black border border-zinc-700 text-xs font-mono-tech text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={celebrity.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#f5c518] hover:bg-[#ffe500] text-black font-bold font-mono-tech text-xs transition-colors shadow-md mt-4"
              >
                <span className="px-1.5 py-0.5 bg-black text-[#f5c518] text-[10px] rounded font-black">
                  IMDb
                </span>
                <span>Consulter la Filmographie Complète sur IMDb Pro</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-6 py-3 flex items-center justify-between text-xs font-mono-tech text-zinc-400">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>CAMPUS UNIVERS CASCADES • LE CATEAU-CAMBRÉSIS</span>
          </span>
          <button
            onClick={onClose}
            className="text-[#FFE500] hover:underline uppercase font-bold cursor-pointer"
          >
            Fermer (Échap)
          </button>
        </div>
      </div>
    </div>
  );
};
