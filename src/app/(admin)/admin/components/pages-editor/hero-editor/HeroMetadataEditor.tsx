'use client';

import React from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { MediaImageField } from '../MediaImageField';
import {
    HERO_CARD_CLASS,
    HERO_CARD_HEADER_CLASS,
    HERO_CARD_HINT_CLASS,
    HERO_CARD_TITLE_CLASS,
    HERO_INPUT_CLASS,
    HERO_LABEL_CLASS,
    HERO_TAG_CLASS,
} from './hero-editor.styles';

export interface HeroMetadataEditorProps {
    formData: SitePageContent;
    /** Fusion immuable d'un ou plusieurs champs de la page (méta, OpenGraph…). */
    onChange: (patch: Partial<SitePageContent>) => void;
    /** Ouvre la médiathèque sur une cible de champ (`og_image`). */
    setMediaPickerTarget: (target: string) => void;
}

/**
 * Métadonnées de page (SEO + OpenGraph).
 *
 * Ces champs n'ont pas de contrepartie cliquable dans l'aperçu — ils ne sont
 * donc pas annotés `data-cuc-field` : le mode inspection les atteint par la
 * liste du formulaire, pas par un clic dans la page.
 */
export const HeroMetadataEditor: React.FC<HeroMetadataEditorProps> = ({
    formData,
    onChange,
    setMediaPickerTarget,
}) => (
    <div className={HERO_CARD_CLASS}>
        <div className={HERO_CARD_HEADER_CLASS}>
            <div>
                <h3 className={HERO_CARD_TITLE_CLASS}>
                    Référencement Naturel & Indexation (SEO)
                </h3>
                <p className={HERO_CARD_HINT_CLASS}>
                    Balises meta de la page générées dynamiquement dans le HTML source.
                </p>
            </div>
            <span className={HERO_TAG_CLASS}>Head & Meta</span>
        </div>

        <div className="space-y-3">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className={HERO_LABEL_CLASS}>
                        Titre SEO & Onglet Navigateur (Meta Title)
                    </label>
                    <span className="text-[11px] font-mono text-gray-400">Google & Onglet uniquement</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1.5">
                    Balise technique invisible sur la page. Pour modifier le grand titre affiché sur le site, utilisez le « Titre Principal (H1) » ci-dessus.
                </p>
                <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(event) => onChange({ meta_title: event.target.value })}
                    placeholder="ex: CUC - Campus Univers Cascades | Le Plus Grand Centre au Monde"
                    className={HERO_INPUT_CLASS}
                />
            </div>

            <div>
                <label className={HERO_LABEL_CLASS}>
                    Description Moteur de Recherche (Meta Description)
                </label>
                <textarea
                    rows={2}
                    value={formData.meta_description || ''}
                    onChange={(event) => onChange({ meta_description: event.target.value })}
                    placeholder="Résumé de la page affiché dans Google (150-160 caractères recommandés)..."
                    className={HERO_INPUT_CLASS}
                />
            </div>

            <MediaImageField
                label="Image OpenGraph / Réseaux Sociaux (Partage Facebook, LinkedIn, X)"
                value={formData.og_image || ''}
                onChange={(url) => onChange({ og_image: url })}
                onPickMedia={() => setMediaPickerTarget('og_image')}
                placeholder="https://... ou /media/..."
            />
        </div>
    </div>
);
