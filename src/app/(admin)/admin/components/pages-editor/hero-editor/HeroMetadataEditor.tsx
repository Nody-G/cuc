'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
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
                <label className={HERO_LABEL_CLASS}>
                    Titre SEO & Onglet Navigateur (Meta Title)
                </label>
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

            <div>
                <label className={HERO_LABEL_CLASS}>
                    Image OpenGraph / Réseaux Sociaux (Partage Facebook, LinkedIn, X)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={formData.og_image || ''}
                        onChange={(event) => onChange({ og_image: event.target.value })}
                        placeholder="https://... ou /images/..."
                        className={`${HERO_INPUT_CLASS} flex-1 font-mono`}
                    />
                    <button
                        type="button"
                        onClick={() => setMediaPickerTarget('og_image')}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                        title="Sélectionner dans la médiathèque"
                    >
                        <ImageIcon className="w-3.5 h-3.5 text-[#FFE500]" />
                        <span>Médiathèque</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);
