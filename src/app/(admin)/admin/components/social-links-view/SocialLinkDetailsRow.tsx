'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import type { SiteSocialLink } from '@/data/navigation';
import { SOCIAL_INPUT_CLASS } from './social-links-form';
import { ToggleButton } from './ToggleButton';

interface SocialLinkDetailsRowProps {
    link: SiteSocialLink;
    onUpdate: (id: string, updates: Partial<SiteSocialLink>) => void;
}

/** Ligne 2 : handle, texte d'indice, couleur de marque et emplacements. */
export const SocialLinkDetailsRow: React.FC<SocialLinkDetailsRowProps> = ({ link, onUpdate }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pl-0 lg:pl-[104px]">
        <div className="lg:col-span-3">
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                Identifiant / handle
            </label>
            <input
                type="text"
                value={link.handle || ''}
                placeholder="@campusuniverscascades"
                onChange={(e) => onUpdate(link.id, { handle: e.target.value })}
                className={SOCIAL_INPUT_CLASS}
            />
        </div>

        <div className="lg:col-span-3">
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                Texte d'indice
            </label>
            <input
                type="text"
                value={link.display_hint || ''}
                placeholder="Chaîne Stunt Team"
                onChange={(e) => onUpdate(link.id, { display_hint: e.target.value })}
                className={SOCIAL_INPUT_CLASS}
            />
        </div>

        <div className="lg:col-span-2">
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                Couleur
            </label>
            <div className="relative flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <input
                    type="color"
                    value={link.brand_color || '#FFE500'}
                    onChange={(e) => onUpdate(link.id, { brand_color: e.target.value })}
                    className="w-9 h-9 rounded-md bg-black/60 border border-white/20 cursor-pointer"
                />
                <input
                    type="text"
                    value={link.brand_color || ''}
                    onChange={(e) => onUpdate(link.id, { brand_color: e.target.value })}
                    className={`${SOCIAL_INPUT_CLASS} font-mono text-xs`}
                />
            </div>
        </div>

        <div className="lg:col-span-4">
            <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">
                Emplacements d'affichage
            </label>
            <div className="flex flex-wrap gap-2">
                <ToggleButton
                    checked={link.show_in_navbar}
                    onChange={(v) => onUpdate(link.id, { show_in_navbar: v })}
                    label="Navbar"
                />
                <ToggleButton
                    checked={link.show_in_drawer}
                    onChange={(v) => onUpdate(link.id, { show_in_drawer: v })}
                    label="Menu mobile"
                />
                <ToggleButton
                    checked={link.show_in_footer}
                    onChange={(v) => onUpdate(link.id, { show_in_footer: v })}
                    label="Footer"
                />
            </div>
        </div>
    </div>
);
