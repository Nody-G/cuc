'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { Discipline } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';

export interface DisciplineEditorFieldsProps {
    value: Discipline;
    onChange: (updates: Partial<Discipline>) => void;
    campusPOIs: POI[];
    onOpenMediaPicker: () => void;
}

const inputClass =
    'w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold';
const labelClass = 'block text-xs font-semibold text-zinc-400 mb-1';

/** Champs principaux du module : identité, niveau, zone, textes, matériel, visuel. */
export const DisciplineEditorFields: React.FC<DisciplineEditorFieldsProps> = ({
    value,
    onChange,
    campusPOIs,
    onOpenMediaPicker,
}) => (
    <>
        {/* Infos Clés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className={labelClass}>Numéro (ex: 01)</label>
                <input
                    type="text"
                    required
                    value={value.number}
                    onChange={(e) => onChange({ number: e.target.value })}
                    className={inputClass}
                />
            </div>
            <div className="sm:col-span-2">
                <label className={labelClass}>Nom du Module</label>
                <input
                    type="text"
                    required
                    value={value.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className={inputClass}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Niveau Technique</label>
                <select
                    value={value.level}
                    onChange={(e) => onChange({ level: e.target.value as Discipline['level'] })}
                    className={inputClass}
                >
                    <option value="Fondamental">Fondamental</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Extrême">Extrême</option>
                    <option value="Tactique">Tactique</option>
                </select>
            </div>
            <div>
                <label className={labelClass}>Zone du Campus (Lieu d'Entraînement)</label>
                <select
                    value={value.campus_zone_id || ''}
                    onChange={(e) => onChange({ campus_zone_id: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Sélectionner une infrastructure...</option>
                    {campusPOIs.map((poi) => (
                        <option key={poi.id} value={poi.id}>
                            {poi.name} ({poi.category})
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Descriptions */}
        <div>
            <label className={labelClass}>Accroche Courte (Vitrine)</label>
            <textarea
                rows={2}
                required
                value={value.shortDesc}
                onChange={(e) => onChange({ shortDesc: e.target.value })}
                className={inputClass}
            />
        </div>

        <div>
            <label className={labelClass}>Description Pédagogique Détaillée</label>
            <textarea
                rows={4}
                value={value.fullDesc}
                onChange={(e) => onChange({ fullDesc: e.target.value })}
                className={inputClass}
            />
        </div>

        {/* Contexte Cinéma & Matériel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Exemples de Scènes Cinéma</label>
                <input
                    type="text"
                    value={value.cinemaContext}
                    onChange={(e) => onChange({ cinemaContext: e.target.value })}
                    placeholder="ex: John Wick, cascades sur les toits..."
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Matériel Spécifique (séparé par des virgules)</label>
                <input
                    type="text"
                    value={
                        Array.isArray(value.equipment)
                            ? value.equipment.join(', ')
                            : value.equipment || ''
                    }
                    onChange={(e) =>
                        onChange({ equipment: e.target.value.split(',').map((s) => s.trim()) })
                    }
                    placeholder="Airbag géant, Harnais, Nomex..."
                    className={inputClass}
                />
            </div>
        </div>

        {/* Visuel */}
        <div>
            <label className={labelClass}>Image Illustrative (URL ou Médiathèque)</label>
            <div className="flex gap-2">
                <input
                    type="url"
                    value={value.heroImage}
                    onChange={(e) => onChange({ heroImage: e.target.value })}
                    placeholder="https://..."
                    className={`flex-1 ${inputClass}`}
                />
                <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                >
                    <ImageIcon className="w-4 h-4 text-cuc-gold" />
                    Médiathèque
                </button>
            </div>
        </div>
    </>
);
