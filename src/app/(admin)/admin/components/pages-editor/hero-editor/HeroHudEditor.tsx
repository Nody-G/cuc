'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import type { SitePageHero } from '@/lib/data/site-service';
import { LinkField } from '../LinkField';
import {
    HERO_CARD_CLASS,
    HERO_CARD_HEADER_CLASS,
    HERO_CARD_HINT_CLASS,
    HERO_CARD_TITLE_CLASS,
    HERO_INPUT_CLASS,
    HERO_LABEL_CLASS,
    HERO_TAG_CLASS,
} from './hero-editor.styles';

export interface HeroHudEditorProps {
    /** Hero courant (source française ou contenu localisé). */
    hero: SitePageHero;
    /** Fusion immuable d'un ou plusieurs champs du hero. */
    onChange: (patch: Partial<SitePageHero>) => void;
}

/**
 * Bandeau technique du hero : les repères affichés en surimpression (région,
 * nature du domaine) et la pilule d'accès à la carte.
 *
 * Ces textes existaient côté vitrine sans aucun contrôle au Cockpit : ils
 * n'étaient donc modifiables que dans l'aperçu, et pas du tout en mode
 * inspection. Chaque saisie porte le chemin canonique (`data-cuc-field`), ce qui
 * permet à l'aperçu de la focaliser et de la remplir depuis la page.
 *
 * L'URL de la carte se règle **ici et pas en place** : un contrôle (l'ancre de
 * la pilule) ne porte qu'un champ cliquable — la cible de navigation n'est pas
 * éditable en clic dans la page.
 */
export const HeroHudEditor: React.FC<HeroHudEditorProps> = ({ hero, onChange }) => {
    const tHero = useTranslations('home.hero');

    return (
        <div className={HERO_CARD_CLASS}>
            <div className={HERO_CARD_HEADER_CLASS}>
                <div>
                    <h3 className={HERO_CARD_TITLE_CLASS}>
                        Bandeau technique du Hero (Repères & Carte)
                    </h3>
                    <p className={HERO_CARD_HINT_CLASS}>
                        Repères affichés en haut de la bannière, et pilule d'accès à la carte.
                    </p>
                </div>
                <span className={HERO_TAG_CLASS}>Surimpression</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={HERO_LABEL_CLASS}>Localisation (gauche)</label>
                    <input
                        type="text"
                        value={hero.hud_location || ''}
                        onChange={(event) => onChange({ hud_location: event.target.value })}
                        placeholder={tHero('hudLocation')}
                        className={HERO_INPUT_CLASS}
                        data-cuc-field="hero.hud_location"
                    />
                </div>
                <div>
                    <label className={HERO_LABEL_CLASS}>Nature du domaine (droite)</label>
                    <input
                        type="text"
                        value={hero.hud_private_domain || ''}
                        onChange={(event) => onChange({ hud_private_domain: event.target.value })}
                        placeholder={tHero('hudPrivateDomain')}
                        className={HERO_INPUT_CLASS}
                        data-cuc-field="hero.hud_private_domain"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                    <label className={HERO_LABEL_CLASS}>
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#FFE500]" />
                            Libellé de la pilule carte
                        </span>
                    </label>
                    <input
                        type="text"
                        value={hero.hud_map_label || ''}
                        onChange={(event) => onChange({ hud_map_label: event.target.value })}
                        placeholder={tHero('hudMapLabel')}
                        className={HERO_INPUT_CLASS}
                        data-cuc-field="hero.hud_map_label"
                    />
                </div>
                <LinkField
                    label="Cible de la carte (URL externe acceptée)"
                    field="hero.hud_map_url"
                    value={hero.hud_map_url || ''}
                    onChange={(value) => onChange({ hud_map_url: value })}
                    placeholder="https://www.google.com/maps/…"
                />
            </div>
        </div>
    );
};
