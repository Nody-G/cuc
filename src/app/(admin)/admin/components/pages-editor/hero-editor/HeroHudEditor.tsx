'use client';

import React from 'react';
import type { SitePageHero } from '@/lib/data/site-service';
import { LinkField } from '../LinkField';
import {
    HERO_CARD_CLASS,
    HERO_CARD_HEADER_CLASS,
    HERO_CARD_HINT_CLASS,
    HERO_CARD_TITLE_CLASS,
    HERO_TAG_CLASS,
} from './hero-editor.styles';

export interface HeroHudEditorProps {
    /** Hero courant (source française ou contenu localisé). */
    hero: SitePageHero;
    /** Fusion immuable d'un ou plusieurs champs du hero. */
    onChange: (patch: Partial<SitePageHero>) => void;
}

/**
 * Accès carte du hero : la vitrine n'affiche plus qu'une épingle de
 * localisation, dont la cible se règle **ici et pas en place** — un contrôle de
 * navigation (l'ancre) ne porte jamais de champ éditable au clic, sinon le geste
 * est ambigu.
 */
export const HeroHudEditor: React.FC<HeroHudEditorProps> = ({ hero, onChange }) => (
    <div className={HERO_CARD_CLASS}>
        <div className={HERO_CARD_HEADER_CLASS}>
            <div>
                <h3 className={HERO_CARD_TITLE_CLASS}>Accès carte du Hero</h3>
                <p className={HERO_CARD_HINT_CLASS}>
                    Cible de l'épingle de localisation affichée en haut de la bannière.
                </p>
            </div>
            <span className={HERO_TAG_CLASS}>Surimpression</span>
        </div>

        <LinkField
            label="Cible de la carte (URL externe acceptée)"
            field="hero.hud_map_url"
            value={hero.hud_map_url || ''}
            onChange={(value) => onChange({ hud_map_url: value })}
            placeholder="https://www.google.com/maps/…"
        />
    </div>
);
