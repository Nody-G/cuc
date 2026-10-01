'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Image as ImageIcon, X } from 'lucide-react';

export interface MediaImageFieldProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onPickMedia?: () => void;
    placeholder?: string;
    disabled?: boolean;
    helperText?: string;
    inputClass?: string;
    'data-cuc-field'?: string;
}

/**
 * Extrait le nom de fichier ou le dernier segment d'une URL pour affichage compact.
 */
function getFilenameFromUrl(url: string): string {
    if (!url) return '';
    try {
        const clean = url.split('?')[0].split('#')[0];
        const parts = clean.split('/');
        return decodeURIComponent(parts[parts.length - 1] || '');
    } catch {
        return url;
    }
}

/**
 * Champ d'image avec aperçu visuel immédiat pour l'administrateur dans « Pages du Site ».
 *
 * Permet à l'administrateur d'avoir une vue rapide de quelle image est utilisée
 * sans devoir déchiffrer une URL Supabase longue, avec lien direct pour ouvrir
 * en taille réelle, indicateur d'erreur de chargement et bouton d'ouverture de la médiathèque.
 */
export const MediaImageField: React.FC<MediaImageFieldProps> = ({
    label,
    value,
    onChange,
    onPickMedia,
    placeholder = 'https://... ou /media/...',
    disabled = false,
    helperText,
    inputClass,
    'data-cuc-field': dataCucField,
}) => {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const hasError = Boolean(value && failedUrl === value);
    const filename = getFilenameFromUrl(value);

    return (
        <div className="space-y-1.5">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono text-gray-400">{label}</label>
                    {filename && (
                        <span className="text-[10px] font-mono text-[#FFE500] truncate max-w-[200px]" title={value}>
                            {filename}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Vignette d'aperçu visuel */}
                <div className="relative w-20 h-14 rounded-lg bg-black/60 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center group">
                    {value && !hasError ? (
                        <>
                            <Image
                                key={value}
                                src={value}
                                alt={filename || 'Aperçu'}
                                fill
                                sizes="80px"
                                unoptimized
                                className="object-cover transition-transform group-hover:scale-105"
                                onError={() => setFailedUrl(value)}
                            />
                            <a
                                href={value}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                title="Ouvrir l'image en taille réelle"
                            >
                                <ExternalLink className="w-3.5 h-3.5 text-[#FFE500]" />
                            </a>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center text-gray-500">
                            <ImageIcon className="w-4 h-4 mb-0.5" />
                            <span className="text-[9px] font-mono leading-none">
                                {hasError ? 'Erreur' : 'Vide'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Champ texte d'URL + Boutons d'action */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            disabled={disabled}
                            data-cuc-field={dataCucField}
                            className={
                                inputClass ||
                                'w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#FFE500] focus:outline-none disabled:opacity-60'
                            }
                        />

                        {onPickMedia && (
                            <button
                                type="button"
                                onClick={onPickMedia}
                                disabled={disabled}
                                className="shrink-0 px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                title="Choisir dans la médiathèque"
                            >
                                <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                                <span className="hidden sm:inline">Médiathèque</span>
                            </button>
                        )}

                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="shrink-0 p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors"
                                title="Effacer l'image"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {helperText && <p className="text-[11px] text-gray-500">{helperText}</p>}
                </div>
            </div>
        </div>
    );
};
