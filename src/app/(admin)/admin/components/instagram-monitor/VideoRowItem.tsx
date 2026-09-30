'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2, ChevronUp, ChevronDown, Video } from 'lucide-react';
import type { ProgrammeTvItem } from '@/data/videos';

export interface VideoRowItemProps {
  video: ProgrammeTvItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onUpdate: (updates: Partial<ProgrammeTvItem>) => void;
  onDelete: () => void;
}

export const VideoRowItem: React.FC<VideoRowItemProps> = ({
  video,
  isFirst,
  isLast,
  onMove,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-[#0D0D12] border border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors">
      {/* Réordonnancement */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-zinc-400"
          title="Monter"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-zinc-400"
          title="Descendre"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Vignette */}
      <div className="relative w-28 h-16 shrink-0 bg-black border border-zinc-800 rounded overflow-hidden">
        {video.img ? (
          <Image
            src={video.img}
            alt={video.title}
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Video className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Inputs éditables en ligne */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-mono-tech text-zinc-500 uppercase">Titre</label>
          <input
            type="text"
            value={video.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-black/40 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-[#FFE500]"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-mono-tech text-zinc-500 uppercase">Sous-titre / Chaîne</label>
          <input
            type="text"
            value={video.sub}
            onChange={(e) => onUpdate({ sub: e.target.value })}
            className="w-full bg-black/40 border border-zinc-800 rounded p-1.5 text-xs text-white focus:border-[#FFE500]"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-[10px] font-mono-tech text-zinc-500 uppercase">Lien ou ID vidéo</label>
          <input
            type="text"
            value={video.dmId}
            onChange={(e) => onUpdate({ dmId: e.target.value })}
            className="w-full bg-black/40 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:border-[#FFE500]"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors"
          title="Supprimer la vidéo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
