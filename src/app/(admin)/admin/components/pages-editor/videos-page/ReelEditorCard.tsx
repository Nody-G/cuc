'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ExternalLink, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { InstagramReel } from '@/app/(site)/[locale]/videos-cascadeur/sections/instagram-reels.data';

interface ReelEditorCardProps {
    reel: InstagramReel;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onRemove: (index: number) => void;
    onFieldChange: <K extends keyof InstagramReel>(
        index: number,
        field: K,
        value: InstagramReel[K]
    ) => void;
    onPickCover: (index: number) => void;
}

const INPUT_CLASS =
    'w-full px-2.5 py-1.5 bg-black/50 border border-white/10 rounded text-xs text-white focus:border-[#FFE500] outline-none';

/** Fiche d'édition d'un Reel : ordre, affiche, titre, légende et lien source. */
export const ReelEditorCard: React.FC<ReelEditorCardProps> = ({
    reel,
    index,
    isFirst,
    isLast,
    onMove,
    onRemove,
    onFieldChange,
    onPickCover,
}) => (
    <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono-tech text-[#FFE500]">
                REEL #{index + 1} • {reel.shortcode}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onMove(index, 'up')}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="Monter"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onMove(index, 'down')}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="Descendre"
                >
                    <ArrowDown className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                    title="Supprimer ce Reel"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex gap-4">
            <div className="relative w-24 h-36 bg-black rounded-lg border border-white/10 overflow-hidden shrink-0">
                {reel.coverImage ? (
                    <Image
                        src={reel.coverImage}
                        alt={reel.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-2.5">
                <div>
                    <label className="block text-[11px] font-mono-tech text-gray-400 mb-0.5">
                        Titre
                    </label>
                    <input
                        type="text"
                        value={reel.title}
                        onChange={(e) => onFieldChange(index, 'title', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-mono-tech text-gray-400 mb-0.5">
                        Légende réelle Instagram
                    </label>
                    <textarea
                        rows={2}
                        value={reel.description}
                        placeholder="Légende officielle (ou laisser vide pour n'afficher aucun texte)..."
                        onChange={(e) => onFieldChange(index, 'description', e.target.value)}
                        className={INPUT_CLASS}
                    />
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <button
                        type="button"
                        onClick={() => onPickCover(index)}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono-tech"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>Changer l'image</span>
                    </button>
                    <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-[#FFE500] flex items-center gap-1 font-mono-tech ml-auto"
                    >
                        <span>Voir sur Instagram</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    </div>
);
