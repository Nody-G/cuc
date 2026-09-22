'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import type { FilmCredit } from '@/types';
import { FILM_CATEGORIES } from '@/lib/film-category';

export interface FilmEditorFieldsProps {
    value: FilmCredit;
    onChange: (updates: Partial<FilmCredit>) => void;
    onOpenMediaPicker: () => void;
}

const inputClass =
    'w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]';
const labelClass = 'block text-xs font-mono text-gray-400 mb-1';

/** Champs principaux du projet : identité, catégorie, affiche, castings doublés, liens. */
export const FilmEditorFields: React.FC<FilmEditorFieldsProps> = ({
    value,
    onChange,
    onOpenMediaPicker,
}) => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Titre du film *</label>
                <input
                    type="text"
                    required
                    value={value.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Année de sortie *</label>
                <input
                    type="text"
                    required
                    placeholder="ex: 2025"
                    value={value.year}
                    onChange={(e) => onChange({ year: e.target.value })}
                    className={inputClass}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Catégorie vitrine</label>
                <select
                    value={value.category}
                    onChange={(e) => onChange({ category: e.target.value as FilmCredit['category'] })}
                    className={inputClass}
                >
                    {FILM_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className={labelClass}>Badge / Tag</label>
                <input
                    type="text"
                    placeholder="ex: COMBATS, POURSUITES, NOUVEAU"
                    value={value.tag || ''}
                    onChange={(e) => onChange({ tag: e.target.value })}
                    className={inputClass}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Réalisateur</label>
                <input
                    type="text"
                    placeholder="ex: Olivier Megaton, Luc Besson..."
                    value={value.director || ''}
                    onChange={(e) => onChange({ director: e.target.value })}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Affiche (URL ou locale)</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="/images/... ou https://..."
                        value={value.image || ''}
                        onChange={(e) => onChange({ image: e.target.value })}
                        className={`flex-1 ${inputClass}`}
                    />
                    <button
                        type="button"
                        onClick={onOpenMediaPicker}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                        title="Choisir dans la médiathèque"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                    </button>
                </div>
            </div>
        </div>

        <div>
            <label className={labelClass}>
                Comédiens doublés (séparés par des virgules)
            </label>
            <input
                type="text"
                placeholder="ex: Tomer Sisley, Pierre Niney, Keanu Reeves"
                value={
                    Array.isArray(value.doubledActors)
                        ? value.doubledActors.join(', ')
                        : (value.doubledActors as unknown as string) || ''
                }
                onChange={(e) =>
                    onChange({
                        doubledActors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                }
                className={inputClass}
            />
        </div>

        <div>
            <label className={labelClass}>Rôles de cascades & Réalisations</label>
            <textarea
                rows={2}
                placeholder="ex: Coordination cascades, chorégraphie combats, doublure Tomer Sisley, chutes hauteur 18m"
                value={value.stuntRoles}
                onChange={(e) => onChange({ stuntRoles: e.target.value })}
                className={inputClass}
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                    <ImdbLogo className="h-3 w-auto inline-block" /> URL
                </label>
                <input
                    type="text"
                    placeholder="https://imdb.com/title/..."
                    value={value.imdbUrl || ''}
                    onChange={(e) => onChange({ imdbUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
            <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                    <AllocineLogo className="h-3 w-auto inline-block" /> URL
                </label>
                <input
                    type="text"
                    placeholder="https://allocine.fr/film/..."
                    value={value.allocineUrl || ''}
                    onChange={(e) => onChange({ allocineUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
            <div>
                <label className={`${labelClass} flex items-center gap-1`}>
                    <YouTubeLogo className="w-3 h-3 inline-block" variant="color" /> Trailer
                </label>
                <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={value.trailerUrl || ''}
                    onChange={(e) => onChange({ trailerUrl: e.target.value })}
                    className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500]"
                />
            </div>
        </div>
    </>
);
