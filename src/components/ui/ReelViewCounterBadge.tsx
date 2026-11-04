'use client';

import React from 'react';
import { Eye } from 'lucide-react';

export interface ReelViewCounterBadgeProps {
  views?: number;
  viewsFormatted?: string;
  className?: string;
  variant?: 'compact' | 'detailed';
  showVuesLabel?: boolean;
}

/**
 * Formate un nombre de vues Instagram de façon concise et lisible.
 * Utilise en priorité `viewsFormatted` (certifié Meta Graph API ou catalogue).
 */
export function formatReelViews(views?: number, viewsFormatted?: string): string {
  if (viewsFormatted && viewsFormatted.trim().length > 0 && viewsFormatted !== '0' && viewsFormatted !== '—') {
    return viewsFormatted;
  }
  if (!views || views <= 0) return '';
  if (views >= 1_000_000) {
    const val = views / 1_000_000;
    return val >= 10 ? `${Math.round(val)} M` : `${val.toFixed(1).replace('.', ',')} M`;
  }
  if (views >= 1_000) {
    const val = views / 1_000;
    return val >= 100 ? `${Math.round(val)} k` : `${val.toFixed(1).replace('.', ',')} k`;
  }
  return views.toLocaleString('fr-FR');
}

/**
 * Badge moderne de compteur de vues pour les vidéos et Reels Instagram.
 * Conçu selon l'esthétique studio CUC (verre sombre cinématique, accent or #FFE500, font-mono-tech).
 */
export const ReelViewCounterBadge: React.FC<ReelViewCounterBadgeProps> = ({
  views,
  viewsFormatted,
  className = '',
  variant = 'compact',
  showVuesLabel = false,
}) => {
  const formatted = formatReelViews(views, viewsFormatted);
  if (!formatted) return null;

  if (variant === 'detailed') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0c0c10]/85 backdrop-blur-md border border-zinc-700/80 text-[11px] font-mono-tech text-zinc-200 shadow-md ${className}`}
        title={`${formatted} vues`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse" />
        <Eye className="w-3.5 h-3.5 text-[#FFE500]" />
        <span className="font-semibold text-white tracking-wider">{formatted}</span>
        <span className="text-zinc-400 text-[10px]">vues</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono-tech text-zinc-200 font-semibold shadow-md group-hover:border-[#FFE500]/60 group-hover:text-white transition-all duration-300 ${className}`}
      title={`${formatted} vues`}
    >
      <Eye className="w-3 h-3 text-[#FFE500] shrink-0" />
      <span className="tracking-wide">
        {formatted}
        {showVuesLabel ? ' vues' : ''}
      </span>
    </div>
  );
};
