'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { Discipline } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import { coerceStringList } from '@/lib/comma-list';
import { CommaListField } from '../ui';

export interface DisciplineEditorFieldsProps {
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    value: Discipline;
    /** Patch des champs traduisibles (allow-list `DISCIPLINE_CODEC`). */
    onChange: (updates: Partial<Discipline>) => void;
    /** Fiche source française : champs techniques verrouillés en anglais. */
    sourceValue: Discipline;
    /** Patch des champs techniques (numéro, niveau, zone, visuel). */
    onSourceChange: (updates: Partial<Discipline>) => void;
    campusPOIs: POI[];
    onOpenMediaPicker: () => void;
    /** Champ verrouillé dans la locale courante (technique ou non chargé). */
    isFieldReadOnly: (field: string) => boolean;
}

const inputClass =
    'w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'block text-xs font-semibold text-zinc-400 mb-1';

/**
 * Champs principaux du module : identité, niveau, zone, textes, matériel,
 * visuel. En anglais seuls les textes (et le matériel) restent éditables.
 */
export const DisciplineEditorFields: React.FC<DisciplineEditorFieldsProps> = ({
    value,
    onChange,
    sourceValue,
    onSourceChange,
    campusPOIs,
    onOpenMediaPicker,
    isFieldReadOnly,
}) => (
    <>
        {/* Infos Clés */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className={labelClass}>Numéro (ex: 01)</label>
                <input
                    type="text"
                    required
                    disabled={isFieldReadOnly('number')}
                    value={sourceValue.number}
                    onChange={(e) => onSourceChange({ number: e.target.value })}
                    className={inputClass}
                />
            </div>
            <div className="sm:col-span-2">
                <label className={labelClass}>Nom du Module</label>
                <input
                    type="text"
                    required
                    disabled={isFieldReadOnly('name')}
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
                    disabled={isFieldReadOnly('level')}
                    value={sourceValue.level}
                    onChange={(e) => onSourceChange({ level: e.target.value as Discipline['level'] })}
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
                    disabled={isFieldReadOnly('campus_zone_id')}
                    value={sourceValue.campus_zone_id || ''}
                    onChange={(e) => onSourceChange({ campus_zone_id: e.target.value })}
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
                disabled={isFieldReadOnly('shortDesc')}
                value={value.shortDesc}
                onChange={(e) => onChange({ shortDesc: e.target.value })}
                className={inputClass}
            />
        </div>

        <div>
            <label className={labelClass}>Description Pédagogique Détaillée</label>
            <textarea
                rows={4}
                disabled={isFieldReadOnly('fullDesc')}
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
                    disabled={isFieldReadOnly('cinemaContext')}
                    value={value.cinemaContext}
                    onChange={(e) => onChange({ cinemaContext: e.target.value })}
                    placeholder="ex: John Wick, cascades sur les toits..."
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Matériel Spécifique (séparé par des virgules)</label>
                <CommaListField
                    key={`discipline-equipment-${value.id}`}
                    value={coerceStringList(value.equipment)}
                    onChange={(equipment) => onChange({ equipment })}
                    disabled={isFieldReadOnly('equipment')}
                    placeholder="Airbag géant, Harnais, Nomex..."
                    className={inputClass}
                    aria-label="Matériel spécifique"
                />
            </div>
        </div>

        {/* Visuel (technique : verrouillé en anglais) */}
        <div>
            <label className={labelClass}>Image Illustrative (URL ou Médiathèque)</label>
            <div className="flex gap-2">
                <input
                    type="url"
                    disabled={isFieldReadOnly('heroImage')}
                    value={sourceValue.heroImage}
                    onChange={(e) => onSourceChange({ heroImage: e.target.value })}
                    placeholder="https://..."
                    className={`flex-1 ${inputClass}`}
                />
                <button
                    type="button"
                    onClick={onOpenMediaPicker}
                    disabled={isFieldReadOnly('heroImage')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ImageIcon className="w-4 h-4 text-cuc-gold" />
                    Médiathèque
                </button>
            </div>
        </div>
    </>
);

export default DisciplineEditorFields;
