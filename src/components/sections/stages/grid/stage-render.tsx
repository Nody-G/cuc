'use client';

import React from 'react';
import {
    Clock,
    MapPin,
    ShieldCheck,
    Bed,
    Utensils,
    Users,
    Sparkles,
} from 'lucide-react';
import type { StageData } from '../stages.data';

/**
 * Copie éditoriale d'un stage, appariée par `id` : badges, titre, description,
 * lignes de détail (par index), libellé du bouton, libellé du PDF et `alt` de
 * l'affiche. Les données (`stages.data.ts` / `site_pages`) gardent les icônes,
 * les variantes de couleur, les liens PDF, les prix et les images.
 */
export interface StageCopy {
    id: string;
    badgeText?: string;
    subBadge?: string;
    highlightText?: string;
    title?: string;
    description?: string;
    details?: string[];
    buttonLabel?: string;
    pdfLabel?: string;
    imageAlt?: string;
}

/**
 * Correctifs éditoriaux saisis en place dans le Mode Studio
 * (`sections_data.stages_catalogue.items.<index>`, la même source que le
 * formulaire du Cockpit) : ils priment sur la copie traduite, qui reste le
 * repli quand aucune valeur n'est saisie.
 */
export interface StageOverride {
    badge_text?: string;
    sub_badge?: string;
    highlight_text?: string;
    title?: string;
    description?: string;
    details?: string[];
    button_label?: string;
    pdf_label?: string;
    image?: string;
    image_alt?: string;
}

export const pickCopy = (value: string | undefined, fallback: string): string =>
    value && value.trim().length > 0 ? value : fallback;

export const renderIcon = (type: string) => {
    switch (type) {
        case 'clock':
            return <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'bed':
            return <Bed className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'utensils':
            return <Utensils className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'map':
            return <MapPin className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'shield':
            return <ShieldCheck className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'sparkles':
            return <Sparkles className="w-4 h-4 text-[#FFE500] shrink-0" />;
        case 'users':
            return <Users className="w-4 h-4 text-[#FFE500] shrink-0" />;
        default:
            return <Clock className="w-4 h-4 text-[#FFE500] shrink-0" />;
    }
};

export const renderBadge = (badge: StageData['badge'], fieldPath?: string) => {
    switch (badge.variant) {
        case 'yellow':
            return (
                <span
                    data-cuc-field={fieldPath}
                    className="px-2.5 py-0.5 bg-[#FFE500] text-black font-mono-tech text-xs font-bold uppercase"
                >
                    {badge.text}
                </span>
            );
        case 'emerald':
            return (
                <span
                    data-cuc-field={fieldPath}
                    className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono-tech text-xs font-bold uppercase"
                >
                    {badge.text}
                </span>
            );
        case 'red':
            return (
                <span
                    data-cuc-field={fieldPath}
                    className="px-2.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 font-mono-tech text-xs font-bold uppercase"
                >
                    {badge.text}
                </span>
            );
        default:
            return null;
    }
};
